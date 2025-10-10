'use client';

import { cn } from '@/lib/utils';
import {
  Activity,
  BarChart3,
  Bell,
  CreditCard,
  HelpCircle,
  Key,
  LayoutDashboard,
  MessageSquare,
  Settings,
  Shield,
  User,
  Users
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'AI Chat', href: '/admin/chat', icon: MessageSquare },
  { name: 'API Keys', href: '/admin/keys', icon: Key },
  { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
  { name: 'Users', href: '/admin/users', icon: Users },
  { name: 'System Status', href: '/admin/system', icon: Shield },
  { name: 'Billing', href: '/admin/billing', icon: CreditCard },
  { name: 'Notifications', href: '/admin/notifications', icon: Bell },
  { name: 'Profile', href: '/admin/profile', icon: User },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
  { name: 'Help', href: '/admin/help', icon: HelpCircle },
];

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();

  return (
    <div className={cn("flex h-full w-64 flex-col bg-slate-900", className)}>
      {/* Logo */}
      <div className="flex h-16 shrink-0 items-center px-6">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-bold text-white">RouterAI</h1>
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