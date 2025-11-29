/**
 * HTTP-based Chat System Test
 * Tests chat functionality via API endpoints
 */

const BASE_URL = 'http://localhost:3000';

interface TestUser {
    id: string;
    name: string;
    phone: string;
    email?: string;
    role: string;
}

interface TestResult {
    test: string;
    status: 'PASS' | 'FAIL';
    details?: any;
    error?: string;
}

const results: TestResult[] = [];

function logTest(test: string, status: 'PASS' | 'FAIL', details?: any, error?: string) {
    results.push({ test, status, details, error });
    const icon = status === 'PASS' ? '✅' : '❌';
    console.log(`${icon} ${test}`);
    if (details) console.log('   Details:', JSON.stringify(details, null, 2));
    if (error) console.log('   Error:', error);
}

async function makeRequest(endpoint: string, method: string = 'GET', body?: any) {
    const url = `${BASE_URL}${endpoint}`;
    const options: RequestInit = {
        method,
        headers: {
            'Content-Type': 'application/json',
        },
    };

    if (body) {
        options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);
    const data = await response.json();
    return { response, data };
}

async function testChatSystem() {
    console.log('🚀 Starting B2BChat HTTP API Test\n');
    console.log('='.repeat(60));

    try {
        // 1. Test Database Connection
        console.log('\n📊 1. Testing Database Connection...');
        try {
            const { data } = await makeRequest('/api/test-db');
            if (data.success) {
                logTest('Database Connection', 'PASS', { userCount: data.userCount });
            } else {
                logTest('Database Connection', 'FAIL', null, data.error);
            }
        } catch (error: any) {
            logTest('Database Connection', 'FAIL', null, error.message);
        }

        // 2. Get Users
        console.log('\n👥 2. Fetching Users...');
        let users: TestUser[] = [];
        try {
            const { data } = await makeRequest('/api/users');
            if (Array.isArray(data)) {
                users = data.slice(0, 5);
                logTest('Fetch Users', 'PASS', { count: users.length, users: users.map(u => u.name) });

                console.log('\n   Available Users:');
                users.forEach((user, idx) => {
                    console.log(`   ${idx + 1}. ${user.name} (${user.phone}) - ${user.role}`);
                });
            } else {
                logTest('Fetch Users', 'FAIL', null, 'Invalid response format');
            }
        } catch (error: any) {
            logTest('Fetch Users', 'FAIL', null, error.message);
        }

        if (users.length < 2) {
            console.log('\n⚠️  Not enough users to test conversations. Need at least 2 users.');
            return;
        }

        // 3. Test User-to-User Conversation
        console.log('\n💬 3. Testing User-to-User Conversation...');
        const user1 = users[0];
        const user2 = users[1];

        try {
            // Get or create conversation
            const { data: conversations } = await makeRequest('/api/conversations');
            console.log(`   Found ${conversations.length} existing conversations`);

            // Create a new conversation if needed
            let conversationId: string | null = null;

            // Check if conversation exists between user1 and user2
            const existingConv = conversations.find((conv: any) =>
                (conv.userAId === user1.id && conv.userBId === user2.id) ||
                (conv.userAId === user2.id && conv.userBId === user1.id)
            );

            if (existingConv) {
                conversationId = existingConv.id;
                console.log(`   Using existing conversation: ${conversationId}`);
            } else {
                const { data: newConv } = await makeRequest('/api/conversations', 'POST', {
                    userAId: user1.id,
                    userBId: user2.id,
                    type: 'USER_USER',
                });
                conversationId = newConv.id;
                console.log(`   Created new conversation: ${conversationId}`);
            }

            logTest('Create/Get Conversation', 'PASS', { conversationId });

            // Send messages
            console.log('\n   📤 Sending test messages...');

            const message1 = await makeRequest('/api/messages/send', 'POST', {
                conversationId,
                senderUserId: user1.id,
                text: `Hello ${user2.name}! This is a test message from ${user1.name}.`,
            });

            if (message1.data.success || message1.data.id) {
                logTest('Send Message 1', 'PASS', { from: user1.name, to: user2.name });
            } else {
                logTest('Send Message 1', 'FAIL', null, JSON.stringify(message1.data));
            }

            const message2 = await makeRequest('/api/messages/send', 'POST', {
                conversationId,
                senderUserId: user2.id,
                text: `Hi ${user1.name}! I received your message. Testing reply functionality.`,
            });

            if (message2.data.success || message2.data.id) {
                logTest('Send Message 2', 'PASS', { from: user2.name, to: user1.name });
            } else {
                logTest('Send Message 2', 'FAIL', null, JSON.stringify(message2.data));
            }

            // Poll for messages
            console.log('\n   📨 Polling for messages...');
            const { data: messages } = await makeRequest(`/api/messages/poll?conversationId=${conversationId}`);

            if (Array.isArray(messages)) {
                logTest('Poll Messages', 'PASS', { messageCount: messages.length });
                console.log(`\n   Messages in conversation (${messages.length} total):`);
                messages.slice(-5).forEach((msg: any, idx: number) => {
                    const sender = msg.senderUserId === user1.id ? user1.name : user2.name;
                    console.log(`   ${idx + 1}. ${sender}: ${msg.text}`);
                });
            } else {
                logTest('Poll Messages', 'FAIL', null, 'Invalid response format');
            }

        } catch (error: any) {
            logTest('User-to-User Conversation', 'FAIL', null, error.message);
        }

        // 4. Test Groups
        console.log('\n👨‍👩‍👧‍👦 4. Testing Groups...');
        try {
            const { data: groups } = await makeRequest('/api/groups');

            if (Array.isArray(groups)) {
                logTest('Fetch Groups', 'PASS', { count: groups.length });

                if (groups.length > 0) {
                    console.log(`\n   Available Groups (${groups.length}):`);
                    groups.slice(0, 5).forEach((group: any, idx: number) => {
                        console.log(`   ${idx + 1}. ${group.name} - ${group.members?.length || 0} members`);
                    });

                    // Test group conversation
                    const testGroup = groups[0];
                    console.log(`\n   Testing group: "${testGroup.name}"`);

                    // Get group conversation
                    const { data: groupConvs } = await makeRequest('/api/conversations');
                    const groupConv = groupConvs.find((conv: any) => conv.groupId === testGroup.id);

                    if (groupConv) {
                        console.log(`   Found group conversation: ${groupConv.id}`);

                        // Send group message
                        if (users.length >= 1) {
                            const { data: groupMsg } = await makeRequest('/api/messages/send', 'POST', {
                                conversationId: groupConv.id,
                                senderUserId: users[0].id,
                                text: `Hello everyone in ${testGroup.name}! This is a test group message.`,
                            });

                            if (groupMsg.success || groupMsg.id) {
                                logTest('Send Group Message', 'PASS', { group: testGroup.name });
                            } else {
                                logTest('Send Group Message', 'FAIL', null, JSON.stringify(groupMsg));
                            }
                        }
                    } else {
                        console.log(`   No conversation found for group ${testGroup.name}`);
                    }
                } else {
                    console.log('   No groups found. Create a group to test group chat.');
                }
            } else {
                logTest('Fetch Groups', 'FAIL', null, 'Invalid response format');
            }
        } catch (error: any) {
            logTest('Groups Test', 'FAIL', null, error.message);
        }

        // 5. Test Friend Requests
        console.log('\n🤝 5. Testing Friend Requests...');
        if (users.length >= 2) {
            try {
                const requester = users[0];
                const receiver = users[1];

                const { data: friendReq } = await makeRequest('/api/friends/request', 'POST', {
                    requesterId: requester.id,
                    receiverId: receiver.id,
                });

                if (friendReq.success || friendReq.id) {
                    logTest('Send Friend Request', 'PASS', {
                        from: requester.name,
                        to: receiver.name
                    });
                } else {
                    logTest('Send Friend Request', 'FAIL', null, JSON.stringify(friendReq));
                }
            } catch (error: any) {
                logTest('Friend Requests', 'FAIL', null, error.message);
            }
        }

        // 6. Test Contacts
        console.log('\n📇 6. Testing Contacts...');
        try {
            const { data: contacts } = await makeRequest('/api/contacts');

            if (Array.isArray(contacts)) {
                logTest('Fetch Contacts', 'PASS', { count: contacts.length });
                console.log(`   Found ${contacts.length} contacts`);
            } else {
                logTest('Fetch Contacts', 'FAIL', null, 'Invalid response format');
            }
        } catch (error: any) {
            logTest('Contacts Test', 'FAIL', null, error.message);
        }

        // Summary
        console.log('\n' + '='.repeat(60));
        console.log('\n📊 Test Summary:');
        const passed = results.filter(r => r.status === 'PASS').length;
        const failed = results.filter(r => r.status === 'FAIL').length;
        const total = results.length;

        console.log(`   ✅ Passed: ${passed}/${total}`);
        console.log(`   ❌ Failed: ${failed}/${total}`);
        console.log(`   📈 Success Rate: ${((passed / total) * 100).toFixed(1)}%`);

        console.log('\n' + '='.repeat(60));

        if (failed === 0) {
            console.log('✅ All tests passed!\n');
        } else {
            console.log('⚠️  Some tests failed. Review the errors above.\n');
        }

    } catch (error) {
        console.error('\n❌ Fatal error during testing:', error);
        throw error;
    }
}

// Run the test
console.log('⏳ Starting test in 2 seconds...');
console.log('⚠️  Make sure the Next.js dev server is running on http://localhost:3000\n');

setTimeout(() => {
    testChatSystem()
        .then(() => {
            console.log('🎉 Test script finished!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('💥 Test script failed:', error);
            process.exit(1);
        });
}, 2000);
