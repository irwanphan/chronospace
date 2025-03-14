import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { stepOrder, actorId, comment, type } = body;

    // Update dalam transaksi
    const result = await prisma.$transaction(async (tx: PrismaClient) => {
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

      // Cek apakah masih ada step selanjutnya
      const nextStep = await tx.purchaseRequestApproval.findFirst({
        where: {
          purchaseRequestId: params.id,
          stepOrder: { gt: stepOrder },
          status: 'Pending'
        }
      });

      // Update status PR
      await tx.purchaseRequest.update({
        where: { id: params.id },
        data: {
          status: newStatus
        }
      });

      return { updatedStep, nextStep };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Failed to approve request' },
      { status: 500 }
    );
  }
} 