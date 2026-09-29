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
      return NextResponse.json({ error: 'Permission Denied. Only Founder can reset member passwords.' }, { status: 403 });
    }

    const body = await req.json();
    const { sparc_id } = body;

    if (!sparc_id) {
      return NextResponse.json({ error: 'SPARC ID is required.' }, { status: 400 });
    }

    const success = await db.resetPasswordForMember(sparc_id, null);
    if (!success) {
      return NextResponse.json({ error: 'Member not found or reset failed.' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: `Password reset successfully for ${sparc_id}. The cadet can now visit "Create Password" to set fresh credentials.`
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Reset failed' }, { status: 500 });
  }
}
