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
        budgetLimit: body.budgetLimit,
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
    // Check if role is being used in any purchase request approval
    const purchaseRequestApprovalsWithRole = await prisma.purchaseRequestApproval.findMany({
      where: { roleId: params.id }
    });

    if (purchaseRequestApprovalsWithRole.length > 0) {  
      return NextResponse.json(
        { error: 'Cannot delete role that is used in purchase request approvals' },
        { status: 400 }
      );
    }

    // Check if role is being used in any approval step
    const approvalStepsWithRole = await prisma.approvalStep.findMany({
      where: { roleId: params.id }
    });

    if (approvalStepsWithRole.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete role that is used in approval schemas' },
        { status: 400 }
      );
    }

    // Check if role is being used by any user
    const usersWithRole = await prisma.user.findMany({
      where: { roleId: params.id }
    });

    if (usersWithRole.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete role that is assigned to users' },
        { status: 400 }
      );
    }

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