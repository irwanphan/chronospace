import { db } from '@/lib/db';
import { ApprovalSchema, ApprovalStep } from '@/types/approvalSchema';

export const ApprovalSchemaService = {
  async create(data: Omit<ApprovalSchema, 'id' | 'createdAt' | 'updatedAt'>) {
    try {
      const { steps, ...schemaData } = data;
      
      const schema = await db.approvalSchema.create({
        data: {
          ...schemaData,
          steps: {
            create: steps.map((step, index) => ({
              ...step,
              stepNumber: index + 1,
            })),
          },
        },
        include: {
          steps: true,
        },
      });
      
      return schema;
    } catch (error) {
      throw new Error('Failed to create approval schema');
    }
  },

  async getAll() {
    try {
      const schemas = await db.approvalSchema.findMany({
        include: {
          steps: {
            orderBy: {
              stepNumber: 'asc',
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
      return schemas;
    } catch (error) {
      throw new Error('Failed to fetch approval schemas');
    }
  },

  async getById(id: string) {
    try {
      const schema = await db.approvalSchema.findUnique({
        where: { id },
        include: {
          steps: {
            orderBy: {
              stepNumber: 'asc',
            },
          },
        },
      });
      return schema;
    } catch (error) {
      throw new Error('Failed to fetch approval schema');
    }
  },

  async updateSteps(schemaId: string, steps: Omit<ApprovalStep, 'id' | 'createdAt' | 'updatedAt'>[]) {
    try {
      // Delete existing steps
      await db.approvalStep.deleteMany({
        where: { schemaId },
      });

      // Create new steps
      await db.approvalStep.createMany({
        data: steps.map((step, index) => ({
          ...step,
          schemaId,
          stepNumber: index + 1,
        })),
      });

      return await this.getById(schemaId);
    } catch (error) {
      throw new Error('Failed to update approval steps');
    }
  },
}; 