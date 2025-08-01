// src/components/UserMenu.tsx
'use client';

import { Menu, Transition } from '@headlessui/react';
import Link from 'next/link';
import { Fragment, useState } from 'react';
import EditProfileModal from '@/components/EditProfileModal';

type Props = {
  user: {
    avatar?: string;
    username?: string;
    fullName?: string;
    level: number;
    plan: string;
    id: string;
    createdAt: string;
    videoCount: number;
    email?: string;
  };
  onLogout: () => void;
};

export default function UserMenu({ user, onLogout }: Props) {
  const [editOpen, setEditOpen] = useState(false);

  const formattedDate = user.createdAt && !isNaN(new Date(user.createdAt).getTime())
    ? new Date(user.createdAt).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' })
    : new Date().toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });

  const displayName = user.fullName || user.username || 'Пользователь';

  return (
    <>
      <Menu as="div" className="relative inline-block text-left">
        <Menu.Button
          className="
            flex items-center space-x-3
            bg-[#1c2335]
            hover:bg-[#31354b]
            px-5 py-2
            rounded-lg
            transition
            focus:outline-none
          "
        >
          <img
            src={user.avatar || '/avatar-placeholder.png'}
            alt="User avatar"
            className="h-8 w-8 rounded-full object-cover"
          />
          <span className="text-white text-sm font-medium truncate max-w-[10ch]">
            {displayName}
          </span>
          <div
            className="
              flex items-center justify-center
              bg-[#3b3f54]
              w-6 h-6
              rounded
            "
          >
            <i className="ri-arrow-down-s-line text-white text-base" />
          </div>
        </Menu.Button>

        <Transition
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <Menu.Items className="origin-top-right absolute right-0 mt-2 w-64 rounded-xl shadow-lg bg-profile ring-1 ring-black ring-opacity-20 focus:outline-none z-50 bg-gradient-to-br from-[#1e2030] to-[#2a2c3e]">
            <div className="py-4 px-4">  {/* Компактнее padding */}
              {/* Профиль-инфо с центрированием */}
              <div className="flex flex-col items-center mb-4">
                <img
                  src={user.avatar || '/avatar-placeholder.png'}
                  alt="User avatar"
                  className="h-12 w-12 rounded-full object-cover mb-2 shadow-md" 
                />
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold">{displayName}</h3>  {/* Меньше, жирный */}
                  <button onClick={() => setEditOpen(true)} className="text-gray-400 hover:text-white">
                    <i className="ri-pencil-line text-base" />
                  </button>
                </div>
              </div>

              {/* Уровень */}
              <div className="mb-3">
                <div className="flex justify-between text-base mb-1">  {/* Меньше шрифт */}
                  <span className="font-bold flex items-center"><i className="ri-star-line mr-1 text-sm"></i>Уровень: </span>
                  <span className="font-normal">{user.level}</span>
                </div>
                <div className="bg-gray-700 rounded-full h-2 overflow-hidden relative glow-bar shadow-sm">  {/* Тоньше */}
                  <div
                    className="bg-blue-500 h-full rounded-full transition-all duration-300"
                    style={{ width: `${user.level}%` }}
                  />
                </div>
              </div>

              {/* План */}
              <div className="text-base mb-2 flex justify-between">  {/* Выравнивание justify-between */}
                <span className="font-bold flex items-center"><i className="ri-price-tag-3-line mr-1 text-sm"></i>План: </span>
                <span className="font-normal capitalize text-blue-400">{user.plan}</span>
              </div>

              {/* ID */}
              <div className="text-base mb-2 flex justify-between">
                <span className="font-bold">ID: </span>
                <span className="font-normal text-gray-300">{user.id}</span>
              </div>

              {/* Дата */}
              <div className="text-base mb-2 flex justify-between">
                <span className="font-bold">Создан: </span>
                <span className="font-normal text-gray-300">{formattedDate}</span>
              </div>

              {/* Видео */}
              <div className="text-base mb-4 flex justify-between">
                <span className="font-bold flex items-center"><i className="ri-video-line mr-1 text-sm"></i>Видео создано: </span>
                <span className="font-normal text-gray-300">{user.videoCount}</span>
              </div>

              {/* Разделитель */}
              <hr className="border-gray-600 my-2" />

              {/* Пункты меню */}
              <Menu.Item>
                {({ active }) => (
                  <Link
                    href="/dashboard"
                    className={`block px-2 py-2 text-base rounded-md transition ${
                      active ? 'bg-[#2a2c3e]' : ''
                    }`}
                  >
                    Личный кабинет
                  </Link>
                )}
              </Menu.Item>
              <Menu.Item>
                {({ active }) => (
                  <Link
                    href="/settings"
                    className={`block px-2 py-2 text-base rounded-md transition ${
                      active ? 'bg-[#2a2c3e]' : ''
                    }`}
                  >
                    Настройки
                  </Link>
                )}
              </Menu.Item>
              <Menu.Item>
                {({ active }) => (
                  <button
                    onClick={onLogout}
                    className={`w-full text-left px-2 py-2 text-base rounded-md transition ${
                      active ? 'bg-[#2a2c3e]' : ''
                    }`}
                  >
                    Выйти
                  </button>
                )}
              </Menu.Item>
            </div>
          </Menu.Items>
        </Transition>
      </Menu>

      {editOpen && (
        <EditProfileModal
          user={user}
          onClose={() => setEditOpen(false)}
          onSave={(updatedData) => {
            user.fullName = updatedData.fullName;
            user.email = updatedData.email;
            setEditOpen(false);
          }}
        />
      )}
    </>
  );
}