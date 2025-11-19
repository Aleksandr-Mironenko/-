import { NextResponse } from "next/server";
import { readState, dataFile } from '@/app/helpers/getState'
import fs from "fs/promises";
import { Doctor } from '@/app/DTO'

export async function POST(req: Request) {

  let newDoctor: Doctor | null = null;

  const { roomId, password, name, timeStartWork, timeEndWork, lunch } = await req.json();

  if (!roomId || !name || !timeStartWork || !timeEndWork || !lunch || !password) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  let id = 0

  const state = await readState("state.json");

  const stateSecure = await readState("state-password.json");

  const foundRoom = stateSecure.rooms.find(room => room.roomId === Number(roomId));

  if (!foundRoom || foundRoom?.roomPassword !== password) {
    return NextResponse.json({ ok: false, error: "Invalid room ID or password" }, { status: 401 });
  }

  const correctTime = (elem: string): number => {
    const [hours, minutes] = elem.split(':').map(Number);
    return minutes ? Number(hours) * 60 + Number(minutes) : Number(hours) * 60
  }

  const correctTimeString = (elem: string): string => {
    const [hours, minutes] = elem.split(':').map(Number);
    return minutes ? `${hours}:${minutes}` : `${hours}:00`
  }


  const stringTime = (start: string, end: string): string => {

    return `Начал(а) работать:${correctTimeString(start)}. Закончит работать:${correctTimeString(end)}`
  }


  const updatedRooms = state.rooms.map(el => {
    if (el.roomId === Number(roomId)) {
      if (!Array.isArray(el.doctors)) {
        el.doctors = [];
      }

      newDoctor = <Doctor>{
        id: el.doctors.length ? Math.max(...el.doctors.map(d => d.id)) + 1 : 0,
        name,
        startWork: correctTime(timeStartWork),
        endWork: correctTime(timeEndWork),
        lunchTime: correctTime(lunch),
        counter: 0,
        counterSkip: 0,
        isNext: el.doctors.length === 0,
        isWorking: false,
        isLunch: false,
        congratulations: false,
        workTime: stringTime(timeStartWork, timeEndWork),
        finishedEarlierThanExpected: false
      };

      id = newDoctor.id;

      return { ...el, doctors: [...el.doctors, newDoctor] };
    }
    return el;
  });

  if (!newDoctor) {
    return NextResponse.json({ error: `Room with id ${roomId} not found` }, { status: 404 });
  }

  const newState = { rooms: updatedRooms };
  await fs.writeFile(dataFile("state.json"), JSON.stringify(newState, null, 2));

  const save = NextResponse.json({ id, roomId, newDoctor });

  save.cookies.set({
    name: "userId",
    value: String(id),
    httpOnly: true,
    sameSite: "strict",
    maxAge: 60 * 60 * 14,
    path: "/",
  });
  return save;

}
