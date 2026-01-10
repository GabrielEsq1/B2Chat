# Plan de Implementación Técnica: Discovery + Chat con Empresas Públicas

## 1. Resumen Ejecutivo
Este documento detalla la arquitectura para habilitar el descubrimiento y comunicación con empresas públicas desde B2BChat. El objetivo es permitir que los usuarios encuentren cualquier empresa (vía Google/APIs públicas), inicien un chat y que la comunicación fluya bidireccionalmente entre el chat de la plataforma y el correo electrónico de la empresa externa (shadow account), sin que esta necesite registrarse previamente.

## 2. Análisis de Viabilidad

### 2.1 Viabilidad de Datos (Discovery)
El sistema actual ya integra una búsqueda híbrida (Local + Simulada con Apollo/Hunter + Google Places).
*   **Google Places API**: Excelente para Nombre, Ubicación, Categoría y Teléfono. **Limitación crítica**: Rara vez proporciona emails públicos.
*   **Solución**: Utilizar una estrategia de "enrichment" en cascada.
    1.  Google Places (Discovery Base).
    2.  Hunter.io / Snov.io API (Búsqueda de email basada en dominio/nombre).
    3.  Clearbit (Opcional, costoso pero efectivo).
    *Si no se encuentra email*: El flujo de "Chat" no puede ser bidireccional por email. Se debe habilitar un fallback (ej. "Invitar por SMS/WhatsApp" usando el teléfono de Google). Este plan asume el "Happy Path" donde se encuentra un email.

### 2.2 Viabilidad de Comunicación (Bidireccionalidad)
*   **Salida (Chat -> Email)**: Facilmente implementable con el proveedor actual (`Resend` o SMTP).
*   **Entrada (Email -> Chat)**: Requiere infraestructura de **Inbound Email Processing**.
    *   **Resend**: Actualmente no ofrece parsing de emails entrantes (solo envío).
    *   **Solución Recomendada**: Configurar un subdominio `reply.b2bchat.co` con registros MX apuntando a **SendGrid Inbound Parse** o **Mailgun Routes**. Estos servicios reciben el email, lo parsean a JSON y hacen un POST a nuestro webhook `/api/webhooks/inbound-email`.

---

## 3. Arquitectura Propuesta

### 3.1 Modelo de Datos (Prisma Schema)

Necesitamos distinguir empresas/usuarios "reales" de los "provisionales" (Ghosts).

```prisma
model Company {
  // ... campos existentes
  isProvisional   Boolean   @default(false)
  externalSource  String?   // "GOOGLE", "HUNTER", etc.
  externalId      String?   @unique // ID en la fuente externa (ej. place_id)
  enrichmentData  Json?     // Datos crudos de la API externa
}

model User {
  // ... campos existentes
  isGhost         Boolean   @default(false) // Usuario "sombra" que representa a la empresa externa
  ghostEmail      String?   // Email real externo al que escribimos
}
```

### 3.2 Flujo de Datos y Endpoints

#### A. Búsqueda (Discovery)
*   **Endpoint**: `GET /api/companies/search` (Existente, se debe reforzar).
*   **Lógica**:
    1.  Buscar en DB Local.
    2.  Si no hay match, buscar en Google Places API.
    3.  Para resultados de Google, intentar enriquecer email on-the-flight (o diferir hasta el intento de chat).
    4.  Retornar lista mixta estandarizada.

#### B. Creación de Entidad Provisional ("Shadowing")
*   **Nuevo Endpoint**: `POST /api/companies/provisional`
*   **Payload**: `{ externalId, source, name, email, phone, address, ... }`
*   **Lógica**:
    1.  Verificar si ya existe `Company` con ese `externalId`.
    2.  Si no, crear `Company` (`isProvisional: true`).
    3.  Crear `User` "Admin Fantasma" (`isGhost: true`, `email`: generado o real).
    4.  Retornar `userId` del fantasma.

#### C. Inicio de Chat
*   **Frontend**: Al hacer clic en un resultado "externo" en `GlobalCompanySearch`:
    1.  Llamar a `POST /api/companies/provisional` con los datos de la empresa seleccionada.
    2.  Recibir el `userId` del fantasma.
    3.  Llamar a `POST /api/conversations` con ese `userId`.
    4.  Redirigir al chat.

#### D. Mensajería (Bridge)
*   **Envío (B2BChat -> Email)**:
    *   Al crear un mensaje en `POST /api/conversations/[id]/messages`:
    *   Detectar si el receptor es `isGhost`.
    *   Si es Ghost, encolar/enviar email vía `Resend`.
    *   **From**: `notificaciones@b2bchat.co` (o alias personalizado).
    *   **Reply-To**: `reply-{conversationId}-{secureToken}@reply.b2bchat.co`.

*   **Recepción (Email -> B2BChat)**:
    *   La empresa externa responde al correo.
    *   Proveedor Inbound (SendGrid/Mailgun) recibe el correo en `reply.b2bchat.co`.
    *   Webhook POST a `/api/webhooks/inbound-email`.
    *   Validar `secureToken` y extraer `conversationId` del `Reply-To` (o del subject/body reference).
    *   Insertar mensaje en la DB como si fuera enviado por el `User` Ghost.
    *   Notificar vía Socket.io al usuario B2BChat.

---

## 4. Plan de Implementación Incremental

### Fase 1: Discovery & Shadowing (Frontend + Backend Base)
1.  Modificar esquema de Prisma (`isProvisional`, `isGhost`).
2.  Implementar `POST /api/companies/provisional`.
3.  Conectar `GlobalCompanySearch` para llamar a este endpoint al seleccionar una empresa externa.
4.  Permitir creación de chat con usuarios Ghost.
    *   *Resultado*: Puedes buscar "Tacos El Rey" en Google, hacer clic y abrir un chat en B2BChat. (El chat aún no envía emails externos).

### Fase 2: Salida (Outbound Messaging)
1.  Configurar integración con **Hunter.io** u otro enrichment service en el backend de búsqueda para intentar conseguir emails reales.
2.  Modificar lógica de mensajes para detectar `isGhost` y enviar email con `Resend`.
    *   *Resultado*: "Tacos El Rey" recibe un correo con tu mensaje.

### Fase 3: Entrada (Inbound Messaging)
1.  Configurar subdominio `reply.b2bchat.co` y proveedor Inbound (Mailgun/SendGrid).
2.  Implementar webhook `/api/webhooks/inbound-email`.
3.  Procesar respuestas y mapearlas al chat.
    *   *Resultado*: "Tacos El Rey" responde desde Gmail y el mensaje aparece en B2BChat.

---

## 5. APIs Sugeridas

| Función | API Principal | Alternativa | Comentario |
| :--- | :--- | :--- | :--- |
| **Discovery** | **Google Places API (New)** | Yelp Fusion | Estándar de oro para datos básicos. Generosa capa gratuita. |
| **Emails** | **Hunter.io API** | Apollo.io / Snov.io | Vital para obtener el email. Google casi nunca lo da. Costo asociado. |
| **Email Inbound** | **SendGrid Inbound Parse** | Mailgun Routes | Necesario para recibir la respuesta. Resend no tiene esto nativo. |

## 6. Riesgos y Mitigación
1.  **Falta de Email**: Riesgo alto. Si Google no da email y Hunter no lo encuentra, el flujo se rompe.
    *   *Mitigación*: Implementar "Invitar por WhatsApp" (usando el `phone` de Google) como fallback si no hay email.
2.  **Spam/Deliverability**: Enviar correos no solicitados puede afectar la reputación del dominio.
    *   *Mitigación*: Usar un subdominio dedicado (`mail.b2bchat.co`) y limitar la tasa de mensajes iniciales.
3.  **Costos API**: Google Places y Hunter cobran por uso intensivo.
    *   *Mitigación*: Cachear resultados agresivamente en DB (`enrichmentData`) para no consultar la API repetidamente por la misma empresa.

---
**Recomendación Inmediata**: Proceder con **Fase 1** (Infraestructura y Discovery) usando Google Places API existente, pero añadiendo la lógica de "Shadow Account". Validar manualmente la obtención de emails antes de automatizar la Fase 2.
