import { AttendanceStatus, ClubSettings, AttendanceStats, AttendanceRecord, CalendarDayInfo } from '@/types';

/**
 * Formats a Date object to "HH:mm:ss" in 24-hour format
 */
export function formatToTime24(date: Date = new Date()): string {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
}

/**
 * Formats a Date object to "YYYY-MM-DD"
 */
export function formatToDateStr(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Formats a Date object or ISO string to readable telemetry format
 * Example: "29 SEP 2026 • 17:08:24 IST"
 */
export function formatTelemetryDateTime(dateInput: Date | string): string {
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (isNaN(date.getTime())) return 'INVALID TIME';
  
  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  const d = String(date.getDate()).padStart(2, '0');
  const m = months[date.getMonth()];
  const y = date.getFullYear();
  const time = date.toLocaleTimeString('en-US', { hour12: false });
  
  return `${d} ${m} ${y} • ${time} HRS`;
}

/**
 * Evaluates current time against club settings to determine status
 * Rule per updated requirement:
 * - Up to 5:15 PM (17:15:00) -> PRESENT
 * - 5:15 PM - 5:30 PM (17:15:01 - 17:30:00) -> LATE
 * - After 5:30 PM (17:30:00+) -> ABSENT
 */
export function evaluateAttendanceStatus(
  deviceTime: Date = new Date(),
  settings?: Partial<ClubSettings>
): AttendanceStatus {
  // If emergency window is active, mark PRESENT
  if (settings?.emergency_window_active) {
    return 'PRESENT';
  }

  const lateStart = settings?.late_start || '17:15:00';
  const attendanceEnd = settings?.attendance_end || '17:30:00';

  const [lateH, lateM] = lateStart.split(':').map(Number);
  const [endH, endM] = attendanceEnd.split(':').map(Number);

  const currentMinutes = deviceTime.getHours() * 60 + deviceTime.getMinutes();
  const lateMinutes = lateH * 60 + lateM;
  const endMinutes = endH * 60 + endM;

  if (currentMinutes <= lateMinutes) {
    return 'PRESENT';
  } else if (currentMinutes <= endMinutes) {
    return 'LATE';
  } else {
    return 'ABSENT';
  }
}

/**
 * Calculates attendance statistics for a member including <75% Low Attendance warning flag
 */
export function calculateAttendanceStats(records: AttendanceRecord[]): AttendanceStats {
  const nonHolidayRecords = records.filter(r => r.status !== 'HOLIDAY');
  const totalMeetings = nonHolidayRecords.length;
  
  const presentCount = records.filter(r => r.status === 'PRESENT').length;
  const lateCount = records.filter(r => r.status === 'LATE').length;
  const absentCount = records.filter(r => r.status === 'ABSENT').length;
  const holidayCount = records.filter(r => r.status === 'HOLIDAY').length;

  // Each PRESENT counts as 100%, LATE counts as 75% or 1 full attendance (standard: counted towards presence)
  // Let's calculate effective attendance percentage: (Present + Late) / totalMeetings * 100
  let percentage = 0;
  if (totalMeetings > 0) {
    percentage = Math.round(((presentCount + lateCount) / totalMeetings) * 100);
  }

  const isLowAttendance = totalMeetings > 0 && percentage < 75;

  return {
    totalMeetings,
    presentCount,
    lateCount,
    absentCount,
    holidayCount,
    percentage,
    isLowAttendance
  };
}

/**
 * Generates monthly calendar matrix with attendance status indicators
 * Green: PRESENT
 * Amber: LATE
 * Red: ABSENT
 * White / Light: HOLIDAY
 */
export function generateMonthlyCalendar(
  year: number,
  month: number, // 0-indexed (0 = Jan, 11 = Dec)
  records: AttendanceRecord[]
): CalendarDayInfo[] {
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const todayStr = formatToDateStr(new Date());

  const daysInMonth = lastDayOfMonth.getDate();
  const startingDayOfWeek = firstDayOfMonth.getDay(); // 0 = Sunday, 1 = Monday, etc.

  // Map records by date for fast lookup
  const recordMap = new Map<string, AttendanceRecord>();
  records.forEach(rec => {
    recordMap.set(rec.date, rec);
  });

  const calendarDays: CalendarDayInfo[] = [];

  // Previous month trailing days
  const prevMonthLastDay = new Date(year, month, 0).getDate();
  for (let i = startingDayOfWeek - 1; i >= 0; i--) {
    const d = prevMonthLastDay - i;
    const dateObj = new Date(year, month - 1, d);
    const dateStr = formatToDateStr(dateObj);
    const record = recordMap.get(dateStr);
    
    calendarDays.push({
      dateStr,
      dayNumber: d,
      isCurrentMonth: false,
      isToday: dateStr === todayStr,
      status: record ? record.status : 'NO_MEETING',
      notes: record?.notes,
      time: record?.timestamp
    });
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    const dateObj = new Date(year, month, d);
    const dateStr = formatToDateStr(dateObj);
    const record = recordMap.get(dateStr);
    const isPastOrToday = dateStr <= todayStr;

    calendarDays.push({
      dateStr,
      dayNumber: d,
      isCurrentMonth: true,
      isToday: dateStr === todayStr,
      status: record ? record.status : (isPastOrToday ? 'NO_MEETING' : 'UPCOMING'),
      notes: record?.notes,
      time: record?.timestamp
    });
  }

  // Next month leading days to complete grid (up to multiple of 7)
  const remainingCells = 42 - calendarDays.length; // Standard 6-row calendar
  for (let d = 1; d <= remainingCells; d++) {
    const dateObj = new Date(year, month + 1, d);
    const dateStr = formatToDateStr(dateObj);
    const record = recordMap.get(dateStr);

    calendarDays.push({
      dateStr,
      dayNumber: d,
      isCurrentMonth: false,
      isToday: dateStr === todayStr,
      status: record ? record.status : 'UPCOMING',
      notes: record?.notes,
      time: record?.timestamp
    });
  }

  return calendarDays;
}

export const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

/**
 * Calculates monthly attendance statistics for a specific month & year (resets each month)
 */
export function calculateMonthlyAttendanceStats(
  records: AttendanceRecord[],
  year: number = new Date().getFullYear(),
  month: number = new Date().getMonth() // 0-indexed (0 = Jan, 8 = Sep)
): AttendanceStats & { monthKey: string; monthName: string; year: number } {
  const monthKey = `${year}-${String(month + 1).padStart(2, '0')}`;
  const monthRecords = records.filter(r => r.date && r.date.startsWith(monthKey));

  const nonHolidayRecords = monthRecords.filter(r => r.status !== 'HOLIDAY');
  const totalMeetings = nonHolidayRecords.length;
  
  const presentCount = monthRecords.filter(r => r.status === 'PRESENT').length;
  const lateCount = monthRecords.filter(r => r.status === 'LATE').length;
  const absentCount = monthRecords.filter(r => r.status === 'ABSENT').length;
  const holidayCount = monthRecords.filter(r => r.status === 'HOLIDAY').length;

  let percentage = 0;
  if (totalMeetings > 0) {
    percentage = Math.round(((presentCount + lateCount) / totalMeetings) * 100);
  } else {
    // Fresh month cycle with 0 meetings defaults to 100% standing
    percentage = 100;
  }

  const isLowAttendance = totalMeetings > 0 && percentage < 75;

  return {
    totalMeetings,
    presentCount,
    lateCount,
    absentCount,
    holidayCount,
    percentage,
    isLowAttendance,
    monthKey,
    monthName: MONTH_NAMES[month] || `Month ${month + 1}`,
    year
  };
}

/**
 * Extracts all unique available months (YYYY-MM) from attendance records + current month
 */
export function getAvailableAttendanceMonths(records: AttendanceRecord[]): { key: string; label: string; year: number; month: number }[] {
  const monthSet = new Set<string>();
  
  // Always include current month
  const now = new Date();
  const currentKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  monthSet.add(currentKey);

  records.forEach(r => {
    if (r.date && r.date.length >= 7) {
      monthSet.add(r.date.substring(0, 7));
    }
  });

  const sortedKeys = Array.from(monthSet).sort().reverse();

  return sortedKeys.map(key => {
    const [yStr, mStr] = key.split('-');
    const y = parseInt(yStr, 10);
    const m = parseInt(mStr, 10) - 1;
    const name = MONTH_NAMES[m] || `Month ${m + 1}`;
    return {
      key,
      label: `${name} ${y}`,
      year: y,
      month: m
    };
  });
}

/**
 * Formats an array of attendance records to downloadable CSV text
 */
export function generateAttendanceCSV(records: (AttendanceRecord & { member_name?: string, department?: string, batch?: string })[]): string {
  const headers = ['SPARC ID', 'Name', 'Department', 'Batch', 'Date', 'Status', 'Check-In Time', 'Device Timestamp', 'Marked By', 'Notes'];
  
  const rows = records.map(r => [
    `"${r.sparc_id || ''}"`,
    `"${(r.member_name || '').replace(/"/g, '""')}"`,
    `"${(r.department || '').replace(/"/g, '""')}"`,
    `"${(r.batch || '').replace(/"/g, '""')}"`,
    `"${r.date || ''}"`,
    `"${r.status || ''}"`,
    `"${r.timestamp ? new Date(r.timestamp).toLocaleTimeString() : ''}"`,
    `"${r.device_timestamp ? new Date(r.device_timestamp).toLocaleTimeString() : ''}"`,
    `"${r.marked_by_sparc_id || ''}"`,
    `"${(r.notes || '').replace(/"/g, '""')}"`
  ]);

  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
}

/**
 * Generates aggregated monthly report CSV for all cadets with their individual percentages
 */
export function generateMonthlySummaryCSV(
  members: { id: string; sparc_id: string; name: string; department: string; batch: string; role: string }[],
  records: AttendanceRecord[],
  monthKey: string
): string {
  const [yStr, mStr] = monthKey.split('-');
  const y = parseInt(yStr, 10);
  const m = parseInt(mStr, 10) - 1;
  const monthName = MONTH_NAMES[m] || monthKey;

  // Find all unique dates in this month that were held as club meetings (excluding club holidays)
  const monthRecords = records.filter(r => r.date && r.date.startsWith(monthKey));
  const clubMeetingDates = Array.from(new Set(monthRecords.filter(r => r.status !== 'HOLIDAY').map(r => r.date)));
  const totalClubSessions = clubMeetingDates.length;

  const headers = [
    'SPARC ID',
    'Cadet Name',
    'Department',
    'Batch',
    'Role',
    'Evaluation Month',
    'Total Club Sessions',
    'Present (Green)',
    'Late (Yellow)',
    'Absent (Red)',
    'Club Holiday (White)',
    'Monthly Attendance Percentage (%)',
    'Attendance Standing'
  ];

  const rows = members.map(mem => {
    const memRecords = monthRecords.filter(r => r.member_id === mem.id || r.sparc_id === mem.sparc_id);
    const presentCount = memRecords.filter(r => r.status === 'PRESENT').length;
    const lateCount = memRecords.filter(r => r.status === 'LATE').length;
    const recordedAbsents = memRecords.filter(r => r.status === 'ABSENT').length;
    const holidayCount = memRecords.filter(r => r.status === 'HOLIDAY').length;

    // Total required sessions for this month
    const totalSessions = totalClubSessions > 0 ? totalClubSessions : memRecords.filter(r => r.status !== 'HOLIDAY').length;
    const effectiveAbsents = totalClubSessions > 0 
      ? Math.max(recordedAbsents, totalClubSessions - (presentCount + lateCount))
      : recordedAbsents;

    let percentage = 100;
    if (totalSessions > 0) {
      percentage = Math.round(((presentCount + lateCount) / totalSessions) * 100);
    }

    const isLow = totalSessions > 0 && percentage < 75;
    const statusText = totalSessions === 0 
      ? 'NO SESSIONS HELD' 
      : isLow 
        ? 'WARNING (<75%)' 
        : 'CLEARED (>=75%)';

    return [
      `"${mem.sparc_id}"`,
      `"${mem.name.replace(/"/g, '""')}"`,
      `"${mem.department.replace(/"/g, '""')}"`,
      `"${mem.batch}"`,
      `"${mem.role}"`,
      `"${monthName} ${y}"`,
      totalSessions,
      presentCount,
      lateCount,
      effectiveAbsents,
      holidayCount,
      `"${percentage}%"`,
      `"${statusText}"`
    ];
  });

  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
}
