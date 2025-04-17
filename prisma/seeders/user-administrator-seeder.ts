import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

const password = "password";

export async function userAdministratorSeeder() {
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create role first
  const role = await prisma.role.create({
    data: { 
      roleCode: 'ADMIN',
      roleName: 'Administrator',
      description: 'Administrator',
      upperLevel: null,
      budgetLimit: 0,
    },
  });

  const userData = [
    { 
      name: 'John CEO', 
      email: 'magus@chronospace.id', 
      password: hashedPassword, 
      roleId: role.id, 
      phone: '000', 
      workDivisionId: 'RND', 
      employeeId: 'CHR', 
      residentId: 'Zeal000', 
      nationality: 'ZL', 
      isActive: true, 
      birthday: new Date('1986-04-09') 
    },
  ];

  const user = await prisma.user.create({
    data: userData[0]
  });

  await prisma.userRole.create({
    data: {
      userId: user.id,
      roleId: role.id,
    },
  });

  await prisma.userAccess.create({
    data: {
      userId: user.id,
      menuAccess: {
        timeline: true,
        workspace: true,
        projectPlanning: true,
        budgetPlanning: true,
        userManagement: true,
        workspaceManagement: true,
        documents: true,
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
        generateCertificate: true,
      },
      workspaceAccess: {
        createPurchaseRequest: true,
        viewPurchaseRequest: true,
        editPurchaseRequest: true,
        reviewApprovePurchaseRequest: true,
        viewOthersPurchaseRequest: true,
        viewOtherDivisionPurchaseRequest: true,
        createPurchaseOrder: true,
        viewPurchaseOrder: true,
        viewOthersPurchaseOrder: true,
        viewOtherDivisionPurchaseOrder: true,
        generatePurchaseOrderDocument: true,
        signDocument: true,
      },
    },
  });
}