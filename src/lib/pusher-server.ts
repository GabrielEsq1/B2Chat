import PusherServer from 'pusher';

export const pusherServer = new PusherServer({
    appId: process.env.B2BCHAT_REALTIME_PUSHER_APPID_PROD || process.env.PUSHER_APP_ID!,
    key: process.env.NEXT_PUBLIC_B2BCHAT_REALTIME_PUSHER_KEY || process.env.NEXT_PUBLIC_PUSHER_KEY!,
    secret: process.env.B2BCHAT_REALTIME_PUSHER_SECRET_PROD || process.env.PUSHER_SECRET!,
    cluster: process.env.NEXT_PUBLIC_B2BCHAT_REALTIME_PUSHER_CLUSTER || process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    useTLS: true,
});
