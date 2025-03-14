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
          // items: true,
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

    // const getCurrentStep = (steps: ApprovalStep[]) => {
    //   // Sort steps by order
    //   const sortedSteps = steps.sort((a, b) => a.order - b.order);
    //   // Find first PENDING step
    //   for (const step of sortedSteps) {
    //     if (step.status === "PENDING") {
    //       return step;
    //     }
    //   }
    //   return null;
    // };

    // const getSpecificUser = (steps: ApprovalStep | ApprovalStep[]) => {
    //   if (Array.isArray(steps)) {
    //     return steps.filter(step => step.specificUserId !== null);
    //   } else {
    //     return steps.specificUserId !== null;
    //   }
    // };
    // const getRoles = (param: ApprovalStep[] | ApprovalStep) => {
    //   const role = Array.isArray(param) ? param.map(step => step.role) : param.role;
    //   return role;
    // };

    // // const listOfViewers = purchaseRequests.map(request => {
    // //   const currentStep = getCurrentStep(request.approvalSteps);
      
    // //   const currentStepSpecificUser = getSpecificUser(request.approvalSteps);
    // //   const currentStepRole = getRoles(currentStep);

    // //   return checkIfSpecificUser.map(step => {
    // //     console.log('approver', step.role);
    // //     return step.role;
    // //   });
    // // });

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