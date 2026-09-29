import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifySessionToken, canMarkAttendance } from '@/lib/auth';
import { formatToDateStr } from '@/lib/time-utils';

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
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const { valid, payload } = verifySessionToken(token);
    if (!valid || !payload || !canMarkAttendance(payload.role)) {
      return NextResponse.json({ error: 'Permission Denied. Only Flight Leadership can execute bulk operations.' }, { status: 403 });
    }

    const body = await req.json();
    const date = body.date || formatToDateStr(new Date());

    const result = await db.bulkMarkAbsent(date, payload.sparc_id);

    return NextResponse.json({
      success: true,
      message: `Successfully marked ${result.count} unmarked cadet(s) as ABSENT for ${date}.`,
      count: result.count
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Bulk mark failed' }, { status: 500 });
  }
}
