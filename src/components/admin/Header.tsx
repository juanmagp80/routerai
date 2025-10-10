'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useUserSync } from '@/hooks/useUserSync';
import { UserButton } from '@clerk/nextjs';
import { Bell, Search, User } from 'lucide-react';
import Link from 'next/link';

export function Header() {
  const { dbUser, clerkUser, isLoading } = useUserSync();

  return (
    <header className="bg-white border-b border-slate-200">
      <div className="px-6 py-4">
        <div className="flex h-10 items-center justify-between">
          {/* Search */}
          <div className="flex flex-1 items-center">
            <div className="w-full max-w-lg">
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Search className="h-4 w-4 text-slate-400" />
                </div>
                <Input
                  className="block w-full rounded-md border-slate-300 pl-10 pr-3 py-2 text-sm placeholder-slate-400 focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Buscar..."
                  type="search"
                />
              </div>
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="h-5 w-5 text-slate-500" />
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-xs text-white flex items-center justify-center">
                {dbUser ? '1' : '0'}
              </span>
            </Button>

            {/* User info */}
            <div className="flex items-center space-x-3">
              {isLoading ? (
                <div className="animate-pulse">
                  <div className="h-4 w-32 bg-gray-200 rounded"></div>
                  <div className="h-3 w-24 bg-gray-200 rounded mt-1"></div>
                </div>
              ) : (
                <div className="text-right">
                  <p className="text-sm font-medium text-slate-900">
                    {dbUser?.name || 'Usuario'}
                  </p>
                  <p className="text-xs text-slate-500">
                    {dbUser?.email || clerkUser?.emailAddresses[0]?.emailAddress}
                  </p>
                </div>
              )}

              {/* Profile Button */}
              <Link href="/admin/profile">
                <Button variant="ghost" size="sm">
                  <User className="h-4 w-4" />
                </Button>
              </Link>
              <UserButton afterSignOutUrl="/" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}