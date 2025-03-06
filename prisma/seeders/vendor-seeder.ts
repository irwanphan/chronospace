import { prisma } from "@/lib/prisma";

export async function vendorSeeder() {
  await prisma.vendor.createMany({
    data: [
      {
        id: 'vendor-1',
        vendorName: 'PT Maju Teknologi',
        vendorCode: 'VDR-001',
        address: 'Jl. Teknologi No. 123, Jakarta',
        phone: '021-5551234',
        email: 'contact@majuteknologi.com',
      },
      {
        id: 'vendor-2',
        vendorName: 'PT Solusi Digital',
        vendorCode: 'VDR-002',
        address: 'Jl. Digital No. 456, Bandung',
        phone: '022-5555678',
        email: 'info@solusidigital.com',
      },
      {
        id: 'vendor-3',
        vendorName: 'PT Sistem Andal',
        vendorCode: 'VDR-003',
        address: 'Jl. Sistem No. 789, Surabaya',
        phone: '031-5559012',
        email: 'contact@sistemandal.com',
      },
      {
        id: 'vendor-4',
        vendorName: 'PT Infrastruktur Prima',
        vendorCode: 'VDR-004',
        address: 'Jl. Prima No. 321, Medan',
        phone: '061-5553456',
        email: 'info@infraprima.com',
      },
      {
        id: 'vendor-5',
        vendorName: 'PT Konsultan Profesional',
        vendorCode: 'VDR-005',
        address: 'Jl. Profesional No. 654, Semarang',
        phone: '024-5557890',
        email: 'contact@konpro.com',
      }
    ]
  });
}