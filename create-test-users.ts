// Script to create test users for live chat demonstration
async function createTestUsers() {
    const users = [
        {
            name: "Maria Rodriguez",
            email: "maria.rodriguez@test.com",
            phone: "+57 301 111 2222",
            password: "test1234",
            companyName: "Tech Solutions SA"
        },
        {
            name: "Carlos Mendez",
            email: "carlos.mendez@test.com",
            phone: "+57 302 333 4444",
            password: "test1234",
            companyName: "Digital Innovations"
        }
    ];

    console.log("Creating 2 test users for live chat demonstration...\n");

    for (const user of users) {
        try {
            const response = await fetch('http://localhost:3000/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(user),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                console.log(`✓ User created: ${user.name} (${user.email})`);
            } else {
                console.log(`✗ Failed to create ${user.name}: ${data.error || 'Unknown error'}`);
            }
        } catch (error) {
            console.error(`✗ Error creating ${user.name}:`, error);
        }
    }

    console.log("\n✓ Test users creation completed!");
    console.log("\nYou can now login with:");
    console.log("User 1: maria.rodriguez@test.com / test1234");
    console.log("User 2: carlos.mendez@test.com / test1234");
}

createTestUsers();
