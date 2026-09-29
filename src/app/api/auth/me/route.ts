import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifySessionToken, sanitizeMember } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    let token = req.cookies.get('sparc_token')?.value;

    if (!token) {
      const authHeader = req.headers.get('authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }

    if (!token) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    const { valid, payload } = verifySessionToken(token);
    if (!valid || !payload) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    const member = await db.getMemberById(payload.sub) || await db.getMemberBySparcId(payload.sparc_id);
    if (!member || !member.active) {
      return NextResponse.json({ authenticated: false, error: 'Cadet account inactive or not found' }, { status: 401 });
    }

    return NextResponse.json({
      authenticated: true,
      user: sanitizeMember(member)
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Authentication check failed' }, { status: 500 });
  }
}
