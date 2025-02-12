import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

const password = "password";

export async function userSeeder() {
  const hashedPassword = await bcrypt.hash(password, 10);

  const userData = [
    { id: 'cm71xui7r000asgprkai2jfkb', name: 'John CEO', email: 'ceo@example.com', password: hashedPassword, role: 'CEO', phone: '1234567890', workDivision: 'RND', employeeId: 'EMP001', residentId: 'RES001', nationality: 'ID', birthday: new Date('1980-01-01') },
    { name: 'Alice CFO', email: 'cfo@example.com', password: hashedPassword, role: 'CFO', phone: '1234567891', workDivision: 'FIN', employeeId: 'EMP002', residentId: 'RES002', nationality: 'ID', birthday: new Date('1981-02-02') },
    { name: 'Bob CTO', email: 'cto@example.com', password: hashedPassword, role: 'CTO', phone: '1234567892', workDivision: 'ITE', employeeId: 'EMP003', residentId: 'RES003', nationality: 'ID', birthday: new Date('1982-03-03') },
    { name: 'Carol Finance', email: 'finance@example.com', password: hashedPassword, role: 'Finance Manager', phone: '1234567893', workDivision: 'FIN', employeeId: 'EMP004', residentId: 'RES004', nationality: 'ID', birthday: new Date('1983-04-04') },
    { name: 'Dave IT', email: 'it@example.com', password: hashedPassword, role: 'Department Head', phone: '1234567894', workDivision: 'ITE', employeeId: 'EMP005', residentId: 'RES005', nationality: 'ID', birthday: new Date('1984-05-05') },
    { name: 'Eve HR', email: 'hr@example.com', password: hashedPassword, role: 'Department Head', phone: '1234567895', workDivision: 'HRD', employeeId: 'EMP006', residentId: 'RES006', nationality: 'ID', birthday: new Date('1985-06-06') },
    { name: 'Frank GM', email: 'gm@example.com', password: hashedPassword, role: 'General Manager', phone: '1234567896', workDivision: 'OPS', employeeId: 'EMP007', residentId: 'RES007', nationality: 'ID', birthday: new Date('1986-07-07') },
  ];

  await prisma.user.createMany({
    data: userData
  });

  await prisma.userRole.create({
    data: {
      userId: 'cm71xui7r000asgprkai2jfkb',
      roleId: 'role-ceo',
    }
  });

  await Promise.all(
    userData.map(user => 
      prisma.user.upsert({
        where: { email: user.email },
        update: {
          name: user.name,
          password: user.password,
          role: user.role,
        },
        create: user,
      })
    )
  );
}
