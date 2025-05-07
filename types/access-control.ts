export interface MenuAccess {
  timeline: boolean;
  timelineManagement: boolean;
  workspace: boolean;
  projectPlanning: boolean;
  budgetPlanning: boolean;
  userManagement: boolean;
  workspaceManagement: boolean;
  documents: boolean;
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

  createDocument: boolean;
  uploadDocument: boolean;
  deleteDocument: boolean;
  downloadDocument: boolean;
  generateCertificate: boolean;

  createTimelineItem: boolean;
  editTimelineItem: boolean;
  deleteTimelineItem: boolean;
}

export interface WorkspaceAccess {
  createPurchaseRequest: boolean;
  viewPurchaseRequest: boolean;
  editPurchaseRequest: boolean;
  reviewApprovePurchaseRequest: boolean;
  viewOthersPurchaseRequest: boolean;
  viewOtherDivisionPurchaseRequest: boolean;
  createPurchaseOrder: boolean;
  viewPurchaseOrder: boolean;
  viewOthersPurchaseOrder: boolean;
  viewOtherDivisionPurchaseOrder: boolean;
  generatePurchaseOrderDocument: boolean;
  signDocument: boolean;
}

export interface AccessControl {
  menuAccess: MenuAccess;
  activityAccess: ActivityAccess;
  workspaceAccess: WorkspaceAccess;
}