import { prisma } from "@/lib/prisma";

export async function roleSeeder() {
  const roles = [
    { 
      id: 'cm71xui670000sgpr8ygg9z6u',
      roleCode: 'CEO',
      roleName: 'Chief Executive Officer',
      description: 'Highest level executive position',
      upperLevel: null,
      approvalLimit: 1000000000 // 1 Miliar
    },
    { 
      roleCode: 'CFO',
      roleName: 'Chief Financial Officer',
      description: 'Head of financial operations',
      upperLevel: 'CEO',
      approvalLimit: 500000000 // 500 Juta
    },
    { 
      roleCode: 'GM',
      roleName: 'General Manager',
      description: 'General management position',
      upperLevel: 'CEO',
      approvalLimit: 250000000 // 250 Juta
    },
    { 
      roleCode: 'DH',
      roleName: 'Department Head',
      description: 'Department management position',
      upperLevel: 'GM',
      approvalLimit: 100000000 // 100 Juta
    },
    { 
      roleCode: 'FM',
      roleName: 'Finance Manager',
      description: 'Financial management position',
      upperLevel: 'CFO',
      approvalLimit: 50000000 // 50 Juta
    }
  ]

  await prisma.role.createMany({
    data: roles
  });

  await Promise.all(
    roles.map(role => 
      prisma.role.upsert({
        where: { roleCode: role.roleCode },
        update: {
          roleName: role.roleName,
          description: role.description,
          upperLevel: role.upperLevel,
          approvalLimit: role.approvalLimit,
        },
        create: role,
      })
    )
  );
}
