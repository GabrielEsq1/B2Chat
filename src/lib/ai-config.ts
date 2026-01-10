import { createGroq } from '@ai-sdk/groq';
import { createGoogleGenerativeAI } from '@ai-sdk/google';

/**
 * Configuración del modelo de IA usando Groq (Llama 3.1)
 * Groq ofrece inferencia extremadamente rápida para modelos Llama
 */
const groq = createGroq({
    apiKey: process.env.B2BCHAT_AI_GROQ_KEY_PROD || process.env.GROQ_API_KEY || '[REMOVED_GROQ_KEY]',
});

// Usamos Llama 3.3 70B para un balance óptimo entre inteligencia y velocidad
// Google Generative AI Configuration
export const googleConfig = {
    apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY || '[REMOVED_GOOGLE_KEY]',
    geminiKey: process.env.GEMINI_API_KEYb2b || 'https://makersuite.google.com/app/apikey',
};

const google = createGoogleGenerativeAI({
    apiKey: googleConfig.apiKey,
});

export const aiModel = groq('llama-3.3-70b-versatile');
export const googleModel = google('gemini-1.5-pro-latest');

/**
 * Configuración del sistema para el bot de IA
 */
export const systemPrompt = `Eres un asistente de IA útil y amigable para B2BChat, una plataforma de mensajería empresarial.

Tus responsabilidades:
- Ayudar a los usuarios con preguntas sobre la plataforma
- Proporcionar información sobre características y funcionalidades
- Ser profesional pero amigable en tus respuestas
- Responder en el idioma del usuario (principalmente español)

Mantén las respuestas concisas y útiles.`;
