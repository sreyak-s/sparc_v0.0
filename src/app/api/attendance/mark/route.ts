import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifySessionToken, canMarkAttendance } from '@/lib/auth';
import { evaluateAttendanceStatus, formatToDateStr } from '@/lib/time-utils';
import { AttendanceStatus } from '@/types';

export async function POST(req: NextRequest) {
  try {
    let token = req.cookies.get('sparc_token')?.value;
    if (!token) {
      const authHeader = req.headers.get('authorization');
      if (authHeader?.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized. You must be signed in as Leadership to mark attendance.' },
        { status: 401 }
      );
    }

    const { valid, payload } = verifySessionToken(token);
    if (!valid || !payload) {
      return NextResponse.json({ error: 'Invalid flight session token.' }, { status: 401 });
    }

    // STRICT USER REQUIREMENT:
    // Only Founder, Captain, Vice Captain, and Secretary can mark attendance!
    if (!canMarkAttendance(payload.role)) {
      return NextResponse.json(
        { 
          error: 'Permission Denied: Standard members cannot mark attendance. Only the Founder, Captain, Vice Captain, and Secretary are authorized to mark roll call.',
          isForbidden: true 
        },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { member_id, sparc_id, date, status, device_timestamp, notes, auto_evaluate } = body;

    if (!member_id && !sparc_id) {
      return NextResponse.json({ error: 'Target member_id or sparc_id is required.' }, { status: 400 });
    }

    const targetDate = date || formatToDateStr(new Date());
    const deviceTime = device_timestamp ? new Date(device_timestamp) : new Date();

    let finalStatus: AttendanceStatus = status;

    // If auto_evaluate is requested, use the leadership's device time rule:
    // Up to 5:15 PM -> PRESENT, 5:15-5:30 PM -> LATE, after 5:30 PM -> ABSENT
    if (auto_evaluate || !finalStatus) {
      const settings = await db.getSettings();
      finalStatus = evaluateAttendanceStatus(deviceTime, settings);
    }

    const result = await db.markAttendance({
      member_id: member_id || '',
      sparc_id: sparc_id || '',
      date: targetDate,
      status: finalStatus,
      device_timestamp: deviceTime.toISOString(),
      marked_by_sparc_id: payload.sparc_id,
      notes: notes || undefined
    });

    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: result.message,
      record: result.record
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to record attendance.' }, { status: 500 });
  }
}
