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
          workspaceManagement: true,
          documents: true
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
          changePassword: true,
          changeOtherUserPassword: true,
          manageUserAccess: true,
          createDocument: true,
          uploadDocument: true,
          deleteDocument: true,
          downloadDocument: true,
          generateCertificate: true
        },
        workspaceAccess: {
          createPurchaseRequest: false,
          viewPurchaseRequest: true,
          editPurchaseRequest: true,
          reviewApprovePurchaseRequest: true,
          signDocument: true
        }
      },
      {
        userId: 'g239g84h9g49q28g9hq82g9hf', // cfo user id
        menuAccess: {
          timeline: true,
          workspace: true,
          projectPlanning: true,
          budgetPlanning: true,
          userManagement: true,
          workspaceManagement: true,
          documents: true
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
          changePassword: true,
          changeOtherUserPassword: true,
          manageUserAccess: false,
          createDocument: true,
          uploadDocument: true,
          deleteDocument: true,
          downloadDocument: true,
          generateCertificate: true
        },
        workspaceAccess: {
          createPurchaseRequest: true,
          viewPurchaseRequest: true,
          editPurchaseRequest: true,
          reviewApprovePurchaseRequest: false,
          signDocument: true
        }
      },
      {
        userId: '29ihvdiuw8r9bdjivue9289vh', // cto user id
        menuAccess: {
          timeline: true,
          workspace: true,
          projectPlanning: true,
          budgetPlanning: true,
          userManagement: true,
          workspaceManagement: true,
          documents: true
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
          changePassword: true,
          changeOtherUserPassword: true,
          manageUserAccess: false,
          createDocument: true,
          uploadDocument: true,
          deleteDocument: true,
          downloadDocument: true,
          generateCertificate: true
        },
        workspaceAccess: {
          createPurchaseRequest: true,
          viewPurchaseRequest: true,
          editPurchaseRequest: true,
          reviewApprovePurchaseRequest: false,
          signDocument: true
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
          workspaceManagement: true,
          documents: true
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
          changePassword: true,
          changeOtherUserPassword: true,
          manageUserAccess: false,
          createDocument: true,
          uploadDocument: true,
          deleteDocument: true,
          downloadDocument: true,
          generateCertificate: true
        },
        workspaceAccess: {
          createPurchaseRequest: true,
          viewPurchaseRequest: true,
          editPurchaseRequest: true,
          reviewApprovePurchaseRequest: false,
          signDocument: true
        }
      },
      {
        userId: '289fhvr2gih9rg8ha9ih98a9f', // hr user id
        menuAccess: {
          timeline: true,
          workspace: true,
          projectPlanning: true,
          budgetPlanning: true,
          userManagement: true,
          workspaceManagement: true,
          documents: true
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
          changePassword: true,
          changeOtherUserPassword: true,
          manageUserAccess: false,
          createDocument: true,
          uploadDocument: true,
          deleteDocument: true,
          downloadDocument: true,
          generateCertificate: true
        },
        workspaceAccess: {
          createPurchaseRequest: true, 
          viewPurchaseRequest: true,
          editPurchaseRequest: true,
          reviewApprovePurchaseRequest: true,
          signDocument: true
        }
      },
      {
        userId: '389fuii7r0sdv8huqweuqrevu', // gm user id  
        menuAccess: {
          timeline: true,
          workspace: true,
          projectPlanning: true,
          budgetPlanning: true,
          userManagement: true, 
          workspaceManagement: true,
          documents: true
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
          changePassword: true,
          changeOtherUserPassword: true,
          manageUserAccess: false,
          createDocument: true,
          uploadDocument: true,
          deleteDocument: true,
          downloadDocument: true,
          generateCertificate: true
        },
        workspaceAccess: {
          createPurchaseRequest: false,
          viewPurchaseRequest: true,
          editPurchaseRequest: false,
          reviewApprovePurchaseRequest: true,
          signDocument: true
        }
      },
      {
        userId: 'ertetrcm71x2fhs89hd00asgp', // dh user id
        menuAccess: {
          timeline: true,
          workspace: true,
          projectPlanning: true,
          budgetPlanning: true,
          userManagement: true,
          workspaceManagement: true,
          documents: true
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
          changePassword: true,
          changeOtherUserPassword: true,
          manageUserAccess: false,
          createDocument: true,
          uploadDocument: true,
          deleteDocument: true,
          downloadDocument: true,
          generateCertificate: true
        },
        workspaceAccess: {
          createPurchaseRequest: false,
          viewPurchaseRequest: true,
          editPurchaseRequest: false,
          reviewApprovePurchaseRequest: true,
          signDocument: true
        }
      },
      {
        userId: '35u8t9wrhidvbs487w3g8iwr9', // another dh user id
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
          changePassword: true,
          changeOtherUserPassword: true,
          manageUserAccess: false,
          createDocument: true,
          uploadDocument: true,
          deleteDocument: true,
          downloadDocument: true,
          generateCertificate: true
        },
        workspaceAccess: {
          createPurchaseRequest: false,
          viewPurchaseRequest: true,
          editPurchaseRequest: false,
          reviewApprovePurchaseRequest: true,
          signDocument: true
        }
      }
    ]
  });
}