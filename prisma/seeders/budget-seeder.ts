import { prisma } from "@/lib/prisma";
import { generateId } from "@/lib/utils";

export async function budgetSeeder() {
  // Get all allocated projects
  const allocatedProjects = await prisma.project.findMany({
    where: { status: 'Allocated' }
  });

  for (const project of allocatedProjects) {
    await prisma.budget.create({
      data: {
        code: generateId('BUD'),
        title: `Budget Plan for ${project.title}`,
        description: `Budget allocation for ${project.title}`,
        projectId: project.id,
        year: project.year,
        startDate: project.startDate,
        finishDate: project.finishDate,
        status: 'Draft',
        totalBudget: generateBudgetAmount(),
        workDivisionId: project.workDivisionId,
        items: {
          create: generateBudgetItems(project.workDivisionId)
        }
      }
    });
  }
}

// Helper function to generate random budget amount between 100M to 500M
function generateBudgetAmount(): number {
  return Math.floor(Math.random() * (500000000 - 100000000) + 100000000);
}

// Helper function to generate budget items based on division
function generateBudgetItems(divisionId: string) {
  const items = [];
  const categories = {
    'ITE': [
      { desc: 'Hardware Equipment', unit: 'Set' },
      { desc: 'Software Licenses', unit: 'License' },
      { desc: 'Network Infrastructure', unit: 'Unit' },
      { desc: 'IT Consulting Services', unit: 'Service' }
    ],
    'FIN': [
      { desc: 'Financial Software', unit: 'License' },
      { desc: 'Accounting Services', unit: 'Service' },
      { desc: 'Financial Consulting', unit: 'Service' },
      { desc: 'Training Materials', unit: 'Package' }
    ],
    'OPS': [
      { desc: 'Machinery Equipment', unit: 'Unit' },
      { desc: 'Operational Tools', unit: 'Set' },
      { desc: 'Safety Equipment', unit: 'Set' },
      { desc: 'Maintenance Service', unit: 'Service' }
    ],
    'HRD': [
      { desc: 'Training Equipment', unit: 'Set' },
      { desc: 'HR Software License', unit: 'License' },
      { desc: 'Consulting Services', unit: 'Service' },
      { desc: 'Office Equipment', unit: 'Set' }
    ],
    'MKT': [
      { desc: 'Marketing Tools', unit: 'Set' },
      { desc: 'Digital Advertising', unit: 'Package' },
      { desc: 'Marketing Software', unit: 'License' },
      { desc: 'Event Equipment', unit: 'Set' }
    ]
  };

  const divisionItems = categories[divisionId as keyof typeof categories] || categories['ITE'];
  
  // Generate 3-5 items per budget
  const numItems = Math.floor(Math.random() * 3) + 3;
  
  for (let i = 0; i < numItems; i++) {
    const item = divisionItems[i % divisionItems.length];
    items.push({
      description: item.desc,
      qty: Math.floor(Math.random() * 10) + 1,
      unit: item.unit,
      unitPrice: Math.floor(Math.random() * (50000000 - 10000000) + 10000000),
      vendorId: `vendor-${Math.floor(Math.random() * 5) + 1}` // Assuming we have vendors with IDs vendor-1 to vendor-5
    });
  }

  return items;
}