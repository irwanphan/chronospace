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
    
    const user = await prisma.user.create({
      data: {
        name: body.fullName,
        email: body.email,
        password: body.password, // Idealnya password harus di-hash dulu
        role: body.role,
        phone: body.phone,
        workDivision: body.workDivision,
        employeeId: body.employeeId,
        address: body.address,
        residentId: body.residentId,
        nationality: body.nationality,
        birthday: new Date(body.birthday),
        createdAt: new Date(),
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
} 