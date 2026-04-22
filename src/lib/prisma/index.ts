import { PrismaClient } from "@prisma/client";

// Keep a single Prisma instance across hot reloads in dev
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

// Don't save to global in production
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
