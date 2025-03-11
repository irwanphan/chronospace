import { prisma } from "@/lib/prisma";

export async function approvalSchemaSeeder() {
  // Schema 1: Standard Purchase Request
  const standardPR = {
    name: 'Standard Purchase Request',
    documentType: 'Purchase Request',
    workDivisionIds: JSON.stringify(['RND', 'FIN', 'ITE', 'OPS', 'MKT']),
    roleIds: JSON.stringify(['role-dh', 'role-fm', 'role-st']),
    description: 'Standard approval flow for purchase requests',
    approvalSteps: {
      create: [
        {
          roleId: 'role-gm',
          duration: 24,
          overtimeAction: 'Notify and Wait',
          order: 1,
          budgetLimit: 250000000 // 250 Juta
        },
        {
          roleId: 'role-cfo',
          duration: 48,
          overtimeAction: 'Notify and Wait',
          order: 2,
          budgetLimit: 500000000 // 500 Juta
        },
        {
          roleId: 'role-ceo',
          duration: 72,
          overtimeAction: 'Notify and Wait',
          order: 3,
          budgetLimit: 1000000000 // 1 Miliar
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
    workDivisionIds: JSON.stringify(['RND', 'FIN', 'ITE', 'OPS', 'MKT']),
    roleIds: JSON.stringify(['role-dh', 'role-fm', 'role-st']),
    description: 'Expedited approval flow for urgent purchase requests',
    approvalSteps: {
      create: [
        {
          roleId: 'role-gm',
          duration: 4,
          overtimeAction: 'Auto Decline',
          order: 1,
          budgetLimit: 250000000 // 250 Juta
        },
        {
          roleId: 'role-cfo',
          duration: 8,
          overtimeAction: 'Auto Decline',
          order: 2,
          budgetLimit: 500000000 // 500 Juta
        },
        {
          roleId: 'role-ceo',
          duration: 12,
          overtimeAction: 'Auto Decline',
          order: 3,
          budgetLimit: 1000000000 // 1 Miliar
        }
      ]
    }
  }

  await prisma.approvalSchema.create({
    data: urgentPR
  });
}