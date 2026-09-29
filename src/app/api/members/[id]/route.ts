import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifySessionToken, canManageMembers, sanitizeMember } from '@/lib/auth';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const member = await db.getMemberById(id) || await db.getMemberBySparcId(id);
    if (!member) {
      return NextResponse.json({ error: 'Cadet not found.' }, { status: 404 });
    }
    return NextResponse.json({ success: true, member: sanitizeMember(member) });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
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
    if (!valid || !payload) {
      return NextResponse.json({ error: 'Invalid flight session token.' }, { status: 401 });
    }

    const isSelf = payload.sub === id || payload.sparc_id === id;
    const isFounderUser = canManageMembers(payload.role);

    if (!isFounderUser && !isSelf) {
      return NextResponse.json({ error: 'Permission Denied.' }, { status: 403 });
    }

    const body = await req.json();
    const updates: any = {};

    // Non-founders can only update their own contact/email
    if (!isFounderUser) {
      if (body.email !== undefined) updates.email = body.email;
    } else {
      // Founders can update all fields
      if (body.name !== undefined) updates.name = body.name;
      if (body.email !== undefined) updates.email = body.email;
      if (body.role !== undefined) updates.role = body.role;
      if (body.department !== undefined) updates.department = body.department;
      if (body.batch !== undefined) updates.batch = body.batch;
      if (body.academic_year !== undefined) updates.academic_year = body.academic_year;
      if (body.active !== undefined) updates.active = body.active;
      if (body.sparc_id !== undefined) updates.sparc_id = body.sparc_id;
    }

    const updated = await db.updateMember(id, updates);
    if (!updated) {
      return NextResponse.json({ error: 'Member not found or update failed.' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Cadet profile updated successfully.',
      member: sanitizeMember(updated)
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Update failed' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
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
      return NextResponse.json({ error: 'Permission Denied. Only Flight Leadership can discharge members.' }, { status: 403 });
    }

    const target = await db.getMemberById(id) || await db.getMemberBySparcId(id);
    if (target?.role === 'FOUNDER' || target?.sparc_id === 'SPARC-FDR') {
      return NextResponse.json({ error: 'Cannot discharge Founder account.' }, { status: 400 });
    }

    const targetId = target ? target.id : id;
    const success = await db.deleteMember(targetId);
    if (!success) {
      return NextResponse.json({ error: 'Member not found or deletion failed.' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: `Member ${target?.name || id} (${target?.sparc_id || ''}) successfully discharged from flight roster.`
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Deletion failed.' }, { status: 500 });
  }
}
