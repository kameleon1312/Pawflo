import { PrismaClient } from '@prisma/client';

// Singleton to avoid exhausting connections in Next.js hot-reload dev mode
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({ log: process.env.NODE_ENV === 'development' ? ['error'] : [] });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
