'use client';

import Link from 'next/link';
import { signOut, useSession } from 'next-auth/react';
import {
  Bell,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Coins,
  LayoutDashboard,
  LineChart,
  LogOut,
  Moon,
  Sun,
  Settings,
  Shield,
  User2,
  Wallet2,
} from 'lucide-react';
import React, { useEffect, useMemo, useRef, useState } from 'react';

// --- UTILITY COMPONENT: GlassCard ---
// Defines the core glassmorphism style for dashboard blocks
export const GlassCard: React.FC<
  React.PropsWithChildren<{ className?: string }>
> = ({ children, className = '' }) => (
  <div
    className={`bg-[color:var(--dash-panel)] border border-[color:var(--dash-border)] rounded-2xl p-5 shadow-xl shadow-black/20 backdrop-blur-xl transition duration-300 hover:border-[color:var(--dash-soft)] text-[color:var(--dash-strong)] ${className}`}
  >
    {children}
  </div>
);

type MenuItem = {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
};

const menuItems: MenuItem[] = [
  { label: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Markets', href: '#', icon: LineChart },
  { label: 'My Positions', href: '#', icon: Wallet2 },
  { label: 'Deposit', href: '#', icon: Coins },
  { label: 'Withdraw', href: '#', icon: Shield },
];

// --- MAIN LAYOUT COMPONENT ---
const DashboardLayout: React.FC<React.PropsWithChildren<{}>> = ({
  children,
}) => {
  const { data: session } = useSession();
  const [collapsed, setCollapsed] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const isSidebarOpen = !collapsed;
  const showLabels = isSidebarOpen;
  const isAdmin =
    (session?.user as any)?.role &&
    (session?.user as any)?.role?.toString().toLowerCase() === 'admin';

  const renderMenuItem = (item: MenuItem) => {
    const Icon = item.icon;
    return (
      <Link
        key={item.label}
        href={item.href}
        className={`group relative flex items-center rounded-xl text-sm transition hover:bg-[color:var(--dash-soft)] text-[color:var(--dash-muted)] ${
          showLabels
            ? 'px-3 py-3 gap-3 justify-start'
            : 'px-2 py-3 justify-center'
        }`}
      >
        <Icon className="h-5 w-5 text-profit group-hover:text-[color:var(--dash-strong)]" />
        <span
          className={`whitespace-nowrap transition-all duration-200 origin-left ${
            showLabels
              ? 'opacity-100 translate-x-0'
              : 'opacity-0 -translate-x-2 w-0 overflow-hidden pointer-events-none'
          }`}
        >
          {item.label}
        </span>
        {!showLabels ? (
          <span className="pointer-events-none absolute left-full ml-3 rounded-lg bg-[color:var(--dash-panel)] px-2 py-1 text-[11px] text-[color:var(--dash-strong)] opacity-0 translate-x-2 transition group-hover:opacity-100 group-hover:translate-x-0 shadow-lg border border-[color:var(--dash-border)]">
            {item.label}
          </span>
        ) : null}
      </Link>
    );
  };

  const initials = useMemo(() => {
    const name = session?.user?.name || session?.user?.email || 'User';
    return name
      .split(' ')
      .map((chunk) => chunk[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  }, [session?.user]);

  const sidebarDisplayName = useMemo(() => {
    const fullName = session?.user?.name?.trim();
    if (fullName) {
      return fullName;
    }
    const email = session?.user?.email;
    return email ? email.split('@')[0] : 'Guest';
  }, [session?.user]);

  const todayLabel = useMemo(() => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      weekday: 'short',
    }).format(new Date());
  }, []);

  useEffect(() => {
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme === 'light' || storedTheme === 'dark') {
      setIsDarkMode(storedTheme === 'dark');
      return;
    }
    const prefersDark =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: dark)').matches;
    setIsDarkMode(prefersDark);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div
      className="min-h-screen h-screen flex overflow-hidden text-[color:var(--dash-strong)]"
      style={{ backgroundColor: 'var(--dash-bg)' }}
    >
      <aside
        className={`relative z-20 h-full max-h-screen bg-[color:var(--dash-panel)] border-r border-[color:var(--dash-border)] backdrop-blur-2xl shadow-2xl shadow-black/40 transition-all duration-300 flex flex-col ${
          isSidebarOpen ? 'w-64' : 'w-20'
        }`}
      >
        <div className="flex items-center gap-3 px-3 py-4 border-b border-[color:var(--dash-border)] sticky top-0 bg-[color:var(--dash-panel)] backdrop-blur-xl z-10">
          <div
            className={`flex items-center gap-3 transition-all flex-1 min-w-0 ${
              isSidebarOpen ? 'justify-start' : 'justify-center'
            }`}
          >
            <User2 className="h-8 w-8 shrink-0 rounded-xl bg-[color:var(--dash-soft)] border border-[color:var(--dash-border)] p-1.5 text-profit" />
            {isSidebarOpen ? (
              <div className="transition-all duration-200 origin-left opacity-100 translate-x-0 min-w-0">
                <p className="text-xs text-[color:var(--dash-muted)]">
                  Welcome
                </p>
                <p
                  className="text-base font-semibold truncate text-[color:var(--dash-strong)]"
                  title={sidebarDisplayName}
                >
                  {sidebarDisplayName}
                </p>
              </div>
            ) : null}
          </div>
        </div>

        <button
          aria-label="Toggle sidebar"
          onClick={() => setCollapsed((c) => !c)}
          className={`absolute -right-4 top-20 h-8 w-8 cursor-pointer rounded-xl flex items-center justify-center transition shadow-lg shadow-black/20 ${
            isSidebarOpen
              ? 'bg-[color:var(--dash-panel)] border border-[color:var(--dash-border)]'
              : 'bg-[color:var(--dash-panel)] hover:bg-[color:var(--dash-soft)] border border-[color:var(--dash-border)]'
          }`}
        >
          {isSidebarOpen ? (
            <ChevronLeft className="h-4 w-4 text-[color:var(--dash-icon)]" />
          ) : (
            <ChevronRight className="h-4 w-4 text-[color:var(--dash-icon)]" />
          )}
        </button>

        <nav
          className={`flex-1 px-3 py-2 ${
            isSidebarOpen
              ? 'space-y-1'
              : 'flex flex-col items-center gap-5 justify-start pt-6'
          }`}
        >
          {menuItems.map(renderMenuItem)}
        </nav>

        <div className="px-3 pb-4 space-y-1">
          {isAdmin ? (
            <button
              className={`group relative cursor-pointer w-full flex items-center gap-3 rounded-xl text-sm transition hover:bg-[color:var(--dash-soft)] text-[color:var(--dash-muted)] ${
                isSidebarOpen ? 'justify-start px-3 py-3' : 'justify-center p-2'
              }`}
              type="button"
            >
              <Settings className="h-5 w-5  shrink-0 " />
              <span
                className={`transition-all duration-200 origin-left ${
                  isSidebarOpen
                    ? 'opacity-100 translate-x-0'
                    : 'opacity-0 -translate-x-2 w-0 overflow-hidden pointer-events-none'
                }`}
              >
                Settings
              </span>
              {!isSidebarOpen ? (
                <span className="pointer-events-none  absolute left-full ml-3 rounded-lg bg-[color:var(--dash-panel)] px-2 py-1 text-[11px] text-[color:var(--dash-strong)] opacity-0 translate-x-2 transition group-hover:opacity-100 group-hover:translate-x-0 shadow-lg border border-[color:var(--dash-border)]">
                  Settings
                </span>
              ) : null}
            </button>
          ) : null}

          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            type="button"
            className={`group relative w-full cursor-pointer flex items-center gap-3 rounded-xl text-sm transition border border-[color:var(--dash-border)]/70 bg-[color:var(--dash-panel)]/70 hover:bg-[color:var(--dash-soft)]/70 hover:border-[var(--profit)]/50 text-[color:var(--dash-strong)] shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--profit)]/30 focus-visible:ring-offset-1 focus-visible:ring-offset-[color:var(--dash-panel)] ${
              isSidebarOpen ? 'justify-start px-3 py-3' : 'justify-center p-2'
            }`}
          >
            <LogOut className="h-5 w-5 shrink-0 text-[var(--profit)] transition-transform group-hover:translate-x-0.5" />
            <span
              className={`transition-all duration-200 origin-left ${
                isSidebarOpen
                  ? 'opacity-100 translate-x-0'
                  : 'opacity-0 -translate-x-2 w-0 overflow-hidden pointer-events-none'
              } group-hover:text-[var(--profit)]`}
            >
              Logout
            </span>
            {!isSidebarOpen ? (
              <span className="pointer-events-none absolute left-full ml-3 rounded-lg bg-[color:var(--dash-panel)] px-2 py-1 text-[11px] text-[color:var(--dash-strong)] opacity-0 translate-x-2 transition group-hover:opacity-100 group-hover:translate-x-0 shadow-lg border border-[color:var(--dash-border)]">
                Logout
              </span>
            ) : null}
          </button>
        </div>
      </aside>

      <main className="flex-1 max-h-screen overflow-y-auto p-6 md:p-8 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-[color:var(--dash-soft)] via-transparent to-[color:var(--dash-soft)] pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center justify-between gap-3 mb-6">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 rounded-full text-sm bg-[color:var(--dash-soft)] border border-[color:var(--dash-border)] text-[color:var(--dash-muted)]">
                  {todayLabel}
                </span>
              </div>
              <p className="text-sm text-[color:var(--dash-muted)]">
                Quick snapshot: stay on top of your positions, markets, and
                updates in one view.
              </p>
            </div>
            <div className="flex items-center justify-end gap-3">
              <button
                className="h-10 w-10 rounded-xl bg-[color:var(--dash-panel)] border border-[color:var(--dash-border)] flex items-center justify-center hover:bg-[color:var(--dash-soft)] transition text-[color:var(--dash-icon)]"
                type="button"
              >
                <Bell className="h-5 w-5" />
              </button>
              <button
                type="button"
                aria-pressed={isDarkMode}
                onClick={() => setIsDarkMode((mode) => !mode)}
                className="relative h-10 cursor-pointer w-10 rounded-xl bg-[color:var(--dash-panel)] border border-[color:var(--dash-border)] flex items-center justify-center overflow-hidden hover:bg-[color:var(--dash-soft)] transition text-[color:var(--dash-icon)]"
              >
                <Moon
                  className={`absolute h-5 w-5 transition-all duration-300 ${
                    isDarkMode
                      ? 'opacity-100 scale-100 rotate-0'
                      : 'opacity-0 scale-75 -rotate-90'
                  }`}
                />
                <Sun
                  className={`absolute h-5 w-5 transition-all duration-300 ${
                    isDarkMode
                      ? 'opacity-0 scale-75 rotate-90'
                      : 'opacity-100 scale-100 rotate-0'
                  }`}
                />
              </button>
              <div ref={menuRef} className="relative">
                <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-[color:var(--dash-panel)] border border-[color:var(--dash-border)] shadow-sm">
                  <div className="h-9 w-9 rounded-xl bg-[var(--profit)]/15 text-[var(--profit)] font-semibold flex items-center justify-center">
                    {initials}
                  </div>
                  <div className="flex flex-col leading-tight max-w-[180px]">
                    <p
                      className="text-sm font-semibold text-[color:var(--dash-strong)] truncate"
                      title={
                        session?.user?.name || session?.user?.email || 'Guest'
                      }
                    >
                      {session?.user?.name || session?.user?.email || 'Guest'}
                    </p>
                    <span className="text-xs text-[color:var(--dash-muted)]">
                      Online
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsMenuOpen((open) => !open)}
                    className="ml-1 h-8 w-8 rounded-lg flex items-center justify-center border border-[color:var(--dash-border)] hover:bg-[color:var(--dash-soft)] text-[color:var(--dash-icon)] transition"
                    aria-haspopup="true"
                    aria-expanded={isMenuOpen}
                  >
                    <ChevronDown
                      className={`h-4 w-4 transition-transform ${
                        isMenuOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                </div>
                {isMenuOpen ? (
                  <div className="absolute right-0 mt-2 w-56 rounded-xl bg-[color:var(--dash-panel)] border border-[color:var(--dash-border)] shadow-xl overflow-hidden z-20">
                    <button
                      className="w-full px-4 py-3 flex items-center justify-between text-sm text-[color:var(--dash-strong)] hover:bg-[color:var(--dash-soft)] transition"
                      type="button"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <span>Profile</span>
                    </button>
                    <button
                      className="w-full px-4 py-3 flex items-center justify-between text-sm text-[color:var(--dash-strong)] hover:bg-[color:var(--dash-soft)] transition"
                      type="button"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <span>Notifications</span>
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
