import { db } from '@/lib/db';
import { Role } from '@/types/role';

export const RoleService = {
  async create(data: Omit<Role, 'id' | 'createdAt' | 'updatedAt'>) {
    try {
      const role = await db.role.create({
        data: {
          ...data,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });
      return role;
    } catch (error) {
      throw new Error('Failed to create role');
    }
  },

  async getAll() {
    try {
      const roles = await db.role.findMany({
        orderBy: {
          createdAt: 'desc',
        },
      });
      return roles;
    } catch (error) {
      throw new Error('Failed to fetch roles');
    }
  },
}; 