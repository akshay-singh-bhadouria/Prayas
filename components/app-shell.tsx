'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  CalendarCheck,
  Newspaper,
  Timer,
  PenLine,
  MessageCircleHeart,
  Sparkles,
  Rocket,
  WifiOff
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useOnlineStatus } from '@/lib/use-online-status';
import { useEffect } from 'react';
import { saveLocal } from '@/lib/storage';

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/planner', label: 'Smart Planner', icon: CalendarCheck },
  { href: '/pulse', label: 'UPSC Pulse', icon: Newspaper },
  { href: '/tests', label: 'Testing & Analytics', icon: Timer },
  { href: '/answer-evaluator', label: 'Answer Evaluator', icon: PenLine },
  { href: '/mentor', label: 'AI Mentor', icon: MessageCircleHeart },
  { href: '/wellness', label: 'Motivation & Wellness', icon: Sparkles },
  { href: '/future', label: 'Future Scope', icon: Rocket }
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isOnline = useOnlineStatus();

  useEffect(() => {
    saveLocal('prayas:last-active', Date.now());
  }, []);

  return (
    <div className="app-bg min-h-screen">
      <div className="mx-auto flex w-full max-w-[1400px] gap-6 px-4 py-6 lg:px-8">
        <aside className="sticky top-6 hidden h-[calc(100vh-3rem)] w-[260px] flex-col gap-6 rounded-3xl border border-white/60 bg-white/70 p-6 shadow-soft backdrop-blur lg:flex">
          <div>
            <p className="font-headline text-2xl font-semibold">PRAYAS</p>
            <p className="mt-1 text-sm text-ink-600">
              Offline-first UPSC companion
            </p>
          </div>
          <nav className="flex flex-1 flex-col gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition',
                    active
                      ? 'bg-ink-900 text-white'
                      : 'text-ink-700 hover:bg-ink-100'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="rounded-2xl border border-ink-100 bg-ink-50/80 p-4 text-sm text-ink-700">
            <div className="flex items-center gap-2">
              {isOnline ? (
                <Badge variant="accent">Online</Badge>
              ) : (
                <Badge variant="subtle" className="gap-1">
                  <WifiOff className="h-3 w-3" /> Offline
                </Badge>
              )}
              <span className="text-xs">Syncs when online</span>
            </div>
            <p className="mt-2 text-xs text-ink-600">
              Your plans, insights, and progress stay on this device.
            </p>
          </div>
        </aside>
        <div className="flex-1">
          <div className="mb-4 flex items-center justify-between rounded-3xl border border-white/60 bg-white/70 px-5 py-4 shadow-soft backdrop-blur lg:hidden">
            <div>
              <p className="font-headline text-xl">PRAYAS</p>
              <p className="text-xs text-ink-600">UPSC companion</p>
            </div>
            <Badge variant={isOnline ? 'accent' : 'subtle'}>
              {isOnline ? 'Online' : 'Offline'}
            </Badge>
          </div>
          {children}
          <div className="mt-6 flex flex-wrap gap-2 lg:hidden">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold',
                    active
                      ? 'border-ink-900 bg-ink-900 text-white'
                      : 'border-ink-200 bg-white/80 text-ink-700'
                  )}
                >
                  <Icon className="h-3 w-3" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
