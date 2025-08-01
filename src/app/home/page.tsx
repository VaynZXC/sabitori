"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

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
  avatar?: string; // Добавил это поле как опциональное
  // ... другие поля
}

export default function HomePage() {
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
    // Лендинг для не-залогиненных
    return (
      <div className="max-w-4xl mx-auto py-10 text-center">
        <h1 className="text-4xl font-bold mb-6">Добро пожаловать в SABITORI! 😊</h1>
        <p className="text-lg mb-4">
          SABITORI — это инструмент для YouTube-креаторов, который упрощает создание и управление фермами каналов. Здесь вы можете генерировать сценарии, озвучку, фоны, эффекты и субтитры без монтажа. Идеально для масштабирования без потери качества!
        </p>
        <p className="text-lg mb-6">
          Сервис доступен по подписке — всего 299$ в месяц.
        </p>
        <Link href="/auth/login" className="bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-600">
          Залогиньтесь или зарегистрируйтесь
        </Link>
      </div>
    );
  }

  // Контент для залогиненных
  return (
    <div className="flex flex-col gap-6">
      {/* Приветствие и описание сверху */}
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Добро пожаловать в SABITORI! 😊</h1>
        <p className="text-lg mb-6 max-w-3xl mx-auto">
          SABITORI — это инструмент для YouTube-креаторов, который упрощает создание и управление фермами каналов. Здесь вы можете генерировать сценарии, озвучку, фоны, эффекты и субтитры без монтажа. Идеально для масштабирования без потери качества!
        </p>
      </div>

      {/* Основной контент: статистика слева, каналы справа */}
      <div className="flex flex-col md:flex-row gap-6 items-stretch">
        {/* Левая часть: Статистика */}
        <div className="w-full md:w-1/4">
          <h2 className="text-2xl font-bold mb-4 text-center">Статистика</h2>
          <div className="p-4 rounded-lg" style={{ backgroundColor: '#141722' }}>
            <div className="space-y-2">
              <p className="text-xl font-semibold tracking-wide">Активные каналы: {user.channelCount || 0}</p>
              <p className="text-xl font-semibold tracking-wide">Просмотры: {user.totalViews || 0}</p>
              <p className="text-xl font-semibold tracking-wide">Подписчики: {user.totalSubs || 0}</p>
              <p className="text-xl font-semibold tracking-wide">Заработано с монетизации: {user.earnedFromMonetization || 0}$</p>
            </div>
          </div>
        </div>

        {/* Правая часть: Каналы */}
        <div className="w-full md:w-3/4">
          <h2 className="text-2xl font-bold mb-4 text-center">Ваши каналы</h2>
          {user.channels && user.channels.length > 0 ? (
            <div className="p-4 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#141722' }}>
              <div className="flex flex-row gap-4 w-full h-full">
                {user.channels.map((channel) => (
                  <div key={channel.id} className="bg-gray-800 flex-1 flex items-center justify-center rounded-md text-6xl transition-transform duration-300 hover:-translate-y-2 hover:bg-gradient-to-r hover:from-gray-800 hover:to-gray-700">
                    {/* Здесь вместо ? используй реальную иконку канала, если есть avatar */}
                    <img src={channel.avatar || '/placeholder-channel.png'} alt={channel.name} className="w-full h-full object-cover rounded-md" />
                  </div>
                ))}
                <Link href="/my-channels/create" className="bg-gray-800 flex-1">
                  <div className="h-full flex items-center justify-center rounded-md text-6xl cursor-pointer transition-transform duration-300 hover:-translate-y-2 hover:bg-gradient-to-r hover:from-gray-800 hover:to-gray-700">+</div>
                </Link>
              </div>
            </div>
          ) : (
            <div>
              <div className="p-4 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#141722' }}>
                <div className="flex flex-row gap-4 w-full h-34">
                  <div className="bg-gray-800 flex-1 flex items-center justify-center rounded-md text-6xl transition-transform duration-300 hover:-translate-y-2 hover:bg-gradient-to-r hover:from-gray-800 hover:to-gray-700">?</div>
                  <div className="bg-gray-800 flex-1 flex items-center justify-center rounded-md text-6xl transition-transform duration-300 hover:-translate-y-2 hover:bg-gradient-to-r hover:from-gray-800 hover:to-gray-700">?</div>
                  <div className="bg-gray-800 flex-1 flex items-center justify-center rounded-md text-6xl transition-transform duration-300 hover:-translate-y-2 hover:bg-gradient-to-r hover:from-gray-800 hover:to-gray-700">?</div>
                  <div className="bg-gray-800 flex-1 flex items-center justify-center rounded-md text-6xl transition-transform duration-300 hover:-translate-y-2 hover:bg-gradient-to-r hover:from-gray-800 hover:to-gray-700">?</div>
                  <div className="bg-gray-800 flex-1 flex items-center justify-center rounded-md text-6xl transition-transform duration-300 hover:-translate-y-2 hover:bg-gradient-to-r hover:from-gray-800 hover:to-gray-700">?</div>
                  <div className="bg-gray-800 flex-1 flex items-center justify-center rounded-md text-6xl transition-transform duration-300 hover:-translate-y-2 hover:bg-gradient-to-r hover:from-gray-800 hover:to-gray-700">?</div>
                  <Link href="/my-channels/create" className="bg-gray-800 flex-1">
                    <div className="h-full flex items-center justify-center rounded-md text-6xl cursor-pointer transition-transform duration-300 hover:-translate-y-2 hover:bg-gradient-to-r hover:from-gray-800 hover:to-gray-700">+</div>
                  </Link>
                </div>
              </div>
              <p className="text-lg mt-4 text-center">У вас пока нет активных каналов.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}