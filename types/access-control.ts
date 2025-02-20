export interface MenuAccess {
  timeline: boolean;
  workspace: boolean;
  projectPlanning: boolean;
  budgetPlanning: boolean;
  userManagement: boolean;
  workspaceManagement: boolean;
}

export interface ActivityAccess {
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
  changePassword: boolean;
  changeOtherUserPassword: boolean;
  manageUserAccess: boolean;
}

export interface WorkspaceAccess {
  createPurchaseRequest: boolean;
  viewPurchaseRequest: boolean;
  editPurchaseRequest: boolean;
  reviewApprovePurchaseRequest: boolean;
}

export interface AccessControl {
  menuAccess: MenuAccess;
  activityAccess: ActivityAccess;
  workspaceAccess: WorkspaceAccess;
}