import { prisma } from "@/lib/prisma";

export async function workDivisionSeeder() {
  const divisions = [
    { id: 'RND', divisionName: 'Research & Development', divisionCode: 'RND', description: 'Research & Development', divisionHead: 'RND', upperDivision: 'RND' },
    { id: 'FIN', divisionName: 'Finance', divisionCode: 'FIN', description: 'Finance', divisionHead: 'FIN', upperDivision: 'FIN' },
    { id: 'HRD', divisionName: 'Human Resources', divisionCode: 'HRD', description: 'Human Resources', divisionHead: 'HRD', upperDivision: 'HRD' },
    { id: 'ITE', divisionName: 'Information Technology', divisionCode: 'ITE', description: 'Information Technology', divisionHead: 'ITE', upperDivision: 'ITE' },
    { id: 'OPS', divisionName: 'Operations', divisionCode: 'OPS', description: 'Operations', divisionHead: 'OPS', upperDivision: 'OPS' },
    { id: 'MKT', divisionName: 'Marketing', divisionCode: 'MKT', description: 'Marketing', divisionHead: 'MKT', upperDivision: 'MKT' },
  ]

  await prisma.workDivision.createMany({
    data: divisions
  });

  await Promise.all(
    divisions.map(division => 
      prisma.workDivision.upsert({
        where: { id: division.id },
        update: {
          divisionName: division.divisionName,
          divisionCode: division.divisionCode,
        },
        create: division,
      })
    )
  );
}
