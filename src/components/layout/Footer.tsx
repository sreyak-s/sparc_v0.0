'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-cyan-500/20 bg-space-950/90 text-slate-400 text-xs py-8 px-4 sm:px-6 lg:px-8 z-10">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Club Info */}
        <div className="flex items-center gap-3">
          <div className="relative w-8 h-8 rounded-full overflow-hidden border border-cyan-400/40 bg-black flex items-center justify-center shadow-[0_0_15px_rgba(0,240,255,0.25)]">
            <Image
              src="/logo.jpg"
              alt="SPARC Logo"
              width={32}
              height={32}
              className="object-cover"
            />
          </div>
          <div>
            <span className="font-extrabold tracking-wider text-sm text-white font-mono">SPARC AEROSPACE</span>
            <p className="text-[10px] text-cyan-400 font-mono">Attendance & Membership Portal</p>
          </div>
        </div>

        {/* Quick Links */}
        <div className="flex items-center gap-6 font-mono text-xs">
          <Link href="/" className="hover:text-cyan-300 transition-colors">Home</Link>
          <Link href="/login" className="hover:text-cyan-300 transition-colors">Login</Link>
          <Link href="/create-password" className="hover:text-cyan-300 transition-colors">Activate ID</Link>
          <Link href="/dashboard" className="hover:text-cyan-300 transition-colors">My Attendance</Link>
          <Link href="/admin/attendance" className="hover:text-cyan-300 transition-colors">Roll Call</Link>
        </div>

        {/* Copyright */}
        <div className="text-[11px] text-slate-500 font-mono">
          © {new Date().getFullYear()} SPARC Aerospace Club
        </div>
      </div>
    </footer>
  );
}

