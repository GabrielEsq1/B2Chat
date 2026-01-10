# Plan Maestro: Evolución a Infraestructura de Ejecución B2B

Este documento define la arquitectura técnica y funcional para transformar B2BChat en la capa de ejecución comercial del ecosistema GNOSIS.

## 🎯 North Star Metric
**"Valor Económico Activo en Conversaciones ($ Pipeline)"**
*   Todas las features deben contribuir a aumentar, acelerar o cerrar este valor.

---

## 🏗 Arquitectura de Bloques

### Bloque 1: Momento AHA (Identidad Económica) ✅ *Iniciado*
*   **Concepto**: Visualizar valor ($) inmediatamente.
*   **Estado**: Implementado badges de "Hot Lead" (🔥) y Valor Estimado (💰) en Header.
*   **Próximo**: Refinar la detección de valor con IA más avanzada.

### Bloque 2: Inbox Inteligente (Panel de Decisiones) 🚀 *Prioridad Actual*
*   **Concepto**: El inbox decide qué es urgente, no el usuario.
*   **Implementación Técnica**:
    *   Modificar `ChatSidebar.tsx`.
    *   Nuevo algoritmo de ordenamiento en `useChatList`: `Score = (Intent * 0.6) + (Recency * 0.4)`.
    *   Tabs: "Foco" (Score > 50) vs "Todos".
    *   UI: Badges de intención en los items de la lista.

### Bloque 3: Identidad Económica de Empresas
*   **Concepto**: Perfiles enriquecidos con señales de comportamiento.
*   **Implementación Técnica**:
    *   Schema: Agregar `purchasingPower`, `avgResponseTime`, `dealVelocity` al modelo `Company`.
    *   UI: Componente `CompanyEconomicProfile` en el panel derecho del chat.
    *   Data: Calcular métricas históricas en background jobs.

### Bloque 4: Conversación Guiada (Playbooks Invisibles)
*   **Concepto**: Estructura sutil para llevar al cierre.
*   **Implementación Técnica**:
    *   Detector de Etapa: Función que analiza mensajes y actualiza `stage` (DISCOVERY -> CLOSING).
    *   Botón "Magic Action": Sugerencia flotante (ej. "Enviar Cotización") basada en la etapa.

### Bloque 5: Memoria Comercial Viva
*   **Concepto**: Contexto persistente entre sesiones.
*   **Implementación Técnica**:
    *   Vector DB (opcional) o campo `summary` en `CompanyRelation`.
    *   Al iniciar chat: "💡 La última vez negociaron X precio...".

### Bloque 6: Efecto Red Visible
*   **Concepto**: Presión social positiva.
*   **Implementación Técnica**:
    *   Ticker o notificaciones sutiles: "3 empresas de tu industria están cerrando negocios ahora".
    *   Badge "Responde Rápido" en perfiles públicos.

### Bloque 7: Monetización Contextual
*   **Concepto**: Cobrar cuando ganan.
*   **Implementación Técnica**:
    *   Gatear features de "Cierre" (ej. pagos directos) tras un umbral gratuito.
    *   Integración profunda con Creatiendas para comisión por transacción facilitada.

### Bloque 8: Modos de Uso
*   **Concepto**: Context Switching (Prospección vs Cierre).
*   **Implementación Técnica**:
    *   Toggle en el Navbar: "Modo Hunter" (Prospección) vs "Modo Closer" (Atención).
    *   Cambia el algoritmo del Inbox y las notificaciones mostradas.

### Bloque 9: Control de Timing
*   **Concepto**: Automatización de seguimiento (Follow-up hell).
*   **Implementación Técnica**:
    *   Cron jobs para detectar chats "abandonados" con alto valor.
    *   "Nudging": Mover chats olvidados al tope del inbox con label "Requiere atención".

### Bloque 10: Narrativa Personal
*   **Concepto**: Gamificación del ego profesional.
*   **Implementación Técnica**:
    *   Reporte semanal por email/modal: "Esta semana cerraste $X".
    *   Comparativa anónima: "Estás en el top 10% de velocidad".

---

## 🚦 Roadmap de Ejecución Incremental

### Fase 1: Visibilidad (Hecho / En Progreso)
*   Objetivo: Que el sistema "vea" el dinero.
*   Tasks: Schema update, Keyword Detection, Badges en UI.

### Fase 2: Decisión (Semana Actual)
*   Objetivo: Que el sistema organice el trabajo.
*   Tasks: **Smart Inbox (Bloque 2)**, Ranking de conversaciones.

### Fase 3: Acción (Próxima)
*   Objetivo: Que el sistema empuje el cierre.
*   Tasks: Playbooks (Bloque 4), Memoria (Bloque 5).

---

## 🛠 Stack Técnico & Riesgos
*   **IA**: Usar modelos ligeros (Gemini Flash / GPT-4o-mini) para clasificación en tiempo real coste-eficiente.
*   **Performance**: Calcular scores de forma asíncrona para no bloquear el envío de mensajes.
*   **UX Risk**: Evitar que el "Smart Inbox" esconda mensajes importantes. Siempre permitir "Ver Todo".
