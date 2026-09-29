import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifySessionToken, isLeadership } from '@/lib/auth';

export async function GET() {
  try {
    const announcements = await db.getAnnouncements();
    return NextResponse.json({
      success: true,
      announcements
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch announcements' }, { status: 500 });
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
    if (!valid || !payload || !isLeadership(payload.role)) {
      return NextResponse.json({ error: 'Permission Denied. Only Leadership can broadcast mission announcements.' }, { status: 403 });
    }

    const body = await req.json();
    const { title, content, category } = body;

    if (!title || !content) {
      return NextResponse.json({ error: 'Title and Content are required.' }, { status: 400 });
    }

    const created = await db.createAnnouncement({
      title,
      content,
      category: category || 'MISSION',
      author_sparc_id: payload.sparc_id
    });

    return NextResponse.json({
      success: true,
      message: 'Announcement broadcasted successfully.',
      announcement: created
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Broadcast failed' }, { status: 500 });
  }
}
