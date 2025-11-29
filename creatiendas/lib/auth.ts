import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Credenciales",
            credentials: {
                email: { label: "Correo", type: "email", placeholder: "tucorreo@ejemplo.com" },
                password: { label: "Contraseña", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) return null;
                const user = await prisma.user.findUnique({ where: { email: credentials.email } });
                if (!user) return null;
                const isValid = await bcrypt.compare(credentials.password, user.passwordHash);
                if (!isValid) return null;
                return { id: user.id, email: user.email, name: user.name ?? "" };
            },
        }),
    ],
    secret: process.env.NEXTAUTH_SECRET,
    session: { strategy: "jwt" },
    jwt: { secret: process.env.NEXTAUTH_SECRET },
    callbacks: {
        async session({ session, token }) {
            if (token?.sub && session.user) {
                (session.user as any).id = token.sub;

                // Fetch user role and plan from database
                const user = await prisma.user.findUnique({
                    where: { id: token.sub },
                    select: { role: true, plan: true }
                });

                if (user) {
                    (session.user as any).role = user.role;
                    (session.user as any).plan = user.plan;
                }
            }
            return session;
        },
    },
    pages: {
        signIn: "/auth/login",
    },
};
