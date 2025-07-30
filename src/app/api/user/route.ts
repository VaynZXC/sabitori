// src/app/api/user/route.ts
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

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
    return NextResponse.json({ user: data });
  } catch {
    return NextResponse.json({ user: null });
  }
}
