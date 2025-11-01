'use client';

import { cn } from '@/lib/utils';
import { useUser } from '@clerk/nextjs';
import {
  BarChart3,
  Bell,
  Brain,
  CreditCard,
  HelpCircle,
  Key,
  LayoutDashboard,
  MessageSquare,
  Settings,
  Shield,
  User
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const baseNavigation = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'AI Chat', href: '/admin/chat', icon: MessageSquare },
  { name: 'API Keys', href: '/admin/keys', icon: Key },
  { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
  { name: 'Billing', href: '/admin/billing', icon: CreditCard },
  { name: 'Notifications', href: '/admin/notifications', icon: Bell },
  { name: 'Profile', href: '/admin/profile', icon: User },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
  { name: 'Help', href: '/admin/help', icon: HelpCircle },
];

const restrictedNavigation = [
  { name: 'Adaptive Learning', href: '/admin/learning', icon: Brain },
  { name: 'Cost Monitoring', href: '/admin/cost-monitoring', icon: Shield },
  { name: 'System Status', href: '/admin/system', icon: Shield },
];

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();
  const { user } = useUser();

  // Determinar qué navegación mostrar según el usuario
  const isAuthorizedUser = user?.emailAddresses?.[0]?.emailAddress === 'agentroutermcp@gmail.com';
  const navigation = isAuthorizedUser
    ? [...baseNavigation.slice(0, 4), ...restrictedNavigation, ...baseNavigation.slice(4)]
    : baseNavigation;

  return (
    <div className={cn("flex h-full w-64 flex-col bg-slate-900", className)}>
      {/* Logo */}
      <div className="flex h-16 shrink-0 items-center px-6">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 flex items-center justify-center">
            <svg
              width="32"
              height="32"
              viewBox="0 0 32 32"
              className="transition-all duration-300"
            >
              <defs>
                <linearGradient id="sidebarLogoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="50%" stopColor="#06b6d4" />
                  <stop offset="100%" stopColor="#3b82f6" />
                </linearGradient>
                <linearGradient id="sidebarConnectionGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#059669" />
                  <stop offset="100%" stopColor="#10b981" />
                </linearGradient>
              </defs>

              {/* Background connection network */}
              <g className="opacity-30">
                {/* Horizontal and vertical connection lines */}
                <path d="M6 16 L26 16" stroke="url(#sidebarConnectionGradient)" strokeWidth="0.8" />
                <path d="M16 6 L16 26" stroke="url(#sidebarConnectionGradient)" strokeWidth="0.8" />

                {/* Diagonal connection lines */}
                <path d="M10 10 L22 22" stroke="url(#sidebarConnectionGradient)" strokeWidth="0.6" className="opacity-60" />
                <path d="M22 10 L10 22" stroke="url(#sidebarConnectionGradient)" strokeWidth="0.6" className="opacity-60" />
              </g>

              {/* Main X structure */}
              <g>
                {/* Primary X shape */}
                <path
                  d="M10 10 L22 22 M22 10 L10 22"
                  stroke="url(#sidebarLogoGradient)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />

                {/* Central decision node */}
                <circle
                  cx="16"
                  cy="16"
                  r="3"
                  fill="url(#sidebarLogoGradient)"
                  className="opacity-90"
                />

                {/* Route decision points */}
                <circle cx="10" cy="10" r="1.5" fill="#34d399" className="opacity-80" />
                <circle cx="22" cy="10" r="1.5" fill="#34d399" className="opacity-80" />
                <circle cx="10" cy="22" r="1.5" fill="#34d399" className="opacity-80" />
                <circle cx="22" cy="22" r="1.5" fill="#34d399" className="opacity-80" />
              </g>
            </svg>
          </div>
          <h1 className="text-xl font-bold text-white">Roulyx</h1>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex flex-1 flex-col px-6 pb-4">
        <ul role="list" className="flex flex-1 flex-col gap-y-1 mt-6">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={cn(
                    'group flex gap-x-3 rounded-md p-3 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-slate-800 text-white shadow-sm ring-1 ring-slate-700'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  )}
                >
                  <item.icon
                    className={cn(
                      'h-5 w-5 shrink-0 transition-colors',
                      isActive ? 'text-blue-400' : 'text-slate-400 group-hover:text-white'
                    )}
                  />
                  {item.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}