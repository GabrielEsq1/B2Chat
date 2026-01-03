import { Translation } from './types';

export const es: Translation = {
    common: {
        loading: 'Cargando...',
        error: 'Ocurrió un error',
        save: 'Guardar',
        cancel: 'Cancelar',
        back: 'Volver',
        delete: 'Eliminar',
        edit: 'Editar',
        search: 'Buscar',
        filter: 'Filtrar',
        view_more: 'Ver más',
        next: 'Siguiente',
        prev: 'Anterior',
        finish: 'Finalizar',
        close: 'Cerrar',
        pending: 'Pendiente',
        confirm: 'Confirmar',
        success: 'Éxito',
    },
    auth: {
        login_btn: 'Iniciar Sesión',
        register_btn: 'Crear Cuenta',
        try_free: 'Probar Gratis',
        welcome: '¡Bienvenido de nuevo!',
        login_title: 'Bienvenido',
        login_subtitle: 'Ingresa a B2Chat para gestionar tus campañas',
        register_title: 'Crear Cuenta',
        register_subtitle: 'Únete a B2Chat y escala tu negocio',
        email_phone_label: 'Email o Teléfono',
        email_phone_placeholder: 'usuario@empresa.com o +57...',
        password_label: 'Contraseña',
        password_placeholder: '••••••••',
        confirm_password_label: 'Confirmar Contraseña',
        confirm_password_placeholder: 'Repite la contraseña',
        forgot_password_link: '¿Olvidaste tu contraseña?',
        forgot_password: {
            title: "Recuperar Acceso",
            description: "Para tu seguridad, la recuperación de cuenta se gestiona personalmente a través de nuestro soporte en WhatsApp.",
            phone_label: "Tu Número de Teléfono",
            support_hint: "Te contactaremos para verificar tu identidad y asignarte una nueva contraseña manualmente.",
            whatsapp_message: "Hola, necesito recuperar mi contraseña. Mi número de cuenta es: {phone}",
            back_to_login: "Volver al Login",
            contact_support: "Contactar Soporte en WhatsApp"
        },
        no_account: '¿No tienes una cuenta?',
        has_account: '¿Ya tienes cuenta?',
        login_here: 'Inicia Sesión',
        register_here: 'Regístrate aquí',
        name_label: 'Nombre',
        company_label: 'Empresa',
        company_placeholder: 'Nombre empresa',
        phone_label: 'Teléfono',
        phone_placeholder: '+57 300 ...',
        errors: {
            invalid_credentials: 'Credenciales inválidas. Verifica tu email/teléfono y contraseña.',
            passwords_mismatch: 'Las contraseñas no coinciden',
            generic: 'Ocurrió un error al intentar ingresar.',
            connection: 'Ocurrió un error de conexión',
        },
        success: {
            account_created: '¡Cuenta creada exitosamente! Por favor inicia sesión.',
            login_redirect: '¡Inicio de sesión exitoso! Redirigiendo...',
            register_redirect: '¡Cuenta creada correctamente! Redirigiendo al login...',
        },
        back_to_home: 'Volver al inicio',
    },
    home: {
        hero_title: 'Cierra más negocios B2B desde un solo chat empresarial',
        hero_subtitle: 'Conecta con empresas reales, automatiza conversaciones comerciales y centraliza tu comunicación profesional en una sola plataforma.',
        cta_primary: 'Probar Gratis (sin tarjeta)',
        cta_secondary: 'Ver cómo funciona en 60s',
        trusted_by: 'Más de 1,000 empresas activas',
        hero_check1: 'Setup en 3 min',
        hero_check2: 'Sin spam',
        hero_check3: 'Verificación inmediata',
        benefits_title: '¿Cómo te hace ganar más dinero?',
        benefits_subtitle: 'Cada funcionalidad está diseñada para aumentar ingresos y reducir costos operativos',
        benefits: [
            {
                title: 'Chat Empresarial Inteligente',
                desc: 'Reduce tiempos de respuesta y aumenta cierres con conversaciones enfocadas en negocios.',
                metric: '+40% más cierres'
            },
            {
                title: 'Conexiones Verificadas',
                desc: 'Interactúa solo con empresas reales y perfiles validados por nuestra red profesional.',
                metric: '100% Verificado'
            },
            {
                title: 'Automatización con IA',
                desc: 'Tu asistente inteligente trabaja 24/7 respondiendo dudas y pre-calificando leads comerciales.',
                metric: 'Atención 24/7'
            },
            {
                title: 'Gestor de Anuncios B2B',
                desc: 'Publica historias empresariales y llega directamente a los tomadores de decisión.',
                metric: '5x más alcance'
            },
            {
                title: 'Integración Ecosistema',
                desc: 'Sincroniza tu tienda y productos para cerrar ventas directamente desde el flujo del chat.',
                metric: 'Venta Directa'
            },
            {
                title: 'Seguridad y Privacidad',
                desc: 'Tus conversaciones comerciales están cifradas y protegidas con estándares empresariales.',
                metric: 'Datos Protegidos'
            }
        ],
        how_it_works_title: 'Cómo Empezar',
        how_it_works_subtitle: 'Comienza a cerrar negocios en menos de 5 minutos',
        steps: [
            { title: 'Crea tu cuenta gratis', desc: 'Sin tarjeta, sin costos ocultos' },
            { title: 'Crea tu perfil empresarial', desc: 'Verificación en menos de 3 minutos' },
            { title: 'Empieza a chatear', desc: 'Conecta con empresas verificadas hoy' }
        ],
        testimonials_title: 'Lo que dicen nuestros clientes',
        testimonials_subtitle: 'Credibilidad Probada',
        testimonials: [
            {
                name: "María Rodríguez",
                role: "CEO, InnovateTech Colombia",
                text: "Desde que usamos B2BChat, nuestras conversaciones con proveedores se cerraron 40% más rápido. La IA filtra los leads reales."
            },
            {
                name: "Juan Carlos Pérez",
                role: "Director Comercial, Maquinaria Norte",
                text: "La integración con CreaTiendas nos ha permitido vender repuestos directamente por el chat. Es lo que nos faltaba."
            },
            {
                name: "Elena Gómez",
                role: "Fundadora, BioTextiles",
                text: "Descubrir proveedores verificados en la plataforma nos dio la seguridad que necesitábamos para expandirnos."
            }
        ],
        social_proof: {
            companies: 'Empresas Activas',
            closures: 'Más Cierres Mensuales',
            time: 'Tiempo Ahorrado'
        },
        cta_final_title: 'Empieza gratis hoy y convierte más conversaciones en negocios',
        cta_final_subtitle: 'Miles de empresas B2B ya están cerrando más deals. ¿A qué esperas?',
        cta_final_btn: 'Probar B2BChat Gratis',
        cta_final_hint: 'Sin costos ocultos · Sin spam · Sin tarjeta de crédito',
        booking_banner: 'CUPOS LIMITADOS · Agenda tu Onboarding GRATIS',
        visit_hub: 'Visitar Hub',
        booking_btn: 'Agendar Ahora',
        footer_rights: 'Todos los derechos reservados.',
        footer_mockup_seal_gnosis: 'Parte de GNOSIS',
        mockup: {
            verified: 'Verificada',
            industry: 'Software Development',
            msg1: 'Hola, vimos tu perfil. ¿Representas a una empresa de desarrollo?',
            msg2: '¡Claro! Nos especializamos en soluciones B2B. ¿Qué necesitas?',
            ai_tag: 'IA',
            typing: 'Escribiendo...',
            footer: '✨ Así se ve cerrar un negocio desde B2BChat'
        },
        about_title: 'Diseñado para empresas que venden, negocian y crecen en LATAM',
        about_items: {
            security: 'Seguridad Empresarial',
            b2b: '100% B2B',
            network: 'Red LATAM',
            integration: 'Integración Creatiendas'
        }
    },
    dashboard: {
        welcome: '¡Hola, {name}! 👋',
        subtitle: 'Gestiona tus conversaciones, campañas y conexiones empresariales',
        stats: {
            conversations: 'Conversaciones',
            campaigns: 'Campañas',
            connections: 'Conexiones',
            messages: 'Mensajes',
        },
        menu: {
            dashboard: 'Inicio',
            chat: 'Chat B2B',
            contacts: 'Contactos',
            discover: 'Descubrir Personas',
            ads: 'Gestor de Anuncios',
            store: 'Mi Tienda',
            create_store: 'Crear Mi Tienda',
        },
        cta_cross_title: 'Vende en CreaTiendas',
        cta_cross_text: 'Convierte tus chats en ventas reales',
    },
    chat: {
        sidebar: {
            recent_chats: 'Chats Recientes',
            search_placeholder: 'Busca tus chats o explora el marketplace...',
            new_chat: 'Nuevo chat',
            new_group: 'Nuevo grupo',
            my_profile: 'Mi Perfil',
            starred_messages_title: 'Mensajes destacados',
            select_chats: 'Seleccionar chats',
            cancel_selection: 'Cancelar selección',
            settings: 'Configuración',
            sign_out: 'Cerrar sesión',
            global_network: 'Red Global B2BChat (3000+)',
            scanning: 'Escaneando base de datos...',
            no_global_results: 'No se encontraron más resultados globales',
            independent_user: 'Usuario Independiente',
            delete_confirm: '¿Estás seguro de eliminar {count} conversaciones?',
            delete_success: 'Conversaciones eliminadas con éxito',
            selection_count: 'seleccionados',
            group_suffix: 'miembros',
            empty_hint: 'Empieza la conversación...',
            search_error_short: 'Por favor escribe al menos 2 caracteres',
        },
        window: {
            online: 'Online',
            offline: 'Offline',
            typing: 'Escribiendo...',
            input_placeholder: 'Escribe un mensaje',
            loading: 'Cargando mensajes...',
            no_messages: 'No hay mensajes. ¡Envía el primero!',
            select_chat: 'Selecciona una conversación para comenzar a chatear',
            member: 'Miembro',
            starred_title: 'Destacar mensaje',
            unstar_title: 'Quitar destacado',
            whatsapp_confirm: '¿Enviar este chat a WhatsApp de {name}?',
            whatsapp_success: '✅ Mensaje enviado a WhatsApp',
            options: {
                info: 'Info. del contacto',
                mute: 'Silenciar notificaciones',
                delete: 'Eliminar chat',
                search: 'Buscar en chat',
                more: 'Más opciones',
            },
            email_toast: {
                title: 'Notificación Enviada',
                body: 'Correo enviado a {email}',
            },
        },
        modals: {
            profile: {
                title: 'Editar Perfil',
                name_label: 'Nombre Completo',
                phone_label: 'Teléfono (No editable)',
                success: 'Perfil actualizado correctamente',
            },
            group: {
                title: 'Nuevo Grupo',
                subtitle: 'Crea un grupo para conectar con tu equipo',
                name_label: 'Nombre del Grupo *',
                name_placeholder: 'Ej: Equipo de Ventas',
                desc_label: 'Descripción (opcional)',
                desc_placeholder: 'Describe el propósito del grupo...',
                participants: 'Participantes *',
                create_btn: 'Crear Grupo',
                creating: 'Creando...',
                validation_error: 'Por favor ingresa un nombre y selecciona al menos un contacto',
            },
            invitation: {
                title: 'Invitar Contacto',
                not_registered: 'no está registrado en B2BChat.',
                hint: '¡Invítalo a unirse y empieza a conectar! 🚀',
                link_label: 'Link de Invitación',
                copy_success: '✓ Link copiado al portapapeles',
                whatsapp_btn: 'Enviar por WhatsApp',
            },
        },
        sidebar_title: 'Mensajes',
        search_placeholder: 'Buscar chats...',
        new_chat: 'Nuevo Chat',
        no_messages: 'No hay mensajes',
        type_message: 'Escribe un mensaje...',
        send: 'Enviar',
        online: 'Conectado',
        offline: 'Desconectado',
        last_seen: 'Última vez',
        email_sent_toast: 'Notificación enviada por email',
        actions: {
            pin: 'Fijar',
            unpin: 'Desfijar',
            favorite: 'Destacar',
            unfavorite: 'Quitar destacado',
            delete: 'Eliminar',
            mute: 'Silenciar',
        }
    },
    ads: {
        title: 'Gestor de Anuncios',
        subtitle: 'Crea y gestiona tus campañas publicitarias',
        create_btn: 'Crear Campaña',
        active_stories: 'Historias Activas',
        no_stories: 'No hay historias activas en este momento',
        create_first: 'Sé el primero en publicar',
        status: {
            draft: 'Borrador',
            pending: 'Pendiente',
            active: 'Activa',
            rejected: 'Rechazada',
            paused: 'Pausada',
            payment_pending: 'Pendiente de Pago',
        },
        wizard: {
            steps: {
                details: 'Detalles',
                segmentation: 'Segmentación',
                budget: 'Presupuesto',
                creative: 'Creativo',
                review: 'Revisar',
                payment: 'Pago',
            },
            details: {
                name_label: 'Nombre de la Campaña',
                objective_label: 'Objetivo',
                placeholders: {
                    name: 'Ej: Promoción Verano 2025',
                },
            },
            segmentation: {
                industry_label: 'Industria',
                sector_label: 'Sector',
                roles_label: 'Cargos (Roles)',
                age_label: 'Rango de Edad',
                gender_label: 'Género',
                location_label: 'Ubicación',
            },
            budget: {
                daily_label: 'Presupuesto Diario',
                total_label: 'Presupuesto Total',
                duration_label: 'Duración Calculada',
            },
            creative: {
                type_label: 'Tipo de Creativo',
                upload_label: 'Subir Archivo',
                text_label: 'Texto del Anuncio',
                desc_label: 'Descripción',
                url_label: 'URL de Destino',
            },
            payment: {
                title: 'Confirmación de Pago',
                instructions: 'Sube tu comprobante de Nequi para activar la campaña.',
                upload_proof: 'Subir Comprobante',
            },
        },
    },
    ecosystem: {
        seal: 'Parte de GNOSIS, ecosistema empresarial en crecimiento',
        title_main: "Donde nacen las",
        title_highlight: "conversaciones que se convierten en ventas",
        subtitle: "Creatiendas y B2BChat hacen parte de GNOSIS, un ecosistema empresarial diseñado para conectar comunicación, ventas y ejecución en un solo flujo.",
        b2bchat: {
            title: "B2BChat",
            tagline: "Tu motor de conversaciones B2B",
            benefits: [
                "Genera conversaciones calificadas entre empresas reales",
                "Elimina correos perdidos, LinkedIn frío y WhatsApp informal"
            ],
            badges: [
                "Empresas verificadas",
                "Conversaciones con intención real"
            ]
        },
        creatiendas: {
            title: "CreaTiendas",
            tagline: "Convierte conversaciones en ventas",
            benefits: [
                "Transforma chats en pedidos reales",
                "Tienda online conectada a WhatsApp",
                "Sin comisiones · Sin fricción · Activación inmediata"
            ],
            badges: [
                "Ventas directas",
                "Ejecución inmediata"
            ]
        },
        transition_text: "De la conversación al negocio, sin fricción",
        footer: {
            title_part1: "La diferencia entre",
            title_highlight1: "hablar",
            title_part2: "y",
            title_highlight2: "cerrar negocios",
            subtitle: "La mayoría de las empresas ya conversa con clientes. Muy pocas convierten esas conversaciones en ventas.",
            cta_store: "Crear mi tienda ahora",
            cta_b2b: "Descubrir B2BChat"
        }
    },
    hub: {
        hero_title: 'GNOSIS: El Hub que escala negocios B2B',
        hero_subtitle: 'Una visión integral que combina comunicación, estrategia y ejecución digital.',
        ceo_name: 'Gabriel Esquivia',
        ceo_title: 'Full stack developer & full stack digital marketer',
        ceo_summary: 'Especialista en crear y cerrar nuevos negocios, lanzar campañas de alto impacto y escalar ecosistemas digitales. Con experiencia liderando estrategias de Paid Media, SEO, automatización y analítica para marcas globales y startups.',
        experience_title: 'Trayectoria Estratégica',
        portfolio_title: 'Expertise en Acción (Behance)',
        view_project: 'Ver Proyecto',
    },
};
