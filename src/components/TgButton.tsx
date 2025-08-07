// src/components/TgButton.tsx
import React from 'react';
import clsx from 'clsx';
import { oauthURL } from '@/lib/telegram';

type TgButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

const TgButton: React.FC<TgButtonProps> = ({ className, onClick, ...rest }) => (
  <button
    type="button"
    {...rest}
    onClick={(e) => {
      onClick?.(e);
      if (!e.defaultPrevented) window.location.href = oauthURL;
    }}
    className={clsx(
      'w-full h-13 rounded-xl bg-gradient-to-b from-[#6f4dff] to-[#6540f0]',
      'grid place-content-center text-white font-semibold cursor-pointer select-none',
      className,
    )}
  >
    Войти через Telegram
  </button>
);

export default TgButton;
