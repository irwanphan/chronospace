import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

interface ApprovalStep {
  id: string;
  role: string;
  status: string;
  purchaseRequestId: string;
  specificUserId: string | null;
  createdAt: Date;
  updatedAt: Date;
  order: number;
  overtimeAction: string;
  approvedBy: string | null;
  user: {
    name: string;
    id: string;
  } | null;
}

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
                  divisionName: true,
                  divisionCode: true
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
              name: true
            }
          },
          approvalSteps: {
            include: {
              user: {
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

    const getViewers = (steps: ApprovalStep[]) => {
      const result = {
        specificUserIds: [] as string[],
        roleIds: [] as string[]
      };

      // Sort steps by order
      const sortedSteps = steps.sort((a, b) => a.order - b.order);
      
      // Cek setiap step
      sortedSteps.forEach(step => {
        // console.log('Processing step:', step); // Debug
        // Jika ada specificUser, tambahkan ke specificUserIds
        if (step.specificUserId && step.specificUserId !== 'NULL') {
          result.specificUserIds.push(step.specificUserId);
        }
        // Jika tidak ada specificUser, tambahkan role
        else {
          result.roleIds.push(step.role);
        }
      });

      // console.log('Final result:', result); // Debug
      return result;
    };

    const fixedPurchaseRequests = purchaseRequests.map(request => {
      const viewers = getViewers(request.approvalSteps as unknown as ApprovalStep[]);
      return {
        ...request,
        viewers
      };
    });

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