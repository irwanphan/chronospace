import { db } from '@/lib/db';
import { Vendor } from '@/types/vendor';

export const VendorService = {
  async create(data: Omit<Vendor, 'id' | 'createdAt' | 'updatedAt'>) {
    try {
      const vendor = await db.vendor.create({
        data: {
          ...data,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });
      return vendor;
    } catch (error) {
      throw new Error('Failed to create vendor');
    }
  },

  async getAll() {
    try {
      const vendors = await db.vendor.findMany({
        orderBy: {
          createdAt: 'desc',
        },
      });
      return vendors;
    } catch (error) {
      throw new Error('Failed to fetch vendors');
    }
  },
}; 