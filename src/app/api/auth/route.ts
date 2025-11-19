import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";



const SECRET = process.env.JWT_SECRET

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("jwt")?.value;

  if (!token) {
    return NextResponse.json({ ok: false });
  }

  try {
    const decoded = jwt.verify(token, SECRET!) as { roomId: string, ok: boolean };
    const userId = cookieStore.get("userId")?.value;


    const roomId = decoded.roomId;

    return NextResponse.json({ userId, roomId, ok: true });

  } catch {
    return NextResponse.json({ ok: false });
  }
}
