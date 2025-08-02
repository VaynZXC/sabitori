import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.JWT_SECRET as string;

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json({ message: 'Заполните все поля' }, { status: 400 });
    }

    // Поиск пользователя
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user || !user.password) {
      return NextResponse.json({ message: 'Неверный логин или пароль' }, { status: 401 });
    }

    // Проверка пароля
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return NextResponse.json({ message: 'Неверный логин или пароль' }, { status: 401 });
    }

    // Генерация JWT
    const token = jwt.sign({ userId: user.id, username: user.username }, SECRET_KEY, { expiresIn: '1h' });

    // Установка куки
    const response = NextResponse.json({ message: 'Логин успешный', user: { id: user.id, username: user.username } });
    response.cookies.set('authToken', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', maxAge: 3600 });

    return response;
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Ошибка сервера' }, { status: 500 });
  }
}