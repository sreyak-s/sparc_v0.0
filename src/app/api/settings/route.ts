import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifySessionToken, canManageMembers } from '@/lib/auth';

export async function GET() {
  try {
    const settings = await db.getSettings();
    const academicYears = await db.getAcademicYears();
    return NextResponse.json({
      success: true,
      settings,
      academicYears
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
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
      return NextResponse.json({ error: 'Permission Denied. Only Founder can alter mission parameters and settings.' }, { status: 403 });
    }

    const body = await req.json();
    const updated = await db.updateSettings(body);

    return NextResponse.json({
      success: true,
      message: 'Mission Control settings updated.',
      settings: updated
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Settings update failed' }, { status: 500 });
  }
}
