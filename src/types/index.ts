export type Role = 'FOUNDER' | 'CAPTAIN' | 'VICE_CAPTAIN' | 'SECRETARY' | 'MEMBER';

export type AttendanceStatus = 'PRESENT' | 'LATE' | 'ABSENT' | 'HOLIDAY';

export interface Member {
  id: string;
  sparc_id: string;
  name: string;
  email?: string;
  password_hash?: string | null;
  role: Role;
  department: string;
  batch: string;
  academic_year: string;
  active: boolean;
  has_password?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface AttendanceRecord {
  id: string;
  member_id: string;
  sparc_id: string;
  member_name?: string;
  department?: string;
  batch?: string;
  role?: Role;
  date: string; // YYYY-MM-DD
  timestamp: string; // ISO 8601
  device_timestamp: string; // ISO 8601
  status: AttendanceStatus;
  marked_by_sparc_id: string;
  notes?: string;
  created_at?: string;
}

export interface ClubSettings {
  id: string;
  attendance_start: string; // "17:00:00"
  late_start: string;       // "17:15:00"
  attendance_end: string;   // "17:30:00"
  current_year: string;     // "2026-27"
  emergency_window_active: boolean;
  club_name: string;
  motto: string;
  updated_at?: string;
}

export interface AcademicYear {
  id: string;
  year_name: string;
  is_current: boolean;
  created_at?: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  category: 'MISSION' | 'WORKSHOP' | 'GENERAL' | 'URGENT' | 'HOLIDAY';
  author_sparc_id: string;
  created_at: string;
}

export interface AttendanceStats {
  totalMeetings: number;
  presentCount: number;
  lateCount: number;
  absentCount: number;
  holidayCount: number;
  percentage: number;
  isLowAttendance: boolean; // < 75% threshold
}

export interface CalendarDayInfo {
  dateStr: string; // YYYY-MM-DD
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  status: AttendanceStatus | 'NO_MEETING' | 'UPCOMING';
  notes?: string;
  time?: string;
}

export interface AuthSession {
  user: Member;
  token: string;
  expiresAt: number;
}
