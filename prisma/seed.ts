import { PrismaClient } from '@prisma/client';
import { hash } from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Clear existing data
  await prisma.budget.deleteMany();
  await prisma.project.deleteMany();
  await prisma.workDivision.deleteMany();
  await prisma.vendor.deleteMany();
  await prisma.approvalSchema.deleteMany();
  await prisma.user.deleteMany();

  // Create work divisions
  const divisions = await prisma.workDivision.createMany({
    data: [
      { name: 'Research & Development' },
      { name: 'Finance' },
      { name: 'Human Resources' },
      { name: 'Information Technology' },
      { name: 'Operations' },
      { name: 'Marketing' },
    ]
  });

  // Create users with different roles
  const hashedPassword = await hash('password', 10);
  const users = await prisma.user.createMany({
    data: [
      { name: 'John CEO', email: 'ceo@example.com', password: hashedPassword, role: 'CEO' },
      { name: 'Alice CFO', email: 'cfo@example.com', password: hashedPassword, role: 'CFO' },
      { name: 'Bob CTO', email: 'cto@example.com', password: hashedPassword, role: 'CTO' },
      { name: 'Carol Finance', email: 'finance@example.com', password: hashedPassword, role: 'Finance Manager' },
      { name: 'Dave IT', email: 'it@example.com', password: hashedPassword, role: 'Department Head' },
      { name: 'Eve HR', email: 'hr@example.com', password: hashedPassword, role: 'Department Head' },
      { name: 'Frank GM', email: 'gm@example.com', password: hashedPassword, role: 'General Manager' },
    ]
  });

  // Create vendors
  const vendors = await prisma.vendor.createMany({
    data: [
      { name: 'Tech Solutions Inc', email: 'tech@vendor.com', phone: '1234567890', address: 'Tech Street 1' },
      { name: 'Office Supplies Co', email: 'office@vendor.com', phone: '0987654321', address: 'Supply Road 2' },
      { name: 'Research Equipment Ltd', email: 'research@vendor.com', phone: '5555555555', address: 'Lab Avenue 3' },
    ]
  });

  // Create projects
  const projects = await prisma.project.createMany({
    data: [
      { projectTitle: 'IT Infrastructure Upgrade', division: 'Information Technology', status: 'Active' },
      { projectTitle: 'Financial System Migration', division: 'Finance', status: 'Planning' },
      { projectTitle: 'Research Lab Equipment', division: 'Research & Development', status: 'Active' },
    ]
  });

  // Create approval schemas
  const approvalSchemas = await prisma.approvalSchema.createMany({
    data: [
      {
        name: 'Standard Approval',
        steps: [
          'Department Head',
          'Finance Manager',
          'General Manager',
          'CFO'
        ]
      },
      {
        name: 'High Value Approval',
        steps: [
          'Department Head',
          'Finance Manager',
          'General Manager',
          'CFO',
          'CEO'
        ]
      },
      {
        name: 'IT Project Approval',
        steps: [
          'Department Head',
          'CTO',
          'Finance Manager',
          'CFO'
        ]
      }
    ]
  });

  console.log({
    divisions,
    users,
    vendors,
    projects,
    approvalSchemas
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 