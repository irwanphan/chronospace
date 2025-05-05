import { prisma } from '@/lib/prisma';

import { userSeeder } from './seeders/user-seeder';
import { roleSeeder } from './seeders/role-seeder';
import { workDivisionSeeder } from './seeders/work-division-seeder';
import { userAccessSeeder } from './seeders/user-access-seeder';
import { vendorSeeder } from './seeders/vendor-seeder';
import { approvalSchemaSeeder } from './seeders/approval-schema-seeder';
import { projectSeeder } from './seeders/project-seeder';
import { budgetSeeder } from './seeders/budget-seeder';
import { purchaseRequestSeeder } from './seeders/purchase-request-seeder';
import { userAdministratorSeeder } from './seeders/user-administrator-seeder';
import { timelineEventSeeder } from './seeders/timeline-event-seeder';

async function main() {
  // Clear existing data
  await prisma.notification.deleteMany();
  await prisma.userCertificate.deleteMany();
  await prisma.documentSignature.deleteMany();
  await prisma.projectDocument.deleteMany();
  await prisma.document.deleteMany();
  await prisma.approvalStep.deleteMany();
  await prisma.approvalSchema.deleteMany();
  await prisma.activityHistory.deleteMany();
  await prisma.purchaseOrderItem.deleteMany();
  await prisma.purchaseOrderHistory.deleteMany();
  await prisma.purchaseOrder.deleteMany();
  await prisma.purchaseRequestItem.deleteMany();
  await prisma.purchaseRequestApproval.deleteMany();
  await prisma.purchaseRequestHistory.deleteMany();
  await prisma.purchaseRequest.deleteMany();
  await prisma.budgetedItem.deleteMany();
  await prisma.budget.deleteMany();
  await prisma.projectHistory.deleteMany();
  await prisma.project.deleteMany();
  await prisma.userAccess.deleteMany();
  await prisma.userRole.deleteMany();
  await prisma.timelineLink.deleteMany();
  await prisma.timelineNews.deleteMany();
  await prisma.timelineEvent.deleteMany();
  await prisma.timelineItem.deleteMany();
  await prisma.user.deleteMany();
  await prisma.vendor.deleteMany();
  await prisma.workDivision.deleteMany();
  await prisma.role.deleteMany();
  // Seeders
  await workDivisionSeeder();
  await userAdministratorSeeder();
  await roleSeeder();
  await userSeeder();
  await userAccessSeeder();
  await vendorSeeder();
  await approvalSchemaSeeder();
  await projectSeeder();
  await budgetSeeder();
  await purchaseRequestSeeder();
  await timelineEventSeeder();
}
  
main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })