import { NextResponse } from "next/server";
import { readState, dataFile } from "@/app/helpers/getState";
import fs from "fs/promises";

export async function POST(req: Request) {
  const body = await req.json();
  const { roomid, message, id } = body;

  // Загружаем текущее состояние
  const state = await readState("state.json");

  // Находим комнату
  const roomIndex = state.rooms.findIndex((el) => el.roomId === Number(roomid));

  if (roomIndex === -1) {
    return NextResponse.json({ error: "Room not found" }, { status: 404 });//если неверно передана комната
  }

  const now = new Date();

  const validTime = () => {
    const min: number = now.getMinutes();
    const minutes = min < 10 ? `0${min}` : String(min)
    const h: number = now.getHours();
    const hours = h < 10 ? `0${h}` : String(h)
    return `${hours}:${minutes}`
  }

  const room = { ...state.rooms[roomIndex] };
  const findDoctorIdex = room.doctors.findIndex(el => el.id == id)

  if (message !== '' && message !== undefined && message !== null) {
    room?.chat?.unshift({
      time: validTime(),
      id: room.chat.length ? Math.max(...room.chat.map(d => d.id)) + 1 : 0,
      name: room.doctors[findDoctorIdex].name,
      message: message
    })



    state.rooms[roomIndex] = room;
    await fs.writeFile(dataFile("state.json"), JSON.stringify(state, null, 2));



    return NextResponse.json({
      ok: true, message: message
    });
  }
  else {
    return NextResponse.json({
      ok: false
    })
  }
}
