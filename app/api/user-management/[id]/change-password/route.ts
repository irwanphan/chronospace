import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const canChangePassword = session.user.access.activityAccess.changePassword;
    const canChangeOtherUserPassword = session.user.access.activityAccess.changeOtherUserPassword;
    const isSelfChange = session.user.id === params.id;

    if (!canChangePassword && !canChangeOtherUserPassword) {
      return NextResponse.json({ message: 'Permission denied' }, { status: 403 });
    }

    if (!isSelfChange && !canChangeOtherUserPassword) {
      return NextResponse.json({ message: 'Permission denied' }, { status: 403 });
    }

    const { currentPassword, newPassword } = await request.json();

    // Validate new password
    if (!newPassword || newPassword.length < 8) {
      return NextResponse.json(
        { message: 'New password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        password: true,
      },
    });

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // If changing own password, verify current password
    if (isSelfChange) {
      if (!currentPassword) {
        return NextResponse.json(
          { message: 'Current password is required' },
          { status: 400 }
        );
      }

      const isCurrentPasswordValid = await bcrypt.compare(
        currentPassword,
        user.password
      );

      if (!isCurrentPasswordValid) {
        return NextResponse.json(
          { message: 'Current password is incorrect' },
          { status: 400 }
        );
      }
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await prisma.user.update({
      where: { id: params.id },
      data: { password: hashedPassword },
    });

    // Log the activity
    await prisma.activityHistory.create({
      data: {
        userId: session.user.id,
        entityType: 'USER',
        entityId: params.id,
        action: isSelfChange ? 'CHANGE_OWN_PASSWORD' : 'CHANGE_USER_PASSWORD',
        details: {
          userId: params.id,
          changedBy: session.user.id,
          timestamp: new Date(),
        },
      },
    });

    return NextResponse.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error changing password:', error);
    return NextResponse.json(
      { message: 'Failed to change password' },
      { status: 500 }
    );
  }
} 