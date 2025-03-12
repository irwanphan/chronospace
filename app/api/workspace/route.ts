import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export interface ApprovalStep {
  id: string;
  role: string;
  status: string;
  purchaseRequestId: string;
  specificUser: string | null;
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

export const getViewers = (steps: ApprovalStep[]) => {
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

export const getCurrentApprover = (steps: ApprovalStep[]) => {
  const result = {
    specificUserId: '',
    roleId: ''
  };
  
  const currentStep = steps.find(step => step.status === 'Updated' || step.status === 'Pending');

  if (currentStep) {
    if (currentStep.specificUser && currentStep.specificUser !== 'NULL') {
      result.specificUserId = currentStep.specificUser;
    } else {
      result.roleId = currentStep.role;
    }
  }

  return result;
};

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

    const fixedPurchaseRequests = purchaseRequests.map(request => {
      const viewers = getViewers(request.approvalSteps as unknown as ApprovalStep[]);
      const approvers = getCurrentApprover(request.approvalSteps as unknown as ApprovalStep[]);
      return {
        ...request,
        viewers,
        approvers
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