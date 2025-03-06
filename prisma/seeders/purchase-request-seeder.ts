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
  // Get approval schema for Purchase Request
  const approvalSchema = await prisma.approvalSchema.findFirst({
    where: {
      documentType: 'Purchase Request'
    },
    include: {
      approvalSteps: {
        orderBy: {
          order: 'asc'
        }
      }
    }
  });

  if (!approvalSchema) {
    throw new Error('Purchase Request approval schema not found');
  }

  // Get 7 random budgets
  const budgets = await prisma.budget.findMany({
    include: {
      items: true,
      project: true
    },
    take: 7
  });

  for (const budget of budgets) {
    // Calculate total budget for this PR
    // const totalBudget = budget.items.reduce((sum, item) => sum + (item.unitPrice * item.qty), 0);

    // Create PR
    const pr = await prisma.purchaseRequest.create({
      data: {
        code: generateId(budget.project.workDivisionId),
        title: `PR for ${budget.title}`,
        description: `Purchase request for ${budget.title}`,
        budgetId: budget.id,
        status: 'Pending',
        createdBy: 'fg71xui7r000asgpgraji935t',
        items: {
          create: generatePRItems(budget.items)
        }
      }
    });

    // Create approval steps based on schema
    const approvalSteps = approvalSchema.approvalSteps.map(step => ({
      purchaseRequestId: pr.id,
      role: step.role,
      specificUser: step.specificUserId,
      stepOrder: step.order,
      status: 'Pending',
      // status: step.order < 3 ? 'Approved' : getRandomApprovalStatus(),
      limit: step.limit ? Number(step.limit) : null,
      duration: step.duration,
      overtime: step.overtimeAction,
      comment: step.order < 3 ? 
        `Approved by ${step.role}` : 
        getRandomComment(),
      approvedAt: step.order < 3 ? new Date() : null,
      approvedBy: step.order < 3 ? 
        (step.specificUserId || 'fg71xui7r000asgpgraji935t') : 
        null
    }));

    await prisma.purchaseRequestApproval.createMany({
      data: approvalSteps
    });

    // Update PR status if all steps are completed
    const lastStep = approvalSteps[approvalSteps.length - 1];
    if (lastStep.status === 'Rejected') {
      await prisma.purchaseRequest.update({
        where: { id: pr.id },
        data: { status: 'Rejected' }
      });
    } else if (lastStep.status === 'Approved') {
      await prisma.purchaseRequest.update({
        where: { id: pr.id },
        data: { status: 'Approved' }
      });
    }
  }
}

// function getRandomApprovalStatus(): 'Pending' | 'Approved' | 'Rejected' {
//   const statuses = ['Approved', 'Approved', 'Approved', 'Rejected']; // 75% chance of approval
//   return statuses[Math.floor(Math.random() * statuses.length)] as 'Pending' | 'Approved' | 'Rejected';
// }

function getRandomComment(): string {
  const approvedComments = [
    'Approved. Proceed with purchase.',
    'Approved. Within budget allocation.',
    'Approved. Please expedite the process.',
    'Approved. Important for project timeline.'
  ];

  const rejectedComments = [
    'Rejected. Over budget allocation.',
    'Rejected. Need more detailed justification.',
    'Rejected. Please revise quantities.',
    'Rejected. Consider alternative vendors.'
  ];

  if (Math.random() < 0.75) { // 75% chance of approval
    return approvedComments[Math.floor(Math.random() * approvedComments.length)];
  } else {
    return rejectedComments[Math.floor(Math.random() * rejectedComments.length)];
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