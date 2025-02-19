import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const [purchaseRequests, workDivisions] = await Promise.all([
      prisma.purchaseRequest.findMany({
        include: {
          items: true,
          budget: true,
          approvalSteps: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      }),
      prisma.workDivision.findMany()
    ]);

    return NextResponse.json({ 
      purchaseRequests, 
      workDivisions, 
    });
  } catch (error) {
    console.error('Error fetching purchase requests:', error);
    return NextResponse.json(
      { error: 'Failed to fetch purchase requests' },
      { status: 500 }
    );
  }
}