import "next-auth";
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: string;
      roleId: string;
      access: {
        menuAccess: {
          timeline: boolean;
          workspace: boolean;
          projectPlanning: boolean;
          budgetPlanning: boolean;
          userManagement: boolean;
          workspaceManagement: boolean;
          documents: boolean;
        },
        activityAccess: {
          createProject: boolean;
          editProject: boolean;
          deleteProject: boolean;
          createBudget: boolean;
          editBudget: boolean;
          deleteBudget: boolean;
          createWorkDivision: boolean;
          editWorkDivision: boolean;
          deleteWorkDivision: boolean;
          createRole: boolean;
          editRole: boolean;
          deleteRole: boolean;
          createVendor: boolean;
          editVendor: boolean;
          deleteVendor: boolean;
          createApprovalSchema: boolean;
          editApprovalSchema: boolean;
          deleteApprovalSchema: boolean;
          createUser: boolean;
          editUser: boolean;
          deleteUser: boolean;
          manageUserAccess: boolean;
          createDocument: boolean;
          uploadDocument: boolean;
          deleteDocument: boolean;
          downloadDocument: boolean;
        },
        workspaceAccess: {
          createPurchaseRequest: boolean;
          viewPurchaseRequest: boolean;
          editPurchaseRequest: boolean;
          reviewApprovePurchaseRequest: boolean;
          signDocument: boolean;
        };
      };
    } & DefaultSession["user"];
  }
}
