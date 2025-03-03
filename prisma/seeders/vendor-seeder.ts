import { prisma } from "@/lib/prisma";

export async function vendorSeeder() {
  await prisma.vendor.createMany({
    data: [
      {
        id: 'VDR001813yer198y9137r91y',
        vendorCode: 'VDR001',
        vendorName: 'PT Maju Jaya',
        address: 'Jl. Raya Utama No. 123, Jakarta',
        phone: '021-5551234',
        email: 'sales@majujaya.com',
        documents: JSON.stringify(['SIUP', 'TDP', 'NPWP'])
      },
      {
        id: 'VDR002813yer198y9154d76r',
        vendorCode: 'VDR002',
        vendorName: 'CV Tekno Solusi',
        address: 'Jl. Teknologi No. 45, Bandung',
        phone: '022-4445678',
        email: 'info@teknosolusi.com',
        documents: JSON.stringify(['SIUP', 'TDP', 'NPWP'])
      },
      {
        id: 'VDR003813yer137r91yeqr78u',
        vendorCode: 'VDR003',
        vendorName: 'PT Sumber Makmur',
        address: 'Jl. Industri Raya No. 78, Surabaya',
        phone: '031-3334567',
        email: 'procurement@sumbermakmur.com',
        documents: JSON.stringify(['SIUP', 'TDP', 'NPWP'])
      }
    ]
  });
}