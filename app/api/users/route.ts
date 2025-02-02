import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        lastLogin: true,
        createdAt: true,
        image: true,
        userRoles: {
          select: {
            roleId: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });
    return NextResponse.json(users.map(user => ({
      id: user.id,
      name: user.name,
      roles: user.userRoles.map(ur => ur.roleId),
      image: user.image,
      email: user.email,
      role: user.role,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt,
    })));
  } catch (error) {
    console.error('Failed to fetch users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Cek unique fields
    const [existingEmail, existingEmployeeId, existingResidentId] = await Promise.all([
      prisma.user.findUnique({ where: { email: body.email } }),
      prisma.user.findFirst({ where: { employeeId: body.employeeId } }),
      prisma.user.findFirst({ where: { residentId: body.residentId } })
    ]);

    if (existingEmail) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 400 }
      );
    }

    if (existingEmployeeId) {
      return NextResponse.json(
        { error: 'Employee ID already exists' },
        { status: 400 }
      );
    }

    if (existingResidentId) {
      return NextResponse.json(
        { error: 'Resident ID already exists' },
        { status: 400 }
      );
    }

    const user = await prisma.user.create({
      data: body
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error('Failed to create user:', error);
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
} 