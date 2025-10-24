import { PrismaClient } from '@prisma/client'

// We’re telling TypeScript that we want to attach a property prisma to it.
const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined
}

// if globalForPrisma.prisma already exists reuse it. Otherwise create a new PrismaClient instance.
export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma