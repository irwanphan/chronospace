import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { createDeclineNotifications } from "@/lib/notifications";

export const revalidate = 0

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { stepOrder, actorId, comment, type } = body;

    // Get actor name for notification
    const actor = await prisma.user.findUnique({
      where: { id: actorId },
      select: { name: true }
    });

    if (!actor) {
      throw new Error('Actor not found');
    }

    // Update dalam transaksi
    const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // Update approval step
      const newStatus = type === 'revision' ? 'Revision' : 'Declined';
      const updatedStep = await tx.purchaseRequestApproval.update({
        where: {
          purchaseRequestId_stepOrder: {
            purchaseRequestId: params.id,
            stepOrder: stepOrder
          }
        },
        data: {
          status: newStatus,
          actorId,
          actedAt: new Date(),
          comment
        }
      });

      // Create history
      await tx.purchaseRequestHistory.create({
        data: {
          purchaseRequestId: params.id,
          action: newStatus,
          actorId,
          comment: comment
        }
      });

      // Cek apakah masih ada step-step selanjutnya
      const nextSteps = await tx.purchaseRequestApproval.findMany({
        where: {
          purchaseRequestId: params.id,
          stepOrder: { gt: stepOrder },
          status: 'Pending'
        }
      });

      // Update nextStep menjadi Canceled
      if (nextSteps.length > 0) {
        await tx.purchaseRequestApproval.updateMany({
          where: {
            purchaseRequestId: params.id,
            stepOrder: { gt: stepOrder }
          },
          data: { status: 'Canceled' }
        });
      }

      // Update status PR
      await tx.purchaseRequest.update({
        where: { id: params.id },
        data: {
          status: newStatus
        }
      });

      // Free up all budgeted items associated with this PR
      await tx.budgetedItem.updateMany({
        where: {
          purchaseRequestId: params.id
        },
        data: {
          purchaseRequestId: null
        }
      });

      return { updatedStep, nextSteps };
    });

    // Create notifications after transaction
    await createDeclineNotifications(
      params.id,
      stepOrder,
      actor.name,
      comment,
      type === 'revision'
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Failed to decline request' },
      { status: 500 }
    );
  }
} 