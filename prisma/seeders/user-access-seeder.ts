import { prisma } from "@/lib/prisma";

export async function userAccessSeeder() {
  await prisma.userAccess.createMany({
    data: [
      {
        userId: 'cm71xui7r000asgprkai2jfkb', // ceo user id
        menuAccess: {
          timeline: true,
          workspace: true,
          projectPlanning: true,
          budgetPlanning: true,
          userManagement: true,
          workspaceManagement: true
        },
        activityAccess: {
          createProject: true,
          editProject: true,
          deleteProject: true,
          createBudget: true,
          editBudget: true,
          deleteBudget: true,
          createWorkDivision: true,
          editWorkDivision: true,
          deleteWorkDivision: true,
          createRole: true,
          editRole: true,
          deleteRole: true,
          createVendor: true,
          editVendor: true,
          deleteVendor: true,
          createApprovalSchema: true,
          editApprovalSchema: true,
          deleteApprovalSchema: true,
          createUser: true,
          editUser: true,
          deleteUser: true,
          manageUserAccess: true
        },
        workspaceAccess: {
          createPurchaseRequest: false,
          reviewApprovePurchaseRequest: true
        }
      },
      {
        userId: 'fg71xui7r000asgpgraji935t', // staff user id
        menuAccess: {
          timeline: true,
          workspace: true,
          projectPlanning: true,
          budgetPlanning: true,
          userManagement: true,
          workspaceManagement: true
        },
        activityAccess: {
          createProject: true,
          editProject: true,
          deleteProject: false,
          createBudget: true,
          editBudget: true,
          deleteBudget: false,
          createWorkDivision: true,
          editWorkDivision: true,
          deleteWorkDivision: false,
          createRole: true,
          editRole: true,
          deleteRole: false,
          createVendor: true,
          editVendor: true,
          deleteVendor: false,
          createApprovalSchema: true,
          editApprovalSchema: true,
          deleteApprovalSchema: false,
          createUser: true,
          editUser: true,
          deleteUser: false,
          manageUserAccess: false
        },
        workspaceAccess: {
          createPurchaseRequest: true,
          reviewApprovePurchaseRequest: false
        }
      }
    ]
  });
}