// src/lib/telegram.ts

const BOT_ID   = Number(process.env.NEXT_PUBLIC_TELEGRAM_BOT_ID);
const ORIGIN   = encodeURIComponent(process.env.NEXT_PUBLIC_ORIGIN!);
const REDIRECT = encodeURIComponent(process.env.NEXT_PUBLIC_REDIRECT_URL!);

export const oauthURL =
  `https://oauth.telegram.org/auth` +
  `?bot_id=${BOT_ID}` +
  `&origin=${ORIGIN}` +
  `&redirect_url=${REDIRECT}` +         // REDIRECT = https://sabitori.ru/api/auth/telegram
  `&request_access=write`;
