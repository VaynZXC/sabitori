"use client";

import { Menu, Transition } from "@headlessui/react";
import { Fragment } from "react";

type Props = {
  avatarUrl?: string;
  onLogout: () => void;
};

export default function UserMenu({ avatarUrl, onLogout }: Props) {
  return (
    <Menu as="div" className="relative inline-block text-left">
      {/* Кнопка‑тригер */}
      <Menu.Button className="flex items-center justify-center focus:outline-none">
        <img
          src={avatarUrl || "/avatar-placeholder.png"}
          alt="User avatar"
          className="h-10 w-10 rounded-full bg-black"
        />
      </Menu.Button>

      {/* Плавное появление меню */}
      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        {/* Позиционирование и стили меню */}
        <Menu.Items className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-[#1e2030] ring-1 ring-black ring-opacity-20 focus:outline-none">
          <div className="py-1">
            {/* Пункты меню */}
            <Menu.Item>
              {({ active }) => (
                <a
                  href="/dashboard"
                  className={`block px-4 py-2 text-sm ${
                    active ? "bg-[#2a2c3e]" : ""
                  }`}
                >
                  Dashboard
                </a>
              )}
            </Menu.Item>

            <Menu.Item>
              {({ active }) => (
                <a
                  href="/settings"
                  className={`block px-4 py-2 text-sm ${
                    active ? "bg-[#2a2c3e]" : ""
                  }`}
                >
                  Settings
                </a>
              )}
            </Menu.Item>

            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={onLogout}
                  className={`w-full text-left px-4 py-2 text-sm ${
                    active ? "bg-[#2a2c3e]" : ""
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
  );
}
