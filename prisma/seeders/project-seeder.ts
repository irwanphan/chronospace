import { prisma } from "@/lib/prisma";

// project status:
// Not Allocated: Project is not allocated in any budget plan
// Allocated: Project is allocated in a budget plan
// In Progress: Project is in progress with purchase request being processed
// Completed: Project is completed
// Cancelled: Project is cancelled

export async function projectSeeder() {
  await prisma.project.createMany({
    data: [
      {
        projectId: 'PRJ/2025/03/000001',
        projectCode: 'RND-25-001',
        projectTitle: 'System Development 2025',
        description: 'Development of new enterprise system',
        workDivisionId: 'ITE',
        year: 2025,
        startDate: new Date('2025-01-01'),
        finishDate: new Date('2025-12-31'),
        requestDate: new Date('2024-12-01'),
        status: 'Allocated'
      },
      {
        projectId: 'PRJ/2025/03/000002',
        projectCode: 'FIN-25-001',
        projectTitle: 'Financial System Integration',
        description: 'Integration of financial systems across divisions',
        workDivisionId: 'FIN',
        year: 2025,
        startDate: new Date('2025-02-01'),
        finishDate: new Date('2025-06-30'),
        requestDate: new Date('2024-12-15'),
        status: 'Allocated'
      },
      {
        projectId: 'PRJ/2025/03/000003',
        projectCode: 'OPS-25-001',
        projectTitle: 'Operations Improvement',
        description: 'Operational efficiency improvement project',
        workDivisionId: 'OPS',
        year: 2025,
        startDate: new Date('2025-03-01'),
        finishDate: new Date('2025-08-31'),
        requestDate: new Date('2024-12-20'),
        status: 'Not Allocated'
      },
      {
        projectId: 'PRJ/2025/03/000004',
        projectCode: 'HRD-25-001',
        projectTitle: 'HR Management System',
        description: 'New HR management system implementation',
        workDivisionId: 'HRD',
        year: 2025,
        startDate: new Date('2025-01-15'),
        finishDate: new Date('2025-07-15'),
        requestDate: new Date('2024-12-05'),
        status: 'Allocated'
      },
      {
        projectId: 'PRJ/2025/03/000005',
        projectCode: 'MKT-25-001',
        projectTitle: 'Digital Marketing Platform',
        description: 'Implementation of digital marketing platform',
        workDivisionId: 'MKT',
        year: 2025,
        startDate: new Date('2025-02-15'),
        finishDate: new Date('2025-05-15'),
        requestDate: new Date('2024-12-10'),
        status: 'Not Allocated'
      },
      {
        projectId: 'PRJ/2025/03/000006',
        projectCode: 'ITE-25-002',
        projectTitle: 'Network Infrastructure Upgrade',
        description: 'Company-wide network infrastructure upgrade',
        workDivisionId: 'ITE',
        year: 2025,
        startDate: new Date('2025-04-01'),
        finishDate: new Date('2025-09-30'),
        requestDate: new Date('2024-12-22'),
        status: 'Allocated'
      },
      {
        projectId: 'PRJ/2025/03/000007',
        projectCode: 'FIN-25-002',
        projectTitle: 'Budget Management System',
        description: 'Implementation of new budget management system',
        workDivisionId: 'FIN',
        year: 2025,
        startDate: new Date('2025-03-15'),
        finishDate: new Date('2025-08-15'),
        requestDate: new Date('2024-12-18'),
        status: 'Not Allocated'
      },
      {
        projectId: 'PRJ/2025/03/000008',
        projectCode: 'OPS-25-002',
        projectTitle: 'Warehouse Automation',
        description: 'Automation of warehouse operations',
        workDivisionId: 'OPS',
        year: 2025,
        startDate: new Date('2025-05-01'),
        finishDate: new Date('2025-10-31'),
        requestDate: new Date('2024-12-25'),
        status: 'Allocated'
      },
      {
        projectId: 'PRJ/2025/03/000009',
        projectCode: 'HRD-25-002',
        projectTitle: 'Training Management System',
        description: 'Employee training management system',
        workDivisionId: 'HRD',
        year: 2025,
        startDate: new Date('2025-02-01'),
        finishDate: new Date('2025-07-31'),
        requestDate: new Date('2024-12-12'),
        status: 'Not Allocated'
      },
      {
        projectId: 'PRJ/2025/03/000010',
        projectCode: 'MKT-25-002',
        projectTitle: 'Customer Analytics Platform',
        description: 'Implementation of customer analytics platform',
        workDivisionId: 'MKT',
        year: 2025,
        startDate: new Date('2025-03-01'),
        finishDate: new Date('2025-06-30'),
        requestDate: new Date('2024-12-15'),
        status: 'Allocated'
      },
      {
        projectId: 'PRJ/2025/03/000011',
        projectCode: 'ITE-25-003',
        projectTitle: 'Cloud Migration Project',
        description: 'Migration of systems to cloud infrastructure',
        workDivisionId: 'ITE',
        year: 2025,
        startDate: new Date('2025-06-01'),
        finishDate: new Date('2025-11-30'),
        requestDate: new Date('2024-12-28'),
        status: 'Not Allocated'
      },
      {
        projectId: 'PRJ/2025/03/000012',
        projectCode: 'FIN-25-003',
        projectTitle: 'Accounting System Upgrade',
        description: 'Upgrade of existing accounting system',
        workDivisionId: 'FIN',
        year: 2025,
        startDate: new Date('2025-04-01'),
        finishDate: new Date('2025-09-30'),
        requestDate: new Date('2024-12-20'),
        status: 'Allocated'
      },
      {
        projectId: 'PRJ/2025/03/000013',
        projectCode: 'OPS-25-003',
        projectTitle: 'Supply Chain Optimization',
        description: 'Supply chain management optimization project',
        workDivisionId: 'OPS',
        year: 2025,
        startDate: new Date('2025-07-01'),
        finishDate: new Date('2025-12-31'),
        requestDate: new Date('2024-12-30'),
        status: 'Not Allocated'
      },
      {
        projectId: 'PRJ/2025/03/000014',
        projectCode: 'HRD-25-003',
        projectTitle: 'Performance Management System',
        description: 'Employee performance management system',
        workDivisionId: 'HRD',
        year: 2025,
        startDate: new Date('2025-03-15'),
        finishDate: new Date('2025-08-15'),
        requestDate: new Date('2024-12-16'),
        status: 'Allocated'
      },
      {
        projectId: 'PRJ/2025/03/000015',
        projectCode: 'MKT-25-003',
        projectTitle: 'Social Media Integration',
        description: 'Integration of social media marketing platforms',
        workDivisionId: 'MKT',
        year: 2025,
        startDate: new Date('2025-04-01'),
        finishDate: new Date('2025-07-31'),
        requestDate: new Date('2024-12-18'),
        status: 'Not Allocated'
      },
      {
        projectId: 'PRJ/2025/03/000016',
        projectCode: 'ITE-25-004',
        projectTitle: 'Cybersecurity Enhancement',
        description: 'Enhancement of cybersecurity measures',
        workDivisionId: 'ITE',
        year: 2025,
        startDate: new Date('2025-08-01'),
        finishDate: new Date('2025-12-31'),
        requestDate: new Date('2024-12-31'),
        status: 'Allocated'
      },
      {
        projectId: 'PRJ/2025/03/000017',
        projectCode: 'FIN-25-004',
        projectTitle: 'Tax Management System',
        description: 'Implementation of tax management system',
        workDivisionId: 'FIN',
        year: 2025,
        startDate: new Date('2025-05-01'),
        finishDate: new Date('2025-10-31'),
        requestDate: new Date('2024-12-22'),
        status: 'Not Allocated'
      },
      {
        projectId: 'PRJ/2025/03/000018',
        projectCode: 'OPS-25-004',
        projectTitle: 'Quality Management System',
        description: 'Implementation of quality management system',
        workDivisionId: 'OPS',
        year: 2025,
        startDate: new Date('2025-09-01'),
        finishDate: new Date('2025-12-31'),
        requestDate: new Date('2024-12-31'),
        status: 'Allocated'
      },
      {
        projectId: 'PRJ/2025/03/000019',
        projectCode: 'HRD-25-004',
        projectTitle: 'Recruitment System',
        description: 'New recruitment management system',
        workDivisionId: 'HRD',
        year: 2025,
        startDate: new Date('2025-06-01'),
        finishDate: new Date('2025-11-30'),
        requestDate: new Date('2024-12-25'),
        status: 'Not Allocated'
      },
      {
        projectId: 'PRJ/2025/03/000020',
        projectCode: 'MKT-25-004',
        projectTitle: 'E-commerce Integration',
        description: 'Integration with e-commerce platforms',
        workDivisionId: 'MKT',
        year: 2025,
        startDate: new Date('2025-07-01'),
        finishDate: new Date('2025-12-31'),
        requestDate: new Date('2024-12-28'),
        status: 'Allocated'
      }
    ]
  });
}