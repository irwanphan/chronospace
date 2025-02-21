import { prisma } from "@/lib/prisma";
import { generateId } from "@/lib/utils";
export async function purchaseRequestSeeder() {
  // Ambil budget pertama dan user Grace Staff
  const [budget, user] = await Promise.all([
    prisma.budget.findFirst({
      include: {
        items: {
          include: {
            vendor: true
          }
        }
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

  // Buat purchase request pertama dengan item 1 dan 2
  await prisma.purchaseRequest.create({
    data: {
      code: generateId('PR'),
      budgetId: budget.id,
      title: "Hardware & Software Procurement",
      description: "Procurement for IT equipment and licenses",
      status: "Submitted",
      createdBy: user.id,
      items: {
        create: [
          {
            budgetItemId: budget.items[0].id, // Hardware Equipment
            description: budget.items[0].description,
            qty: 10,
            unit: budget.items[0].unit,
            unitPrice: budget.items[0].unitPrice,
            vendorId: budget.items[0].vendorId
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
            overtime: "Notify and Wait",
            specificUser: "ertetrcm71x2fhs89hd00asgp"
          },
          {
            role: "role-gm", 
            stepOrder: 2,
            status: "PENDING",
            duration: 24,
            limit: 250000000,
            overtime: "Notify and Wait"
          }
        ]
      }
    }
  });
} 