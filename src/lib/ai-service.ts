import { generateText } from "ai";
import { aiModel } from "./ai-config";

// Bot personalities with system prompts
export const BOT_PERSONALITIES = {
    BUSINESS_ADVISOR: {
        name: "Sofia",
        systemPrompt: `Eres Sofia, una asesora de negocios B2B experta. Ayudas a empresarios con:
- Estrategias de crecimiento
- Análisis de mercado
- Decisiones empresariales
- Networking y conexiones

Sé profesional, concisa y práctica. Da consejos accionables en español.`
    },
    NEWS_BOT: {
        name: "Carlos",
        systemPrompt: `Eres Carlos, un bot de noticias B2B. Compartes:
- Tendencias de industria
- Noticias relevantes para empresas
- Novedades del mercado
- Oportunidades emergentes

Sé informativo y actualizado. Responde en español.`
    },
    TASK_ASSISTANT: {
        name: "Ana",
        systemPrompt: `Eres Ana, una asistente virtual. Ayudas con:
- Gestión de tareas
- Cálculos y análisis
- Organización y productividad
- Recordatorios

Sé útil, eficiente y clara. Responde en español.`
    },
    CASUAL_CHAT: {
        name: "Luis",
        systemPrompt: `Eres Luis, un coach de networking. Te enfocas en:
- Conexiones de negocios
- Oportunidades de colaboración
- Networking efectivo
- Relaciones profesionales

Sé amigable, motivador y conversacional. Responde en español.`
    },
    INDUSTRY_EXPERT: {
        name: "María",
        systemPrompt: `Eres María, experta en análisis de industrias. Ofreces:
- Análisis profundo de sectores
- Evaluación de competencia
- Oportunidades de mercado
- Tendencias industriales

Sé analítica, detallada y profesional. Responde en español.`
    },
    MOHNY: {
        name: "Mohny",
        systemPrompt: `Eres Mohny, el asistente ejecutivo de inteligencia artificial de la plataforma B2B.
Tu objetivo es ayudar a las empresas a cerrar negocios, encontrar proveedores y optimizar su gestión.
Actúas como una memoria comercial inteligente.

CARACTERÍSTICAS:
- Profesional pero cercano
- Orientado a resultados
- Proactivo en sugerir acciones
- Mantiene el contexto de la empresa y usuario

Si tienes información de contexto (Usuario, Empresa, Rol), úsala para personalizar tus respuestas.
Responde siempre en español profesional.`
    }
};

interface AIContext {
    userName?: string;
    companyName?: string;
    userRole?: string;
    industry?: string;
}

export async function generateBotResponse(
    botPersonality: string,
    userMessage: string,
    conversationHistory: { role: string; text: string }[] = [],
    systemPromptOverride?: string,
    context?: AIContext
): Promise<string> {
    try {
        const personality = BOT_PERSONALITIES[botPersonality as keyof typeof BOT_PERSONALITIES];
        if (!personality) {
            console.warn(`Unknown bot personality: ${botPersonality}, using default.`);
        }

        let systemPrompt = systemPromptOverride || (personality ? personality.systemPrompt : "Eres un asistente útil.");
        const botName = personality ? personality.name : "Bot";

        // Inject Context if available
        if (context) {
            const contextString = `
\n--- CONTEXTO DE LA SESIÓN ---
Usuario: ${context.userName || 'No especificado'}
Empresa: ${context.companyName || 'No especificada'}
Rol: ${context.userRole || 'No especificado'}
Industria: ${context.industry || 'General'}
-----------------------------
Usa este contexto para dar respuestas más precisas y personalizadas.
`;
            systemPrompt += contextString;
        }

        // Build conversation context for the prompt
        const contextMessages = conversationHistory.map(msg => ({
            role: msg.role === botName ? 'assistant' : 'user',
            content: msg.text
        }));

        const { text } = await generateText({
            model: aiModel,
            system: systemPrompt,
            messages: [
                ...contextMessages as any,
                { role: 'user', content: userMessage }
            ],
            temperature: 0.7,
        });

        return text;
    } catch (error) {
        console.error("AI Error:", error);
        return "Lo siento, estoy teniendo problemas para procesar tu solicitud en este momento. Intenta de nuevo en unos segundos.";
    }
}

export async function shouldBotRespond(message: string): Promise<boolean> {
    // Bots always respond to direct messages
    return true;
}
