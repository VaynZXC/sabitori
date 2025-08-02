'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import UserMenu from '@/components/UserMenu';
import LoginModal from '@/components/LoginModal';

type User = { 
  id: string; 
  username?: string; 
  firstName?: string;
  avatar?: string; 
  level: number;
  plan: 'free' | 'base' | 'pro';
  createdAt: string;
  videoCount: number;
  email?: string;
};

export default function Header() {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true); // Опционально для лоадера
  const pathname = usePathname();

  useEffect(() => {
    setLoading(true);
    fetch('/api/user', { credentials: 'include' })
      .then(res => {
        if (!res.ok) throw new Error('Ошибка fetch');
        return res.json();
      })
      .then(data => setUser(data.user))
      .catch(err => {
        console.error(err);
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, [pathname]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
  };

  return (
    <>
      <header className="h-20 px-6 flex items-center justify-between bg-brand_blue shadow-md">
        <Link href="/" className="flex items-center gap-2 ml-[10px]">
          <img src="/logo2.png" alt="logo" className="h-14 w-auto" />
        </Link>

        <div className="flex items-center gap-4 mr-[10px]">
          {loading ? (
            <span>Загрузка...</span> // Опциональный лоадер
          ) : user ? (
            <UserMenu user={user} onLogout={handleLogout} />
          ) : (
            <button
              onClick={() => setOpen(true)}
              className="px-20 py-4 rounded-xl bg-[#1d233b] text-white font-semibold shadow-inner hover:bg-[#232b46] transition-colors mr-[10px]"
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