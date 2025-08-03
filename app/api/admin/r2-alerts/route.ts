import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { 
  checkR2Alerts, 
  getActiveR2Alerts, 
  getR2AlertStats, 
  saveR2Alerts,
  acknowledgeR2Alert,
  DEFAULT_ALERT_THRESHOLDS 
} from '@/lib/r2-alerts';

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check if user is admin or hero
    if (session.user.role !== 'ADMIN' && session.user.role !== 'HERO') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    switch (action) {
      case 'check':
        // Check for new alerts
        const newAlerts = await checkR2Alerts(DEFAULT_ALERT_THRESHOLDS);
        await saveR2Alerts(newAlerts);
        
        return NextResponse.json({
          success: true,
          alerts: newAlerts,
          message: `Found ${newAlerts.length} new alerts`
        });

      case 'stats':
        // Get alert statistics
        const stats = await getR2AlertStats();
        
        return NextResponse.json({
          success: true,
          stats
        });

      default:
        // Get active alerts
        const activeAlerts = await getActiveR2Alerts();
        
        return NextResponse.json({
          success: true,
          alerts: activeAlerts,
          count: activeAlerts.length
        });
    }

  } catch (error) {
    console.error('Error handling R2 alerts:', error);
    return NextResponse.json(
      { 
        error: 'Failed to handle R2 alerts',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check if user is admin or hero
    if (session.user.role !== 'ADMIN' && session.user.role !== 'HERO') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const { alertId, action } = await request.json();

    if (action === 'acknowledge' && alertId) {
      // Acknowledge an alert
      await acknowledgeR2Alert(alertId, session.user.id);
      
      return NextResponse.json({
        success: true,
        message: 'Alert acknowledged successfully'
      });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Error acknowledging R2 alert:', error);
    return NextResponse.json(
      { 
        error: 'Failed to acknowledge alert',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 