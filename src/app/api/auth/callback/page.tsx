'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    console.log('useEffect запущен: Проверяем hash...');  // Лог 1: Запуск эффекта
    const hash = window.location.hash;
    console.log('Hash из URL:', hash);  // Лог 2: Что в hash

    if (hash.startsWith('#tgAuthResult=')) {
      console.log('Hash найден, обрабатываем...');  // Лог 3: Нашли tgAuthResult
      const tgAuthResult = hash.substring('#tgAuthResult='.length);
      try {
        const decoded = atob(tgAuthResult);
        console.log('Декодированные данные:', decoded);  // Лог 4: После base64 decode
        const userData = JSON.parse(decoded);
        console.log('Парсенные данные:', userData);  // Лог 5: JSON объект

        fetch('/api/auth/telegram', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(userData),
        }).then(response => {
          console.log('Ответ от fetch:', response.status);  // Лог 6: Статус от API
          if (response.ok) {
            console.log('Успех: Очищаем hash и редирект');  // Лог 7: Всё ок
            window.history.replaceState({}, document.title, window.location.pathname);
            router.push('/dashboard');
          } else {
            console.error('Ошибка backend:', response.statusText);
          }
        }).catch(err => console.error('Ошибка fetch:', err));
      } catch (err) {
        console.error('Ошибка декодирования:', err);
      }
    } else {
      console.log('Hash не найден, редирект на главную');  // Лог 8: Нет hash
      router.push('/');
    }
  }, [router]);

  return <div>Авторизация... (проверь консоль F12)</div>;  // Лоадер с подсказкой
}