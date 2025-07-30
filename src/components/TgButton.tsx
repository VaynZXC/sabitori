'use client';

import { oauthURL } from '@/lib/telegram';

export default function TgButton() {
  return (
    <div
      onClick={() => (window.location.href = oauthURL)}
      className="w-full h-13 rounded-xl bg-gradient-to-b
                 from-[#6f4dff] to-[#6540f0] grid place-content-center
                 text-white font-semibold cursor-pointer select-none">
      Войти через Telegram
    </div>
  );
}
