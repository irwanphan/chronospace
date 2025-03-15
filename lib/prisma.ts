import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    // log: ['query', 'error', 'warn'], // Aktifkan logging untuk debugging
  });

if (!globalForPrisma.prisma) {
  globalForPrisma.prisma = prisma; // Cache di globalThis untuk mencegah multiple instances
}
