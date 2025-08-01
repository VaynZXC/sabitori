// src/components/LoginModal.tsx
'use client';

import Script from "next/script";
import TgButton from "@/components/TgButton";

interface LoginModalProps {
  onClose: () => void;
}

export default function LoginModal({ onClose }: LoginModalProps) {
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
          
          {/* ——— Крестик для закрытия ——— */}
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

          {/* Кнопка Telegram (виджет её заменит) */}
          <TgButton />
        </div>
      </div>
    </>
  );
}
