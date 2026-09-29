'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import SparcIdCard from '@/components/member/SparcIdCard';
import { 
  User, 
  KeyRound, 
  ShieldCheck, 
  Lock, 
  CheckCircle2, 
  AlertCircle, 
  Mail, 
  Sparkles,
  ArrowRight
} from 'lucide-react';

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [email, setEmail] = useState(user?.email || '');
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  if (!user) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-4 text-center">
        <p className="text-slate-400 font-mono text-sm">Please log in to view your cadet profile.</p>
      </div>
    );
  }

  const handleUpdateContact = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    setMessage(null);

    try {
      const res = await fetch(`/api/members/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await res.json();
      if (res.ok) {
        setMessage({ text: 'Contact information updated successfully.', type: 'success' });
        refreshUser();
      } else {
        setMessage({ text: data.error || 'Update failed', type: 'error' });
      }
    } catch (e: any) {
      setMessage({ text: e.message || 'Error occurred', type: 'error' });
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-space-900/80 border border-cyan-500/20 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-400">
            <User className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-mono font-bold text-white tracking-wider">
              CADET PROFILE & IDENTITY CREDENTIALS
            </h3>
            <p className="text-xs text-slate-400">
              Manage your personal flight record details, verified email, and digital pass.
            </p>
          </div>
        </div>
      </div>

      {message && (
        <div className={`p-3.5 rounded-xl border text-xs font-mono flex items-center gap-2 ${
          message.type === 'success' 
            ? 'bg-emerald-950/60 border-emerald-500/60 text-emerald-300' 
            : 'bg-red-950/60 border-red-500/60 text-red-300'
        }`}>
          {message.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>{message.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Left: Holographic Digital SPARC Card */}
        <div className="md:col-span-6 space-y-4">
          <h4 className="text-sm font-mono font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            DIGITAL IDENTITY PASS
          </h4>
          <SparcIdCard member={user} />
        </div>

        {/* Right: Profile Details & Contact Form */}
        <div className="md:col-span-6 space-y-6">
          {/* Metadata Card */}
          <div className="p-6 rounded-3xl bg-space-900/80 border border-cyan-500/20 backdrop-blur-xl space-y-4">
            <h4 className="text-sm font-mono font-bold text-white uppercase tracking-wider border-b border-cyan-500/10 pb-3">
              REGISTRY METADATA
            </h4>

            <div className="grid grid-cols-2 gap-4 text-xs font-mono">
              <div>
                <span className="text-slate-500 block text-[10px] uppercase">Full Name</span>
                <span className="text-white font-bold">{user.name}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase">SPARC ID</span>
                <span className="text-cyan-300 font-bold">{user.sparc_id}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase">Role</span>
                <span className="text-amber-300 font-bold">{user.role}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase">Cycle</span>
                <span className="text-slate-300 font-bold">{user.academic_year}</span>
              </div>
              <div className="col-span-2">
                <span className="text-slate-500 block text-[10px] uppercase">Department</span>
                <span className="text-slate-300">{user.department}</span>
              </div>
            </div>
          </div>

          {/* Update Email Form */}
          <div className="p-6 rounded-3xl bg-space-900/80 border border-cyan-500/20 backdrop-blur-xl space-y-4">
            <h4 className="text-sm font-mono font-bold text-white uppercase tracking-wider border-b border-cyan-500/10 pb-3">
              COMMUNICATION CONTACT
            </h4>

            <form onSubmit={handleUpdateContact} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-cyan-400 uppercase mb-1.5">
                  Registered Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="cadet@sparc-aero.org"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-space-950 border border-slate-700 text-white text-xs font-mono focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={updating}
                className="px-5 py-2.5 rounded-xl bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-500/40 text-xs font-mono font-bold transition-all disabled:opacity-50"
              >
                {updating ? 'Updating...' : 'Save Email Address'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
