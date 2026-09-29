import { Member, AttendanceRecord, ClubSettings, AcademicYear, Announcement } from '@/types';
import bcrypt from 'bcryptjs';

// Pre-hashed password for "Sparc@2026"
export const DEFAULT_PASSWORD_HASH = bcrypt.hashSync('Sparc@2026', 10);

export const INITIAL_SETTINGS: ClubSettings = {
  id: 'a0000000-0000-0000-0000-000000000001',
  attendance_start: '17:00:00',
  late_start: '17:15:00',
  attendance_end: '17:30:00',
  current_year: '2026-27',
  emergency_window_active: false,
  club_name: 'SPARC Aerospace Club',
  motto: 'Innovating Beyond the Atmosphere',
  updated_at: new Date().toISOString()
};

export const INITIAL_ACADEMIC_YEARS: AcademicYear[] = [
  { id: 'y-2024-25', year_name: '2024-25', is_current: false },
  { id: 'y-2025-26', year_name: '2025-26', is_current: false },
  { id: 'y-2026-27', year_name: '2026-27', is_current: true },
  { id: 'y-2027-28', year_name: '2027-28', is_current: false }
];

export const INITIAL_MEMBERS: Member[] = [
  {
    id: 'b0000000-0000-0000-0000-000000000001',
    sparc_id: 'SPARC-FDR',
    name: 'Dr. Vikram Sarabhai',
    email: 'founder@sparc-aero.org',
    password_hash: DEFAULT_PASSWORD_HASH,
    role: 'FOUNDER',
    department: 'Aerospace Engineering',
    batch: 'Faculty / Founder',
    academic_year: '2026-27',
    active: true,
    has_password: true,
    created_at: '2026-08-01T00:00:00Z'
  },
  {
    id: 'b0000000-0000-0000-0000-000000000002',
    sparc_id: 'SPARC-001',
    name: 'Nihita Rao',
    email: 'nihita.captain@sparc-aero.org',
    password_hash: DEFAULT_PASSWORD_HASH,
    role: 'CAPTAIN',
    department: 'Aeronautical Engineering',
    batch: '2023-2027',
    academic_year: '2026-27',
    active: true,
    has_password: true,
    created_at: '2026-08-01T00:00:00Z'
  },
  {
    id: 'b0000000-0000-0000-0000-000000000003',
    sparc_id: 'SPARC-002',
    name: 'Aditya Verma',
    email: 'aditya.vice@sparc-aero.org',
    password_hash: DEFAULT_PASSWORD_HASH,
    role: 'VICE_CAPTAIN',
    department: 'Mechanical Engineering',
    batch: '2023-2027',
    academic_year: '2026-27',
    active: true,
    has_password: true,
    created_at: '2026-08-01T00:00:00Z'
  },
  {
    id: 'b0000000-0000-0000-0000-000000000004',
    sparc_id: 'SPARC-003',
    name: 'Ananya Sharma',
    email: 'ananya.sec@sparc-aero.org',
    password_hash: DEFAULT_PASSWORD_HASH,
    role: 'SECRETARY',
    department: 'Computer Science & Systems',
    batch: '2024-2028',
    academic_year: '2026-27',
    active: true,
    has_password: true,
    created_at: '2026-08-01T00:00:00Z'
  },
  {
    id: 'b0000000-0000-0000-0000-000000000005',
    sparc_id: 'SPARC-004',
    name: 'Rohan Nair',
    email: 'rohan.nair@sparc-aero.org',
    password_hash: DEFAULT_PASSWORD_HASH,
    role: 'MEMBER',
    department: 'Electrical & Electronics',
    batch: '2024-2028',
    academic_year: '2026-27',
    active: true,
    has_password: true,
    created_at: '2026-08-10T00:00:00Z'
  },
  {
    id: 'b0000000-0000-0000-0000-000000000006',
    sparc_id: 'SPARC-005',
    name: 'Pooja Iyer',
    email: 'pooja.propulsion@sparc-aero.org',
    password_hash: null, // Unactivated account for first-time password creation!
    role: 'MEMBER',
    department: 'Aerospace Engineering',
    batch: '2025-2029',
    academic_year: '2026-27',
    active: true,
    has_password: false,
    created_at: '2026-08-15T00:00:00Z'
  },
  {
    id: 'b0000000-0000-0000-0000-000000000007',
    sparc_id: 'SPARC-006',
    name: 'Dev Patel',
    email: 'dev.avionics@sparc-aero.org',
    password_hash: DEFAULT_PASSWORD_HASH,
    role: 'MEMBER',
    department: 'Robotics & Automation',
    batch: '2024-2028',
    academic_year: '2026-27',
    active: true,
    has_password: true,
    created_at: '2026-08-15T00:00:00Z'
  },
  {
    id: 'b0000000-0000-0000-0000-000000000008',
    sparc_id: 'SPARC-007',
    name: 'Kavya Menon',
    email: 'kavya.aero@sparc-aero.org',
    password_hash: DEFAULT_PASSWORD_HASH,
    role: 'MEMBER',
    department: 'Mechanical Engineering',
    batch: '2025-2029',
    academic_year: '2026-27',
    active: true,
    has_password: true,
    created_at: '2026-08-20T00:00:00Z'
  },
  {
    id: 'b0000000-0000-0000-0000-000000000009',
    sparc_id: 'SPARC-008',
    name: 'Tanmay Joshi',
    email: 'tanmay.payload@sparc-aero.org',
    password_hash: DEFAULT_PASSWORD_HASH,
    role: 'MEMBER',
    department: 'Physics & Astronomy',
    batch: '2025-2029',
    academic_year: '2026-27',
    active: true,
    has_password: true,
    created_at: '2026-08-20T00:00:00Z'
  }
];

// Generate past 20 meeting dates in September 2026
export function generateInitialAttendance(): AttendanceRecord[] {
  const records: AttendanceRecord[] = [];
  
  // Sample dates in Sep 2026: 1, 3, 5, 8, 10, 12, 15, 17, 19, 22, 24, 26, 29
  const meetingDates = [
    { date: '2026-09-01', holiday: false },
    { date: '2026-09-03', holiday: false },
    { date: '2026-09-05', holiday: false },
    { date: '2026-09-08', holiday: false },
    { date: '2026-09-10', holiday: false },
    { date: '2026-09-12', holiday: true, note: 'National Space Day Special Holiday' },
    { date: '2026-09-15', holiday: false },
    { date: '2026-09-17', holiday: false },
    { date: '2026-09-19', holiday: false },
    { date: '2026-09-22', holiday: false },
    { date: '2026-09-24', holiday: false },
    { date: '2026-09-26', holiday: false },
    { date: '2026-09-29', holiday: false } // Today
  ];

  let idCounter = 100;

  meetingDates.forEach(m => {
    INITIAL_MEMBERS.forEach((member, memberIdx) => {
      // Create interesting variations for attendance percentages:
      // Nihita (SPARC-001): 100% Present
      // Aditya (SPARC-002): 92% Present
      // Ananya (SPARC-003): 95% Present
      // Rohan (SPARC-004): 88% Present
      // Pooja (SPARC-005): 62% (Low Attendance warning demonstration!)
      // Dev (SPARC-006): 85% Present
      // Kavya (SPARC-007): 70% (Low Attendance warning demonstration!)
      // Tanmay (SPARC-008): 90% Present

      if (m.holiday) {
        records.push({
          id: `att-${idCounter++}`,
          member_id: member.id,
          sparc_id: member.sparc_id,
          member_name: member.name,
          department: member.department,
          batch: member.batch,
          role: member.role,
          date: m.date,
          timestamp: `${m.date}T17:00:00Z`,
          device_timestamp: `${m.date}T17:00:00Z`,
          status: 'HOLIDAY',
          marked_by_sparc_id: 'SPARC-FDR',
          notes: m.note
        });
        return;
      }

      let status: 'PRESENT' | 'LATE' | 'ABSENT' = 'PRESENT';
      let checkInTime = '17:08:15';

      if (member.sparc_id === 'SPARC-005') {
        // Pooja - low attendance
        const rand = (memberIdx * 7 + idCounter) % 10;
        if (rand < 4) {
          status = 'ABSENT';
        } else if (rand === 4 || rand === 5) {
          status = 'LATE';
          checkInTime = '17:22:40';
        }
      } else if (member.sparc_id === 'SPARC-007') {
        // Kavya - low attendance (<75%)
        const rand = (memberIdx * 3 + idCounter) % 10;
        if (rand < 4) {
          status = 'ABSENT';
        } else if (rand === 4) {
          status = 'LATE';
          checkInTime = '17:18:20';
        }
      } else if (member.sparc_id === 'SPARC-004') {
        const rand = (idCounter) % 10;
        if (rand === 1) status = 'ABSENT';
        if (rand === 2) {
          status = 'LATE';
          checkInTime = '17:25:10';
        }
      } else if (member.sparc_id === 'SPARC-002') {
        if (m.date === '2026-09-17') {
          status = 'LATE';
          checkInTime = '17:19:04';
        }
      }

      records.push({
        id: `att-${idCounter++}`,
        member_id: member.id,
        sparc_id: member.sparc_id,
        member_name: member.name,
        department: member.department,
        batch: member.batch,
        role: member.role,
        date: m.date,
        timestamp: `${m.date}T${checkInTime}Z`,
        device_timestamp: `${m.date}T${checkInTime}Z`,
        status,
        marked_by_sparc_id: 'SPARC-001',
        notes: status === 'LATE' ? 'Checked in during late window' : undefined
      });
    });
  });

  return records;
}

export const INITIAL_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'ann-1',
    title: '🚀 Project ASTRA-1 Sounding Rocket Static Fire Test',
    content: 'Static engine test scheduled at the propulsion bay this Friday at 16:30 hrs. All propulsion and avionics cadets must report in safety gear with flight telemetry units.',
    category: 'MISSION',
    author_sparc_id: 'SPARC-001',
    created_at: '2026-09-28T10:00:00Z'
  },
  {
    id: 'ann-2',
    title: '🛰️ CanSat Telemetry Protocol Workshop',
    content: 'Join the telemetry workshop covering LoRa 433MHz frequency handshakes, barometer calibration, and live ground station plotting with Dr. Sarabhai.',
    category: 'WORKSHOP',
    author_sparc_id: 'SPARC-003',
    created_at: '2026-09-27T14:30:00Z'
  },
  {
    id: 'ann-3',
    title: '⚠️ 75% Minimum Attendance Flight Requirement',
    content: 'Cadets are reminded that a minimum 75% attendance record is mandatory for flight certification, workshop travel allowance, and sounding rocket payload clearances.',
    category: 'URGENT',
    author_sparc_id: 'SPARC-FDR',
    created_at: '2026-09-26T09:15:00Z'
  }
];
