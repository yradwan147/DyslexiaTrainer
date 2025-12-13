'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';

const navItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
  { href: '/admin/participants', label: 'Participants', icon: '👥' },
  { href: '/admin/studies', label: 'Studies', icon: '📚' },
  { href: '/admin/export', label: 'Export Data', icon: '📥' },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?mode=researcher');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-12 w-12 border-4 border-primary-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 w-64 bg-slate-800 text-white">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <span className="text-3xl">🧠</span>
            <div>
              <div className="font-bold">Visual Training</div>
              <div className="text-sm text-slate-400">Admin Panel</div>
            </div>
          </div>

          <nav className="space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                  pathname === item.href
                    ? 'bg-primary-500 text-white'
                    : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-slate-700">
          <div className="text-sm text-slate-400 mb-2">
            Signed in as
          </div>
          <div className="font-medium mb-4">{session?.user?.email}</div>
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="w-full px-4 py-2 text-sm bg-slate-700 hover:bg-slate-600 rounded-xl transition-colors"
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="ml-64 p-8">
        {children}
      </main>
    </div>
  );
}

