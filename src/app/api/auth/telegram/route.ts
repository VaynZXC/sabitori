// src/app/api/auth/telegram/route.ts
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

const BOT_TOKEN   = process.env.BOT_TOKEN!;
const JWT_SECRET  = process.env.JWT_SECRET!;
const prisma      = new PrismaClient();

// Интерфейс для данных от Telegram (чтобы избежать any)
interface TelegramData {
  id: number;
  username?: string;
  first_name?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
  [key: string]: string | number | undefined; // Добавили | undefined для optional полей
}

// Общая функция, обрабатывающая и GET, и POST
async function handleAuth(rawData: TelegramData) {
  // 0. Преобразуем id к строке, чтобы Prisma не жаловался
  const userId = String(rawData.id);

  // 1. Отделяем hash от остальных параметров
  const { hash, ...params } = rawData;

  // 2. Проверяем свежесть auth_date (не старше суток)
  if (Math.abs(Date.now() / 1000 - Number(params.auth_date)) > 86400) {
    return new NextResponse("Expired auth data", { status: 403 });
  }

  // 3. Собираем строку для HMAC
  const checkString = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join("\n");

  // 4. Генерируем HMAC на нашей стороне
  const secretKey = crypto.createHash("sha256").update(BOT_TOKEN).digest();
  const hmac      = crypto.createHmac("sha256", secretKey).update(checkString).digest("hex");

  // 5. Сравниваем его с пришедшим от Telegram
  if (hmac !== hash) {
    return new NextResponse("Invalid hash", { status: 403 });
  }

  try {
    // 6. upsert в БД
    const user = await prisma.user.upsert({
      where:  { id: userId },
      create: {
        id:        userId,
        username:  params.username,
        firstName: params.first_name,
        avatar:    params.photo_url,
      },
      update: {
        username:  params.username,
        firstName: params.first_name,
        avatar:    params.photo_url,
      },
    });

    // 7. Генерим JWT
    const token = jwt.sign({ userId: user.id, username: user.username, avatar: user.avatar }, JWT_SECRET, { expiresIn: "7d" });

    // 8. Редиректим на /dashboard и ставим куку
    const res = NextResponse.redirect(new URL("/dashboard", process.env.NEXT_PUBLIC_ORIGIN!));
    res.cookies.set("authToken", token, {
      httpOnly: true,
      secure:   process.env.NODE_ENV === "production",
      path:     "/",
      maxAge:   60 * 60 * 24 * 7,
    });
    return res;

  } catch (err) {
    console.error("Prisma Error in upsert:", err);
    return new NextResponse("Database error", { status: 500 });
  }
}

// Обработка GET-запроса (OAuth redirect с query-параметрами)
export async function GET(req: NextRequest) {
  const data = Object.fromEntries(req.nextUrl.searchParams) as TelegramData; 
  return handleAuth(data);
}

// Обработка POST-запроса (если вы используете client-side flow)
export async function POST(req: NextRequest) {
  const data = await req.json() as TelegramData; 
  return handleAuth(data);
}