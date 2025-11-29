import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { generateBotResponse } from "./src/lib/ai-service";

async function testBot() {
    console.log("Testing Bot Response...");
    try {
        const response = await generateBotResponse(
            "BUSINESS_ADVISOR",
            "Hola, necesito ayuda con mi estrategia de marketing B2B.",
            []
        );
        console.log("Bot Response:", response);
    } catch (error) {
        console.error("Error:", error);
    }
}

testBot();
