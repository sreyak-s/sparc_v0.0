'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { 
  ShieldCheck, 
  CalendarCheck, 
  Users, 
  LogOut, 
  LogIn, 
  KeyRound, 
  Menu, 
  X, 
  Activity,
  Sliders,
  Calendar,
  Clock
} from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const { user, isLeadership, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentDateTime, setCurrentDateTime] = useState<Date | null>(null);

  useEffect(() => {
    setCurrentDateTime(new Date());
    const interval = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const navLinks = [
    { name: 'Portal Home', href: '/' },
    ...(isLeadership
      ? [
          { name: 'Roll Call', href: '/admin/attendance', icon: CalendarCheck },
          { name: 'Member Roster', href: '/admin/members', icon: Users },
          { name: 'Overview', href: '/admin', icon: Activity },
          { name: 'Rules & Settings', href: '/admin/settings', icon: Sliders },
        ]
      : user
      ? [
          { name: 'My Attendance', href: '/dashboard', icon: Calendar },
          { name: 'Profile & Pass', href: '/profile', icon: ShieldCheck },
        ]
      : [
          { name: 'Activate ID', href: '/create-password', icon: KeyRound },
        ]),
  ];

  const formattedTime = currentDateTime
    ? currentDateTime.toLocaleTimeString('en-US', { hour12: false })
    : '--:--:--';
  const formattedDate = currentDateTime
    ? currentDateTime.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    : '---';

  return (
    <header className="sticky top-0 z-50 w-full border-b border-cyan-500/20 bg-space-950/90 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Logo & Title */}
          <Link href="/" className="flex items-center gap-3 group flex-shrink-0">
            <div className="relative w-10 h-10 rounded-full overflow-hidden border border-cyan-400/30 group-hover:border-cyan-400 transition-all shadow-[0_0_15px_rgba(0,240,255,0.25)] bg-black flex items-center justify-center">
              <Image
                src="/logo.jpg"
                alt="SPARC Aerospace Club Logo"
                width={40}
                height={40}
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                priority
              />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold tracking-widest text-lg text-white font-mono flex items-center gap-1.5">
                SPARC
                <span className="text-[10px] uppercase px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-sans tracking-normal font-semibold">
                  AERO
                </span>
              </span>
              <span className="text-[10px] tracking-wider text-slate-400 font-mono hidden sm:inline">
                ATTENDANCE & ROSTER PORTAL
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              const Icon = link.icon;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`relative px-3.5 py-2 text-xs font-semibold uppercase tracking-wider rounded-lg transition-all duration-200 flex items-center gap-1.5 ${
                    isActive
                      ? 'text-cyan-300 bg-cyan-950/40 border border-cyan-500/30 shadow-[0_0_15px_rgba(0,240,255,0.15)]'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
                  }`}
                >
                  {Icon && <Icon className="w-3.5 h-3.5" />}
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Right Hand Corner: Live Date & Time HUD + User Auth */}
          <div className="flex items-center gap-3">
            {/* Live Telemetry Clock & Date in Top Right Corner */}
            <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-space-900/90 border border-cyan-500/30 shadow-[0_0_15px_rgba(0,240,255,0.15)] font-mono text-right">
              <Clock className="w-4 h-4 text-cyan-400 animate-pulse flex-shrink-0" />
              <div className="flex flex-col text-right leading-tight">
                <span className="text-xs font-bold text-cyan-300 tracking-wider">
                  {formattedTime} HRS
                </span>
                <span className="text-[9px] text-slate-400 uppercase tracking-tighter">
                  {formattedDate}
                </span>
              </div>
            </div>

            {/* User Auth Action Bar */}
            <div className="hidden md:flex items-center gap-3">
              {user ? (
                <div className="flex items-center gap-3">
                  <Link
                    href={isLeadership ? '/admin' : '/dashboard'}
                    className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-cyan-500/30 hover:border-cyan-400 transition-all text-left"
                  >
                    <div className="w-7 h-7 rounded-full bg-cyan-950 border border-cyan-400/40 flex items-center justify-center text-cyan-300 font-mono text-xs font-bold shadow-[0_0_10px_rgba(0,240,255,0.3)]">
                      {user.name.charAt(0)}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-slate-100 font-mono flex items-center gap-1">
                        {user.sparc_id}
                      </span>
                      <span className="text-[10px] text-cyan-400 font-sans truncate max-w-[100px]">
                        {user.name}
                      </span>
                    </div>
                  </Link>
                  <button
                    onClick={() => logout()}
                    title="Sign out"
                    className="p-2 rounded-lg bg-red-950/30 hover:bg-red-900/50 border border-red-500/30 text-red-400 hover:text-red-300 transition-all"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    href="/create-password"
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white bg-slate-900/60 hover:bg-slate-800 border border-slate-700/60 transition-all flex items-center gap-1.5"
                  >
                    <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                    Activate ID
                  </Link>
                  <Link
                    href="/login"
                    className="px-4 py-1.5 rounded-lg text-xs font-semibold text-space-950 bg-gradient-to-r from-cyan-400 to-sky-400 hover:from-cyan-300 hover:to-sky-300 transition-all shadow-[0_0_15px_rgba(0,240,255,0.4)] hover:shadow-[0_0_25px_rgba(0,240,255,0.7)] flex items-center gap-1.5 font-mono"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    Login
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="flex md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-cyan-500/20 bg-space-950/95 backdrop-blur-2xl px-4 pt-3 pb-6 space-y-3">
          <div className="flex flex-col space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`px-4 py-2.5 rounded-lg text-sm font-semibold tracking-wider flex items-center justify-between ${
                  pathname === link.href
                    ? 'text-cyan-300 bg-cyan-950/60 border border-cyan-500/30'
                    : 'text-slate-300 hover:bg-slate-800/60'
                }`}
              >
                <span className="flex items-center gap-2">
                  {link.icon && <link.icon className="w-4 h-4" />}
                  {link.name}
                </span>
              </Link>
            ))}
          </div>

          <div className="pt-4 border-t border-slate-800/80 flex flex-col gap-2">
            {user ? (
              <div className="space-y-2">
                <div className="px-3 py-2 rounded-lg bg-slate-900 border border-cyan-500/20 text-xs">
                  <div className="text-cyan-400 font-mono font-bold">{user.sparc_id}</div>
                  <div className="text-white font-medium">{user.name}</div>
                  <div className="text-[11px] text-slate-400">{user.role} • {user.department}</div>
                </div>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                  className="w-full py-2.5 rounded-lg bg-red-950/40 border border-red-500/30 text-red-400 hover:text-red-300 text-sm font-semibold flex items-center justify-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2.5 rounded-lg text-center font-mono font-bold text-space-950 bg-gradient-to-r from-cyan-400 to-sky-400 text-sm shadow-[0_0_15px_rgba(0,240,255,0.4)]"
                >
                  Login
                </Link>
                <Link
                  href="/create-password"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2.5 rounded-lg text-center text-sm font-semibold text-slate-300 bg-slate-900 border border-slate-700"
                >
                  Activate SPARC ID
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

