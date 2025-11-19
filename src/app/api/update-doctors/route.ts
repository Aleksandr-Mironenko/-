
// Создаёшь api/update-doctors (см. пример выше)

// Регистрируешься на https://upstash.com

// В разделе Scheduler указываешь:

// URL: https://твойдомен/api/update-doctors

// Schedule: Every minute

// Готово — теперь Upstash будет дёргать твою API-функцию каждые 60 секунд.

// 





//https://console.upstash.com/qstash/request-builder?teamid=0

//🔹 1. В поле Место назначения

// Выбери тип URL
// и вставь туда адрес твоего Next.js API:

// https://твой-домен/api/update-doctors


// (замени на свой реальный домен или Vercel URL)

// 🔹 2. В блоке Тип

// Выбери вкладку «Расписание»
// (она справа от «Публиковать» и «Поставить в очередь»).

// 🔹 3. В появившихся полях укажи:

// Cron schedule →

// */1 * * * *


// (это каждую минуту)

// Body можешь оставить пустым, если твой эндпоинт не требует данных.

// Если нужно, добавь заголовки:

// {
//   "Content-Type": "application/json"
// }

// 🔹 4. Нажми «Отправлять» или «Создать»

// После этого QStash сохранит задачу, и она появится в разделе
// 📅 «Расписание» (вкладка справа от «Конструктор запросов»).

// 🔹 5. Проверь, что всё работает

// Перейди в:

// QStash → Расписание (Schedules)
// и убедись, что там есть твой URL и что он срабатывает.

import { NextResponse } from "next/server";
import { readState, dataFile } from '@/app/helpers/getState'
import fs from "fs/promises";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { sendEmail } from "@/app/helpers/sendEmail"

const SECRET = process.env.JWT_SECRET

export async function GET() {//тут бы изменить гет на пост с передачей значения комнаты чтобы не обновлять вообще все состояние хотя это сделает его более

  const cookieStore = await cookies();
  const token = cookieStore.get("jwt")?.value;

  let userIdInToken = undefined
  let roomIdInToken = undefined

  if (token) {
    const decodedInToken = jwt.verify(token, SECRET!) as { roomId: string, ok: boolean };
    userIdInToken = cookieStore.get("userId")?.value
    roomIdInToken = decodedInToken.roomId;
  }

  const { shouldDeleteCookies } = await updateDoctorStatuses({ userIdInToken, roomIdInToken });

  const res = NextResponse.json({ update: true, cookiesCleared: shouldDeleteCookies });

  if (shouldDeleteCookies) {
    res.cookies.set("userId", "", { maxAge: 0, path: "/" });
    res.cookies.set("jwt", "", { maxAge: 0, path: "/" })
    res.cookies.set("roomId", "", { maxAge: 0, path: "/" });
  }
  return res;
}



async function updateDoctorStatuses({ userIdInToken, roomIdInToken }) {
  const state = await readState("state.json");
  const statePassword = await readState("state-password.json");

  const now = new Date();

  const validTime = () => {
    const minutes: number = now.getMinutes();
    const hours: number = now.getHours();
    return hours * 60 + minutes
  }

  const stringValidTime = () => {
    const min: number = now.getMinutes();
    const minutes = min < 10 ? `0${min}` : String(min)
    const h: number = now.getHours();
    const hours = h < 10 ? `0${h}` : String(h)
    return `${hours}:${minutes}`
  }

  const updatedRooms = [...state.rooms]
  const updatedRoomsPassword = [...statePassword.rooms]
  const time = validTime()
  const znstringValidTime = stringValidTime()

  let shouldDeleteCookies = false;
  let nextDoc = []
  const funcDeleteAfterTime = (roomId, id) => {
    const indexRoomId = updatedRooms.findIndex(el => el.roomId == roomId)//ищу индекс комнаты которой айдишник передан
    const docId = updatedRooms[indexRoomId].doctors.findIndex(el => el.id == id)//ищу индекс доктора которого айдишник передан
    if (docId !== -1) {
      updatedRooms[indexRoomId].doctors.splice(docId, 1);
    } else {
    }
    if (
      userIdInToken &&
      userIdInToken == id &&
      roomIdInToken &&
      roomIdInToken == roomId
    ) {
      shouldDeleteCookies = true;
    }
  }

  const addFinishedDoctors = (roomId, doctor) => {
    const indexRoomId = updatedRooms.findIndex(el => el.roomId == roomId)
    const time = new Date().toISOString()
    updatedRooms[indexRoomId].finishedDoctors.push({ time, doctor })
  }
  const roomsToDelete = []
  for (const room of updatedRooms) {
    const doctorsToDelete = [];
    if (room.doctors.length !== 0) {
      for (const doctor of room.doctors) {
        let doctorEnd = doctor.endWork;
        let doctorLunch = doctor.lunchTime;
        const doctorStart = doctor.startWork
        if (time > doctorEnd && doctorEnd < doctorStart) {
          doctorEnd += 1440
          if (time > doctorLunch) {
            doctorLunch += 1440
          }
        }
        if (time > doctorEnd - 20 || doctor.finishedEarlierThanExpected) {
          doctor.isWorking = false
          if (doctor.isNext) {
            nextDoc = [...nextDoc, [doctor, room.roomId]]
          }
          addFinishedDoctors(room.roomId, doctor)
          doctorsToDelete.push(doctor.id);
        } else if (doctorStart <= time && time <= doctorEnd - 20) {
          doctor.isWorking = true
        } else if (doctorEnd < doctorStart && time <= doctorEnd - 20) {
          doctor.isWorking = true
        } else {
          doctor.isWorking = false
        }
        if ((time >= doctorLunch - 20) && doctorLunch + 60 >= (time)) {
          doctor.isLunch = true
          if (doctor.isNext) {
            nextDoc = [...nextDoc, [doctor, room.roomId]]
          }
        } else {
          doctor.isLunch = false
        }
        if (time === doctorEnd) {
          doctor.congratulations = true
        } else {
          doctor.congratulations = false
        }
      }
      for (const id of doctorsToDelete) {
        funcDeleteAfterTime(room.roomId, id);
      }
    }
    else {
      const findindexroomid = updatedRooms.findIndex(el => el.roomId == room.roomId)
      if (findindexroomid !== -1 && updatedRooms[findindexroomid].finishedDoctors.length !== 0) {
        roomsToDelete.push(room)
      }
    }
  }

  for (const [doctor, roomId] of nextDoc) {
    const roomIndex = updatedRooms.findIndex(r => r.roomId === roomId);
    if (roomIndex === -1) continue;

    const doctors = updatedRooms[roomIndex].doctors;

    doctors.forEach(d => d.isNext = false);

    const availableDoctors = doctors.filter(d => d.isWorking && !d.isLunch);
    if (availableDoctors.length === 0) {
      continue;
    }

    let lastActiveId = doctor.id;
    const minId = Math.min(...doctors.map(d => d.id));
    const maxId = Math.max(...doctors.map(d => d.id));
    let nextDoctor = null;
    let attempts = 0;


    while (!nextDoctor && attempts < doctors.length) {
      lastActiveId++;
      if (lastActiveId > maxId) lastActiveId = minId;
      nextDoctor = availableDoctors.find(d => d.id === lastActiveId);
      attempts++;
    }

    if (nextDoctor) {
      const nextIndex = doctors.findIndex(d => d.id === nextDoctor.id);
      doctors[nextIndex].isNext = true;
    }
    // else {
    //   console.log(`Не найден следующий доступный врач после ${doctor.id} (roomId: ${roomId})`);
    // }
  }

  for (const rooom of roomsToDelete) {
    const messages = rooom?.messages?.map(el => {
      return `<p>${el}</p>`;
    })
    const doctorsEndWork = rooom?.finishedDoctors?.map(el => {

      return `<p>${el.doctor.name}</p> 
              <p>${el.doctor.workTime}</p>
              <p> Принял: ${el.doctor.counter}, пропустил: ${el.doctor.counterSkip}  </p>`;
    })

    const chatItems = rooom?.chat.map(el => (
      `<div style={{border:"1px solid black", margin:"20px auto"}}>
      <p> ${el.name} написал(а) в ${el.time}</p>
      <p>${el.message}</p>
      </div>`))

    const docBreack = rooom.finishedDoctors?.filter(el => el.finishedEarlierThanExpected).map((el, index) => {

      return `<p> ${index + 1}. ${el.doctor.name}</p> `;
    })

    await sendEmail(
      rooom?.creatorEmail,
      `Комната ${rooom.roomName} больше не работает`,
      `<p>Комната <b>${rooom.roomName}(ID: ${rooom.roomId})</b> прекратила работу. В ней не осталось врачей.</p>
           <p>Начало работы: ${rooom.roomStartWork}. Окончание работы ${znstringValidTime}</p>
            ${messages && `<p>Перечень не принятых случаев и причин:</p> ${messages}`}
           <p>Принимали врачи</p>
           ${doctorsEndWork}`
    );

    await sendEmail(
      "sanek.miron2@gmail.com",
      `Отчет о работе комнаты ${rooom.roomName}`,
      `<p>Комната <b>${rooom.roomName}(ID: ${rooom.roomId})</b> прекратила работу. В ней не осталось врачей.</p>
      <p>Создавал ${rooom?.creatorEmail}</p>
           <p>Начало работы: ${rooom.roomStartWork}. Окончание работы ${znstringValidTime}</p>
            ${messages && `<p>Перечень не принятых случаев и причин</p> ${messages}`}
           
           <p>Принимали врачи.</p> 
           ${doctorsEndWork}
           ${docBreack && `<p>Врачи, которые прервали смену</p>
            ${docBreack}`}
           ${chatItems && `<div style={{margin:"20px auto"}}>
           <p>Диалог</p>
           ${chatItems}
           </div>`}`
    );
    const delIndex = updatedRooms.findIndex(el => el.roomId == rooom.roomId)
    const delIndexPass = updatedRoomsPassword.findIndex(el => el.roomId == rooom.roomId)
    if (delIndex !== -1 && delIndexPass !== -1) {
      updatedRooms.splice(delIndex, 1)
      updatedRoomsPassword.splice(delIndexPass, 1)
    }
  }

  const newState = { rooms: updatedRooms }
  const newStatePasswords = { rooms: updatedRoomsPassword }

  await fs.writeFile(dataFile("state.json"), JSON.stringify(newState, null, 2));
  await fs.writeFile(dataFile("state-password.json"), JSON.stringify(newStatePasswords, null, 2));
  return { shouldDeleteCookies };// room.creatorEmail
}

