import { PrismaClient } from '@prisma/client';
import { userSeeder } from './seeders/user-seeder';
import { roleSeeder } from './seeders/role-seeder';
import { workDivisionSeeder } from './seeders/work-division-seeder';
import { userAccessSeeder } from './seeders/user-access-seeder';
import { vendorSeeder } from './seeders/vendor-seeder';
import { approvalSchemaSeeder } from './seeders/approval-schema-seeder';
const prisma = new PrismaClient();

async function main() {
  // Clear existing data
  await prisma.workDivision.deleteMany();
  await prisma.role.deleteMany();
  await prisma.userAccess.deleteMany();
  await prisma.userRole.deleteMany();
  await prisma.user.deleteMany();
  await prisma.vendor.deleteMany();

  // Seeders
  await workDivisionSeeder();
  await roleSeeder();
  await userSeeder();
  await userAccessSeeder();
  await vendorSeeder();
  await approvalSchemaSeeder();

  // // Create projects
  // const projects = await prisma.project.createMany({
  //   data: [
  //     { projectTitle: 'IT Infrastructure Upgrade', projectId: 'PRJ001', projectCode: 'ITE001', division: 'Information Technology', status: 'Active', year: 2024, startDate: new Date('2024-01-01'), finishDate: new Date('2024-12-31'), requestDate: new Date() },
  //     { projectTitle: 'Financial System Migration', projectId: 'PRJ002', projectCode: 'FIN001', division: 'Finance', status: 'Planning', year: 2024, startDate: new Date('2024-02-01'), finishDate: new Date('2024-11-30'), requestDate: new Date() },
  //     { projectTitle: 'Research Lab Equipment', projectId: 'PRJ003', projectCode: 'RND001', division: 'Research & Development', status: 'Active', year: 2024, startDate: new Date('2024-03-01'), finishDate: new Date('2024-10-31'), requestDate: new Date() },
  //   ]
  // });

  // // Create budget plans
  // const budgets = await prisma.budget.createMany({
  //   data: [
  //     {
  //       projectId: 'PRJ001',
  //       title: 'IT Infrastructure Budget 2024',
  //       description: 'Annual budget for IT infrastructure upgrades',
  //       year: 2024,
  //       division: 'Information Technology',
  //       totalBudget: 500000000,
  //       startDate: new Date('2024-01-01'),
  //       finishDate: new Date('2024-12-31'),
  //       status: 'In Progress',
  //       purchaseRequestStatus: 'Not Submitted'
  //     },
  //     {
  //       projectId: 'PRJ002',
  //       title: 'Financial System Migration Budget',
  //       description: 'Budget for financial system upgrade project',
  //       year: 2024,
  //       division: 'Finance',
  //       totalBudget: 750000000,
  //       startDate: new Date('2024-01-10'),
  //       finishDate: new Date('2024-06-30'),
  //       status: 'In Progress',
  //       purchaseRequestStatus: 'Not Submitted'
  //     },
  //     {
  //       projectId: 'PRJ003',
  //       title: 'Research Equipment Budget',
  //       description: 'Budget for new research lab equipment',
  //       year: 2024,
  //       division: 'Research & Development',
  //       totalBudget: 1000000000,
  //       startDate: new Date('2024-01-15'),
  //       finishDate: new Date('2024-12-31'),
  //       status: 'In Progress',
  //       purchaseRequestStatus: 'Not Submitted'
  //     }
  //   ]
  // });

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