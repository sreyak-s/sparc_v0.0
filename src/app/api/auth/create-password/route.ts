import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashPassword, sanitizeMember, createSessionToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sparc_id, name, password } = body;

    if (!sparc_id || !name || !password) {
      return NextResponse.json(
        { error: 'SPARC ID, Full Name, and New Password are required.' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long.' },
        { status: 400 }
      );
    }

    const passwordHash = await hashPassword(password);
    const result = await db.setPasswordForMember(sparc_id, name, passwordHash);

    if (!result.success || !result.member) {
      return NextResponse.json(
        { error: result.message },
        { status: 400 }
      );
    }

    const safeMember = sanitizeMember(result.member);
    const token = createSessionToken(result.member);

    const response = NextResponse.json({
      success: true,
      message: 'Account activated successfully! Welcome aboard SPARC.',
      user: safeMember,
      token
    });

    response.cookies.set('sparc_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60
    });

    return response;
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Activation failed.' }, { status: 500 });
  }
}
