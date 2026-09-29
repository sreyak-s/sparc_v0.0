'use client';

import React, { useState } from 'react';
import { Role } from '@/types';
import { UserPlus, Sparkles, X, Shield, AlertCircle } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onMemberCreated: () => void;
  currentYear: string;
  suggestedSparcId?: string;
}

export default function AddMemberModal({ isOpen, onClose, onMemberCreated, currentYear, suggestedSparcId }: Props) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<Role>('MEMBER');
  const [department, setDepartment] = useState('Aerospace Engineering');
  const [batch, setBatch] = useState('2025-2029');
  const [customSparcId, setCustomSparcId] = useState('');
  const [nextId, setNextId] = useState(suggestedSparcId || 'SPARC-009');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    if (isOpen) {
      fetch('/api/members')
        .then(res => res.json())
        .then(data => {
          if (data.next_sparc_id) {
            setNextId(data.next_sparc_id);
          }
        })
        .catch(() => {});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email: email || undefined,
          role,
          department,
          batch,
          academic_year: currentYear,
          sparc_id: customSparcId ? customSparcId.trim().toUpperCase() : undefined
        })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to create member');
      } else {
        onMemberCreated();
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-space-950/85 backdrop-blur-md animate-fadeIn">
      <div className="relative max-w-lg w-full p-6 sm:p-8 rounded-3xl bg-space-900 border border-cyan-500/30 shadow-[0_0_50px_rgba(0,240,255,0.25)] space-y-6">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white bg-slate-800/80 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-300">
            <UserPlus className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-mono font-bold text-white tracking-wide">
              ENROLL NEW CADET
            </h3>
            <p className="text-xs text-slate-400">
              Create cadet profile. They will set their password via &apos;Activate ID&apos;.
            </p>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/60 text-red-300 text-xs font-mono flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono text-cyan-400 uppercase mb-1.5">
              Cadet Full Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Sreya K. S."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-space-950 border border-slate-700 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono text-cyan-400 uppercase mb-1.5">
                Official SPARC ID
              </label>
              <input
                type="text"
                placeholder={`Auto-assigned: ${nextId}`}
                value={customSparcId}
                onChange={(e) => setCustomSparcId(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-space-950 border border-slate-700 text-cyan-300 placeholder-cyan-500/60 font-mono text-xs focus:outline-none focus:border-cyan-400"
              />
              <span className="text-[10px] text-slate-500 font-mono">Sequential: will auto-assign {nextId}</span>
            </div>

            <div>
              <label className="block text-xs font-mono text-cyan-400 uppercase mb-1.5">
                Assigned Role *
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as Role)}
                className="w-full px-4 py-2.5 rounded-xl bg-space-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-400 font-mono"
              >
                <option value="MEMBER">MEMBER (Cadet)</option>
                <option value="CAPTAIN">CAPTAIN (SPARC-001)</option>
                <option value="VICE_CAPTAIN">VICE CAPTAIN (SPARC-002)</option>
                <option value="SECRETARY">SECRETARY (SPARC-003)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono text-cyan-400 uppercase mb-1.5">
                Department *
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-space-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-400 font-mono"
              >
                <option value="Aerospace Engineering">Aerospace Engineering</option>
                <option value="Aeronautical Engineering">Aeronautical Engineering</option>
                <option value="Mechanical Engineering">Mechanical Engineering</option>
                <option value="Electrical & Electronics">Electrical & Electronics</option>
                <option value="Computer Science & Systems">Computer Science & Systems</option>
                <option value="Robotics & Automation">Robotics & Automation</option>
                <option value="Physics & Space Sciences">Physics & Space Sciences</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono text-cyan-400 uppercase mb-1.5">
                Batch *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. 2025-2029"
                value={batch}
                onChange={(e) => setBatch(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-space-950 border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-cyan-400 uppercase mb-1.5">
              Email Address (Optional)
            </label>
            <input
              type="email"
              placeholder="cadet@sparc-aero.org"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-space-950 border border-slate-700 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-slate-400 hover:text-white text-xs font-mono"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-sky-400 text-space-950 font-mono font-bold text-xs shadow-[0_0_20px_rgba(0,240,255,0.4)] hover:from-cyan-300 hover:to-sky-300 transition-all disabled:opacity-50"
            >
              {loading ? 'Registering...' : 'Enroll Cadet'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
