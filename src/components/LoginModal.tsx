// src/components/LoginModal.tsx
'use client';

import { useState } from 'react';
import Script from "next/script";
import TgButton from "@/components/TgButton";
import Image from 'next/image';

interface LoginModalProps {
  onClose: () => void;
}

export default function LoginModal({ onClose }: LoginModalProps) {
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState(''); // Для регистрации
  const [registerPassword, setRegisterPassword] = useState(''); // Отдельный state для пароля регистрации
  const [registerUsername, setRegisterUsername] = useState(''); // Отдельный state для username регистрации
  const [error, setError] = useState(''); // Общий для ошибок

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!username || !password) {
      setError('Заполните все поля');
      return;
    }
    try {
      // Placeholder: Вызов API для логина
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Ошибка логина');
      }
      // Успех: Закрой модалку и обнови сессию
      onClose();
      window.location.href = '/dashboard';
      // Добавьте редирект или обновление состояния пользователя здесь
    } catch (err: any) {
      setError(err.message || 'Неверный логин или пароль');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!registerUsername || !registerPassword || !firstName) {
      setError('Заполните все поля');
      return;
    }
    try {
      // Placeholder: Вызов API для регистрации
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: registerUsername, password: registerPassword, firstName }),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Ошибка регистрации');
      }
      // Успех: Можно автоматически залогинить или показать сообщение
      setShowRegisterForm(false);
      setShowLoginForm(true); // Переключить на логин после регистрации
      setError(''); // Очистить ошибки
      onClose();
      window.location.href = '/dashboard';
    } catch (err: any) {
      setError(err.message || 'Ошибка при регистрации');
    }
  };

  const toggleLoginForm = () => {
    setShowLoginForm(!showLoginForm);
    setShowRegisterForm(false); // Закрыть регистрацию, если открыта
    setError(''); // Очистить ошибки
  };

  const toggleRegisterForm = () => {
    setShowRegisterForm(!showRegisterForm);
    setShowLoginForm(false); // Закрыть логин, если открыт
    setError(''); // Очистить ошибки
  };

  return (
    <>
      {/* overlay */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      {/* dialog */}
      <div className="fixed inset-0 grid place-content-center z-50">
        <div className="w-[440px] max-w-[90vw] rounded-2xl bg-navbar p-8 text-center text-nav relative">
          
          {/* Крестик для закрытия */}
          <button
            onClick={onClose}
            className="absolute right-3 top-3 text-white/60 hover:text-white text-xl leading-none cursor-pointer select-none"
            aria-label="Закрыть"
          >
            ×
          </button>

          {/* Логотип */}
          <img src="/logo.png" alt="ToriStory" className="h-12 mx-auto mb-6" />

          <hr className="border-white/10 mb-6" />

          {/* Заголовок */}
          <h2 className="text-white text-xl font-extrabold tracking-wide mb-4">
            ДОБРО ПОЖАЛОВАТЬ!
          </h2>

          {/* Текст */}
          <p className="text-nav mb-6 leading-relaxed">
            Построй собственную&nbsp;фабрику историй: задай тему — ToriStory сам
            напишет сценарий, озвучит, наложит эффекты и&nbsp;отдаст готовый ролик.
            Никакой рутины, только творческий контроль.
          </p>

          <hr className="border-white/10 mb-6" />

          {/* Кнопка Telegram с рекомендацией */}
          <div className="relative">
            <TgButton className="hover:shadow-[0_0_15px_5px_rgba(168,85,247,0.12)] hover:bg-purple-700 transition-all duration-200" /> {/* Мягкое свечение с уменьшенной прозрачностью */}
            <span className="absolute top-[-20px] right-0 text-xs text-gray-400 font-semibold">Рекомендуется</span>
          </div>

          {/* Кнопка для показа формы логина */}
          <button
            onClick={toggleLoginForm}
            className="w-full mt-4 px-4 py-3 rounded-lg bg-blue-600 text-white font-semibold hover:shadow-[0_0_15px_5px_rgba(59,130,246,0.12)] hover:bg-blue-700 transition-all duration-200 h-[50px]"
          >
            Войти по логину и паролю
          </button>

          {/* Выезжающая форма логина (conditional rendering с анимацией) */}
          <div
            className={`overflow-hidden transition-all duration-300 ease-in-out ${
              showLoginForm ? 'max-h-96 opacity-100 mt-4' : 'max-h-0 opacity-0'
            }`}
          >
            <form onSubmit={handleLogin} className="space-y-4">
              <input
                type="text"
                placeholder="Логин (username)"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-gray-800 text-white placeholder-gray-400 border border-gray-600 focus:border-blue-500 focus:outline-none"
                required
                aria-required="true"
              />
              <input
                type="password"
                placeholder="Пароль"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-gray-800 text-white placeholder-gray-400 border border-gray-600 focus:border-blue-500 focus:outline-none"
                required
                aria-required="true"
              />
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <button
                type="submit"
                className="w-full px-4 py-3 rounded-lg bg-blue-600 text-white font-semibold hover:shadow-[0_0_15px_5px_rgba(59,130,246,0.12)] hover:bg-blue-700 transition-all duration-200"
              >
                Войти
              </button>
            </form>
            <p className="mt-4 text-sm text-gray-400">
              Нет аккаунта?{' '}
              <button
                onClick={toggleRegisterForm}
                className="text-blue-400 hover:underline"
              >
                Зарегистрироваться
              </button>
            </p>
          </div>

          {/* Выезжающая форма регистрации (аналогично) */}
          <div
            className={`overflow-hidden transition-all duration-300 ease-in-out ${
              showRegisterForm ? 'max-h-96 opacity-100 mt-4' : 'max-h-0 opacity-0'
            }`}
          >
            <form onSubmit={handleRegister} className="space-y-4">
              <input
                type="text"
                placeholder="Имя (firstName)"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-gray-800 text-white placeholder-gray-400 border border-gray-600 focus:border-blue-500 focus:outline-none"
                required
                aria-required="true"
              />
              <input
                type="text"
                placeholder="Логин (username)"
                value={registerUsername}
                onChange={(e) => setRegisterUsername(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-gray-800 text-white placeholder-gray-400 border border-gray-600 focus:border-blue-500 focus:outline-none"
                required
                aria-required="true"
              />
              <input
                type="password"
                placeholder="Пароль"
                value={registerPassword}
                onChange={(e) => setRegisterPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-gray-800 text-white placeholder-gray-400 border border-gray-600 focus:border-blue-500 focus:outline-none"
                required
                aria-required="true"
              />
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <button
                type="submit"
                className="w-full px-4 py-3 rounded-lg bg-blue-600 text-white font-semibold hover:shadow-[0_0_15px_5px_rgba(59,130,246,0.12)] hover:bg-blue-700 transition-all duration-200"
              >
                Зарегистрироваться
              </button>
            </form>
            <p className="mt-4 text-sm text-gray-400">
              Уже есть аккаунт?{' '}
              <button
                onClick={toggleLoginForm}
                className="text-blue-400 hover:underline"
              >
                Войти
              </button>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}