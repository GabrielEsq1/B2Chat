import 'dotenv/config';
import { prisma } from './src/lib/prisma';

async function testChatSystem() {
    console.log('🚀 Starting B2BChat Database Test\n');
    console.log('='.repeat(60));

    try {
        // 1. Test Database Connection
        console.log('\n📊 1. Testing Database Connection...');
        const userCount = await prisma.user.count();
        const groupCount = await prisma.group.count();
        const conversationCount = await prisma.conversation.count();
        const messageCount = await prisma.message.count();

        console.log(`✅ Database connected successfully!`);
        console.log(`   - Users: ${userCount}`);
        console.log(`   - Groups: ${groupCount}`);
        console.log(`   - Conversations: ${conversationCount}`);
        console.log(`   - Messages: ${messageCount}`);

        // 2. Get Test Users
        console.log('\n👥 2. Fetching Test Users...');
        const users = await prisma.user.findMany({
            take: 5,
            select: {
                id: true,
                name: true,
                phone: true,
                email: true,
                role: true,
                isBot: true,
            },
        });

        if (users.length === 0) {
            console.log('❌ No users found in database. Please seed the database first.');
            return;
        }

        console.log(`✅ Found ${users.length} users:`);
        users.forEach((user, idx) => {
            console.log(`   ${idx + 1}. ${user.name} (${user.phone}) - ${user.role}${user.isBot ? ' [BOT]' : ''}`);
        });

        // 3. Test User-to-User Conversations
        console.log('\n💬 3. Testing User-to-User Conversations...');
        if (users.length >= 2) {
            const user1 = users[0];
            const user2 = users[1];

            // Check if conversation exists
            let conversation = await prisma.conversation.findFirst({
                where: {
                    OR: [
                        { userAId: user1.id, userBId: user2.id },
                        { userAId: user2.id, userBId: user1.id },
                    ],
                    type: 'USER_USER',
                },
                include: {
                    messages: {
                        orderBy: { createdAt: 'desc' },
                        take: 5,
                        include: {
                            sender: {
                                select: { name: true },
                            },
                        },
                    },
                },
            });

            if (!conversation) {
                console.log(`   Creating conversation between ${user1.name} and ${user2.name}...`);
                conversation = await prisma.conversation.create({
                    data: {
                        type: 'USER_USER',
                        userAId: user1.id,
                        userBId: user2.id,
                    },
                    include: {
                        messages: true,
                    },
                });
                console.log(`   ✅ Conversation created: ${conversation.id}`);
            } else {
                console.log(`   ✅ Existing conversation found: ${conversation.id}`);
            }

            // Send test messages
            console.log(`\n   📤 Sending test messages...`);
            const message1 = await prisma.message.create({
                data: {
                    conversationId: conversation.id,
                    senderUserId: user1.id,
                    text: `Hello ${user2.name}! This is a test message from ${user1.name}.`,
                },
            });
            console.log(`   ✅ Message 1 sent: "${message1.text}"`);

            const message2 = await prisma.message.create({
                data: {
                    conversationId: conversation.id,
                    senderUserId: user2.id,
                    text: `Hi ${user1.name}! I received your message. Testing reply functionality.`,
                },
            });
            console.log(`   ✅ Message 2 sent: "${message2.text}"`);

            // Retrieve conversation with messages
            if (!conversation) {
                console.log('❌ Failed to create conversation');
                return;
            }
            const conversationWithMessages = await prisma.conversation.findUnique({
                where: { id: conversation.id },
                include: {
                    messages: {
                        orderBy: { createdAt: 'asc' },
                        include: {
                            sender: {
                                select: { name: true },
                            },
                        },
                    },
                },
            });

            console.log(`\n   📨 Conversation Messages (${conversationWithMessages?.messages.length || 0} total):`);
            conversationWithMessages?.messages.forEach((msg, idx) => {
                const time = msg.createdAt.toLocaleTimeString();
                console.log(`   ${idx + 1}. [${time}] ${msg.sender.name}: ${msg.text}`);
            });
        }

        // 4. Test Groups
        console.log('\n👨‍👩‍👧‍👦 4. Testing Groups...');
        let testGroup = await prisma.group.findFirst({
            include: {
                members: {
                    include: {
                        user: {
                            select: { name: true, phone: true },
                        },
                    },
                },
                conversations: {
                    include: {
                        messages: {
                            orderBy: { createdAt: 'desc' },
                            take: 5,
                        },
                    },
                },
            },
        });

        if (!testGroup && users.length >= 3) {
            console.log('   Creating test group...');
            testGroup = await prisma.group.create({
                data: {
                    name: 'Test Group Chat',
                    description: 'A test group for testing chat functionality',
                    createdById: users[0].id,
                    members: {
                        create: [
                            { userId: users[0].id, isAdmin: true },
                            { userId: users[1].id, isAdmin: false },
                            { userId: users[2].id, isAdmin: false },
                        ],
                    },
                },
                include: {
                    members: {
                        include: {
                            user: {
                                select: { name: true, phone: true },
                            },
                        },
                    },
                    conversations: true,
                },
            });
            console.log(`   ✅ Group created: "${testGroup.name}" (${testGroup.id})`);
        } else if (testGroup) {
            console.log(`   ✅ Existing group found: "${testGroup.name}" (${testGroup.id})`);
        }

        if (testGroup) {
            console.log(`\n   👥 Group Members (${testGroup.members.length}):`);
            testGroup.members.forEach((member, idx) => {
                console.log(`   ${idx + 1}. ${member.user.name} (${member.user.phone})${member.isAdmin ? ' [ADMIN]' : ''}`);
            });

            // Create group conversation if it doesn't exist
            let groupConversation = await prisma.conversation.findFirst({
                where: {
                    groupId: testGroup.id,
                },
                include: {
                    messages: {
                        orderBy: { createdAt: 'asc' },
                        include: {
                            sender: {
                                select: { name: true },
                            },
                        },
                    },
                },
            });

            if (!groupConversation) {
                console.log('\n   Creating group conversation...');
                groupConversation = await prisma.conversation.create({
                    data: {
                        type: 'USER_USER',
                        groupId: testGroup.id,
                    },
                    include: {
                        messages: true,
                    },
                });
                console.log(`   ✅ Group conversation created: ${groupConversation.id}`);
            }

            if (!groupConversation) {
                console.log('❌ Failed to create group conversation');
                return;
            }

            // Send group messages
            console.log(`\n   📤 Sending group messages...`);
            const groupMembers = testGroup.members.slice(0, 3);

            for (let i = 0; i < groupMembers.length; i++) {
                const member = groupMembers[i];
                const message = await prisma.message.create({
                    data: {
                        conversationId: groupConversation.id,
                        senderUserId: member.userId,
                        text: `Hello everyone! This is ${member.user.name} testing the group chat.`,
                    },
                });
                console.log(`   ✅ Message from ${member.user.name}: "${message.text}"`);
            }

            // Retrieve all group messages
            const groupConvWithMessages = await prisma.conversation.findUnique({
                where: { id: groupConversation.id },
                include: {
                    messages: {
                        orderBy: { createdAt: 'asc' },
                        include: {
                            sender: {
                                select: { name: true },
                            },
                        },
                    },
                },
            });

            console.log(`\n   📨 Group Messages (${groupConvWithMessages?.messages.length || 0} total):`);
            groupConvWithMessages?.messages.forEach((msg, idx) => {
                const time = msg.createdAt.toLocaleTimeString();
                console.log(`   ${idx + 1}. [${time}] ${msg.sender.name}: ${msg.text}`);
            });
        }

        // 5. Test Multiple Conversations
        console.log('\n🔄 5. Testing Multiple Conversations...');
        const allConversations = await prisma.conversation.findMany({
            take: 10,
            include: {
                userA: {
                    select: { name: true },
                },
                userB: {
                    select: { name: true },
                },
                group: {
                    select: { name: true },
                },
                messages: {
                    orderBy: { createdAt: 'desc' },
                    take: 1,
                },
            },
        });

        console.log(`✅ Found ${allConversations.length} conversations:`);
        allConversations.forEach((conv, idx) => {
            const participants = conv.group
                ? `Group: ${conv.group.name}`
                : `${conv.userA?.name || 'Unknown'} ↔ ${conv.userB?.name || 'Unknown'}`;
            const lastMessage = conv.messages[0];
            const messagePreview = lastMessage
                ? `"${lastMessage.text.substring(0, 40)}..."`
                : 'No messages';
            console.log(`   ${idx + 1}. ${participants} - ${messagePreview}`);
        });

        // 6. Test Friend Requests
        console.log('\n🤝 6. Testing Friend Requests...');
        if (users.length >= 2) {
            const requester = users[0];
            const receiver = users[1];

            let friendRequest = await prisma.friendRequest.findFirst({
                where: {
                    requesterId: requester.id,
                    receiverId: receiver.id,
                },
            });

            if (!friendRequest) {
                console.log(`   Creating friend request from ${requester.name} to ${receiver.name}...`);
                friendRequest = await prisma.friendRequest.create({
                    data: {
                        requesterId: requester.id,
                        receiverId: receiver.id,
                        status: 'PENDING',
                    },
                });
                console.log(`   ✅ Friend request created: ${friendRequest.id}`);
            } else {
                console.log(`   ✅ Existing friend request found: ${friendRequest.status}`);
            }

            // Accept the friend request
            if (friendRequest.status === 'PENDING') {
                await prisma.friendRequest.update({
                    where: { id: friendRequest.id },
                    data: { status: 'ACCEPTED' },
                });
                console.log(`   ✅ Friend request accepted!`);
            }
        }

        // 7. Summary Statistics
        console.log('\n📈 7. Summary Statistics:');
        const stats = {
            totalUsers: await prisma.user.count(),
            totalGroups: await prisma.group.count(),
            totalConversations: await prisma.conversation.count(),
            totalMessages: await prisma.message.count(),
            totalFriendRequests: await prisma.friendRequest.count(),
            acceptedFriendRequests: await prisma.friendRequest.count({
                where: { status: 'ACCEPTED' },
            }),
            pendingFriendRequests: await prisma.friendRequest.count({
                where: { status: 'PENDING' },
            }),
        };

        console.log(`   👥 Total Users: ${stats.totalUsers}`);
        console.log(`   👨‍👩‍👧‍👦 Total Groups: ${stats.totalGroups}`);
        console.log(`   💬 Total Conversations: ${stats.totalConversations}`);
        console.log(`   📨 Total Messages: ${stats.totalMessages}`);
        console.log(`   🤝 Friend Requests:`);
        console.log(`      - Total: ${stats.totalFriendRequests}`);
        console.log(`      - Accepted: ${stats.acceptedFriendRequests}`);
        console.log(`      - Pending: ${stats.pendingFriendRequests}`);

        console.log('\n' + '='.repeat(60));
        console.log('✅ All tests completed successfully!\n');

    } catch (error) {
        console.error('\n❌ Error during testing:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

// Run the test
testChatSystem()
    .then(() => {
        console.log('🎉 Test script finished!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('💥 Test script failed:', error);
        process.exit(1);
    });
