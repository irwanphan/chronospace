import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    // 1. Revoke all active certificates
    const result = await prisma.userCertificate.updateMany({
      where: {
        isActive: true,
        revokedAt: null
      },
      data: {
        isActive: false,
        revokedAt: new Date(),
        revocationReason: 'Encryption key change - certificate reset'
      }
    });

    console.log(`Successfully revoked ${result.count} active certificates.`);
    console.log('\nPlease follow these steps:');
    console.log('1. Add this line to your .env file:');
    console.log('ENCRYPTION_KEY=eNCQEtqhKt7+yK8wNtro9fw4u7piUuLHhLoEWurCZNI=');
    console.log('\n2. Restart your application:');
    console.log('npm run dev');
    console.log('\n3. Generate new certificates for users through the user management interface.');

  } catch (error) {
    console.error('Error revoking certificates:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 