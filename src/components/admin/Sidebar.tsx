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
  { name: 'API Console', href: '/admin/chat', icon: MessageSquare },
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
              className="transition-all duration-300 hover:scale-110"
            >
              <defs>
                <linearGradient id="sidebarLogoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="30%" stopColor="#06b6d4" />
                  <stop offset="70%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#8b5cf6" />
                </linearGradient>
                <linearGradient id="sidebarNodeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#34d399" />
                  <stop offset="100%" stopColor="#06b6d4" />
                </linearGradient>
                <linearGradient id="sidebarConnectionGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#06b6d4" />
                </linearGradient>
                <filter id="sidebarGlow">
                  <feGaussianBlur stdDeviation="1" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Neural Network Connections */}
              <g className="opacity-50" filter="url(#sidebarGlow)">
                {/* Layer 1 to Center connections */}
                <path d="M5 8 Q12 12 16 16" stroke="url(#sidebarConnectionGradient)" strokeWidth="1" fill="none" />
                <path d="M5 16 L16 16" stroke="url(#sidebarConnectionGradient)" strokeWidth="1" />
                <path d="M5 24 Q12 20 16 16" stroke="url(#sidebarConnectionGradient)" strokeWidth="1" fill="none" />

                {/* Center to Layer 2 connections */}
                <path d="M16 16 Q20 12 27 8" stroke="url(#sidebarConnectionGradient)" strokeWidth="1" fill="none" />
                <path d="M16 16 L27 16" stroke="url(#sidebarConnectionGradient)" strokeWidth="1" />
                <path d="M16 16 Q20 20 27 24" stroke="url(#sidebarConnectionGradient)" strokeWidth="1" fill="none" />
              </g>

              {/* Input Layer Nodes */}
              <g filter="url(#sidebarGlow)">
                <circle cx="5" cy="8" r="2" fill="url(#sidebarNodeGradient)" className="opacity-70" />
                <circle cx="5" cy="16" r="2" fill="url(#sidebarNodeGradient)" className="opacity-70" />
                <circle cx="5" cy="24" r="2" fill="url(#sidebarNodeGradient)" className="opacity-70" />
              </g>

              {/* Central Router Node */}
              <g filter="url(#sidebarGlow)">
                <circle
                  cx="16"
                  cy="16"
                  r="4"
                  fill="url(#sidebarLogoGradient)"
                  strokeWidth="1.5"
                  stroke="#10b981"
                  className="opacity-90"
                />
                {/* Inner core */}
                <circle
                  cx="16"
                  cy="16"
                  r="1.5"
                  fill="#ffffff"
                  className="opacity-90"
                />
              </g>

              {/* Output Layer Nodes */}
              <g filter="url(#sidebarGlow)">
                <circle cx="27" cy="8" r="2" fill="url(#sidebarNodeGradient)" className="opacity-70" />
                <circle cx="27" cy="16" r="2" fill="url(#sidebarNodeGradient)" className="opacity-70" />
                <circle cx="27" cy="24" r="2" fill="url(#sidebarNodeGradient)" className="opacity-70" />
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