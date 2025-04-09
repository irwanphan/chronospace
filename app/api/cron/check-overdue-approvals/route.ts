import { NextResponse } from "next/server";
import { checkAndCreateOverdueNotifications } from "@/lib/notifications";

// This endpoint should be called by a cron job
export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    
    // Basic security check - you should replace this with your actual API key
    if (authHeader !== `Bearer ${process.env.CRON_SECRET_KEY}`) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    await checkAndCreateOverdueNotifications();
    
    return NextResponse.json({ message: 'Successfully checked for overdue approvals' });
  } catch (error) {
    console.error('Error checking overdue approvals:', error);
    return NextResponse.json(
      { error: 'Failed to check overdue approvals' },
      { status: 500 }
    );
  }
} 