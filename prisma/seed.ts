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
      { id: 'RND', divisionName: 'Research & Development', divisionCode: 'RND' },
      { id: 'FIN', divisionName: 'Finance', divisionCode: 'FIN' },
      { id: 'HRD', divisionName: 'Human Resources', divisionCode: 'HRD' },
      { id: 'ITE', divisionName: 'Information Technology', divisionCode: 'ITE' },
      { id: 'OPS', divisionName: 'Operations', divisionCode: 'OPS' },
      { id: 'MKT', divisionName: 'Marketing', divisionCode: 'MKT' },
    ]
  });

  // Create users with different roles
  const hashedPassword = await hash('password', 10);
  const users = await prisma.user.createMany({
    data: [
      { name: 'John CEO', email: 'ceo@example.com', password: hashedPassword, role: 'CEO', phone: '1234567890', workDivision: 'RND', employeeId: 'EMP001', residentId: 'RES001', nationality: 'ID', birthday: new Date('1980-01-01') },
      { name: 'Alice CFO', email: 'cfo@example.com', password: hashedPassword, role: 'CFO', phone: '1234567891', workDivision: 'FIN', employeeId: 'EMP002', residentId: 'RES002', nationality: 'ID', birthday: new Date('1981-02-02') },
      { name: 'Bob CTO', email: 'cto@example.com', password: hashedPassword, role: 'CTO', phone: '1234567892', workDivision: 'ITE', employeeId: 'EMP003', residentId: 'RES003', nationality: 'ID', birthday: new Date('1982-03-03') },
      { name: 'Carol Finance', email: 'finance@example.com', password: hashedPassword, role: 'Finance Manager', phone: '1234567893', workDivision: 'FIN', employeeId: 'EMP004', residentId: 'RES004', nationality: 'ID', birthday: new Date('1983-04-04') },
      { name: 'Dave IT', email: 'it@example.com', password: hashedPassword, role: 'Department Head', phone: '1234567894', workDivision: 'ITE', employeeId: 'EMP005', residentId: 'RES005', nationality: 'ID', birthday: new Date('1984-05-05') },
      { name: 'Eve HR', email: 'hr@example.com', password: hashedPassword, role: 'Department Head', phone: '1234567895', workDivision: 'HRD', employeeId: 'EMP006', residentId: 'RES006', nationality: 'ID', birthday: new Date('1985-06-06') },
      { name: 'Frank GM', email: 'gm@example.com', password: hashedPassword, role: 'General Manager', phone: '1234567896', workDivision: 'OPS', employeeId: 'EMP007', residentId: 'RES007', nationality: 'ID', birthday: new Date('1986-07-07') },
    ]
  });

  // Create vendors
  const vendors = await prisma.vendor.createMany({
    data: [
      { vendorName: 'Tech Solutions Inc', vendorCode: 'TSI', email: 'tech@vendor.com', phone: '1234567890', address: 'Tech Street 1' },
      { vendorName: 'Office Supplies Co', vendorCode: 'OSC', email: 'office@vendor.com', phone: '0987654321', address: 'Supply Road 2' },
      { vendorName: 'Research Equipment Ltd', vendorCode: 'REL', email: 'research@vendor.com', phone: '5555555555', address: 'Lab Avenue 3' },
    ]
  });

  // Create projects
  const projects = await prisma.project.createMany({
    data: [
      { projectTitle: 'IT Infrastructure Upgrade', projectId: 'PRJ001', projectCode: 'ITE001', division: 'Information Technology', status: 'Active', year: 2024, startDate: new Date('2024-01-01'), finishDate: new Date('2024-12-31'), requestDate: new Date() },
      { projectTitle: 'Financial System Migration', projectId: 'PRJ002', projectCode: 'FIN001', division: 'Finance', status: 'Planning', year: 2024, startDate: new Date('2024-02-01'), finishDate: new Date('2024-11-30'), requestDate: new Date() },
      { projectTitle: 'Research Lab Equipment', projectId: 'PRJ003', projectCode: 'RND001', division: 'Research & Development', status: 'Active', year: 2024, startDate: new Date('2024-03-01'), finishDate: new Date('2024-10-31'), requestDate: new Date() },
    ]
  });

  // Create approval schema
  const schema = await prisma.approvalSchema.create({
    data: {
      name: 'Standard Approval',
      documentType: 'Purchase Request',
      title: 'Standard Approval',
      description: 'Standard Approval Description',
      roles: JSON.stringify(['Department Head']),
      divisions: JSON.stringify(['RND', 'FIN', 'ITE', 'OPS', 'MKT']),
      steps: {
        create: [
          {
            duration: 10,
            role: 'CFO',
            limit: 10000000,
            overtime: 'Notify and Wait',
            order: 1
          },
          {
            duration: 12,
            role: 'General Manager',
            limit: 10000000,
            overtime: 'Notify and Wait',
            order: 2
          }
        ]
      }
    }
  });

  // Create budget plans
  const budgets = await prisma.budget.createMany({
    data: [
      {
        projectId: 'PRJ001',
        title: 'IT Infrastructure Budget 2024',
        description: 'Annual budget for IT infrastructure upgrades',
        year: 2024,
        division: 'Information Technology',
        totalBudget: 500000000,
        startDate: new Date('2024-01-01'),
        finishDate: new Date('2024-12-31'),
        status: 'In Progress',
        purchaseRequestStatus: 'Not Submitted'
      },
      {
        projectId: 'PRJ002',
        title: 'Financial System Migration Budget',
        description: 'Budget for financial system upgrade project',
        year: 2024,
        division: 'Finance',
        totalBudget: 750000000,
        startDate: new Date('2024-01-10'),
        finishDate: new Date('2024-06-30'),
        status: 'In Progress',
        purchaseRequestStatus: 'Not Submitted'
      },
      {
        projectId: 'PRJ003',
        title: 'Research Equipment Budget',
        description: 'Budget for new research lab equipment',
        year: 2024,
        division: 'Research & Development',
        totalBudget: 1000000000,
        startDate: new Date('2024-01-15'),
        finishDate: new Date('2024-12-31'),
        status: 'In Progress',
        purchaseRequestStatus: 'Not Submitted'
      }
    ]
  });

  console.log({
    divisions,
    users,
    vendors,
    projects,
    schema,
    budgets
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