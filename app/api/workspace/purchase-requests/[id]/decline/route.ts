import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { stepOrder, approvedBy, comment, type } = body;

    // Update dalam transaksi
    const result = await prisma.$transaction(async (tx) => {
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
          approvedBy,
          approvedAt: new Date(),
        }
      });

      // Create history
      await tx.purchaseRequestHistory.create({
        data: {
          purchaseRequestId: params.id,
          action: newStatus,
          actorId: approvedBy,
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