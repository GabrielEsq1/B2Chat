import { olivia } from '../src/lib/olivia/index.ts';

async function testOlivia() {
    console.log("🧪 Testing Olivia AI Logic Locally...\n");

    const testInputs = [
        "Hola",
        "¿Quién eres?",
        "Cuéntame un chiste", // Should trigger fallback
        "¿Qué puedes hacer?",
        "Adiós"
    ];

    for (const input of testInputs) {
        console.log(`👤 User: "${input}"`);
        const response = olivia.process(input);
        console.log(`🤖 Olivia: "${response}"\n`);
    }
}

testOlivia().catch(console.error);
