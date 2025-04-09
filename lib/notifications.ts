import { prisma } from '@/lib/prisma';

export async function createNotification(userId: string, title: string, message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') {
  return prisma.notification.create({
    data: {
      userId,
      title,
      message,
      type
    }
  });
}

export async function createPurchaseRequestNotifications(
  purchaseRequestId: string,
  purchaseRequestCode: string,
  approvalSteps: {
    roleId: string;
    specificUserId?: string | null;
  }[]
) {
  try {
    // Get all users that need to be notified based on roles and specific users
    const usersToNotify = new Set<string>();

    // Get users with matching roles
    const roleIds = approvalSteps.map(step => step.roleId);
    
    // Get users through UserRole relation
    const usersWithRoles = await prisma.userRole.findMany({
      where: {
        roleId: {
          in: roleIds
        }
      },
      select: {
        userId: true
      }
    });

    // Add users with matching roles
    usersWithRoles.forEach(userRole => usersToNotify.add(userRole.userId));

    // Add specific users
    approvalSteps
      .filter(step => step.specificUserId)
      .forEach(step => step.specificUserId && usersToNotify.add(step.specificUserId));

    // Create notifications for all users
    const notificationPromises = Array.from(usersToNotify).map(userId =>
      createNotification(
        userId,
        'New Purchase Request Requires Approval',
        `Purchase Request ${purchaseRequestCode} requires your approval.`,
        'info'
      )
    );

    await Promise.all(notificationPromises);
  } catch (error) {
    console.error('Error creating notifications:', error);
    throw error;
  }
}

export async function createApprovalNotifications(
  purchaseRequestId: string,
  currentStepOrder: number,
  approverName: string
) {
  try {
    // Fetch purchase request with related data
    const purchaseRequest = await prisma.purchaseRequest.findUnique({
      where: { id: purchaseRequestId },
      include: {
        approvalSteps: {
          orderBy: { stepOrder: 'asc' },
          include: {
            role: true,
            specificUser: true
          }
        },
        user: true // creator of the purchase request
      }
    });

    if (!purchaseRequest) {
      throw new Error('Purchase request not found');
    }

    // Notify the creator
    await createNotification(
      purchaseRequest.createdBy,
      'Purchase Request Approved',
      `Your Purchase Request ${purchaseRequest.code} has been approved by ${approverName} at step ${currentStepOrder}.`,
      'success'
    );

    // Find next step if exists
    const nextStep = purchaseRequest.approvalSteps.find(step => step.stepOrder === currentStepOrder + 1);

    if (nextStep) {
      // Get users to notify for next step
      const usersToNotify = new Set<string>();

      // If specific user is assigned
      if (nextStep.specificUserId) {
        usersToNotify.add(nextStep.specificUserId);
      } else {
        // Get users with the role
        const usersWithRole = await prisma.userRole.findMany({
          where: { roleId: nextStep.roleId },
          select: { userId: true }
        });
        usersWithRole.forEach(userRole => usersToNotify.add(userRole.userId));
      }

      // Create notifications for next step approvers
      const notificationPromises = Array.from(usersToNotify).map(userId =>
        createNotification(
          userId,
          'Purchase Request Ready for Your Approval',
          `Purchase Request ${purchaseRequest.code} has been approved by previous step and is now ready for your approval.`,
          'info'
        )
      );

      await Promise.all(notificationPromises);
    }
  } catch (error) {
    console.error('Error creating approval notifications:', error);
    throw error;
  }
} 