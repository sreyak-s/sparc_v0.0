import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { generateAttendanceCSV, generateMonthlySummaryCSV } from '@/lib/time-utils';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get('date') || undefined;
    const status = searchParams.get('status') || undefined;
    const batch = searchParams.get('batch') || undefined;
    const month = searchParams.get('month') || undefined; // YYYY-MM
    const type = searchParams.get('type') || 'summary'; // 'summary' (all members + percentages) | 'detailed' (log entries)

    const now = new Date();
    const activeMonth = month || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const timestamp = new Date().toISOString().split('T')[0];

    if (type === 'summary') {
      const [members, records] = await Promise.all([
        db.getMembers(),
        db.getAttendance({ month: activeMonth, batch })
      ]);
      const csvContent = generateMonthlySummaryCSV(members, records, activeMonth);
      const filename = `SPARC_Monthly_Attendance_Summary_${activeMonth}_${timestamp}.csv`;

      return new NextResponse(csvContent, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="${filename}"`,
          'Cache-Control': 'no-cache, no-store, must-revalidate'
        }
      });
    }

    const records = await db.getAttendance({ date, status, batch, month: month || activeMonth });
    const csvContent = generateAttendanceCSV(records);
    const filename = `SPARC_Detailed_Attendance_Logs_${month || date || activeMonth}_${timestamp}.csv`;

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Export failed' }, { status: 500 });
  }
}
