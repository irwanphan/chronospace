import { prisma } from "@/lib/prisma";
import { ApprovalStep } from "@/types/approval-schema";
import { NextResponse } from "next/server";
import { PurchaseRequest } from "@/types/purchase-request";
import { getViewers, getCurrentApprover } from "@/lib/helpers";

export async function GET() {
  try {
    const [purchaseRequests] = await Promise.all([
      prisma.purchaseRequest.findMany({
        include: {
          budget: {
            include: {
              workDivision: {
                select: {
                  id: true,
                  name: true,
                  code: true
                }
              },
              project: {
                select: {
                  finishDate: true,
                }
              },
            }
          },
          user: {
            select: {
              id: true,
              name: true
            }
          },
          approvalSteps: {
            include: {
              actor: {
                select: {
                  name: true,
                  id: true
                }
              }
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      }),
    ]);

    const fixedPurchaseRequests = await Promise.all(purchaseRequests.map(async (request: PurchaseRequest) => {
      const viewers = await getViewers(request.approvalSteps as unknown as ApprovalStep[]);
      const approvers = await getCurrentApprover(request.approvalSteps as unknown as ApprovalStep[]);
      return {
        ...request,
        viewers,
        actors: approvers
      };
    }));

    return NextResponse.json({ 
      purchaseRequests: fixedPurchaseRequests
    });
  } catch (error) {
    console.error('Error fetching purchase requests:', error);
    return NextResponse.json(
      { error: 'Failed to fetch purchase requests' },
      { status: 500 }
    );
  }
}