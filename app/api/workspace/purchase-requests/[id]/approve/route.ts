import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { stepOrder, approvedBy, comment } = body;

    // Update dalam transaksi
    const result = await prisma.$transaction(async (tx) => {
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
          approvedBy,
          approvedAt: new Date()
        }
      });

      // Create history
      await tx.purchaseRequestHistory.create({
        data: {
          purchaseRequestId: params.id,
          action: 'Approved',
          actorId: approvedBy,
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

      // Update status PR
      await tx.purchaseRequest.update({
        where: { id: params.id },
        data: {
          status: nextStep ? 'On Progress' : 'Approved'
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