import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

const connectionString = process.env.DATABASE_URL;

const isAccelerate = connectionString?.startsWith("prisma://") || connectionString?.startsWith("prisma+postgres://");

const adapter = isAccelerate
    ? undefined
    : new PrismaPg(new Pool({ connectionString }));

export const prisma =
    globalForPrisma.prisma ||
    new PrismaClient({
        log: ["query"],
        adapter: adapter,
        accelerateUrl: isAccelerate ? connectionString : undefined,
    });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
