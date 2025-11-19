import { NextResponse } from "next/server";
import { readState, dataFile } from "@/app/helpers/getState";
import fs from "fs/promises";

export async function POST(req: Request) {
  const body = await req.json();
  const { roomid, reason } = body;

  const state = await readState("state.json");

  const roomIndex = state.rooms.findIndex((el) => {
    return el.roomId === Number(roomid)
  });

  if (roomIndex === -1) {
    return NextResponse.json({ error: "Room not found" }, { status: 404 });
  }

  const room = { ...state.rooms[roomIndex] };

  const roomNOIIsWorking = room.doctors.filter((doc) => !doc.isWorking);
  const roomIsWorking = room.doctors.filter((doc) => doc.isLunch);
  const roomNOInLunch = room.doctors.filter((doc) => !doc.isLunch);
  const roomInLunch = room.doctors.filter((doc) => doc.isLunch);

  const isWorkingNolunch = room.doctors.filter((doc) => {
    if (doc.isWorking && !doc.isLunch) {
      return doc
    };

  })
  const isWorkinglunch = room.doctors.filter((doc) => {
    if (doc.isWorking && doc.isLunch) {
      return doc
    }
  });

  if (roomIsWorking && isWorkingNolunch.length === 0) {
    return NextResponse.json(
      { error: "No available doctors (all on lunch)" },
      { status: 400 }
    );
  }

  if (isWorkingNolunch.length === 0) {
    return NextResponse.json(
      { error: "No available doctors (all on lunch or working end)" },
      { status: 400 }
    );
  }

  let lastActiveId = room.active;

  const maxId = Math.max(...isWorkingNolunch.map((d) => d.id));
  let nextDoctor = null;
  let attempts = 0;

  while (!nextDoctor && attempts <= room.doctors.length) {
    lastActiveId++;
    if (lastActiveId > maxId) lastActiveId = 0;
    nextDoctor = isWorkingNolunch.find((doc) => {
      if (doc.id === lastActiveId) return doc
    })
    attempts++;
  }

  if (!nextDoctor) {
    return NextResponse.json({ error: "Next doctor not found" }, { status: 404 });
  }

  room.doctors = room.doctors.map((doc) => {
    if (isWorkingNolunch.length === 1) { return doc }
    if (doc.id === room.active) return { ...doc, isNext: false };
    if (doc.id === nextDoctor.id) return { ...doc, isNext: true };
    return doc;
  });

  const now = new Date();

  const validTime = () => {
    const min: number = now.getMinutes();
    const minutes = min < 10 ? `0${min}` : String(min)
    const h: number = now.getHours();
    const hours = h < 10 ? `0${h}` : String(h)
    return `${hours}:${minutes}`
  }

  const prevDoctorIndex = room.doctors.findIndex((d) => d.id === room.active);
  if (prevDoctorIndex !== -1) {
    const prevDoctor = room.doctors[prevDoctorIndex];
    if (reason && reason.trim() !== "") {
      prevDoctor.counterSkip = (prevDoctor.counterSkip || 0) + 1;
      room.messages.push(
        `${prevDoctor.name} пропустил(а) очередь в ${validTime()}. Причина: ${reason}`
      );
    } else {
      prevDoctor.counter = (prevDoctor.counter || 0) + 1;
    }
  }

  room.active = nextDoctor.id;
  state.rooms[roomIndex] = room;
  await fs.writeFile(dataFile("state.json"), JSON.stringify(state, null, 2));

  return NextResponse.json({
    nextDoctor: nextDoctor.name,
    nextDoctorId: nextDoctor.id,
    roomNOInLunch,
    roomInLunch,
    isWorkingNolunch,
    room
  });
}

