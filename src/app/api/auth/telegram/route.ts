// src/app/api/auth/telegram/route.ts
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

const BOT_TOKEN   = process.env.BOT_TOKEN!;
const JWT_SECRET  = process.env.JWT_SECRET!;   // создайте в .env.local
const prisma      = new PrismaClient();

export async function GET(req: NextRequest) {
  const data = Object.fromEntries(req.nextUrl.searchParams) as Record<string, string>;

  // …проверка hash как раньше…

  // 4. upsert в БД
  const user = await prisma.user.upsert({
    where: { id: data.id },
    create: {
      id:        data.id,
      username:  data.username,
      firstName: data.first_name,
      avatar:    data.photo_url,
    },
    update: {
      username:  data.username,
      firstName: data.first_name,
      avatar:    data.photo_url,
    },
  });

  // 5. генерим JWT и кладём его в cookie
  const token = jwt.sign(
    { id: user.id, username: user.username, avatar: user.avatar },
    JWT_SECRET,
    { expiresIn: "7d" }
  );

  const res = NextResponse.redirect(new URL("/dashboard", req.url));
  res.cookies.set("token", token, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === "production",
    path:     "/",
    maxAge:   60 * 60 * 24 * 7,
  });

  return res;
}
