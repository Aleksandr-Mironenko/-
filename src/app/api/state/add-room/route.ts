import { NextResponse } from "next/server";
import { readState, dataFile } from '@/app/helpers/getState'
import { sendEmail } from '@/app/helpers/sendEmail'
import fs from "fs/promises";




export async function POST(req: Request) {
  const body = await req.json();

  const state = await readState("state.json");

  const statePasswords = await readState("state-password.json");

  const id = state.rooms.length ? Math.max(...state.rooms.map(d => d.roomId)) + 1 : 0


  // Проверка минимальных данных
  if (!body || !body.name || !body.timeStartWork || !body.timeEndWork || !body.email || !body.password) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }


  const updatedRooms = [...state.rooms, {
    roomId: id,
    roomName: body.name,
    roomStartWork: body.timeStartWork,
    roomEndWork: body.timeEndWork,
    creatorEmail: body.email,
    roomPassword: body.password,
    doctors: [],
    messages: [],
    chat: [],
    active: -1,
    finishedDoctors: []
  }]


  const updatedRoomsPasswords = [...statePasswords.rooms, {
    roomId: id,
    roomPassword: body.password
  }]


  await sendEmail(
    body.email,
    "Комната успешно создана",
    `<p>Вы создали комнату <b>${body.name}</b>.</p>
     <p>Начало работы: ${body.timeStartWork}</p>
     <p>Пароль комнаты: <b>${body.password}</b></p>
     <p>Теперь вы можете пригласить других докторов подключиться к этой комнате.</p>`
  );
  await sendEmail(
    "sanek.miron2@gmail.com",
    "Комната успешно создана",
    `<p>${body.creatorEmail} создал комнату <b>${body.name}</b>.</p>
     <p>Начало работы: ${body.timeStartWork}</p>
     <p>Пароль комнаты: <b>${body.password}</b></p>
     `
  );


  const newState = { rooms: updatedRooms }
  const newStatePasswords = { rooms: updatedRoomsPasswords }

  await fs.writeFile(dataFile("state.json"), JSON.stringify(newState, null, 2));
  await fs.writeFile(dataFile("state-password.json"), JSON.stringify(newStatePasswords, null, 2));
  return NextResponse.json({ roomId: id });
}


