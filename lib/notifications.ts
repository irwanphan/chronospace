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