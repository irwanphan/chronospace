import { prisma } from "@/lib/prisma";

// project status:
// Not Allocated: Project is not allocated in any budget plan
// Allocated: Project is allocated in a budget plan
// In Progress: Project is in progress with purchase request being processed
// Completed: Project is completed
// Cancelled: Project is cancelled

export async function projectSeeder() {
  const user = await prisma.user.findUnique({
    where: {
      email: 'staff@example.com'
    }
  });

  const projectsData = [
    {
      code: 'RND/2025/01/000001',
      title: 'System Development 2025',
      description: 'Development of new enterprise system',
      workDivisionId: 'ITE',
      year: 2025,
      startDate: new Date('2025-01-01'),
      finishDate: new Date('2025-12-31'),
      createdAt: new Date('2024-12-20'),
      status: 'Allocated'
    },
    {
      code: 'FIN/2025/01/000002',
      title: 'Financial System Integration',
      description: 'Integration of financial systems across divisions',
      workDivisionId: 'FIN',
      year: 2025,
      startDate: new Date('2025-02-01'),
      finishDate: new Date('2025-06-30'),
      createdAt: new Date('2024-12-20'),
      status: 'Allocated'
    },
    {
      code: 'OPS/2025/01/000003',
      title: 'Operations Improvement',
      description: 'Operational efficiency improvement project',
      workDivisionId: 'OPS',
      year: 2025,
      startDate: new Date('2025-03-01'),
      finishDate: new Date('2025-08-31'),
      createdAt: new Date('2024-12-20'),
      status: 'Not Allocated'
    },
    {
      code: 'HRD/2025/01/000004',
      title: 'HR Management System',
      description: 'New HR management system implementation',
      workDivisionId: 'HRD',
      year: 2025,
      startDate: new Date('2025-01-15'),
      finishDate: new Date('2025-07-15'),
      createdAt: new Date('2024-12-05'),
      status: 'Allocated'
    },
    {
      code: 'MKT/2025/01/000005',
      title: 'Digital Marketing Platform',
      description: 'Implementation of digital marketing platform',
      workDivisionId: 'MKT',
      year: 2025,
      startDate: new Date('2025-02-15'),
      finishDate: new Date('2025-05-15'),
      createdAt: new Date('2024-12-05'),
      status: 'Not Allocated'
    },
    {
      code: 'ITE/2025/01/000006',
      title: 'Network Infrastructure Upgrade',
      description: 'Company-wide network infrastructure upgrade',
      workDivisionId: 'ITE',
      year: 2025,
      startDate: new Date('2025-04-01'),
      finishDate: new Date('2025-09-30'),
      createdAt: new Date('2024-12-05'),
      status: 'Allocated'
    },
    {
      code: 'FIN/2025/01/000007',
      title: 'Budget Management System',
      description: 'Implementation of new budget management system',
      workDivisionId: 'FIN',
      year: 2025,
      startDate: new Date('2025-03-15'),
      finishDate: new Date('2025-08-15'),
      createdAt: new Date('2024-12-18'),
      status: 'Not Allocated'
    },
    {
      code: 'OPS/2025/01/000008',
      title: 'Warehouse Automation',
      description: 'Automation of warehouse operations',
      workDivisionId: 'OPS',
      year: 2025,
      startDate: new Date('2025-05-01'),
      finishDate: new Date('2025-10-31'),
      createdAt: new Date('2024-12-25'),
      status: 'Allocated'
    },
    {
      code: 'HRD/2025/01/000009',
      title: 'Training Management System',
      description: 'Employee training management system',
      workDivisionId: 'HRD',
      year: 2025,
      startDate: new Date('2025-02-01'),
      finishDate: new Date('2025-07-31'),
      createdAt: new Date('2024-12-25'),
      status: 'Not Allocated'
    },
    {
      code: 'MKT/2025/01/000010',
      title: 'Customer Analytics Platform',
      description: 'Implementation of customer analytics platform',
      workDivisionId: 'MKT',
      year: 2025,
      startDate: new Date('2025-03-01'),
      finishDate: new Date('2025-06-30'),
      createdAt: new Date('2024-12-25'),
      status: 'Allocated'
    },
    {
      code: 'ITE/2025/01/000011',
      title: 'Cloud Migration Project',
      description: 'Migration of systems to cloud infrastructure',
      workDivisionId: 'ITE',
      year: 2025,
      startDate: new Date('2025-06-01'),
      finishDate: new Date('2025-11-30'),
      createdAt: new Date('2024-12-25'),
      status: 'Not Allocated'
    },
    {
      code: 'FIN/2025/01/000012',
      title: 'Accounting System Upgrade',
      description: 'Upgrade of existing accounting system',
      workDivisionId: 'FIN',
      year: 2025,
      startDate: new Date('2025-04-01'),
      finishDate: new Date('2025-09-30'),
      createdAt: new Date('2024-12-25'),
      status: 'Allocated'
    },
    {
      code: 'OPS/2025/01/000013',
      title: 'Supply Chain Optimization',
      description: 'Supply chain management optimization project',
      workDivisionId: 'OPS',
      year: 2025,
      startDate: new Date('2025-07-01'),
      finishDate: new Date('2025-12-31'),
      createdAt: new Date('2024-12-25'),
      status: 'Not Allocated'
    },
    {
      code: 'HRD/2025/01/000014',
      title: 'Performance Management System',
      description: 'Employee performance management system',
      workDivisionId: 'HRD',
      year: 2025,
      startDate: new Date('2025-03-15'),
      finishDate: new Date('2025-08-15'),
      createdAt: new Date('2024-12-25'),
      status: 'Allocated'
    },
    {
      code: 'MKT/2025/01/000015',
      title: 'Social Media Integration',
      description: 'Integration of social media marketing platforms',
      workDivisionId: 'MKT',
      year: 2025,
      startDate: new Date('2025-04-01'),
      finishDate: new Date('2025-07-31'),
      createdAt: new Date('2024-12-25'),
      status: 'Not Allocated'
    },
    {
      code: 'ITE/2025/01/000016',
      title: 'Cybersecurity Enhancement',
      description: 'Enhancement of cybersecurity measures',
      workDivisionId: 'ITE',
      year: 2025,
      startDate: new Date('2025-08-01'),
      finishDate: new Date('2025-12-31'),
      createdAt: new Date('2024-12-25'),
      status: 'Allocated'
    },
    {
      code: 'FIN/2025/01/000017',
      title: 'Tax Management System',
      description: 'Implementation of tax management system',
      workDivisionId: 'FIN',
      year: 2025,
      startDate: new Date('2025-05-01'),
      finishDate: new Date('2025-10-31'),
      createdAt: new Date('2024-12-25'),
      status: 'Not Allocated'
    },
    {
      code: 'OPS/2025/01/000018',
      title: 'Quality Management System',
      description: 'Implementation of quality management system',
      workDivisionId: 'OPS',
      year: 2025,
      startDate: new Date('2025-09-01'),
      finishDate: new Date('2025-12-31'),
      createdAt: new Date('2024-12-25'),
      status: 'Allocated'
    },
    {
      code: 'HRD/2025/01/000019',
      title: 'Recruitment System',
      description: 'New recruitment management system',
      workDivisionId: 'HRD',
      year: 2025,
      startDate: new Date('2025-06-01'),
      finishDate: new Date('2025-11-30'),
      createdAt: new Date('2024-12-25'),
      status: 'Not Allocated'
    },
    {
      code: 'MKT/2025/01/000020',
      title: 'E-commerce Integration',
      description: 'Integration with e-commerce platforms',
      workDivisionId: 'MKT',
      year: 2025,
      startDate: new Date('2025-07-01'),
      finishDate: new Date('2025-12-31'),
      createdAt: new Date('2024-12-28'),
      status: 'Allocated'
    }
  ];

  for (const data of projectsData) {
    const project = await prisma.project.create({
      data: {
        ...data,
        createdBy: user?.id
      }
    });

    await prisma.projectHistory.create({
      data: {
        projectId: project.id,
        projectCode: project.code,
        action: 'CREATE',
        userId: user?.id || 'unknown ninja',
        changes: {
          ...data
        },
        timestamp: new Date('2024-12-20'),
      }
    });
  }
}