import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifySessionToken } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get('date') || undefined;
    const member_id = searchParams.get('member_id') || undefined;
    const sparc_id = searchParams.get('sparc_id') || undefined;
    const status = searchParams.get('status') || undefined;
    const batch = searchParams.get('batch') || undefined;

    // Optional auth verification
    let token = req.cookies.get('sparc_token')?.value;
    if (!token) {
      const authHeader = req.headers.get('authorization');
      if (authHeader?.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }

    const records = await db.getAttendance({
      date,
      member_id,
      sparc_id,
      status,
      batch
    });

    return NextResponse.json({
      success: true,
      count: records.length,
      records
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch attendance logs' }, { status: 500 });
  }
}
