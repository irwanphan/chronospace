import { prisma } from "@/lib/prisma";

export async function userAccessSeeder() {
  await prisma.userAccess.create({
    data: {
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
        createPurchaseRequest: true,
        reviewApprovePurchaseRequest: true
      }
    }
  });
}