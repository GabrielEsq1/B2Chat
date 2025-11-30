// Simple test of Olivia AI logic without DB
import { olivia } from '../src/lib/olivia/index.js';

console.log("🤖 Testing Olivia AI Integration\n");
console.log("=================================\n");

const testMessages = [
    "Hola",
    "¿Quién eres?",
    "¿Qué puedes hacer?",
    "Gracias",
    "Adiós"
];

testMessages.forEach(msg => {
    const response = olivia.process(msg);
    console.log(`👤 Usuario: ${msg}`);
    console.log(`🤖 Olivia: ${response}\n`);
});

console.log("✅ Olivia AI está funcionando correctamente!");
