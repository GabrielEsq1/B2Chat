// Hugging Face API Client
// Free tier: 30,000 requests/month

const HF_API_KEY = process.env.B2BCHAT_EXT_HUGGINGFACE_KEY_PROD || process.env.HUGGINGFACE_API_KEY;
const HF_BASE_URL = 'https://api-inference.huggingface.co/models';

// Available free models
const MODELS = {
    CHAT: 'facebook/blenderbot-400M-distill',
    DIALOG: 'microsoft/DialoGPT-medium',
    QA: 'google/flan-t5-base'
};

export async function queryHuggingFace(text: string, model: string = MODELS.CHAT): Promise<string> {
    if (!HF_API_KEY) {
        console.warn('Hugging Face API key not configured');
        return '';
    }

    try {
        const response = await fetch(`${HF_BASE_URL}/${model}`, {
            headers: {
                'Authorization': `Bearer ${HF_API_KEY}`,
                'Content-Type': 'application/json'
            },
            method: 'POST',
            body: JSON.stringify({
                inputs: text,
                parameters: {
                    max_length: 100,
                    temperature: 0.7
                }
            })
        });

        if (!response.ok) {
            console.error('Hugging Face API error:', response.status);
            return '';
        }

        const data = await response.json();

        // Handle different response formats
        if (Array.isArray(data) && data.length > 0) {
            return data[0].generated_text || data[0].summary_text || '';
        }

        return '';
    } catch (error) {
        console.error('Hugging Face query error:', error);
        return '';
    }
}

export async function chatWithAI(message: string, conversationHistory: string[] = []): Promise<string> {
    // Build context from history
    const context = conversationHistory.slice(-5).join('\n'); // Last 5 messages
    const fullPrompt = context ? `${context}\nUser: ${message}` : message;

    return await queryHuggingFace(fullPrompt, MODELS.CHAT);
}

export { MODELS };
