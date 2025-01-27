import { db } from '@/lib/db';
import { Vendor } from '@/types/vendor';

export const VendorService = {
  async create(data: Omit<Vendor, 'id' | 'createdAt' | 'updatedAt'>) {
    try {
      const vendor = await db.vendor.create({
        data: {
          ...data,
          documents: data.documents?.join(',') || null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });
      return vendor;
    } catch (error) {
      console.error('Failed to create vendor:', error);
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
      console.error('Failed to fetch vendors:', error);
      throw new Error('Failed to fetch vendors');
    }
  },
}; 