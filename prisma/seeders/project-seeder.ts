import { prisma } from "@/lib/prisma";

export async function projectSeeder() {
  await prisma.project.createMany({
    data: [
      {
        projectId: 'PRJ-2024-001',
        projectCode: 'RND-24-001',
        projectTitle: 'System Development 2024',
        description: 'Development of new enterprise system',
        division: 'ITE',
        year: 2024,
        startDate: new Date('2024-01-01'),
        finishDate: new Date('2024-12-31'),
        requestDate: new Date('2023-12-01'),
        status: 'In Progress'
      },
      {
        projectId: 'PRJ-2024-002',
        projectCode: 'FIN-24-001',
        projectTitle: 'Financial System Integration',
        description: 'Integration of financial systems across divisions',
        division: 'FIN',
        year: 2024,
        startDate: new Date('2024-02-01'),
        finishDate: new Date('2024-06-30'),
        requestDate: new Date('2024-01-15'),
        status: 'Planning'
      },
      {
        projectId: 'PRJ-2024-003',
        projectCode: 'OPS-24-001',
        projectTitle: 'Operations Improvement',
        description: 'Operational efficiency improvement project',
        division: 'OPS',
        year: 2024,
        startDate: new Date('2024-03-01'),
        finishDate: new Date('2024-08-31'),
        requestDate: new Date('2024-02-01'),
        status: 'Approved'
      }
    ]
  });
}