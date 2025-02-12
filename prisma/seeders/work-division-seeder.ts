import { prisma } from "@/lib/prisma";

export async function workDivisionSeeder() {
  const divisions = [
    { id: 'RND', divisionName: 'Research & Development', divisionCode: 'RND', description: 'Research & Development' },
    { id: 'FIN', divisionName: 'Finance', divisionCode: 'FIN', description: 'Finance' },
    { id: 'HRD', divisionName: 'Human Resources', divisionCode: 'HRD', description: 'Human Resources' },
    { id: 'ITE', divisionName: 'Information Technology', divisionCode: 'ITE', description: 'Information Technology' },
    { id: 'OPS', divisionName: 'Operations', divisionCode: 'OPS', description: 'Operations' },
    { id: 'MKT', divisionName: 'Marketing', divisionCode: 'MKT', description: 'Marketing' },
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
