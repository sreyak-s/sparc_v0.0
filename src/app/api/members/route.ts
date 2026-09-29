import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifySessionToken, canManageMembers, sanitizeMember } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const academic_year = searchParams.get('academic_year') || undefined;

    const members = await db.getMembers(academic_year);
    const nextSparcId = await db.getNextSequentialSparcId();
    const safeMembers = members.map(sanitizeMember);

    return NextResponse.json({
      success: true,
      count: safeMembers.length,
      next_sparc_id: nextSparcId,
      members: safeMembers
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch members' }, { status: 500 });
  }
}

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
      return NextResponse.json({ error: 'Permission Denied. Only the Founder can enroll new cadets.' }, { status: 403 });
    }

    const body = await req.json();
    const { name, email, role, department, batch, academic_year, sparc_id } = body;

    if (!name || !department || !batch) {
      return NextResponse.json({ error: 'Name, Department, and Batch are required.' }, { status: 400 });
    }

    // If sparc_id provided, check for duplicate
    if (sparc_id) {
      const existing = await db.getMemberBySparcId(sparc_id);
      if (existing) {
        return NextResponse.json({ error: `SPARC ID ${sparc_id} is already registered to another cadet.` }, { status: 400 });
      }
    }

    const created = await db.createMember({
      name,
      email,
      role: role || 'MEMBER',
      department,
      batch,
      academic_year: academic_year || '2026-27',
      sparc_id: sparc_id || undefined,
      password_hash: null // Member must use /create-password to activate!
    });

    return NextResponse.json({
      success: true,
      message: `Cadet ${created.name} successfully registered with SPARC ID ${created.sparc_id}.`,
      member: sanitizeMember(created)
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to create member.' }, { status: 500 });
  }
}
