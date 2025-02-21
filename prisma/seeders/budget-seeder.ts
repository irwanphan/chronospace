import { prisma } from "@/lib/prisma";

export async function budgetSeeder() {
  // Get project IDs first
  const projects = await prisma.project.findMany({
    select: { id: true, projectTitle: true, workDivisionId: true, year: true }
  });
  const vendors = await prisma.vendor.findMany();

  for (const project of projects) {
    // Create budget for each project
    await prisma.budget.create({
      data: {
        projectId: project.id,
        title: `Budget Plan for ${project.projectTitle}`,
        description: `Annual budget plan for ${project.workDivisionId} division`,
        year: project.year,
        workDivisionId: project.workDivisionId,
        totalBudget: 350000000, // 350 Juta
        startDate: new Date(`${project.year}-01-01`),
        finishDate: new Date(`${project.year}-12-31`),
        status: 'In Progress',
        purchaseRequestStatus: 'Not Submitted',
        // Create budget items
        items: {
          create: [
            {
              description: 'Hardware Equipment',
              qty: 10,
              unit: 'Unit',
              unitPrice: 15000000, // 15 Juta per unit
              vendorId: vendors[0].id
            },
            {
              description: 'Software Licenses',
              qty: 50,
              unit: 'License',
              unitPrice: 2000000, // 2 Juta per license
              vendorId: vendors[1].id
            },
            {
              description: 'Consulting Services',
              qty: 1,
              unit: 'Service',
              unitPrice: 100000000, // 100 Juta
              vendorId: vendors[2].id
            }
          ]
        }
      }
    });
  }
}