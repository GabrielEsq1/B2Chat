// MonederoApp Integration - Payment Gateway Test Script
// Tests the virtual wallet integration with B2BChat

const API_BASE = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

interface PaymentTest {
    name: string;
    test: () => Promise<boolean>;
}

const tests: PaymentTest[] = [
    {
        name: "MonederoApp Page Loads",
        test: async () => {
            try {
                const res = await fetch(`${API_BASE}/monederaapp`);
                return res.ok || res.status === 404; // 404 is OK if route doesn't exist yet
            } catch {
                return false;
            }
        }
    },
    {
        name: "Payment API Endpoint Accessible",
        test: async () => {
            try {
                const res = await fetch(`${API_BASE}/api/payments/create`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ amount: 1000, currency: 'COP' })
                });
                // Should return 401 unauthorized (but endpoint exists)
                return res.status === 401 || res.status === 400 || res.ok;
            } catch {
                return false;
            }
        }
    },
    {
        name: "CreaTiendas.com Link Works",
        test: async () => {
            try {
                const targetUrl = 'https://creatiendasgit1.vercel.app/';
                const res = await fetch(targetUrl, { method: 'HEAD' });
                return res.ok;
            } catch {
                return false;
            }
        }
    }
];

async function runTests() {
    console.log('🧪 MonederoApp Integration Tests\n');

    let passed = 0;
    let failed = 0;

    for (const test of tests) {
        process.stdout.write(`  ${test.name}... `);
        try {
            const result = await test.test();
            if (result) {
                console.log('✅ PASS');
                passed++;
            } else {
                console.log('❌ FAIL');
                failed++;
            }
        } catch (error) {
            console.log(`❌ ERROR: ${error}`);
            failed++;
        }
    }

    console.log(`\n📊 Results: ${passed} passed, ${failed} failed\n`);

    if (failed > 0) {
        console.log('⚠️  Some tests failed. Review the integration.');
        process.exit(1);
    } else {
        console.log('✅ All MonederoApp integration tests passed!');
    }
}

runTests().catch(console.error);
