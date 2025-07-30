/* components/LoginModal.tsx */
'use client';

import Script from "next/script";
import TgButton from "@/components/TgButton";

export default function LoginModal({ onClose }: { onClose: () => void }) {
  return (
    <>
      {/* Telegram widget: когда загрузится, сам заменит innerHTML контейнера */}
      <Script
        src="https://telegram.org/js/telegram-widget.js?22"
        data-telegram-login="ToriStory_authbot"           // без @
        data-size="large"
        data-userpic="false"
        data-auth-url="/api/auth/telegram"           // наш callback
        strategy="lazyOnload"
        />

      {/* overlay */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      {/* dialog */}
      <div className="fixed inset-0 grid place-content-center z-50">
        <div className="w-[440px] max-w-[90vw] rounded-2xl bg-navbar p-8 text-center text-nav relative">

          {/* ——— КРЕСТИК ——— */}
         <button
           onClick={onClose}
           className="absolute right-3 top-3 text-white/60 hover:text-white
                      text-xl leading-none cursor-pointer select-none"
           aria-label="Закрыть"
         >
           ×
         </button>

          {/* logo */}
          <img src="/logo.png" alt="ToriStory" className="h-12 mx-auto mb-6" />

        <hr className="border-white/10 mb-6" />

          {/* headline */}
          <h2 className="text-white text-xl font-extrabold tracking-wide mb-4">
            ДОБРО ПОЖАЛОВАТЬ!
          </h2>

          {/* copy */}
          <p className="text-nav mb-6 leading-relaxed">
            Построй собственную&nbsp;фабрику историй: задай тему — ToriStory сам
            напишет сценарий, озвучит, наложит эффекты и&nbsp;отдаст готовый ролик.
            Никакой рутины, только творческий контроль.
          </p>

          <hr className="border-white/10 mb-6" />

          {/* ——— КНОПКА Telegram (виджет заменит) ——— */}
          <TgButton />
          {/* <div
            id="telegram-login-button"
            className="w-full h-[52px] rounded-xl bg-gradient-to-b
                       from-[#6f4dff] to-[#6540f0] grid place-content-center
                       text-white font-semibold text-sm cursor-pointer select-none"
          >
            Войти через Telegram
          </div> */}
          {/* <div className="w-full flex justify-center mt-6">
            <script
                async
                src="https://telegram.org/js/telegram-widget.js?22"
                data-telegram-login="USERNAME_bot"      // ← замените на имя бота (без @)
                data-size="large"                       // large | medium | small
                data-userpic="false"
                data-auth-url="/api/auth/telegram"      // ваш callback
                data-request-access="write"
                data-radius="10"                        // скругление, можно убрать
            ></script>
            </div> */}
        </div>
      </div>
    </>
  );
}
