import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

export const revalidate = 0

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { menuAccess, activityAccess, workspaceAccess } = await request.json();

    const updatedAccess = await prisma.userAccess.upsert({
      where: {
        userId: params.id,
      },
      update: {
        menuAccess,
        activityAccess,
        workspaceAccess,
      },
      create: {
        userId: params.id,
        menuAccess,
        activityAccess,
        workspaceAccess,
      },
    });

    // get the difference between the old and new access
    const oldAccess = await prisma.userAccess.findUnique({
      where: { userId: params.id },
    });

    const difference = {
      menuAccess: updatedAccess.menuAccess !== oldAccess?.menuAccess,
      activityAccess: updatedAccess.activityAccess !== oldAccess?.activityAccess,
      workspaceAccess: updatedAccess.workspaceAccess !== oldAccess?.workspaceAccess,
    };

    // activity history
    await prisma.activityHistory.create({
      data: {
        userId: session.user.id,
        action: 'UPDATE',
        entityType: 'USER',
        entityId: params.id,
        entityCode: null,
        details: {
          difference
        }
      }
    });

    return NextResponse.json(updatedAccess);
  } catch (error) {
    console.error('Error updating access:', error);
    return NextResponse.json(
      { error: 'Failed to update access control' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const userAccess = await prisma.userAccess.findUnique({
      where: { userId: params.id },
      include: {
        user: true
      }
    });

    // Jika tidak ada access, kembalikan default values
    if (!userAccess) {
      return NextResponse.json({
        menuAccess: {
          timeline: false,
          workspace: false,
          projectPlanning: false,
          budgetPlanning: false,
          userManagement: false,
          workspaceManagement: false
        },
        activityAccess: {
          // ... default values
        },
        workspaceAccess: {
          // ... default values
        }
      });
    }

    return NextResponse.json(userAccess);
  } catch (error) {
    console.error('Error fetching access control:', error);
    return NextResponse.json(
      { error: 'Failed to fetch access control' },
      { status: 500 }
    );
  }
} 