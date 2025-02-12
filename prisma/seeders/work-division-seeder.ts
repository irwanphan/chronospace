import { prisma } from "@/lib/prisma";

export async function workDivisionSeeder() {
  const divisions = [
    { id: 'RND', divisionName: 'Research & Development', divisionCode: 'RND' },
    { id: 'FIN', divisionName: 'Finance', divisionCode: 'FIN' },
    { id: 'HRD', divisionName: 'Human Resources', divisionCode: 'HRD' },
    { id: 'ITE', divisionName: 'Information Technology', divisionCode: 'ITE' },
    { id: 'OPS', divisionName: 'Operations', divisionCode: 'OPS' },
    { id: 'MKT', divisionName: 'Marketing', divisionCode: 'MKT' },
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
