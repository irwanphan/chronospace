import { prisma } from "@/lib/prisma";

export async function approvalSchemaSeeder() {
  // Schema 1: Standard Purchase Request
  const standardPR = {
    name: 'Standard Purchase Request',
    documentType: 'Purchase Request',
    divisions: JSON.stringify(['RND', 'FIN', 'ITE', 'OPS', 'MKT']),
    roles: JSON.stringify(['Department Head', 'Finance Manager', 'CFO']),
    title: 'Standard PR Approval Flow',
    description: 'Standard approval flow for purchase requests',
    steps: {
      create: [
        {
          role: 'Department Head',
          duration: 24,
          overtime: 'Notify and Wait',
          order: 1,
          limit: 100000000 // 100 Juta
        },
        {
          role: 'Finance Manager',
          duration: 48,
          overtime: 'Notify and Wait',
          order: 2,
          limit: 500000000 // 500 Juta
        },
        {
          role: 'CFO',
          duration: 72,
          overtime: 'Notify and Wait',
          order: 3,
          limit: 1000000000 // 1 Miliar
        }
      ]
    }
  }

  await prisma.approvalSchema.create({
    data: standardPR
  });

  // Schema 2: Urgent Purchase Request
  const urgentPR = {
    name: 'Urgent Purchase Request',
    documentType: 'Purchase Request',
    divisions: JSON.stringify(['RND', 'FIN', 'ITE', 'OPS', 'MKT']),
    roles: JSON.stringify(['Department Head', 'CFO']),
    title: 'Urgent PR Approval Flow',
    description: 'Expedited approval flow for urgent purchase requests',
    steps: {
      create: [
        {
          role: 'Department Head',
          duration: 4,
          overtime: 'Auto Approve',
          order: 1,
          limit: 100000000 // 100 Juta
        },
        {
          role: 'CFO',
          duration: 8,
          overtime: 'Auto Approve',
          order: 2,
          limit: 1000000000 // 1 Miliar
        },
        {
          role: 'CEO',
          duration: 12,
          overtime: 'Notify and Wait',
          order: 3,
          limit: null // Unlimited
        }
      ]
    }
  }

  await prisma.approvalSchema.create({
    data: urgentPR
  });
}