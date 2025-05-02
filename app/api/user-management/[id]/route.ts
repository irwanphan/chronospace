import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export const revalidate = 0

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const [ user, roles, workDivisions ] = await Promise.all([
      prisma.user.findUnique({
        where: { id: params.id },
        include: {
          role: true,
          workDivision: true,
        },
      }),
      prisma.role.findMany({
        select: {
          id: true,
          roleName: true,
        },
        where: {
          roleCode: {
            not: 'ADMIN',
          },
        },
      }), 
      prisma.workDivision.findMany({
        select: {
          id: true,
          name: true,
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
      user,
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
        roleId: body.roleId,             // ganti roleId menjadi role
        workDivisionId: body.workDivisionId,  // ganti workDivisionId menjadi workDivision
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
    // Check if user has purchase requests
    const purchaseRequests = await prisma.purchaseRequest.findMany({
      where: { createdBy: params.id }
    });

    if (purchaseRequests.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete user that has created purchase requests' },
        { status: 400 }
      );
    }

    // Check if user is involved in PR approvals
    const prApprovals = await prisma.purchaseRequestApproval.findMany({
      where: { 
        OR: [
          { actorId: params.id },
          { specificUserId: params.id }
        ]
      }
    });

    if (prApprovals.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete user that is involved in purchase request approvals' },
        { status: 400 }
      );
    }

    // Check if user is specified in approval schemas
    const approvalSteps = await prisma.approvalStep.findMany({
      where: { specificUserId: params.id }
    });

    if (approvalSteps.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete user that is specified in approval schemas' },
        { status: 400 }
      );
    }

    // Check if user is division head
    const divisions = await prisma.workDivision.findMany({
      where: { headId: params.id }
    });

    if (divisions.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete user that is assigned as division head' },
        { status: 400 }
      );
    }

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