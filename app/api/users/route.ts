import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';

interface UserPost {
  email: string;
  password: string;
  fullName: string;
  phone: string;
  role: string;
  workDivision: string;
  employeeId: string;
  address: string;
  residentId: string;
  nationality: string;
  birthday: string;
  avatar?: File;
}

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        workDivision: true,
        employeeId: true,
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
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body: UserPost = await request.json();
    
    // Validasi data yang diperlukan
    if (!body.email || !body.password || !body.fullName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: body.email }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(body.password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: body.email,
        password: hashedPassword,
        name: body.fullName,
        phone: body.phone,
        role: body.role,
        workDivision: body.workDivision,
        employeeId: body.employeeId,
        address: body.address,
        residentId: body.residentId,
        nationality: body.nationality,
        birthday: new Date(body.birthday),
      }
    });

    return NextResponse.json({
      ...user,
      password: undefined
    });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
} 