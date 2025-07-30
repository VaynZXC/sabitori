// src/components/Header.tsx
'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';    // ← обязательно
import Link from 'next/link';
import UserMenu from '@/components/UserMenu';
import LoginModal from '@/components/LoginModal';

type User = { id: string; username?: string; avatar?: string };

export default function Header() {
  const [open, setOpen]   = useState(false);
  const [user, setUser]   = useState<User | null>(null);
  const pathname          = usePathname();       // ← хук отслеживает URL

  // При любом изменении пути (например: на /dashboard после логина)
  // заново фетчим /api/user и обновляем user‑стейт
  useEffect(() => {
    fetch('/api/user', { credentials: 'include' })
      .then(res => res.json())
      .then(data => setUser(data.user))
      .catch(() => setUser(null));
  }, [pathname]);                                 // ← задаём зависимость

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
  };

  return (
    <>
      <header className="h-20 px-6 flex items-center justify-between bg-brand_blue shadow-md">
        <Link href="/" className="flex items-center gap-2 ml-[10px]">
          <img src="/logo.png" alt="logo" className="h-14 w-auto" />
        </Link>

        <div className="flex items-center gap-4 mr-[10px]">
          {user ? (
            <UserMenu avatarUrl={user.avatar} onLogout={handleLogout} />
          ) : (
            <button
              onClick={() => setOpen(true)}
              className="
                px-20 py-4
                rounded-xl
                bg-[#1d233b]
                text-white font-semibold
                shadow-inner
                hover:bg-[#232b46]
                transition-colors
                mr-[10px]
              "
            >
              Login
            </button>
          )}
        </div>
      </header>

      {open && <LoginModal onClose={() => setOpen(false)} />}
    </>
  );
}
