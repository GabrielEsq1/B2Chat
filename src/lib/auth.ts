import { AuthOptions, Profile } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions: AuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                phone: { label: "Phone", type: "text" },
                password: { label: "Password", type: "password" },
                otpCode: { label: "OTP Code", type: "text" },
            },
            async authorize(credentials) {
                if (!credentials?.phone) {
                    throw new Error("Identifier (email or phone) is required");
                }

                // Check for user by email first, then phone
                const user = await prisma.user.findFirst({
                    where: {
                        OR: [
                            { email: credentials.phone },
                            { phone: credentials.phone }
                        ]
                    },
                });

                if (!user) {
                    throw new Error("User not found");
                }

                const otpCode = credentials.otpCode;
                const password = credentials.password;

                const isOtpLogin = otpCode && otpCode !== "undefined" && otpCode !== "null" && otpCode !== "";
                const isPasswordLogin = password && password !== "undefined" && password !== "null" && password !== "";

                // Check if using OTP or password
                if (isOtpLogin) {
                    // OTP-based authentication
                    if (!user.otpCode || !user.otpExpiresAt) {
                        throw new Error("No active OTP code");
                    }

                    if (new Date() > user.otpExpiresAt) {
                        throw new Error("OTP code has expired");
                    }

                    if (user.otpCode !== otpCode) {
                        throw new Error("Invalid OTP code");
                    }

                    // Clear OTP after successful login
                    await prisma.user.update({
                        where: { phone: credentials.phone },
                        data: { otpCode: null, otpExpiresAt: null },
                    });
                } else if (isPasswordLogin) {
                    // Password-based authentication
                    const isValid = await bcrypt.compare(password, user.passwordHash);
                    if (!isValid) {
                        throw new Error("Invalid password");
                    }
                } else {
                    throw new Error("Either password or OTP code is required");
                }

                return {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    phone: user.phone,
                    role: user.role,
                };
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.role = (user as any).role;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string;
                session.user.role = token.role as string;
            }
            return session;
        },
    },
    pages: {
        signIn: "/login",
        error: "/login",
    },
    secret: process.env.NEXTAUTH_SECRET,
    session: {
        strategy: "jwt",
    },
};
