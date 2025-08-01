'use client';

import { useState, useEffect } from 'react';

type UserData = {
  id: string;
  username?: string;
  fullName?: string;
  avatar?: string;
  level: number;
  plan: 'free' | 'base' | 'pro';
  createdAt: string;
  videoCount: number;
  email?: string;
};

export default function Dashboard() {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/user', { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        setUser(data.user);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="text-center p-6 text-lg">Загрузка...</div>;
  }

  if (!user) {
    return <div className="text-center p-6 text-red-500 text-lg">Ошибка загрузки данных. Попробуйте заново войти.</div>;
  }

  const formattedDate = user.createdAt && !isNaN(new Date(user.createdAt).getTime())
    ? new Date(user.createdAt).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' })
    : new Date().toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Личный кабинет</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
        <div className="bg-profile p-8 rounded-xl shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl">  {/* Анимация подъёма */}
          <div className="flex flex-col items-center mb-6">
            <img
              src={user.avatar || '/avatar-placeholder.png'}
              alt="Аватар"
              className="h-20 w-20 rounded-full mb-4 shadow-md"
            />
            <div className="text-center">
              <h2 className="text-2xl font-bold">{user.fullName || user.username || 'Пользователь'}</h2>
              <p className="text-lg text-gray-400 font-normal">Email: {user.email || 'Не указан'}</p>
            </div>
          </div>
          <p className="text-lg mb-2 text-center"><span className="font-bold">ID: </span>{user.id}</p>
          <p className="text-lg mb-2 text-center"><span className="font-bold">Создан: </span>{formattedDate}</p>
        </div>

        <div className="bg-profile p-8 rounded-xl shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl">  {/* Анимация подъёма */}
          <h2 className="text-2xl font-bold mb-6 text-center">Статистика</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-4 border-b border-gray-600">
              <span className="font-bold text-lg flex items-center"><i className="ri-star-line mr-2"></i>Уровень: </span>
              <span className="text-xl font-normal">{user.level ?? 0}</span>
            </div>
            <div className="bg-gray-700 rounded-full h-3 shadow-md transition-all duration-300 glow-hover">  {/* Glow при наведении */}
              <div
                className="bg-blue-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${user.level ?? 0}%` }}
              />
            </div>
            <div className="flex justify-between pb-4 border-b border-gray-600">
              <span className="font-bold text-lg flex items-center"><i className="ri-price-tag-3-line mr-2"></i>План: </span>
              <span className="text-xl font-normal">{user.plan ? user.plan.charAt(0).toUpperCase() + user.plan.slice(1) : 'Free'}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-bold text-lg flex items-center"><i className="ri-video-line mr-2"></i>Создано видео: </span>
              <span className="text-xl font-normal">{user.videoCount ?? 0}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-profile p-8 rounded-xl shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl text-center">  {/* Анимация подъёма */}
        <h2 className="text-2xl font-bold mb-4">Текущие задачи</h2>
        <p className="text-lg text-gray-400 font-normal">Здесь будут отображаться ваши видео в процессе генерации. Пока задач нет.</p>
      </div>
    </div>
  );
}