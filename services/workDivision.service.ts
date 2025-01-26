import { db } from '@/lib/db';
import { WorkDivision } from '@/types/workDivision';

export const WorkDivisionService = {
  async create(data: Omit<WorkDivision, 'id' | 'createdAt' | 'updatedAt'>) {
    try {
      const division = await db.workDivision.create({
        data: {
          ...data,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });
      return division;
    } catch (error) {
      throw new Error('Failed to create work division');
    }
  },

  async getAll() {
    try {
      const divisions = await db.workDivision.findMany({
        orderBy: {
          createdAt: 'desc',
        },
      });
      return divisions;
    } catch (error) {
      throw new Error('Failed to fetch work divisions');
    }
  },
}; 