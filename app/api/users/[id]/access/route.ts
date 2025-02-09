import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
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
    const access = await prisma.userAccess.findUnique({
      where: {
        userId: params.id,
      },
    });

    return NextResponse.json(access || {
      menuAccess: {
        timeline: true,
        workspace: true,
        projectPlanning: true,
        budgetPlanning: true,
        userManagement: true,
        workspaceManagement: true
      },
      activityAccess: {
        // ... default values ...
      },
      workspaceAccess: {
        // ... default values ...
      }
    });
  } catch (error) {
    console.error('Error fetching access:', error);
    return NextResponse.json(
      { error: 'Failed to fetch access control' },
      { status: 500 }
    );
  }
} 