import { PrismaClient } from '@prisma/client';
import { userSeeder } from './seeders/user-seeder';
import { roleSeeder } from './seeders/role-seeder';
import { workDivisionSeeder } from './seeders/work-division-seeder';
import { userAccessSeeder } from './seeders/user-access-seeder';
const prisma = new PrismaClient();

async function main() {
  // Clear existing data
  // await prisma.budget.deleteMany();
  // await prisma.project.deleteMany();
  // await prisma.workDivision.deleteMany();
  // await prisma.vendor.deleteMany();
  // await prisma.approvalSchema.deleteMany();
  await prisma.workDivision.deleteMany();
  await prisma.role.deleteMany();
  await prisma.user.deleteMany();
  await workDivisionSeeder();
  await roleSeeder();
  await userSeeder();
  await userAccessSeeder();
  // // Create vendors
  // const vendors = await prisma.vendor.createMany({
  //   data: [
  //     { vendorName: 'Tech Solutions Inc', vendorCode: 'TSI', email: 'tech@vendor.com', phone: '1234567890', address: 'Tech Street 1' },
  //     { vendorName: 'Office Supplies Co', vendorCode: 'OSC', email: 'office@vendor.com', phone: '0987654321', address: 'Supply Road 2' },
  //     { vendorName: 'Research Equipment Ltd', vendorCode: 'REL', email: 'research@vendor.com', phone: '5555555555', address: 'Lab Avenue 3' },
  //   ]
  // });

  // // Create projects
  // const projects = await prisma.project.createMany({
  //   data: [
  //     { projectTitle: 'IT Infrastructure Upgrade', projectId: 'PRJ001', projectCode: 'ITE001', division: 'Information Technology', status: 'Active', year: 2024, startDate: new Date('2024-01-01'), finishDate: new Date('2024-12-31'), requestDate: new Date() },
  //     { projectTitle: 'Financial System Migration', projectId: 'PRJ002', projectCode: 'FIN001', division: 'Finance', status: 'Planning', year: 2024, startDate: new Date('2024-02-01'), finishDate: new Date('2024-11-30'), requestDate: new Date() },
  //     { projectTitle: 'Research Lab Equipment', projectId: 'PRJ003', projectCode: 'RND001', division: 'Research & Development', status: 'Active', year: 2024, startDate: new Date('2024-03-01'), finishDate: new Date('2024-10-31'), requestDate: new Date() },
  //   ]
  // });

  // // Create approval schema
  // const schema = await prisma.approvalSchema.create({
  //   data: {
  //     name: 'Standard Approval',
  //     documentType: 'Purchase Request',
  //     title: 'Standard Approval',
  //     description: 'Standard Approval Description',
  //     roles: JSON.stringify(['Department Head']),
  //     divisions: JSON.stringify(['RND', 'FIN', 'ITE', 'OPS', 'MKT']),
  //     steps: {
  //       create: [
  //         {
  //           duration: 10,
  //           role: 'CFO',
  //           limit: 10000000,
  //           overtime: 'Notify and Wait',
  //           order: 1
  //         },
  //         {
  //           duration: 12,
  //           role: 'General Manager',
  //           limit: 10000000,
  //           overtime: 'Notify and Wait',
  //           order: 2
  //         }
  //       ]
  //     }
  //   }
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