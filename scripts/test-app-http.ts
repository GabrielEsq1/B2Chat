/**
 * Comprehensive HTTP-based Test Suite for B2BChat Application
 * Tests all major features via API endpoints
 */

async function testApp() {
    console.log('🚀 Starting B2BChat Application Tests\n');
    console.log('='.repeat(70));

    const baseUrl = 'http://localhost:3000';
    let testsPassed = 0;
    let testsFailed = 0;

    // Helper function to test an endpoint
    async function testEndpoint(name: string, url: string, options?: RequestInit) {
        try {
            console.log(`\n📍 Testing: ${name}`);
            console.log(`   URL: ${url}`);

            const response = await fetch(url, options);
            const status = response.status;

            console.log(`   Status: ${status}`);

            if (status >= 200 && status < 400) {
                console.log(`   ✅ PASSED`);
                testsPassed++;
                return { success: true, response };
            } else {
                console.log(`   ❌ FAILED (Status: ${status})`);
                testsFailed++;
                return { success: false, response };
            }
        } catch (error) {
            console.log(`   ❌ FAILED (Error: ${error instanceof Error ? error.message : 'Unknown error'})`);
            testsFailed++;
            return { success: false, error };
        }
    }

    // 1. Test Homepage
    console.log('\n\n📱 1. TESTING HOMEPAGE & BASIC ROUTES');
    console.log('-'.repeat(70));
    await testEndpoint('Homepage', `${baseUrl}/`);
    await testEndpoint('Login Page', `${baseUrl}/login`);
    await testEndpoint('Register Page', `${baseUrl}/register`);

    // 2. Test API Health
    console.log('\n\n🏥 2. TESTING API HEALTH');
    console.log('-'.repeat(70));
    await testEndpoint('API Health Check', `${baseUrl}/api/health`);

    // 3. Test Authentication APIs
    console.log('\n\n🔐 3. TESTING AUTHENTICATION');
    console.log('-'.repeat(70));

    // Test registration
    const registerData = {
        name: `Test User ${Date.now()}`,
        phone: `+1${Date.now().toString().slice(-10)}`,
        email: `test${Date.now()}@example.com`,
        password: 'TestPassword123!',
        role: 'USUARIO'
    };

    const registerResult = await testEndpoint(
        'User Registration',
        `${baseUrl}/api/auth/register`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(registerData)
        }
    );

    // 4. Test Chat APIs
    console.log('\n\n💬 4. TESTING CHAT SYSTEM');
    console.log('-'.repeat(70));

    // Note: These will likely fail without authentication, but we're testing the endpoints exist
    await testEndpoint('Get Conversations', `${baseUrl}/api/conversations`);
    await testEndpoint('Send Message', `${baseUrl}/api/messages/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            conversationId: 'test-id',
            text: 'Test message'
        })
    });

    // 5. Test AI Chat
    console.log('\n\n🤖 5. TESTING AI CHAT');
    console.log('-'.repeat(70));
    await testEndpoint('AI Chat Endpoint', `${baseUrl}/api/chat/ai`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            conversationId: 'test-id',
            userId: 'test-user-id',
            messages: [{ role: 'user', content: 'Hello' }]
        })
    });

    // 6. Test Campaigns/Ads
    console.log('\n\n📢 6. TESTING CAMPAIGNS & ADS');
    console.log('-'.repeat(70));
    await testEndpoint('Get Active Ads', `${baseUrl}/api/ads/active`);
    await testEndpoint('Create Campaign', `${baseUrl}/api/campaigns/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            name: 'Test Campaign',
            objective: 'TRAFFIC',
            dailyBudget: 100,
            durationDays: 7
        })
    });

    // 7. Test Groups
    console.log('\n\n👥 7. TESTING GROUPS');
    console.log('-'.repeat(70));
    await testEndpoint('Get Groups', `${baseUrl}/api/groups`);
    await testEndpoint('Create Group', `${baseUrl}/api/groups/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            name: 'Test Group',
            description: 'A test group'
        })
    });

    // 8. Test Contacts/Friends
    console.log('\n\n📇 8. TESTING CONTACTS & FRIEND REQUESTS');
    console.log('-'.repeat(70));
    await testEndpoint('Get Contacts', `${baseUrl}/api/contacts`);
    await testEndpoint('Search Users', `${baseUrl}/api/users/search?q=test`);

    // 9. Test File Upload
    console.log('\n\n📁 9. TESTING FILE UPLOAD');
    console.log('-'.repeat(70));
    await testEndpoint('Upload Endpoint', `${baseUrl}/api/upload`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
    });

    // 10. Test Admin Routes
    console.log('\n\n⚙️ 10. TESTING ADMIN ROUTES');
    console.log('-'.repeat(70));
    await testEndpoint('Admin Dashboard', `${baseUrl}/admin`);
    await testEndpoint('Admin Config', `${baseUrl}/admin/config`);

    // Summary
    console.log('\n\n' + '='.repeat(70));
    console.log('📊 TEST SUMMARY');
    console.log('='.repeat(70));
    console.log(`✅ Tests Passed: ${testsPassed}`);
    console.log(`❌ Tests Failed: ${testsFailed}`);
    console.log(`📈 Total Tests: ${testsPassed + testsFailed}`);
    console.log(`🎯 Success Rate: ${((testsPassed / (testsPassed + testsFailed)) * 100).toFixed(1)}%`);
    console.log('='.repeat(70));

    if (testsFailed === 0) {
        console.log('\n🎉 All tests passed!');
    } else {
        console.log(`\n⚠️  ${testsFailed} test(s) failed. Review the output above for details.`);
    }
}

// Run the tests
testApp()
    .then(() => {
        console.log('\n✨ Test suite completed!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n💥 Test suite failed:', error);
        process.exit(1);
    });
