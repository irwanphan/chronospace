import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

const password = "password";

export async function userSeeder() {
  const hashedPassword = await bcrypt.hash(password, 10);

  const userData = [
    { id: 'cm71xui7r000asgprkai2jfkb', name: 'John CEO', email: 'ceo@example.com', password: hashedPassword, roleId: 'role-ceo', phone: '1234567890', workDivisionId: 'RND', employeeId: 'EMP001', residentId: 'RES001', nationality: 'ID', birthday: new Date('1980-01-01') },
    { id: 'g239g84h9g49q28g9hq82g9hf', name: 'Alice CFO', email: 'cfo@example.com', password: hashedPassword, roleId: 'role-cfo', phone: '1234567891', workDivisionId: 'FIN', employeeId: 'EMP002', residentId: 'RES002', nationality: 'ID', birthday: new Date('1981-02-02') },
    { id: '29ihvdiuw8r9bdjivue9289vh', name: 'Bob CTO', email: 'cto@example.com', password: hashedPassword, roleId: 'role-cto', phone: '1234567892', workDivisionId: 'ITE', employeeId: 'EMP003', residentId: 'RES003', nationality: 'ID', birthday: new Date('1982-03-03') },
    { name: 'Carol Finance', email: 'finance@example.com', password: hashedPassword, roleId: 'role-fs', phone: '1234567893', workDivisionId: 'FIN', employeeId: 'EMP004', residentId: 'RES004', nationality: 'ID', birthday: new Date('1983-04-04') },
    { name: 'Dave IT', email: 'it@example.com', password: hashedPassword, roleId: 'role-it', phone: '1234567894', workDivisionId: 'ITE', employeeId: 'EMP005', residentId: 'RES005', nationality: 'ID', birthday: new Date('1984-05-05') },
    { id: '289fhvr2gih9rg8ha9ih98a9f', name: 'Eve HR', email: 'hr@example.com', password: hashedPassword, roleId: 'role-hr', phone: '1234567895', workDivisionId: 'HRD', employeeId: 'EMP006', residentId: 'RES006', nationality: 'ID', birthday: new Date('1985-06-06') },
    { id: '389fuii7r0sdv8huqweuqrevu', name: 'Frank GM', email: 'gm@example.com', password: hashedPassword, roleId: 'role-gm', phone: '1234567896', workDivisionId: 'OPS', employeeId: 'EMP007', residentId: 'RES007', nationality: 'ID', birthday: new Date('1986-07-07') },
    { id: 'fg71xui7r000asgpgraji935t', name: 'Grace Staff', email: 'staff@example.com', password: hashedPassword, roleId: 'role-st', phone: '1234567897', workDivisionId: 'ITE', employeeId: 'EMP008', residentId: 'RES008', nationality: 'ID', birthday: new Date('1987-08-08') },
    { id: 'cm71x2fhs89hbd00asgp2jfkb', name: 'Hank Staff', email: 'staff2@example.com', password: hashedPassword, roleId: 'role-st', phone: '1234567898', workDivisionId: 'ITE', employeeId: 'EMP009', residentId: 'RES009', nationality: 'ID', birthday: new Date('1988-09-09') },
    { id: 'ertetrcm71x2fhs89hd00asgp', name: 'Greg Depthead', email: 'dh@example.com', password: hashedPassword, roleId: 'role-dh', phone: '1234567898', workDivisionId: 'OPS', employeeId: 'EMP010', residentId: 'RES010', nationality: 'ID', birthday: new Date('1977-09-19') },
    { id: '35u8t9wrhidvbs487w3g8iwr9', name: 'Another Depthead', email: 'dh2@example.com', password: hashedPassword, roleId: 'role-dh', phone: '1234567898', workDivisionId: 'HRD', employeeId: 'EMP011', residentId: 'RES011', nationality: 'ID', birthday: new Date('1989-11-23') },
  ];

  await prisma.user.createMany({
    data: userData
  });

  await prisma.userRole.createMany({
    data: [
      {
        userId: 'cm71xui7r000asgprkai2jfkb',
        roleId: 'role-ceo',
      },
      {
        userId: 'g239g84h9g49q28g9hq82g9hf',
        roleId: 'role-cfo',
      },
      {
        userId: '29ihvdiuw8r9bdjivue9289vh',
        roleId: 'role-cto',
      },
      {
        userId: 'fg71xui7r000asgpgraji935t',
        roleId: 'role-st',
      },
      {
        userId: '289fhvr2gih9rg8ha9ih98a9f',
        roleId: 'role-hr',
      },
      {
        userId: '389fuii7r0sdv8huqweuqrevu',
        roleId: 'role-gm',
      },
      {
        userId: 'ertetrcm71x2fhs89hd00asgp',
        roleId: 'role-dh',
      },
      {
        userId: '35u8t9wrhidvbs487w3g8iwr9',
        roleId: 'role-dh',
      },
    ]
  });

  await Promise.all(
    userData.map(user => 
      prisma.user.upsert({
        where: { email: user.email },
        update: {
          name: user.name,
          password: user.password,
          roleId: user.roleId,
        },
        create: user,
      })
    )
  );
}
