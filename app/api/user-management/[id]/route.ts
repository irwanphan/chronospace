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
          { approvedBy: params.id },
          { specificUser: params.id }
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
      where: { divisionHead: params.id }
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