import { prisma } from "@/lib/prisma";
import { ApprovalStep } from "@/types/approvalSchema";
import { NextResponse } from "next/server";

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
    // const getRoles = (param: ApprovalStep | ApprovalStep[]) => {
    //   if (Array.isArray(param)) {
    //     return param.map(step => step.role);
    //   } else {
    //     return param.role;
    //   }
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
        if (step.specificUser && step.specificUser !== 'NULL') {
          result.specificUserIds.push(step.specificUser);
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
      const viewers = getViewers(request.approvalSteps);
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