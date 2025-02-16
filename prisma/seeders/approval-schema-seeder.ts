import { prisma } from "@/lib/prisma";

export async function approvalSchemaSeeder() {
  // Schema 1: Standard Purchase Request
  const standardPR = {
    name: 'Standard Purchase Request',
    documentType: 'Purchase Request',
    divisions: JSON.stringify(['RND', 'FIN', 'ITE', 'OPS', 'MKT']),
    roles: JSON.stringify(['role-dh', 'role-fm', 'role-st']),
    title: 'Standard PR Approval Flow',
    description: 'Standard approval flow for purchase requests',
    steps: {
      create: [
        {
          role: 'role-gm',
          duration: 24,
          overtime: 'Notify and Wait',
          order: 1,
          limit: 250000000 // 250 Juta
        },
        {
          role: 'role-cfo',
          duration: 48,
          overtime: 'Notify and Wait',
          order: 2,
          limit: 500000000 // 500 Juta
        },
        {
          role: 'role-ceo',
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
    roles: JSON.stringify(['role-dh', 'role-fm', 'role-st']),
    title: 'Urgent PR Approval Flow',
    description: 'Expedited approval flow for urgent purchase requests',
    steps: {
      create: [
        {
          role: 'role-gm',
          duration: 4,
          overtime: 'Auto Approve',
          order: 1,
          limit: 250000000 // 250 Juta
        },
        {
          role: 'role-cfo',
          duration: 8,
          overtime: 'Auto Approve',
          order: 2,
          limit: 500000000 // 500 Juta
        },
        {
          role: 'role-ceo',
          duration: 12,
          overtime: 'Notify and Wait',
          order: 3,
          limit: 1000000000 // 1 Miliar
        }
      ]
    }
  }

  await prisma.approvalSchema.create({
    data: urgentPR
  });
}