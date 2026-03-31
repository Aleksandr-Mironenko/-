
import { NextResponse } from "next/server";
import { readState } from '@/app/helpers/getState'
import { Room } from '@/app/DTO'

export async function GET() {

  const state = await readState("state.json");
  const rooms = state.rooms
    .filter((el): el is Room => "roomName" in el)
    .map(el => [el.roomName, el.roomId]);


  if (!rooms || rooms.length === 0) {
    return NextResponse.json({ error: "Room not found" }, { status: 450 });
  }

  return NextResponse.json({ rooms });
}
