'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Member, Role, ClubSettings } from '@/types';
import AddMemberModal from '@/components/member/AddMemberModal';
import RolloverModal from '@/components/member/RolloverModal';
import CadetCalendarModal from '@/components/attendance/CadetCalendarModal';
import MonthlyExportModal from '@/components/attendance/MonthlyExportModal';
import { 
  Users, 
  UserPlus, 
  RefreshCw, 
  KeyRound, 
  Trash2, 
  Edit3, 
  ShieldCheck, 
  Search, 
  CheckCircle2, 
  Clock, 
  Orbit, 
  AlertTriangle, 
  Calendar,
  FileSpreadsheet
} from 'lucide-react';

export default function AdminMembersPage() {
  const { isFounder, isLeadership } = useAuth();
  const canManage = isLeadership || isFounder;

  const [members, setMembers] = useState<Member[]>([]);
  const [settings, setSettings] = useState<ClubSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isRolloverModalOpen, setIsRolloverModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [calendarCadet, setCalendarCadet] = useState<Member | null>(null);
  const [memberToDelete, setMemberToDelete] = useState<Member | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [nextSparcId, setNextSparcId] = useState<string>('SPARC-009');

  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const loadMembers = useCallback(async () => {
    try {
      setLoading(true);
      const [mRes, sRes] = await Promise.all([
        fetch('/api/members'),
        fetch('/api/settings')
      ]);

      if (mRes.ok) {
        const mData = await mRes.json();
        setMembers(mData.members || []);
        if (mData.next_sparc_id) {
          setNextSparcId(mData.next_sparc_id);
        }
      }
      if (sRes.ok) {
        const sData = await sRes.json();
        setSettings(sData.settings || null);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMembers();
  }, [loadMembers]);

  const handleResetPassword = async (sparcId: string) => {
    if (!confirm(`Reset password for ${sparcId}? The cadet will be able to set a new password via "Activate ID".`)) {
      return;
    }

    try {
      const res = await fetch('/api/members/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sparc_id: sparcId })
      });

      const data = await res.json();
      if (res.ok) {
        setActionMessage(data.message);
        loadMembers();
      } else {
        alert(data.error || 'Password reset failed');
      }
    } catch (err: any) {
      alert(err.message || 'Error occurred');
    }
  };

  const handleConfirmDelete = async () => {
    if (!memberToDelete) return;
    if (memberToDelete.sparc_id === 'SPARC-FDR' || memberToDelete.role === 'FOUNDER') {
      alert('Cannot delete the Founder account.');
      setMemberToDelete(null);
      return;
    }

    try {
      setIsDeleting(true);
      const res = await fetch(`/api/members/${memberToDelete.id}`, {
        method: 'DELETE'
      });

      const data = await res.json();
      if (res.ok) {
        setActionMessage(`Cadet ${memberToDelete.name} (${memberToDelete.sparc_id}) successfully removed from roster.`);
        setMemberToDelete(null);
        if (editingMember?.id === memberToDelete.id) {
          setEditingMember(null);
        }
        await loadMembers();
      } else {
        alert(data.error || 'Failed to remove member.');
      }
    } catch (err: any) {
      alert(err.message || 'Network error occurred while discharging member.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember) return;

    try {
      const res = await fetch(`/api/members/${editingMember.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingMember)
      });

      const data = await res.json();
      if (res.ok) {
        setActionMessage(`Cadet profile for ${editingMember.sparc_id} updated.`);
        setEditingMember(null);
        loadMembers();
      } else {
        alert(data.error || 'Update failed');
      }
    } catch (err: any) {
      alert(err.message || 'Error');
    }
  };

  const filteredMembers = members.filter(m => {
    const q = searchQuery.toLowerCase();
    return (
      m.name.toLowerCase().includes(q) ||
      m.sparc_id.toLowerCase().includes(q) ||
      m.department.toLowerCase().includes(q) ||
      m.batch.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-8">
      {/* Top Banner with Action Buttons */}
      <div className="p-6 rounded-3xl bg-space-900/80 border border-cyan-500/20 backdrop-blur-xl flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h3 className="text-xl font-mono font-bold text-white tracking-wider flex items-center gap-2">
            <Users className="w-5 h-5 text-cyan-400" />
            CADET FLIGHT ROSTER & SPARC IDS
          </h3>
          <p className="text-xs text-slate-400">
            Founder/Admin authority for cadet enrollment, role promotion, password reset, and annual rollover.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          {isFounder && (
            <button
              onClick={() => setIsRolloverModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-amber-950/60 hover:bg-amber-900/70 border border-amber-500/40 text-amber-300 text-xs font-mono font-bold flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(245,158,11,0.2)]"
            >
              <Orbit className="w-4 h-4 text-amber-400" />
              Academic Rollover Wizard
            </button>
          )}

          {canManage && (
            <>
              <button
                onClick={() => setIsExportModalOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-space-950 hover:bg-slate-800 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-bold flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(0,240,255,0.15)]"
              >
                <FileSpreadsheet className="w-4 h-4 text-cyan-400" />
                Monthly Attendance CSV
              </button>

              <button
                onClick={() => setIsAddModalOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-sky-400 text-space-950 font-mono font-bold text-xs flex items-center gap-2 shadow-[0_0_20px_rgba(0,240,255,0.4)] hover:from-cyan-300 hover:to-sky-300 transition-all"
              >
                <UserPlus className="w-4 h-4 text-space-950" />
                Enroll New Cadet
              </button>
            </>
          )}
        </div>
      </div>

      {actionMessage && (
        <div className="p-3.5 rounded-xl bg-cyan-950/60 border border-cyan-500/50 text-cyan-300 text-xs font-mono flex items-center justify-between animate-fadeIn">
          <span>{actionMessage}</span>
          <button onClick={() => setActionMessage(null)} className="text-xs text-slate-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input
          type="text"
          placeholder="Search by name, SPARC ID, department, batch..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-space-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono"
        />
      </div>

      {/* Cadets Roster Table */}
      <div className="rounded-3xl bg-space-900/80 border border-cyan-500/20 overflow-hidden backdrop-blur-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-space-950/90 text-slate-400 uppercase font-mono text-[10px] tracking-wider border-b border-cyan-500/20">
              <tr>
                <th className="px-5 py-3.5">SPARC ID</th>
                <th className="px-5 py-3.5">Cadet Name</th>
                <th className="px-5 py-3.5">Role</th>
                <th className="px-5 py-3.5">Department</th>
                <th className="px-5 py-3.5">Batch</th>
                <th className="px-5 py-3.5">Activation</th>
                <th className="px-5 py-3.5 text-right">Cadet Management</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredMembers.map((m) => (
                <tr key={m.id} className="hover:bg-slate-850/40 transition-colors">
                  {/* SPARC ID */}
                  <td className="px-5 py-3.5 font-mono font-extrabold text-cyan-300 text-sm">
                    {m.sparc_id}
                  </td>

                  {/* Name */}
                  <td className="px-5 py-3.5">
                    <div className="font-bold text-white text-sm">{m.name}</div>
                    <div className="text-[11px] text-slate-400">{m.email || 'No email specified'}</div>
                  </td>

                  {/* Role Badge */}
                  <td className="px-5 py-3.5">
                    <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${
                      m.role === 'FOUNDER' ? 'bg-yellow-950/60 border-yellow-500/50 text-yellow-300' :
                      m.role === 'CAPTAIN' ? 'bg-cyan-950/60 border-cyan-500/50 text-cyan-300' :
                      m.role === 'VICE_CAPTAIN' ? 'bg-sky-950/60 border-sky-500/50 text-sky-300' :
                      m.role === 'SECRETARY' ? 'bg-purple-950/60 border-purple-500/50 text-purple-300' :
                      'bg-slate-900 border-slate-700 text-slate-300'
                    }`}>
                      {m.role.replace('_', ' ')}
                    </span>
                  </td>

                  {/* Department */}
                  <td className="px-5 py-3.5 text-slate-300">
                    {m.department}
                  </td>

                  {/* Batch */}
                  <td className="px-5 py-3.5 font-mono text-slate-400">
                    {m.batch}
                  </td>

                  {/* Activation Status */}
                  <td className="px-5 py-3.5">
                    {m.has_password ? (
                      <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1 font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5" /> ACTIVE
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono text-amber-400 flex items-center gap-1 font-bold">
                        <Clock className="w-3.5 h-3.5" /> PENDING SETUP
                      </span>
                    )}
                  </td>

                  {/* Action Buttons */}
                  <td className="px-5 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {/* View Cadet 4-Color Attendance Calendar */}
                      <button
                        onClick={() => setCalendarCadet(m)}
                        className="p-1.5 rounded-lg bg-space-950 hover:bg-slate-800 text-cyan-300 border border-slate-700 hover:border-cyan-500/40 transition-colors"
                        title="View 4-Color Attendance Calendar"
                      >
                        <Calendar className="w-3.5 h-3.5" />
                      </button>

                      {canManage && (
                        <>
                          <button
                            onClick={() => handleResetPassword(m.sparc_id)}
                            className="p-1.5 rounded-lg bg-space-950 hover:bg-slate-800 text-amber-400 border border-slate-700 hover:border-amber-500/40 transition-colors"
                            title="Reset Password (allows cadet to re-activate)"
                          >
                            <KeyRound className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => setEditingMember(m)}
                            className="p-1.5 rounded-lg bg-space-950 hover:bg-slate-800 text-cyan-400 border border-slate-700 hover:border-cyan-500/40 transition-colors"
                            title="Edit Cadet Details"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          {m.sparc_id !== 'SPARC-FDR' && (
                            <button
                              onClick={() => setMemberToDelete(m)}
                              className="p-1.5 rounded-lg bg-space-950 hover:bg-red-950/60 text-red-400 border border-slate-700 hover:border-red-500/50 transition-colors"
                              title="Remove / Discharge Cadet"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Member Modal */}
      {editingMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-space-950/85 backdrop-blur-md animate-fadeIn">
          <div className="relative max-w-lg w-full p-6 sm:p-8 rounded-3xl bg-space-900 border border-cyan-500/30 space-y-6 shadow-[0_0_50px_rgba(0,0,0,0.8)]">
            <h3 className="text-xl font-mono font-bold text-white flex items-center gap-2">
              <Edit3 className="w-5 h-5 text-cyan-400" />
              EDIT CADET: {editingMember.sparc_id}
            </h3>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-cyan-400 uppercase mb-1.5">Full Name</label>
                <input
                  type="text"
                  required
                  value={editingMember.name}
                  onChange={(e) => setEditingMember({ ...editingMember, name: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl bg-space-950 border border-slate-700 text-white text-xs font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-cyan-400 uppercase mb-1.5">SPARC ID</label>
                  <input
                    type="text"
                    required
                    value={editingMember.sparc_id}
                    onChange={(e) => setEditingMember({ ...editingMember, sparc_id: e.target.value.toUpperCase() })}
                    className="w-full px-4 py-2 rounded-xl bg-space-950 border border-slate-700 text-cyan-300 font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-cyan-400 uppercase mb-1.5">Role</label>
                  <select
                    value={editingMember.role}
                    onChange={(e) => setEditingMember({ ...editingMember, role: e.target.value as Role })}
                    className="w-full px-4 py-2 rounded-xl bg-space-950 border border-slate-700 text-white text-xs font-mono"
                  >
                    <option value="FOUNDER">FOUNDER</option>
                    <option value="CAPTAIN">CAPTAIN</option>
                    <option value="VICE_CAPTAIN">VICE CAPTAIN</option>
                    <option value="SECRETARY">SECRETARY</option>
                    <option value="MEMBER">MEMBER</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-cyan-400 uppercase mb-1.5">Department</label>
                  <input
                    type="text"
                    required
                    value={editingMember.department}
                    onChange={(e) => setEditingMember({ ...editingMember, department: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl bg-space-950 border border-slate-700 text-white text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-cyan-400 uppercase mb-1.5">Batch</label>
                  <input
                    type="text"
                    required
                    value={editingMember.batch}
                    onChange={(e) => setEditingMember({ ...editingMember, batch: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl bg-space-950 border border-slate-700 text-white text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-cyan-400 uppercase mb-1.5">Email</label>
                <input
                  type="email"
                  value={editingMember.email || ''}
                  onChange={(e) => setEditingMember({ ...editingMember, email: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl bg-space-950 border border-slate-700 text-white text-xs font-mono"
                />
              </div>

              <div className="pt-4 flex items-center justify-between border-t border-slate-800">
                {editingMember.sparc_id !== 'SPARC-FDR' ? (
                  <button
                    type="button"
                    onClick={() => {
                      setMemberToDelete(editingMember);
                      setEditingMember(null);
                    }}
                    className="px-3.5 py-2 rounded-xl bg-red-950/40 hover:bg-red-900/60 text-red-400 border border-red-500/40 text-xs font-mono flex items-center gap-1.5 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Discharge Member
                  </button>
                ) : <div />}

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setEditingMember(null)}
                    className="px-4 py-2 text-xs font-mono text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-cyan-400 text-space-950 font-mono font-bold text-xs shadow-[0_0_15px_rgba(0,240,255,0.4)]"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Discharge / Remove Member Confirmation Modal */}
      {memberToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-space-950/85 backdrop-blur-md animate-fadeIn">
          <div className="relative max-w-md w-full p-6 sm:p-7 rounded-3xl bg-space-900 border border-red-500/50 shadow-[0_0_50px_rgba(239,68,68,0.3)] space-y-5">
            <div className="flex items-center gap-3 text-red-400">
              <div className="p-2.5 rounded-2xl bg-red-950/80 border border-red-500/60 text-red-400">
                <AlertTriangle className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h3 className="text-lg font-mono font-bold text-white tracking-wider">
                  DISCHARGE CADET
                </h3>
                <p className="text-[11px] text-red-300 font-mono">
                  Permanent removal from flight roster
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-space-950/90 border border-slate-800 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-mono">Cadet Name:</span>
                <span className="font-bold text-white text-sm">{memberToDelete.name}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-mono">SPARC ID:</span>
                <span className="font-mono font-extrabold text-cyan-300">{memberToDelete.sparc_id}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-mono">Department / Batch:</span>
                <span className="text-slate-300 font-mono">{memberToDelete.department} ({memberToDelete.batch})</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-mono">Role:</span>
                <span className="text-amber-400 font-mono">{memberToDelete.role.replace('_', ' ')}</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-500/30 text-[11px] text-red-200/90 leading-relaxed font-mono">
              ⚠️ <strong>Warning:</strong> Removing this cadet will permanently erase their club credentials and delete all historical attendance telemetry.
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setMemberToDelete(null)}
                disabled={isDeleting}
                className="px-4 py-2.5 rounded-xl text-xs font-mono text-slate-400 hover:text-white hover:bg-slate-800/50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-red-500 text-white font-mono font-bold text-xs shadow-[0_0_20px_rgba(239,68,68,0.4)] hover:from-red-500 hover:to-red-400 disabled:opacity-50 transition-all flex items-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Discharging...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    Confirm Discharge
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      <AddMemberModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onMemberCreated={loadMembers}
        currentYear={settings?.current_year || '2026-27'}
        suggestedSparcId={nextSparcId}
      />

      {/* Rollover Modal */}
      <RolloverModal
        isOpen={isRolloverModalOpen}
        onClose={() => setIsRolloverModalOpen(false)}
        members={members}
        onRolloverComplete={loadMembers}
        currentYear={settings?.current_year || '2026-27'}
      />

      {/* Cadet 4-Color Attendance Calendar Modal */}
      <CadetCalendarModal
        isOpen={Boolean(calendarCadet)}
        onClose={() => setCalendarCadet(null)}
        member={calendarCadet}
        onAttendanceChanged={loadMembers}
      />

      {/* Monthly Attendance CSV Export Modal */}
      <MonthlyExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
      />
    </div>
  );
}
