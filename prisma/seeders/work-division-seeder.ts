import { prisma } from "@/lib/prisma";

export async function workDivisionSeeder() {
  const divisions = [
    { id: 'RND', name: 'Research & Development', code: 'RND', description: 'Research & Development' },
    { id: 'FIN', name: 'Finance', code: 'FIN', description: 'Finance' },
    { id: 'HRD', name: 'Human Resources', code: 'HRD', description: 'Human Resources' },
    { id: 'ITE', name: 'Information Technology', code: 'ITE', description: 'Information Technology' },
    { id: 'OPS', name: 'Operations', code: 'OPS', description: 'Operations' },
    { id: 'MKT', name: 'Marketing', code: 'MKT', description: 'Marketing' },
  ]

  await prisma.workDivision.createMany({
    data: divisions
  });

  await Promise.all(
    divisions.map(division => 
      prisma.workDivision.upsert({
        where: { id: division.id },
        update: {
          name: division.name,
          code: division.code,
        },
        create: division,
      })
    )
  );
}
