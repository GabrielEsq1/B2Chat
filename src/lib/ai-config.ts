import { createGroq } from '@ai-sdk/groq';

/**
 * Configuración del modelo de IA usando Groq (Llama 3.1)
 * Groq ofrece inferencia extremadamente rápida para modelos Llama
 */
const groq = createGroq({
    apiKey: process.env.B2BCHAT_AI_GROQ_KEY_PROD || process.env.GROQ_API_KEY,
});

// Usamos Llama 3.3 70B para un balance óptimo entre inteligencia y velocidad
export const aiModel = groq('llama-3.3-70b-versatile');

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
