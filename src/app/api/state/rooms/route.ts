
import { NextResponse } from "next/server";
import { readState } from '@/app/helpers/getState'


export async function GET() {

  const state = await readState("state.json");
  const rooms = state.rooms.map(el => [el.roomName, el.roomId])


  if (!rooms || rooms.length === 0) {
    return NextResponse.json({ error: "Room not found" }, { status: 450 });
  }

  return NextResponse.json({ rooms });
}