'use client';  // ← Добавьте это в начало, чтобы файл стал клиентским

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const hash = window.location.hash;
    if (hash.startsWith('#tgAuthResult=')) {
      const tgAuthResult = hash.substring('#tgAuthResult='.length);
      try {
        const decoded = atob(tgAuthResult);  // Декодируем base64
        const userData = JSON.parse(decoded);  // Парсим JSON

        // Отправляем POST на backend
        fetch('/api/auth/telegram', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(userData),
        }).then(response => {
          if (response.ok) {
            window.history.replaceState({}, document.title, window.location.pathname);  // Очищаем hash
            router.push('/dashboard');  // Редирект на дашборд
          } else {
            console.error('Ошибка backend:', response.statusText);
          }
        }).catch(err => console.error('Ошибка fetch:', err));
      } catch (err) {
        console.error('Ошибка декодирования:', err);
      }
    }
  }, [router]);  // Зависимость от router

  return (
    <div className="text-white p-4 rounded-xl">
      Главная страница
    </div>
  );
}