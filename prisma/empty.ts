import { prisma } from "@/lib/prisma";

async function main() {
  // Clear existing data
  await prisma.approvalStep.deleteMany();
  await prisma.approvalSchema.deleteMany();
  await prisma.purchaseRequestItem.deleteMany();
  await prisma.purchaseRequestApproval.deleteMany();
  await prisma.purchaseRequestHistory.deleteMany();
  await prisma.purchaseRequest.deleteMany();
  await prisma.budgetedItem.deleteMany();
  await prisma.budget.deleteMany();
  await prisma.project.deleteMany();
  await prisma.userAccess.deleteMany();
  await prisma.userRole.deleteMany();
  await prisma.user.deleteMany();
  await prisma.vendor.deleteMany();
  await prisma.workDivision.deleteMany();
  await prisma.role.deleteMany();
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