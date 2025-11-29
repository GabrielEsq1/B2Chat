import { generateText } from "ai";
import { aiModel } from "./ai-config";

// Bot personalities with system prompts
const BOT_PERSONALITIES = {
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
    }
};

export async function generateBotResponse(
    botPersonality: string,
    userMessage: string,
    conversationHistory: { role: string; text: string }[] = []
): Promise<string> {
    try {
        const personality = BOT_PERSONALITIES[botPersonality as keyof typeof BOT_PERSONALITIES];
        if (!personality) {
            // Fallback to a default personality if not found
            console.warn(`Unknown bot personality: ${botPersonality}, using default.`);
        }

        const systemPrompt = personality ? personality.systemPrompt : "Eres un asistente útil.";
        const botName = personality ? personality.name : "Bot";

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
        return "Lo siento, estoy teniendo problemas para procesar tu solicitud en este momento. ¿Podrías intentarlo de nuevo?";
    }
}

export async function shouldBotRespond(message: string): Promise<boolean> {
    // Bots always respond to direct messages
    return true;
}
