# Especificación Funcional y Técnica: Sistema de Anuncios "Story Ads" B2BChat

## 1. Visión General
Implementación de un sistema de publicidad tipo "Stories" (vertical, pantalla completa, efímero) dentro de la plataforma B2BChat. El objetivo es monetizar la atención de los usuarios B2B mediante un formato premium, visual y de alta conversión, permitiendo además la promoción cruzada con CreaTiendas.

## 2. Experiencia de Usuario (UX)

### 2.1. Visualización (Viewer)
- **Acceso**: Desde el Dashboard principal, una fila superior de círculos ("Rail") con los logos de las empresas anunciantes.
- **Interacción**:
    - **Tap**: Abre la historia en pantalla completa.
    - **Barra de Progreso**: Muestra la duración restante de la diapositiva actual.
    - **Navegación**: Tap derecha (siguiente), Tap izquierda (anterior), Hold (pausa), Swipe Down (cerrar).
    - **CTA**: Botón inferior persistente ("Ver más", "Contactar", "Registrarme").
- **Tipos de Contenido**:
    - Imagen estática (5 segundos).
    - Video (duración del video, max 30s).

### 2.2. Creación de Campañas (Self-Service)
Flujo paso a paso para empresas verificadas:
1.  **Datos Básicos**: Nombre campaña, Fechas.
2.  **Carga de Creativos**:
    -   Subida de imagen (9:16) o video MP4.
    -   Preview en tiempo real (marco de celular).
    -   Configuración de CTA (Texto y URL destino).
3.  **Presupuesto y Pago**:
    -   Selección de plan/presupuesto.
    -   Instrucciones de pago (Nequi/WhatsApp).
    -   **Subida de Comprobante**: Foto/Screenshot de la transacción.
4.  **Confirmación**: Mensaje de "Pendiente de Aprobación".

## 3. Arquitectura Técnica

### 3.1. Modelo de Datos (Prisma)
Se extiende el modelo existente `AdCampaign` y `AdCreative`.

**Nuevos Campos Clave:**
- `AdCampaign.paymentStatus`: Estado del pago (PENDING_VERIFICATION, PAID, REJECTED).
- `AdCampaign.paymentProofUrl`: URL de la imagen del comprobante.
- `AdCreative.duration`: Segundos de duración.
- `AdCreative.mediaType`: IMAGE o VIDEO.

### 3.2. API Routes
- `GET /api/stories/feed`: Retorna historias activas agrupadas por empresas para el usuario actual (filtrado por bloqueos/preferencias).
- `POST /api/campaigns/create`: Endpoint multipart para crear campaña + subir creativos + subir comprobante.
- `POST /api/admin/campaigns/approve`: Endpoint protegido para admin.
- `GET /api/ads/external`: Endpoint para exponer ads a CreaTiendas.

### 3.3. Integración de Notificaciones
- Al completarse el `POST /api/campaigns/create`, el backend dispara una notificación.
- **Canal**: WhatsApp (vía Meta API o Link generado).
- **Destino**: `3026687991`.
- **Contenido**: "Nueva Campaña: [Nombre] - [Empresa]. Estado: Pendiente de Pago/Aprobación".

## 4. Monetización y Cross-Promo
- **Anuncios Patrocinados**: Empresas pagan por visibilidad prioritaria.
- **Cross-Ads CreaTiendas**:
    - El sistema inyectará historias con el logo de "CreaTiendas" o tiendas específicas.
    - Al hacer clic en el CTA, redirige a la tienda externa.

## 5. Roadmap de Desarrollo
1.  **Front-End Core**: Componentes visuales (Viewer, Rail).
2.  **Back-End**: Ajustes DB y API de lectura.
3.  **Modulo de Creación**: Formulario + Upload.
4.  **Modulo Admin**: Aprobación + Notificaciones.
