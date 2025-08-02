import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.JWT_SECRET as string;

export async function POST(req: NextRequest) {
  try {
    const { username, password, firstName } = await req.json();

    if (!username || !password || !firstName) {
      return NextResponse.json({ message: 'Заполните все поля' }, { status: 400 });
    }

    // Проверка уникальности username
    const existingUser = await prisma.user.findUnique({ where: { username } });
    if (existingUser) {
      return NextResponse.json({ message: 'Username уже занят' }, { status: 409 });
    }

    // Хэширование пароля
    const hashedPassword = await bcrypt.hash(password, 10);

    // Генерация случайной аватарки: предполагаем 1-10.png, подкорректируй max по количеству файлов
    const randomAvatarNumber = Math.floor(Math.random() * 3) + 1; // От 1 до 10
    const avatarPath = `/avatars/${randomAvatarNumber}.png`;

    // Создание пользователя с дефолтной аватаркой
    const user = await prisma.user.create({
      data: {
        username,
        firstName,
        password: hashedPassword,
        avatar: avatarPath, // Добавляем случайный avatar
        plan: 'free',
      },
    });

    // Генерация JWT
    const token = jwt.sign({ userId: user.id, username: user.username }, SECRET_KEY, { expiresIn: '1h' });

    // Установка куки
    const response = NextResponse.json({ message: 'Регистрация успешна', user: { id: user.id, username: user.username } });
    response.cookies.set('authToken', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', maxAge: 3600 });

    return response;
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Ошибка сервера' }, { status: 500 });
  }
}