import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const role = await prisma.role.findUnique({
      where: { id: params.id },
    });

    if (!role) {
      return NextResponse.json(
        { error: 'Role not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(role);
  } catch (error) {
    console.error('Error fetching role:', error);
    return NextResponse.json(
      { error: 'Failed to fetch role' },
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

    // Cek apakah role code sudah digunakan role lain
    const existingRole = await prisma.role.findFirst({
      where: {
        roleCode: body.roleCode,
        id: { not: params.id }  // Exclude current role
      }
    });

    if (existingRole) {
      return NextResponse.json(
        { error: 'Role code already exists' },
        { status: 400 }
      );
    }

    const role = await prisma.role.update({
      where: { id: params.id },
      data: {
        roleCode: body.roleCode,
        roleName: body.roleName,
        description: body.description,
        approvalLimit: body.approvalLimit,
      },
    });
    return NextResponse.json(role);
  } catch (error) {
    console.error('Error updating role:', error);
    return NextResponse.json(
      { error: 'Failed to update role' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.role.delete({
      where: { id: params.id },
    });
    return NextResponse.json({ message: 'Role deleted successfully' });
  } catch (error) {
    console.error('Error deleting role:', error);
    return NextResponse.json(
      { error: 'Failed to delete role' },
      { status: 500 }
    );
  }
} 