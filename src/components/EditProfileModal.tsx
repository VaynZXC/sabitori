// src/components/EditProfileModal.tsx
'use client';

import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useState } from 'react';

type Props = {
  user: {
    fullName?: string;
    email?: string;
  };
  onClose: () => void;
  onSave: (updatedData: { fullName: string; email: string }) => void;
};

export default function EditProfileModal({ user, onClose, onSave }: Props) {
  const [fullName, setFullName] = useState(user.fullName || '');
  const [email, setEmail] = useState(user.email || '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/user/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, email }),
      });
      if (response.ok) {
        onSave({ fullName, email });
      } else {
        alert('Ошибка сохранения');
      }
    } catch (err) {
      alert('Ошибка: ' + err);
    }
  };

  return (
    <Transition appear show as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-[#1e2030] p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-white">
                  Редактировать профиль
                </Dialog.Title>
                <form onSubmit={handleSubmit} className="mt-4">
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-300">Полное имя</label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white p-2"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-300">Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white p-2"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-600 rounded-md text-white">
                      Отмена
                    </button>
                    <button type="submit" className="px-4 py-2 bg-blue-500 rounded-md text-white">
                      Сохранить
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}