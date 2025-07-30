const BOT_ID = 8211248151;                                 // цифры до ":" 8211248151:AAHl8JusPgq_Bjj0iGs5NaxVdn49ranYMcw
const BASE   = process.env.BASE_URL!;                        // https://…ngrok…
const ORIGIN   = encodeURIComponent("https://1158d6625f61.ngrok-free.app");
const REDIRECT = encodeURIComponent("https://1158d6625f61.ngrok-free.app/api/auth/telegram");

export const oauthURL =
  `https://oauth.telegram.org/auth` +
  `?bot_id=${BOT_ID}` +
  `&origin=${ORIGIN}` +
  `&redirect_uri=${REDIRECT}` +
  `&embed=1` +
  `&request_access=write`;