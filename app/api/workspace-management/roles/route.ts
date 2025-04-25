import { NextResponse } from 'next/server';
import { RoleService } from '@/services/role.service';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';

export const revalidate = 0

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const data = await req.json();

    if (data.roleCode === 'ADMIN') {
      return NextResponse.json(
        { error: 'Admin role cannot be created' },
        { status: 400 }
      );
    }

    // Map approvalLimit to budgetLimit
    const roleData = {
      ...data,
      budgetLimit: data.approvalLimit,
      approvalLimit: undefined
    };

    const role = await RoleService.create(roleData);

    // Record activity history
    await prisma.activityHistory.create({
      data: {
        userId: session.user.id,
        entityType: 'ROLE',
        entityId: role.roleCode,
        action: 'CREATE',
        details: {
          id: role.id,
          roleCode: role.roleCode,
          roleName: role.roleName,
          description: role.description,
          budgetLimit: role.budgetLimit
        }
      }
    });

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
      where: {
        roleCode: {
          not: 'ADMIN',
        },
      },
      select: {
        id: true,
        roleName: true,
        description: true,
        budgetLimit: true,
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