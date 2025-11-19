import { NextResponse } from "next/server";
import { readState, dataFile } from '@/app/helpers/getState'
import fs from "fs/promises";
import { Doctor } from '@/app/DTO'
import { message } from "antd";





export async function POST(req: Request) {

  const newDoctor: Doctor | null = null;

  const { roomId, id /*password, name, timeStartWork, timeEndWork, lunch*/ } = await req.json();

  if (!roomId || !id) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
  const state = await readState("state.json");
  const newRooms = [...state.rooms]

  const foundRoomIndex = newRooms.findIndex(room => room.roomId === Number(roomId));



  const now = new Date();

  const validTime = () => {
    const min: number = now.getMinutes();
    const minutes = min < 10 ? `0${min}` : String(min)
    const h: number = now.getHours();
    const hours = h < 10 ? `0${h}` : String(h)
    return `${hours}:${minutes}`
  }



  if (foundRoomIndex === -1) {
    return NextResponse.json({ message: `Not deleted, not found id:${id}`, ok: false });
  }


  const foundDocIndex = newRooms[foundRoomIndex].doctors.find(doc => doc.id === Number(id));

  if (foundDocIndex === undefined) {
    return NextResponse.json({ message: `Not deleted, not found roomId:${roomId}`, ok: false });
  }

  foundDocIndex.finishedEarlierThanExpected = true

  const newState = { rooms: newRooms };
  await fs.writeFile(dataFile("state.json"), JSON.stringify(newState, null, 2));


  const save = NextResponse.json({ message: `${id} deleted`, ok: true });


  save.cookies.set("userId", "", { maxAge: 0, path: "/" });
  save.cookies.set("jwt", "", { maxAge: 0, path: "/" })
  save.cookies.set("roomId", "", { maxAge: 0, path: "/" });
  return save
}











// // for (const rooom of roomsToDelete) {
// //     const messages = rooom?.messages?.map(el => {
// //       return `<p>${el}</p>`;
// //     })
// //     const doctorsEndWork = rooom?.finishedDoctors?.map(el => {

// //       return `<p>${el.doctor.name}</p>
// //               <p>${el.doctor.workTime}</p>
// //               <p> Принял: ${el.doctor.counter}, пропустил: ${el.doctor.counterSkip}  </p>`;
// //     })
// //     await sendEmail(
// //       rooom?.creatorEmail,
// //       "",
// //       `<p>Комната <b>${rooom.roomName}(ID: ${rooom.roomId})</b> прекратила работу. В ней не осталось врачей.</p>
// //            <p>Начало работы: ${rooom.roomStartWork}. Окончание работы ${znstringValidTime}</p>
// //             ${messages && `<p>Перечень не принятых случаев и причин</p> ${messages}`}
// //            <p>Принимали врачи .</p>
// //            ${doctorsEndWork}`
// //     );
// //     const delIndex = updatedRooms.findIndex(el => el.roomId == rooom.roomId)
// //     const delIndexPass = updatedRoomsPassword.findIndex(el => el.roomId == rooom.roomId)
// //     if (delIndex !== -1 && delIndexPass !== -1) {
// //       updatedRooms.splice(delIndex, 1)
// //       updatedRoomsPassword.splice(delIndexPass, 1)
// //     }

// //   }




// if (newDoctor.id === 0) {
//   newDoctor.isNext = true
// }
// id = newDoctor.id

// return { ...el, doctors: [...el.doctors, newDoctor] };
// }
// return el;
//   })



// if (!newDoctor) {
//   return NextResponse.json(
//     { error: `Room with id ${roomId} not found` },
//     { status: 404 }
//   );
// }

// const newState = { rooms: updatedRooms }
// await fs.writeFile(dataFile("state.json"), JSON.stringify(newState, null, 2));


// // const [startH, startM] = body.timeStartWork.split(":").map(Number);
// // const [endH, endM] = body.timeEndWork.split(":").map(Number);
// // const workSeconds = ((endH * 60 + endM) - (startH * 60 + startM)) * 60;
// // const maxAge = workSeconds + 7200;

// // const cookieStore = await cookies();

// // cookieStore.set({
// //   name: "my-secret-password",
// //   value: body.password,
// //   maxAge: maxAge,
// //   httpOnly: true,
// //   sameSite: "strict",
// //   path: "/", // доступна на всём сайте
// // });





// const save = NextResponse.json({ id, roomId });

// save.cookies.set({
//   name: "userId",
//   value: String(id),
//   httpOnly: true,
//   sameSite: "strict",
//   maxAge: 60 * 60 * 14,
//   path: "/", // доступна на всём сайте
// });

// return save
// }

