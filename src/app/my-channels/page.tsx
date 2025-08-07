"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from 'next/image';

// Интерфейс для пользователя (на основе твоего API)
interface User {
  id: string;
  username?: string;
  avatar?: string;
  fullName?: string;
  email?: string;
  level?: number;
  plan?: string;
  createdAt?: string;
  videoCount?: number;
  // Добавим для статистики (расширь Prisma, если нужно)
  channelCount?: number;
  totalViews?: number;
  totalSubs?: number;
  earnedFromMonetization?: number; // Новая метрика
  channels?: Channel[]; // Массив каналов
}

interface Channel {
  id: string;
  name: string;
  subs: number;
  views: number;
  active: boolean;
  avatar?: string; // Добавили это поле (optional, чтобы могло быть undefined)
  // ... другие поля
}

export default function MyChannelsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch("/api/user");
        const data = await res.json();
        setUser(data.user);
      } catch (error) {
        console.error("Ошибка загрузки пользователя:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchUser();
  }, []);

  if (loading) {
    return <div className="text-center py-10">Загрузка...</div>;
  }

  if (!user) {
    return (
      <div className="text-center py-10">
        <p className="text-lg mb-4">Залогиньтесь, чтобы увидеть ваши каналы.</p>
        <Link href="/auth/login" className="bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-600">
          Войти
        </Link>
      </div>
    );
  }

  // Контент для залогиненных — блок каналов
  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-2xl font-bold mb-4 text-center">Ваши каналы</h2>
      {user.channels && user.channels.length > 0 ? (
        <div className="p-4 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#141722' }}>
          <div className="flex flex-row gap-4 w-full h-full">
            {user.channels.map((channel) => (
              <div key={channel.id} className="bg-gray-800 flex-1 flex items-center justify-center rounded-md text-6xl transition-transform duration-300 hover:-translate-y-2 hover:bg-gradient-to-r hover:from-gray-800 hover:to-gray-750">
                {/* Здесь вместо ? используй реальную иконку канала, если есть avatar */}
                <img src={channel.avatar || '/placeholder-channel.png'} alt={channel.name} className="w-full h-full object-cover rounded-md" />
              </div>
            ))}
            <Link href="/my-channels/create" className="flex-1">
              <div className="bg-gray-800 h-full flex items-center justify-center rounded-md text-6xl cursor-pointer transition-transform duration-300 hover:-translate-y-2 hover:bg-green-600">+</div>
            </Link>
          </div>
        </div>
      ) : (
        <div>
          <div className="p-4 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#141722' }}>
            <div className="flex flex-row gap-4 w-full h-34">
              <div className="bg-gray-800 flex-1 flex items-center justify-center rounded-md text-6xl transition-transform duration-300 hover:-translate-y-2 hover:bg-gradient-to-r hover:from-gray-800 hover:to-gray-750">?</div>
              <div className="bg-gray-800 flex-1 flex items-center justify-center rounded-md text-6xl transition-transform duration-300 hover:-translate-y-2 hover:bg-gradient-to-r hover:from-gray-800 hover:to-gray-750">?</div>
              <div className="bg-gray-800 flex-1 flex items-center justify-center rounded-md text-6xl transition-transform duration-300 hover:-translate-y-2 hover:bg-gradient-to-r hover:from-gray-800 hover:to-gray-750">?</div>
              <div className="bg-gray-800 flex-1 flex items-center justify-center rounded-md text-6xl transition-transform duration-300 hover:-translate-y-2 hover:bg-gradient-to-r hover:from-gray-800 hover:to-gray-750">?</div>
              <div className="bg-gray-800 flex-1 flex items-center justify-center rounded-md text-6xl transition-transform duration-300 hover:-translate-y-2 hover:bg-gradient-to-r hover:from-gray-800 hover:to-gray-750">?</div>
              <div className="bg-gray-800 flex-1 flex items-center justify-center rounded-md text-6xl transition-transform duration-300 hover:-translate-y-2 hover:bg-gradient-to-r hover:from-gray-800 hover:to-gray-750">?</div>
              <Link href="/my-channels/create" className="flex-1">
                <div className="bg-gray-800 h-full flex items-center justify-center rounded-md text-6xl cursor-pointer transition-transform duration-300 hover:-translate-y-2 hover:bg-green-600">+</div>
              </Link>
            </div>
          </div>
          <p className="text-lg mt-4 text-center">У вас пока нет активных каналов.</p>
        </div>
      )}
    </div>
  );
}