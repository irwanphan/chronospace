import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { createApprovalNotifications } from "@/lib/notifications";

export const revalidate = 0

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { stepOrder, actorId, comment } = body;

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
      const updatedStep = await tx.purchaseRequestApproval.update({
        where: {
          purchaseRequestId_stepOrder: {
            purchaseRequestId: params.id,
            stepOrder: stepOrder
          }
        },
        data: {
          status: 'Approved',
          actorId,
          actedAt: new Date(),
          comment
        }
      });

      // Create history
      await tx.purchaseRequestHistory.create({
        data: {
          purchaseRequestId: params.id,
          action: 'Approved',
          actorId,
          comment
        }
      });

      // Cek apakah masih ada step selanjutnya
      const nextStep = await tx.purchaseRequestApproval.findFirst({
        where: {
          purchaseRequestId: params.id,
          stepOrder: { gt: stepOrder },
          status: 'Pending'
        }
      });
      
      // jika tidak ada step selanjutnya, update purchase history menjadi fully approved
      if (!nextStep) {
        await tx.purchaseRequestHistory.create({
          data: {
            purchaseRequestId: params.id,
            action: 'Fully Approved',
            actorId,
            comment: 'All approval steps have been completed'
          }
        });

        const purchaseRequest = await tx.purchaseRequest.findUnique({
          where: { id: params.id },
          select: { budgetId: true }
        });

        await tx.budget.update({
          where: {
            id: purchaseRequest?.budgetId
          },
          data: {
            status: 'Completed'
          }
        });
      }
      
      // Update status PR
      await tx.purchaseRequest.update({
        where: { id: params.id },
        data: {
          status: nextStep ? 'On Progress' : 'Approved'
        }
      });

      return { updatedStep, nextStep };
    });

    // Create notifications after transaction
    await createApprovalNotifications(
      params.id,
      stepOrder,
      actor.name
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Failed to approve request' },
      { status: 500 }
    );
  }
} 