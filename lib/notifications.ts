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

    // Check if this is the final approval
    const isFullyApproved = !purchaseRequest.approvalSteps.find(
      step => step.stepOrder > currentStepOrder
    );

    // Notify the creator
    await createNotification(
      purchaseRequest.createdBy,
      isFullyApproved ? 'Purchase Request Fully Approved' : 'Purchase Request Approved',
      isFullyApproved
        ? `Your Purchase Request ${purchaseRequest.code} has been fully approved and is ready to be processed as a Purchase Order.`
        : `Your Purchase Request ${purchaseRequest.code} has been approved by ${approverName} at step ${currentStepOrder}.`,
      'success'
    );

    // If not fully approved, notify next step approvers
    if (!isFullyApproved) {
      // Find next step
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
    }
  } catch (error) {
    console.error('Error creating approval notifications:', error);
    throw error;
  }
}

export async function createDeclineNotifications(
  purchaseRequestId: string,
  currentStepOrder: number,
  approverName: string,
  comment: string,
  isRevision: boolean
) {
  try {
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
        user: true
      }
    });

    if (!purchaseRequest) {
      throw new Error('Purchase request not found');
    }

    // Notify the creator
    await createNotification(
      purchaseRequest.createdBy,
      isRevision ? 'Purchase Request Needs Revision' : 'Purchase Request Declined',
      isRevision
        ? `Your Purchase Request ${purchaseRequest.code} requires revision from ${approverName}. Comment: ${comment}`
        : `Your Purchase Request ${purchaseRequest.code} has been declined by ${approverName}. Reason: ${comment}`,
      isRevision ? 'warning' : 'error'
    );
  } catch (error) {
    console.error('Error creating decline notifications:', error);
    throw error;
  }
}

export async function checkAndCreateOverdueNotifications() {
  try {
    // Get all active approval steps with their duration
    const activeSteps = await prisma.purchaseRequestApproval.findMany({
      where: {
        status: 'Pending',
        actedAt: null
      },
      include: {
        purchaseRequest: true,
        role: true,
        specificUser: true
      }
    });

    for (const step of activeSteps) {
      // Calculate if step is overdue
      const stepStartDate = step.createdAt;
      const durationInDays = step.duration;
      const dueDate = new Date(stepStartDate);
      dueDate.setDate(dueDate.getDate() + durationInDays);

      if (new Date() > dueDate) {
        // Step is overdue, send notifications
        const usersToNotify = new Set<string>();

        // Add specific user if assigned
        if (step.specificUserId) {
          usersToNotify.add(step.specificUserId);
        } else {
          // Get users with the role
          const usersWithRole = await prisma.userRole.findMany({
            where: { roleId: step.roleId },
            select: { userId: true }
          });
          usersWithRole.forEach(userRole => usersToNotify.add(userRole.userId));
        }

        // Add creator of PR
        usersToNotify.add(step.purchaseRequest.createdBy);

        // Create notifications
        const notificationPromises = Array.from(usersToNotify).map(userId =>
          createNotification(
            userId,
            'Purchase Request Approval Overdue',
            `Purchase Request ${step.purchaseRequest.code} is overdue for approval at step ${step.stepOrder}. Please take action.`,
            'warning'
          )
        );

        await Promise.all(notificationPromises);

        // If overtimeAction is "Auto Decline", handle it
        if (step.overtimeAction === 'Auto Decline') {
          await prisma.$transaction(async (tx) => {
            // Update step status
            await tx.purchaseRequestApproval.update({
              where: {
                purchaseRequestId_stepOrder: {
                  purchaseRequestId: step.purchaseRequestId,
                  stepOrder: step.stepOrder
                }
              },
              data: {
                status: 'Declined',
                actedAt: new Date(),
                comment: 'Automatically declined due to overtime'
              }
            });

            // Update PR status
            await tx.purchaseRequest.update({
              where: { id: step.purchaseRequestId },
              data: { status: 'Declined' }
            });

            // Create history
            await tx.purchaseRequestHistory.create({
              data: {
                purchaseRequestId: step.purchaseRequestId,
                action: 'Declined',
                actorId: step.specificUserId || step.purchaseRequest.createdBy, // Use specific user or creator as actor
                comment: 'Automatically declined due to overtime'
              }
            });
          });

          // Send auto-decline notification
          await createNotification(
            step.purchaseRequest.createdBy,
            'Purchase Request Auto-Declined',
            `Purchase Request ${step.purchaseRequest.code} has been automatically declined due to approval timeout at step ${step.stepOrder}.`,
            'error'
          );
        }
      }
    }
  } catch (error) {
    console.error('Error checking for overdue notifications:', error);
    throw error;
  }
}

export async function createRevisionSubmittedNotifications(
  purchaseRequestId: string,
  creatorName: string
) {
  try {
    const purchaseRequest = await prisma.purchaseRequest.findUnique({
      where: { id: purchaseRequestId },
      include: {
        approvalSteps: {
          orderBy: { stepOrder: 'asc' },
          include: {
            role: true,
            specificUser: true
          }
        }
      }
    });

    if (!purchaseRequest) {
      throw new Error('Purchase request not found');
    }

    // Get all users that need to be notified
    const usersToNotify = new Set<string>();

    // Get all approval steps
    for (const step of purchaseRequest.approvalSteps) {
      // If specific user is assigned
      if (step.specificUserId) {
        usersToNotify.add(step.specificUserId);
      } else {
        // Get users with the role
        const usersWithRole = await prisma.userRole.findMany({
          where: { roleId: step.roleId },
          select: { userId: true }
        });
        usersWithRole.forEach(userRole => usersToNotify.add(userRole.userId));
      }
    }

    // Remove creator from notification list (since they're the one making the revision)
    usersToNotify.delete(purchaseRequest.createdBy);

    // Create notifications for all users
    const notificationPromises = Array.from(usersToNotify).map(userId =>
      createNotification(
        userId,
        'Purchase Request Revised',
        `Purchase Request ${purchaseRequest.code} has been revised by ${creatorName} and is ready for review.`,
        'info'
      )
    );

    await Promise.all(notificationPromises);
  } catch (error) {
    console.error('Error creating revision submitted notifications:', error);
    throw error;
  }
} 