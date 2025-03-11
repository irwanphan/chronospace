import { prisma } from "@/lib/prisma";

export async function roleSeeder() {
  const roles = [
    { 
      id: 'role-ceo',
      roleCode: 'CEO',
      roleName: 'Chief Executive Officer',
      description: 'Highest level executive position',
      upperLevel: null,
      budgetLimit: 1000000000 // 1 Miliar
    },
    { 
      id: 'role-cfo',
      roleCode: 'CFO',
      roleName: 'Chief Financial Officer',
      description: 'Head of financial operations',
      upperLevel: 'role-ceo',
      budgetLimit: 500000000 // 500 Juta
    },
    { 
      id: 'role-cto',
      roleCode: 'CTO',
      roleName: 'Chief Technology Officer',
      description: 'Head of technology operations',
      upperLevel: 'role-ceo',
      budgetLimit: 500000000 // 500 Juta
    },
    { 
      id: 'role-gm',
      roleCode: 'GM',
      roleName: 'General Manager',
      description: 'General management position',
      upperLevel: 'role-ceo',
      budgetLimit: 250000000 // 250 Juta
    },
    { 
      id: 'role-dh',
      roleCode: 'DH',
      roleName: 'Department Head',
      description: 'Department management position',
      upperLevel: 'role-gm',
      budgetLimit: 100000000 // 100 Juta
    },
    { 
      id: 'role-hr',
      roleCode: 'HR',
      roleName: 'Human Resource Manager',
      description: 'Human Resource management position',
      upperLevel: 'role-dh',
      budgetLimit: 50000000 // 50 Juta
    },
    { 
      id: 'role-fm',
      roleCode: 'FM',
      roleName: 'Finance Manager',
      description: 'Financial management position',
      upperLevel: 'role-cfo',
      budgetLimit: 50000000 // 50 Juta
    },
    { 
      id: 'role-fs',
      roleCode: 'FS',
      roleName: 'Finance Staff',
      description: 'Financial staff position',
      upperLevel: 'role-fm',
      budgetLimit: 0
    },
    { 
      id: 'role-it',
      roleCode: 'IT',
      roleName: 'IT Staff',
      description: 'IT staff position',
      upperLevel: 'role-cto',
      budgetLimit: 0
    },
    
    {
      id: 'role-st',
      roleCode: 'ST',
      roleName: 'Staff',
      description: 'Staff position',
      upperLevel: 'role-dh',
      budgetLimit: 0
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
          budgetLimit: role.budgetLimit,
        },
        create: role,
      })
    )
  );
}
