'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { QRCodeSVG } from 'qrcode.react';
import { Member } from '@/types';
import { 
  ShieldCheck, 
  Copy, 
  Check, 
  QrCode, 
  Sparkles, 
  Orbit, 
  Layers, 
  Radio
} from 'lucide-react';

interface Props {
  member: Member;
  interactive?: boolean;
}

export default function SparcIdCard({ member, interactive = true }: Props) {
  const [copied, setCopied] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);

  const handleCopyId = () => {
    navigator.clipboard.writeText(member.sparc_id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getRoleBadgeStyle = (role: Member['role']) => {
    switch (role) {
      case 'FOUNDER':
        return 'bg-gradient-to-r from-amber-500/30 to-yellow-500/20 text-yellow-300 border-yellow-500/50 shadow-[0_0_15px_rgba(234,179,8,0.3)]';
      case 'CAPTAIN':
        return 'bg-gradient-to-r from-cyan-500/30 to-blue-500/20 text-cyan-300 border-cyan-500/50 shadow-[0_0_15px_rgba(0,240,255,0.3)]';
      case 'VICE_CAPTAIN':
        return 'bg-gradient-to-r from-sky-500/30 to-indigo-500/20 text-sky-300 border-sky-500/50 shadow-[0_0_15px_rgba(56,189,248,0.3)]';
      case 'SECRETARY':
        return 'bg-gradient-to-r from-purple-500/30 to-pink-500/20 text-purple-300 border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.3)]';
      default:
        return 'bg-cyan-950/40 text-cyan-300 border-cyan-500/30';
    }
  };

  const qrData = JSON.stringify({
    sparc_id: member.sparc_id,
    name: member.name,
    role: member.role,
    dept: member.department,
    batch: member.batch,
    academic_year: member.academic_year,
    issued: 'SPARC_AEROSPACE_COMMAND'
  });

  return (
    <>
      <div className="relative group max-w-md w-full mx-auto">
        {/* Holographic Glowing Border & Ambient Glow */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 rounded-2xl blur-lg opacity-40 group-hover:opacity-75 transition duration-500"></div>

        {/* The Card Body */}
        <div className="relative rounded-2xl bg-gradient-to-b from-space-850 via-space-900 to-space-950 border border-cyan-400/40 p-6 shadow-[0_12px_40px_rgba(0,0,0,0.8)] overflow-hidden">
          {/* Subtle Background Watermark Logo & Grid */}
          <div className="absolute -right-12 -bottom-12 w-48 h-48 opacity-10 pointer-events-none">
            <Image src="/logo.jpg" alt="Watermark" width={200} height={200} className="object-cover rounded-full" />
          </div>
          <div className="absolute inset-0 bg-hud-grid pointer-events-none opacity-20"></div>

          {/* Header Bar */}
          <div className="flex items-center justify-between border-b border-cyan-500/20 pb-4 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full overflow-hidden border border-cyan-400/50 bg-black flex items-center justify-center shadow-[0_0_10px_rgba(0,240,255,0.4)]">
                <Image src="/logo.jpg" alt="SPARC" width={32} height={32} className="object-cover" />
              </div>
              <div>
                <span className="font-mono font-extrabold tracking-widest text-sm text-white">SPARC AEROSPACE</span>
                <p className="text-[9px] font-mono text-cyan-400 tracking-wider">FLIGHT CADET IDENTITY PASS</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase">VERIFIED</span>
            </div>
          </div>

          {/* Middle Cadet Profile Section (Clean Insignia Crest, No Profile Picture required) */}
          <div className="flex items-start gap-4 mb-5">
            {/* Aerospace Rank Insignia Crest */}
            <div className="relative flex-shrink-0">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-950 via-space-800 to-space-900 border-2 border-cyan-400/60 flex items-center justify-center text-xl font-mono font-black text-cyan-300 shadow-[0_0_20px_rgba(0,240,255,0.3)]">
                {member.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
              </div>
              <div className="absolute -bottom-1 -right-1 p-1 rounded-full bg-space-950 border border-cyan-400 text-cyan-400 shadow">
                <Orbit className="w-3 h-3 animate-spin" style={{ animationDuration: '8s' }} />
              </div>
            </div>

            {/* Cadet Metadata */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full border font-bold ${getRoleBadgeStyle(member.role)}`}>
                  {member.role.replace('_', ' ')}
                </span>
                <span className="text-[10px] font-mono text-slate-400">{member.academic_year}</span>
              </div>

              <h3 className="text-base font-bold text-white mt-1.5 truncate">
                {member.name}
              </h3>
              
              <p className="text-xs text-cyan-300/90 truncate">{member.department}</p>
              <p className="text-[11px] text-slate-400 font-mono">Batch: {member.batch}</p>
            </div>
          </div>

          {/* SPARC ID Chip Bar with Quick Copy */}
          <div className="p-3 rounded-xl bg-space-950/80 border border-cyan-500/30 flex items-center justify-between mb-4">
            <div>
              <div className="text-[9px] font-mono text-slate-400 uppercase tracking-wider">OFFICIAL CADET ID</div>
              <div className="text-base sm:text-lg font-mono font-extrabold text-cyan-300 tracking-wider text-glow-cyan">
                {member.sparc_id}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyId}
                className="p-2 rounded-lg bg-slate-800/80 hover:bg-cyan-950 text-slate-300 hover:text-cyan-300 border border-slate-700 hover:border-cyan-500/50 transition-colors text-xs flex items-center gap-1 font-mono"
                title="Copy SPARC ID"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">{copied ? 'COPIED' : 'COPY'}</span>
              </button>

              <button
                onClick={() => setShowQrModal(true)}
                className="p-2 rounded-lg bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 border border-cyan-500/40 transition-colors"
                title="Expand Scannable QR Code"
              >
                <QrCode className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Footer Card Telemetry Bar */}
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 pt-2 border-t border-slate-800/80">
            <span className="flex items-center gap-1">
              <Radio className="w-3 h-3 text-cyan-400 animate-pulse" /> SPARC-SYS-256
            </span>
            <span>CLEARANCE: LEVEL-{member.role === 'FOUNDER' ? '5' : member.role === 'CAPTAIN' ? '4' : '3'}</span>
          </div>
        </div>
      </div>

      {/* Scannable High-Res QR Code Modal */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-space-950/85 backdrop-blur-md animate-fadeIn">
          <div className="relative max-w-sm w-full p-6 rounded-2xl bg-space-900 border border-cyan-500/40 shadow-[0_0_50px_rgba(0,240,255,0.3)] text-center space-y-4">
            <button
              onClick={() => setShowQrModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-800/80"
            >
              ✕
            </button>

            <div className="flex items-center justify-center gap-2 text-cyan-400 font-mono text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              DIGITAL SPARC BADGE QR
            </div>

            <div className="p-4 bg-white rounded-2xl inline-block shadow-[0_0_25px_rgba(0,240,255,0.4)] mx-auto">
              <QRCodeSVG
                value={qrData}
                size={200}
                level="H"
                includeMargin={true}
              />
            </div>

            <div>
              <div className="text-base font-mono font-bold text-white">{member.sparc_id}</div>
              <div className="text-xs text-cyan-300">{member.name}</div>
              <div className="text-[11px] text-slate-400 font-mono mt-1">{member.department} • {member.batch}</div>
            </div>

            <p className="text-[11px] text-slate-400 leading-tight">
              Scan this badge with flight command scanners for instantaneous roll-call verification.
            </p>

            <button
              onClick={() => setShowQrModal(false)}
              className="w-full py-2.5 rounded-xl bg-cyan-950 text-cyan-300 border border-cyan-500/40 text-xs font-mono font-bold hover:bg-cyan-900 transition-colors"
            >
              CLOSE BADGE
            </button>
          </div>
        </div>
      )}
    </>
  );
}
