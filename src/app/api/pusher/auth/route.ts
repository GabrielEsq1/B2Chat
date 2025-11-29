import { NextResponse } from 'next/server';
import { pusherServer } from '@/lib/pusher-server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    const data = await req.text();
    const [socketId, channelName] = data.split('&').map((str) => str.split('=')[1]);

    const presenceData = {
        user_id: session.user.id,
        user_info: {
            name: session.user.name,
            email: session.user.email,
        },
    };

    const authResponse = pusherServer.authorizeChannel(socketId, channelName, presenceData);

    return NextResponse.json(authResponse);
}
