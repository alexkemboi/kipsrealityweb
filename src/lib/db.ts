// Polyfill to allow JSON serialization of BigInt
// (Required for Payment.amountSubunits)
(BigInt.prototype as any).toJSON = function () {
    return this.toString();
};

import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
    prisma?: PrismaClient
}

export const prisma =
    globalForPrisma.prisma ??
    new PrismaClient({
        log: process.env.NODE_ENV === 'development'
            ? ['query', 'error', 'warn']
            : ['error'],
    })

export const db = prisma // Add alias for compatibility

if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma
}

export { PrismaClient }
