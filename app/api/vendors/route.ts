import { NextResponse } from 'next/server';
import { VendorService } from '@/services/vendor.service';

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const vendor = await VendorService.create(data);
    return NextResponse.json(vendor, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create vendor' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const vendors = await VendorService.getAll();
    return NextResponse.json(vendors);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch vendors' },
      { status: 500 }
    );
  }
} 