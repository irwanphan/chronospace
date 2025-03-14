import { prisma } from "@/lib/prisma";
import { generateId } from "@/lib/utils";
import { BudgetedItem } from "@/types/budget";
import { ApprovalStep } from "@/types/approval-schema";

export async function purchaseRequestSeeder() {
  // Get approval schema for Purchase Request
  const approvalSchema = await prisma.approvalSchema.findFirst({
    where: {
      documentType: 'Purchase Request'
    },
    include: {
      approvalSteps: {
        orderBy: {
          stepOrder: 'asc'
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
    // Group items by vendor
    const itemsByVendor = budget.items.reduce((acc: Record<string, BudgetedItem[]>, item: BudgetedItem) => {
      if (!acc[item.vendorId]) {
        acc[item.vendorId] = [];
      }
      acc[item.vendorId].push(item);
      return acc;
    }, {} as Record<string, BudgetedItem[]>);

    // For each vendor group, create a separate PR
    for (const [vendorId, vendorItems] of Object.entries(itemsByVendor) as [string, BudgetedItem[]][]) {
      // Skip if vendor has less than 2 items (optional)
      if (vendorItems.length < 2) continue;

      // Create PR for this vendor's items
      const pr = await prisma.purchaseRequest.create({
        data: {
          code: generateId(budget.project.workDivisionId),
          title: `PR for ${budget.title} - ${vendorId}`,
          description: `Purchase request for ${budget.title} items from vendor ${vendorId}`,
          budgetId: budget.id,
          status: 'Pending',
          createdBy: 'fg71xui7r000asgpgraji935t',
          items: {
            create: generatePRItems(vendorItems as BudgetedItem[])
          }
        }
      });

      // Create approval steps
      const approvalSteps = approvalSchema.approvalSteps.map((step: ApprovalStep) => ({
        purchaseRequestId: pr.id,
        roleId: step.roleId,
        specificUserId: step.specificUserId,
        stepOrder: step.stepOrder,
        status: step.stepOrder < 3 ? 'Approved' : getRandomApprovalStatus(),
        budgetLimit: step.budgetLimit ? Number(step.budgetLimit) : null,
        duration: step.duration,
        overtimeAction: step.overtimeAction,
        comment: step.stepOrder < 3 ? 
          `Approved by ${step.roleId}` : 
          getRandomComment(),
        actedAt: step.stepOrder < 3 ? new Date() : null,
        actorId: step.stepOrder < 3 ? 
          (step.specificUserId || 'fg71xui7r000asgpgraji935t') : 
          null
      }));

      await prisma.purchaseRequestApproval.createMany({
        data: approvalSteps
      });

      await prisma.budget.update({
        where: { id: budget.id },
        data: { status: 'In Progress' }
      });

      // Update PR status based on final approval step
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
}

function getRandomApprovalStatus(): 'Pending' | 'Approved' | 'Rejected' {
  const statuses = ['Approved', 'Approved', 'Approved', 'Rejected']; // 75% chance of approval
  return statuses[Math.floor(Math.random() * statuses.length)] as 'Pending' | 'Approved' | 'Rejected';
}

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

function generatePRItems(budgetItems: BudgetedItem[]) {
  return budgetItems.map(item => {
    const maxQty = Math.min(item.qty, 5);
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