import { prisma } from "@/lib/prisma";
import { generateId } from "@/lib/utils";

interface BudgetedItem {
  id: string;
  description: string;
  qty: number;
  unit: string;
  unitPrice: number;
  vendorId: string;
}

export async function purchaseRequestSeeder() {
  // Get 7 random budgets
  const budgets = await prisma.budget.findMany({
    include: {
      items: true,
      project: true
    },
    take: 7
  });

  for (const budget of budgets) {
    // Create PR
    await prisma.purchaseRequest.create({
      data: {
        code: generateId(budget.project.workDivisionId),
        title: `PR for ${budget.title}`,
        description: `Purchase request for ${budget.title}`,
        budgetId: budget.id,
        status: "Pending",
        createdBy: 'fg71xui7r000asgpgraji935t', // Sesuaikan dengan user ID yang ada
        items: {
          create: generatePRItems(budget.items)
        }
      }
    });
  }
}

// function generatePRCode(divisionId: string): string {
//   const currentDate = new Date();
//   const month = String(currentDate.getMonth() + 1).padStart(2, '0');
//   const randomNum = Math.floor(Math.random() * 100).toString().padStart(2, '0');
//   return `PR/${divisionId}/${month}/2025/${randomNum}`;
// }

function generatePRItems(budgetItems: BudgetedItem[]) {
  return budgetItems.map(item => {
    // Random qty between 1 and the budgeted qty
    const maxQty = Math.min(item.qty, 5); // Cap at 5 for reasonable numbers
    const requestedQty = Math.floor(Math.random() * maxQty) + 1;
    
    return {
      description: item.description,
      qty: requestedQty,
      unit: item.unit,
      unitPrice: item.unitPrice,
      budgetItemId: item.id,
      vendorId: item.vendorId
    };
  });
} 