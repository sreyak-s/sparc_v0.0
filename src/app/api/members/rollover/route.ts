import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifySessionToken, canManageMembers } from '@/lib/auth';

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
    if (!valid || !payload || !canManageMembers(payload.role)) {
      return NextResponse.json({ error: 'Permission Denied. Only Founder can execute Academic Year Rollover.' }, { status: 403 });
    }

    const body = await req.json();
    const { newYear, captainMemberId, viceCaptainMemberId, secretaryMemberId } = body;

    if (!newYear || !captainMemberId || !viceCaptainMemberId || !secretaryMemberId) {
      return NextResponse.json({
        error: 'Academic Year name, Captain, Vice Captain, and Secretary selections are all required.'
      }, { status: 400 });
    }

    const result = await db.rolloverAcademicYear({
      newYear,
      captainMemberId,
      viceCaptainMemberId,
      secretaryMemberId
    });

    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Rollover failed' }, { status: 500 });
  }
}
