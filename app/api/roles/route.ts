import { NextResponse } from 'next/server';
import { RoleService } from '@/services/role.service';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const role = await RoleService.create(data);
    return NextResponse.json(role, { status: 201 });
  } catch (error) {
    console.error('Failed to create role:', error);
    return NextResponse.json(
      { error: 'Failed to create role' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const roles = await prisma.role.findMany({
      select: {
        id: true,
        roleName: true,
      },
      orderBy: {
        roleName: 'asc',
      },
    });
    
    return NextResponse.json(roles);
  } catch (error) {
    console.error('Failed to fetch roles:', error);
    return NextResponse.json(
      { error: 'Failed to fetch roles' },
      { status: 500 }
    );
  }
} 