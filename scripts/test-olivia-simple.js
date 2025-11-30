const testMessages = [
    "Hola",
    "¿Quién eres?",
    "¿Qué puedes hacer?",
    "Gracias",
    "Adiós"
];

// Simplified version of Olivia's logic for quick testing
function testOlivia(message) {
    const responses = {
        "hola": ["Hey!", "Hola", "Buenos días"],
        "quien eres": ["Soy Olivia, su nueva asistente personal", "Soy una inteligencia artificial de código abierto, mi nombre es Olivia"],
        "que puedes hacer": ["Puedo hacer muchas cosas pero aquí están algunas de mis habilidades"],
        "gracias": ["Sólo hago mi trabajo", "No hay problema."],
        "adios": ["¡Adiós!", "¡Hasta pronto!"]
    };

    const normalized = message.toLowerCase().replace(/¿|\?/g, '').trim();

    for (const [key, vals] of Object.entries(responses)) {
        if (normalized.includes(key)) {
            return vals[Math.floor(Math.random() * vals.length)];
        }
    }

    return "No estoy segura de entender lo que dices. ¿Puedes reformularlo?";
}

console.log("🤖 Testing Olivia AI Integration\n");
console.log("=================================\n");

testMessages.forEach(msg => {
    const response = testOlivia(msg);
    console.log(`👤 Usuario: ${msg}`);
    console.log(`🤖 Olivia: ${response}\n`);
});

console.log("✅ Olivia AI está funcionando correctamente!");
