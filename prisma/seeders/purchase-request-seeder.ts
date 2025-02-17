import { prisma } from "@/lib/prisma";

export async function purchaseRequestSeeder() {
  // Ambil budget pertama dan user Grace Staff
  const [budget, user] = await Promise.all([
    prisma.budget.findFirst({
      include: {
        items: true
      }
    }),
    prisma.user.findUnique({
      where: { email: 'staff@example.com' }
    })
  ]);

  if (!budget || !user) {
    console.log('No budget or user found');
    return;
  }

  // Buat purchase request
  await prisma.purchaseRequest.create({
    data: {
      budgetId: budget.id,
      title: "Hardware & Software Procurement",
      description: "Procurement for IT equipment and licenses",
      status: "Submitted",
      createdBy: user.id,
      items: {
        create: [
          {
            description: budget.items[0].description,
            qty: 5,
            unit: budget.items[0].unit,
            unitPrice: budget.items[0].unitPrice,
            vendor: budget.items[0].vendor
          },
          {
            description: budget.items[1].description, 
            qty: 20,
            unit: budget.items[1].unit,
            unitPrice: budget.items[1].unitPrice,
            vendor: budget.items[1].vendor
          }
        ]
      },
      approvalSteps: {
        create: [
          {
            role: "role-dh",
            stepOrder: 1,
            status: "PENDING",
            duration: 24,
            limit: 100000000,
            overtime: "Notify and Wait"
          },
          {
            role: "role-gm", 
            stepOrder: 2,
            status: "PENDING",
            duration: 24,
            limit: 250000000,
            overtime: "Notify and Wait"
          },
          {
            role: "role-cfo",
            stepOrder: 3, 
            status: "PENDING",
            duration: 48,
            limit: 500000000,
            overtime: "Notify and Wait"
          }
        ]
      }
    }
  });
} 