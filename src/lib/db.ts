import { 
  Member, 
  AttendanceRecord, 
  ClubSettings, 
  AcademicYear, 
  Announcement, 
  AttendanceStatus,
  Role 
} from '@/types';
import { getSupabaseAdmin, isSupabaseConfigured } from './supabase';
import { 
  INITIAL_MEMBERS, 
  INITIAL_SETTINGS, 
  INITIAL_ACADEMIC_YEARS, 
  INITIAL_ANNOUNCEMENTS, 
  generateInitialAttendance 
} from './mock-data';

// Persistent in-memory cache for fast, seamless dev/local fallback
interface LocalStore {
  members: Member[];
  attendance: AttendanceRecord[];
  settings: ClubSettings;
  academicYears: AcademicYear[];
  announcements: Announcement[];
}

const globalForStore = global as unknown as { localDbStore?: LocalStore };

function getLocalStore(): LocalStore {
  if (!globalForStore.localDbStore) {
    globalForStore.localDbStore = {
      members: JSON.parse(JSON.stringify(INITIAL_MEMBERS)),
      attendance: generateInitialAttendance(),
      settings: JSON.parse(JSON.stringify(INITIAL_SETTINGS)),
      academicYears: JSON.parse(JSON.stringify(INITIAL_ACADEMIC_YEARS)),
      announcements: JSON.parse(JSON.stringify(INITIAL_ANNOUNCEMENTS)),
    };
  }
  return globalForStore.localDbStore;
}

export const db = {
  // ==========================================
  // MEMBERS
  // ==========================================
  async getMembers(academicYear?: string): Promise<Member[]> {
    if (isSupabaseConfigured) {
      const supabase = getSupabaseAdmin();
      if (supabase) {
        let query = supabase.from('members').select('*').order('sparc_id', { ascending: true });
        if (academicYear) {
          query = query.eq('academic_year', academicYear);
        }
        const { data, error } = await query;
        if (!error && data) return data as Member[];
      }
    }

    const store = getLocalStore();
    let list = [...store.members];
    if (academicYear) {
      list = list.filter(m => m.academic_year === academicYear);
    }
    // Custom sort: SPARC-FDR first, then numeric sequence SPARC-001, SPARC-002, etc.
    return list.sort((a, b) => {
      if (a.sparc_id === 'SPARC-FDR') return -1;
      if (b.sparc_id === 'SPARC-FDR') return 1;
      return a.sparc_id.localeCompare(b.sparc_id, undefined, { numeric: true, sensitivity: 'base' });
    });
  },

  async getMemberBySparcId(sparcId: string): Promise<Member | null> {
    const cleanId = sparcId.trim().toUpperCase();
    if (isSupabaseConfigured) {
      const supabase = getSupabaseAdmin();
      if (supabase) {
        const { data, error } = await supabase
          .from('members')
          .select('*')
          .ilike('sparc_id', cleanId)
          .single();
        if (!error && data) return data as Member;
      }
    }

    const store = getLocalStore();
    const found = store.members.find(m => m.sparc_id.toUpperCase() === cleanId);
    return found ? { ...found } : null;
  },

  async getMemberById(id: string): Promise<Member | null> {
    if (isSupabaseConfigured) {
      const supabase = getSupabaseAdmin();
      if (supabase) {
        const { data, error } = await supabase
          .from('members')
          .select('*')
          .eq('id', id)
          .single();
        if (!error && data) return data as Member;
      }
    }

    const store = getLocalStore();
    const found = store.members.find(m => m.id === id);
    return found ? { ...found } : null;
  },

  async getNextSequentialSparcId(role?: Role): Promise<string> {
    const allMembers = await this.getMembers();
    
    if (role === 'CAPTAIN' && !allMembers.some(m => m.sparc_id === 'SPARC-001')) return 'SPARC-001';
    if (role === 'VICE_CAPTAIN' && !allMembers.some(m => m.sparc_id === 'SPARC-002')) return 'SPARC-002';
    if (role === 'SECRETARY' && !allMembers.some(m => m.sparc_id === 'SPARC-003')) return 'SPARC-003';

    const numericIds = allMembers
      .map(m => m.sparc_id)
      .filter(id => id && id.startsWith('SPARC-') && !id.includes('FDR'))
      .map(id => parseInt(id.replace('SPARC-', ''), 10))
      .filter(num => !isNaN(num) && num > 0);

    const maxNum = numericIds.length > 0 ? Math.max(...numericIds) : 0;
    const nextNum = Math.max(maxNum + 1, 4);
    return `SPARC-${String(nextNum).padStart(3, '0')}`;
  },

  async createMember(memberData: Partial<Member>): Promise<Member> {
    const store = getLocalStore();
    const currentYear = store.settings.current_year || '2026-27';

    // Auto-compute next linear SPARC-XXX if not provided
    let sparcId = memberData.sparc_id?.trim().toUpperCase();
    if (!sparcId) {
      sparcId = await this.getNextSequentialSparcId(memberData.role);
    }

    // Generate valid UUID format for DB compatibility
    const memberId = memberData.id || 
      (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `mem-${Date.now()}`);

    const newMember: Member = {
      id: memberId,
      sparc_id: sparcId,
      name: memberData.name || 'Unnamed Cadet',
      email: memberData.email || '',
      password_hash: memberData.password_hash || null,
      role: memberData.role || 'MEMBER',
      department: memberData.department || 'Aerospace Engineering',
      batch: memberData.batch || '2026-2030',
      academic_year: memberData.academic_year || currentYear,
      active: memberData.active ?? true,
      has_password: Boolean(memberData.password_hash),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    if (isSupabaseConfigured) {
      const supabase = getSupabaseAdmin();
      if (supabase) {
        const { data, error } = await supabase.from('members').insert({
          id: newMember.id,
          sparc_id: newMember.sparc_id,
          name: newMember.name,
          email: newMember.email,
          password_hash: newMember.password_hash,
          role: newMember.role,
          department: newMember.department,
          batch: newMember.batch,
          academic_year: newMember.academic_year,
          active: newMember.active
        }).select().single();
        if (!error && data) return data as Member;
      }
    }

    store.members.push(newMember);
    return newMember;
  },

  async updateMember(id: string, updates: Partial<Member>): Promise<Member | null> {
    if (isSupabaseConfigured) {
      const supabase = getSupabaseAdmin();
      if (supabase) {
        const { data, error } = await supabase
          .from('members')
          .update({ ...updates, updated_at: new Date().toISOString() })
          .eq('id', id)
          .select()
          .single();
        if (!error && data) return data as Member;
      }
    }

    const store = getLocalStore();
    const index = store.members.findIndex(m => m.id === id);
    if (index === -1) return null;

    store.members[index] = {
      ...store.members[index],
      ...updates,
      updated_at: new Date().toISOString()
    };
    return store.members[index];
  },

  async deleteMember(id: string): Promise<boolean> {
    if (isSupabaseConfigured) {
      const supabase = getSupabaseAdmin();
      if (supabase) {
        // Find member first to get both UUID and sparc_id
        const target = await this.getMemberById(id) || await this.getMemberBySparcId(id);
        const uuid = target?.id || id;
        const sparcId = target?.sparc_id || id;

        // Cleanup attendance records first to maintain relational integrity
        await supabase.from('attendance').delete().or(`member_id.eq.${uuid},sparc_id.eq.${sparcId}`);
        const { error } = await supabase.from('members').delete().eq('id', uuid);
        return !error;
      }
    }

    const store = getLocalStore();
    const initialLen = store.members.length;
    store.members = store.members.filter(m => m.id !== id && m.sparc_id !== id);
    // Also cleanup attendance for consistency
    store.attendance = store.attendance.filter(a => a.member_id !== id && a.sparc_id !== id);
    return store.members.length < initialLen;
  },

  async setPasswordForMember(sparcId: string, name: string, passwordHash: string): Promise<{ success: boolean; message: string; member?: Member }> {
    const cleanId = sparcId.trim().toUpperCase();
    const cleanName = name.trim().toLowerCase();

    const member = await this.getMemberBySparcId(cleanId);
    if (!member) {
      return { success: false, message: 'Invalid SPARC ID. No cadet record found.' };
    }

    // Name verification check (case-insensitive substring or exact match)
    if (!member.name.toLowerCase().includes(cleanName) && !cleanName.includes(member.name.toLowerCase())) {
      return { success: false, message: 'Name verification failed. The name provided does not match our flight registry.' };
    }

    if (member.password_hash) {
      return { success: false, message: 'Password is already established for this SPARC ID. Please proceed to login or contact Founder.' };
    }

    const updated = await this.updateMember(member.id, {
      password_hash: passwordHash,
      active: true
    });

    if (!updated) {
      return { success: false, message: 'Failed to activate credentials. Please try again.' };
    }

    return { success: true, message: 'Account activated successfully! Welcome aboard SPARC.', member: updated };
  },

  async resetPasswordForMember(sparcId: string, newPasswordHash: string | null = null): Promise<boolean> {
    const member = await this.getMemberBySparcId(sparcId);
    if (!member) return false;
    const res = await this.updateMember(member.id, { password_hash: newPasswordHash });
    return Boolean(res);
  },

  // ==========================================
  // ATTENDANCE
  // ==========================================
  async getAttendance(filters?: {
    date?: string;
    member_id?: string;
    sparc_id?: string;
    status?: string;
    batch?: string;
    month?: string; // YYYY-MM
  }): Promise<AttendanceRecord[]> {
    if (isSupabaseConfigured) {
      const supabase = getSupabaseAdmin();
      if (supabase) {
        let query = supabase.from('attendance').select('*, members(name, department, batch, role)').order('timestamp', { ascending: false });
        if (filters?.date) query = query.eq('date', filters.date);
        if (filters?.member_id) query = query.eq('member_id', filters.member_id);
        if (filters?.sparc_id) query = query.eq('sparc_id', filters.sparc_id);
        if (filters?.status && filters.status !== 'ALL') query = query.eq('status', filters.status);
        if (filters?.month) {
          const start = `${filters.month}-01`;
          const end = `${filters.month}-31`;
          query = query.gte('date', start).lte('date', end);
        }

        const { data, error } = await query;
        if (!error && data) {
          let records = data.map((r: any) => ({
            id: r.id,
            member_id: r.member_id,
            sparc_id: r.sparc_id,
            date: r.date,
            timestamp: r.timestamp,
            device_timestamp: r.device_timestamp,
            status: r.status,
            marked_by_sparc_id: r.marked_by_sparc_id,
            notes: r.notes,
            created_at: r.created_at,
            member_name: r.members?.name,
            department: r.members?.department,
            batch: r.members?.batch,
            role: r.members?.role,
          }));
          if (filters?.batch && filters.batch !== 'ALL') {
            records = records.filter((r: any) => r.batch === filters.batch);
          }
          return records;
        }
      }
    }

    const store = getLocalStore();
    let records = [...store.attendance];

    if (filters?.date) {
      records = records.filter(r => r.date === filters.date);
    }
    if (filters?.member_id) {
      records = records.filter(r => r.member_id === filters.member_id);
    }
    if (filters?.sparc_id) {
      records = records.filter(r => r.sparc_id.toUpperCase() === filters.sparc_id?.toUpperCase());
    }
    if (filters?.status && filters.status !== 'ALL') {
      records = records.filter(r => r.status === filters.status);
    }
    if (filters?.batch && filters.batch !== 'ALL') {
      records = records.filter(r => r.batch === filters.batch);
    }
    if (filters?.month) {
      records = records.filter(r => r.date.startsWith(filters.month!));
    }

    // Attach member details if missing
    const memberMap = new Map<string, Member>();
    store.members.forEach(m => memberMap.set(m.id, m));

    records = records.map(r => {
      const m = memberMap.get(r.member_id);
      return {
        ...r,
        member_name: r.member_name || m?.name || 'Cadet',
        department: r.department || m?.department || 'Aerospace',
        batch: r.batch || m?.batch || '2026',
        role: r.role || m?.role || 'MEMBER',
      };
    });

    return records.sort((a, b) => new Date(b.date + 'T' + (b.timestamp.split('T')[1] || '00:00:00')).getTime() - new Date(a.date + 'T' + (a.timestamp.split('T')[1] || '00:00:00')).getTime());
  },

  async markAttendance(data: {
    member_id: string;
    sparc_id: string;
    date: string;
    status: AttendanceStatus;
    device_timestamp: string;
    marked_by_sparc_id: string;
    notes?: string;
  }): Promise<{ success: boolean; message: string; record?: AttendanceRecord }> {
    const member = await this.getMemberById(data.member_id) || await this.getMemberBySparcId(data.sparc_id);
    if (!member) {
      return { success: false, message: 'Member not found in flight registry' };
    }

    const nowIso = new Date().toISOString();

    if (isSupabaseConfigured) {
      const supabase = getSupabaseAdmin();
      if (supabase) {
        // Upsert with strictly the columns in Supabase attendance table
        const dbPayload: any = {
          member_id: member.id,
          sparc_id: member.sparc_id,
          date: data.date,
          timestamp: nowIso,
          device_timestamp: data.device_timestamp || nowIso,
          status: data.status,
          marked_by_sparc_id: data.marked_by_sparc_id,
          notes: data.notes || null
        };

        const { data: upserted, error } = await supabase
          .from('attendance')
          .upsert(dbPayload, { onConflict: 'member_id,date' })
          .select('*, members(name, department, batch, role)')
          .single();

        if (error) {
          console.error('Attendance upsert error:', error);
          return { success: false, message: error.message };
        }

        const formattedRecord: AttendanceRecord = {
          id: upserted.id,
          member_id: upserted.member_id,
          sparc_id: upserted.sparc_id,
          member_name: upserted.members?.name || member.name,
          department: upserted.members?.department || member.department,
          batch: upserted.members?.batch || member.batch,
          role: upserted.members?.role || member.role,
          date: upserted.date,
          timestamp: upserted.timestamp,
          device_timestamp: upserted.device_timestamp,
          status: upserted.status,
          marked_by_sparc_id: upserted.marked_by_sparc_id,
          notes: upserted.notes,
          created_at: upserted.created_at
        };

        return { success: true, message: `Attendance marked as ${data.status}`, record: formattedRecord };
      }
    }

    const store = getLocalStore();
    // Check if record already exists for this member on this date
    const existingIndex = store.attendance.findIndex(
      a => (a.member_id === member.id || a.sparc_id === member.sparc_id) && a.date === data.date
    );

    if (existingIndex >= 0) {
      store.attendance[existingIndex] = {
        ...store.attendance[existingIndex],
        status: data.status,
        timestamp: nowIso,
        device_timestamp: data.device_timestamp || nowIso,
        marked_by_sparc_id: data.marked_by_sparc_id,
        notes: data.notes
      };
      return { success: true, message: `Attendance updated to ${data.status}`, record: store.attendance[existingIndex] };
    }

    const newRecord: AttendanceRecord = {
      id: `att-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      member_id: member.id,
      sparc_id: member.sparc_id,
      member_name: member.name,
      department: member.department,
      batch: member.batch,
      role: member.role,
      date: data.date,
      timestamp: nowIso,
      device_timestamp: data.device_timestamp || nowIso,
      status: data.status,
      marked_by_sparc_id: data.marked_by_sparc_id,
      notes: data.notes
    };

    store.attendance.unshift(newRecord);
    return { success: true, message: `Attendance recorded as ${data.status}`, record: newRecord };
  },

  async bulkMarkAbsent(date: string, marked_by_sparc_id: string): Promise<{ count: number }> {
    const store = getLocalStore();
    const members = await this.getMembers();
    const existingDateRecords = await this.getAttendance({ date });
    const markedMemberIds = new Set(existingDateRecords.map(r => r.member_id));

    const unmarkedMembers = members.filter(m => !markedMemberIds.has(m.id) && m.role !== 'FOUNDER');
    let count = 0;

    for (const m of unmarkedMembers) {
      await this.markAttendance({
        member_id: m.id,
        sparc_id: m.sparc_id,
        date,
        status: 'ABSENT',
        device_timestamp: new Date().toISOString(),
        marked_by_sparc_id,
        notes: 'Auto-marked absent after meeting conclusion'
      });
      count++;
    }

    return { count };
  },

  // ==========================================
  // SETTINGS & ACADEMIC YEARS
  // ==========================================
  async getSettings(): Promise<ClubSettings> {
    if (isSupabaseConfigured) {
      const supabase = getSupabaseAdmin();
      if (supabase) {
        const { data, error } = await supabase.from('settings').select('*').limit(1).single();
        if (!error && data) return data as ClubSettings;
      }
    }

    const store = getLocalStore();
    return { ...store.settings };
  },

  async updateSettings(updates: Partial<ClubSettings>): Promise<ClubSettings> {
    if (isSupabaseConfigured) {
      const supabase = getSupabaseAdmin();
      if (supabase) {
        const current = await this.getSettings();
        const { data, error } = await supabase
          .from('settings')
          .update({ ...updates, updated_at: new Date().toISOString() })
          .eq('id', current.id)
          .select()
          .single();
        if (!error && data) return data as ClubSettings;
      }
    }

    const store = getLocalStore();
    store.settings = {
      ...store.settings,
      ...updates,
      updated_at: new Date().toISOString()
    };
    return { ...store.settings };
  },

  async getAcademicYears(): Promise<AcademicYear[]> {
    if (isSupabaseConfigured) {
      const supabase = getSupabaseAdmin();
      if (supabase) {
        const { data, error } = await supabase.from('academic_years').select('*').order('year_name', { ascending: false });
        if (!error && data) return data as AcademicYear[];
      }
    }

    const store = getLocalStore();
    return [...store.academicYears];
  },

  async rolloverAcademicYear(params: {
    newYear: string;
    captainMemberId: string;
    viceCaptainMemberId: string;
    secretaryMemberId: string;
  }): Promise<{ success: boolean; message: string }> {
    const store = getLocalStore();

    // 1. Set current year in settings
    await this.updateSettings({ current_year: params.newYear });

    // 2. Add or activate academic year
    const existingYear = store.academicYears.find(y => y.year_name === params.newYear);
    if (!existingYear) {
      store.academicYears.push({
        id: `y-${params.newYear.replace(/[^a-zA-Z0-9]/g, '-')}`,
        year_name: params.newYear,
        is_current: true
      });
    }
    store.academicYears.forEach(y => {
      y.is_current = (y.year_name === params.newYear);
    });

    // 3. Reassign roles & SPARC IDs:
    // Captain -> SPARC-001
    // Vice Captain -> SPARC-002
    // Secretary -> SPARC-003
    // All other members remain with SPARC-004+
    const members = await this.getMembers();

    for (const m of members) {
      if (m.role === 'FOUNDER' || m.sparc_id === 'SPARC-FDR') {
        // Founder ID never changes
        continue;
      }

      if (m.id === params.captainMemberId) {
        await this.updateMember(m.id, {
          role: 'CAPTAIN',
          sparc_id: 'SPARC-001',
          academic_year: params.newYear
        });
      } else if (m.id === params.viceCaptainMemberId) {
        await this.updateMember(m.id, {
          role: 'VICE_CAPTAIN',
          sparc_id: 'SPARC-002',
          academic_year: params.newYear
        });
      } else if (m.id === params.secretaryMemberId) {
        await this.updateMember(m.id, {
          role: 'SECRETARY',
          sparc_id: 'SPARC-003',
          academic_year: params.newYear
        });
      } else {
        // Normal member
        const currentRole = m.role;
        const newRole: Role = (currentRole === 'CAPTAIN' || currentRole === 'VICE_CAPTAIN' || currentRole === 'SECRETARY')
          ? 'MEMBER'
          : m.role;
        
        await this.updateMember(m.id, {
          role: newRole,
          academic_year: params.newYear
        });
      }
    }

    return {
      success: true,
      message: `Academic year successfully transitioned to ${params.newYear} with updated leadership assignments!`
    };
  },

  // ==========================================
  // ANNOUNCEMENTS
  // ==========================================
  async getAnnouncements(): Promise<Announcement[]> {
    if (isSupabaseConfigured) {
      const supabase = getSupabaseAdmin();
      if (supabase) {
        const { data, error } = await supabase.from('announcements').select('*').order('created_at', { ascending: false });
        if (!error && data) return data as Announcement[];
      }
    }

    const store = getLocalStore();
    return [...store.announcements];
  },

  async createAnnouncement(data: Partial<Announcement>): Promise<Announcement> {
    const newAnn: Announcement = {
      id: `ann-${Date.now()}`,
      title: data.title || 'Aerospace Notice',
      content: data.content || '',
      category: data.category || 'MISSION',
      author_sparc_id: data.author_sparc_id || 'SPARC-FDR',
      created_at: new Date().toISOString()
    };

    if (isSupabaseConfigured) {
      const supabase = getSupabaseAdmin();
      if (supabase) {
        const { data: res, error } = await supabase.from('announcements').insert(newAnn).select().single();
        if (!error && res) return res as Announcement;
      }
    }

    const store = getLocalStore();
    store.announcements.unshift(newAnn);
    return newAnn;
  }
};
