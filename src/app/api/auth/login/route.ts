import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyPassword, sanitizeMember, createSessionToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sparc_id, password } = body;

    if (!sparc_id || !password) {
      return NextResponse.json(
        { error: 'SPARC ID and Password are required.' },
        { status: 400 }
      );
    }

    const member = await db.getMemberBySparcId(sparc_id);

    if (!member) {
      return NextResponse.json(
        { error: 'Invalid SPARC ID. No cadet record found in registry.' },
        { status: 401 }
      );
    }

    if (!member.password_hash) {
      return NextResponse.json(
        { 
          error: 'Password has not been created for this SPARC ID yet. Please activate your account via "Create Password".',
          needsActivation: true,
          sparc_id: member.sparc_id
        },
        { status: 403 }
      );
    }

    const isValid = await verifyPassword(password, member.password_hash);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Incorrect flight access password.' },
        { status: 401 }
      );
    }

    const safeMember = sanitizeMember(member);
    const token = createSessionToken(member);

    const response = NextResponse.json({
      success: true,
      message: 'Authentication successful. Flight clearance granted.',
      user: safeMember,
      token
    });

    // Set HTTP-only cookie
    response.cookies.set('sparc_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 // 7 days
    });

    return response;
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
