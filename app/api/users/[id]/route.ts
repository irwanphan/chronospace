import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const [ user, roles, workDivisions ] = await Promise.all([
      prisma.user.findUnique({
        where: { id: params.id },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,          // Ambil role
          workDivision: true,  // Ambil workDivision
          employeeId: true,
          address: true,
          residentId: true,
          nationality: true,
          birthday: true,
        },
      }),
      prisma.role.findMany({
        select: {
          id: true,
          roleName: true,
        },
      }), 
      prisma.workDivision.findMany({
        select: {
          id: true,
          divisionName: true,
        },
      }), 
    ]);

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ...user,
      roleId: user.role,             // Map ke roleId
      workDivisionId: user.workDivision,  // Map ke workDivisionId
      roles,
      workDivisions
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();

    const user = await prisma.user.update({
      where: { id: params.id },
      data: {
        name: body.name,
        email: body.email,
        phone: body.phone,
        role: body.roleId,             // ganti roleId menjadi role
        workDivision: body.workDivisionId,  // ganti workDivisionId menjadi workDivision
        employeeId: body.employeeId,
        address: body.address,
        residentId: body.residentId,
        nationality: body.nationality,
        birthday: new Date(body.birthday).toISOString(),
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.user.delete({
      where: { id: params.id },
    });
    return NextResponse.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    );
  }
} 