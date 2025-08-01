import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { prisma } from '@/lib/prisma';  // Новый импорт

const JWT_SECRET = process.env.JWT_SECRET!;

export async function GET(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  if (!token) {
    return NextResponse.json({ user: null });
  }
  try {
    const data = jwt.verify(token, JWT_SECRET) as {
      id: string;
      username?: string;
      avatar?: string;
    };

    // Теперь добавляем query в Prisma по id из JWT
    const userFromDB = await prisma.user.findUnique({
      where: { id: data.id },
      include: { videos: true },  // Для videoCount, если relation есть
    });

    if (!userFromDB) {
      return NextResponse.json({ user: null });
    }

    // Сочетаем данные из JWT и БД
    const user = {
      id: data.id,
      username: data.username,
      avatar: data.avatar,
      fullName: userFromDB.firstName,
      email: userFromDB.email,
      level: userFromDB.level,
      plan: userFromDB.plan,
      createdAt: userFromDB.createdAt ? userFromDB.createdAt.toISOString() : null,
      videoCount: userFromDB.videos ? userFromDB.videos.length : 0,
    };

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Ошибка в API /user:', error);
    return NextResponse.json({ user: null });
  }
}