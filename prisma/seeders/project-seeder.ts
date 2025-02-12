import { prisma } from "@/lib/prisma";

export async function projectSeeder() {
  await prisma.project.createMany({
    data: [
      {
        projectId: 'PRJ-2025-001',
        projectCode: 'RND-25-001',
        projectTitle: 'System Development 2025',
        description: 'Development of new enterprise system',
        division: 'ITE',
        year: 2025,
        startDate: new Date('2025-01-01'),
        finishDate: new Date('2025-12-31'),
        requestDate: new Date('2023-12-01'),
        status: 'In Progress'
      },
      {
        projectId: 'PRJ-2025-002',
        projectCode: 'FIN-25-001',
        projectTitle: 'Financial System Integration',
        description: 'Integration of financial systems across divisions',
        division: 'FIN',
        year: 2025,
        startDate: new Date('2025-02-01'),
        finishDate: new Date('2025-06-30'),
        requestDate: new Date('2025-01-15'),
        status: 'Planning'
      },
      {
        projectId: 'PRJ-2025-003',
        projectCode: 'OPS-25-001',
        projectTitle: 'Operations Improvement',
        description: 'Operational efficiency improvement project',
        division: 'OPS',
        year: 2025,
        startDate: new Date('2025-03-01'),
        finishDate: new Date('2025-08-31'),
        requestDate: new Date('2025-02-01'),
        status: 'Approved'
      }
    ]
  });
}