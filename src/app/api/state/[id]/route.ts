import { NextResponse } from "next/server";
import { readState } from '@/app/helpers/getState'

export async function GET(req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params
  const idd = Number(id)
  const state = await readState("state.json");

  const room = state.rooms.find(el => el.roomId === idd);

  if (!room) {
    return NextResponse.json({ error: "Room not found" }, { status: 404 });
  }
  const roomInLunch = room.doctors.filter(doc => doc.isLunch === true)

  const roomNOInLunch = room.doctors.filter(doc => doc.isLunch === false)

  const roomIsWorkingDoctors = room.doctors.filter(doc => doc.isWorking === true)

  const roomNOIsWorkingDoctors = room.doctors.filter(doc => doc.isWorking === false)

  const workAndNoLunch = roomIsWorkingDoctors.filter(doc => doc.isLunch === false)

  const next = workAndNoLunch.find(el => el.isNext)

  if (roomNOIsWorkingDoctors.length === 1) {
    if (roomNOIsWorkingDoctors[0].isNext !== true) {
      roomNOIsWorkingDoctors[0].isNext = true;
    }
    room.doctors.forEach(el => {
      if (el.id != roomNOIsWorkingDoctors[0].id && el.isNext === true) {
        el.isNext = false
      }
    })
  }

  return NextResponse.json({ room, roomInLunch, roomNOInLunch, roomIsWorkingDoctors, roomNOIsWorkingDoctors, workAndNoLunch, next: next });
}













// import { NextResponse } from "next/server";
// import { readState } from '@/app/helpers/getState'

// export async function GET(req: Request,
//   context: { params: Promise<{ id: string }> }
// ) {
//   const { id } = await context.params
//   const idd = Number(id)
//   const state = await readState("state.json");

//   const room = state.rooms.find(el => el.roomId === idd);

//   if (!room) {
//     return NextResponse.json({ error: "Room not found" }, { status: 404 });
//   }

//   return NextResponse.json(room);
// }



//11/11
// import { NextResponse } from "next/server";
// import { readState } from '@/app/helpers/getState'

// export async function GET(req: Request,
//   context: { params: Promise<{ id: string }> }
// ) {

//   const { id } = await context.params
//   const idd = Number(id)
//   const state = await readState("state.json");

//   const room = state.rooms.find(el => el.roomId === idd);


//   if (!room) {
//     return NextResponse.json({ error: "Room not found" }, { status: 404 });
//   }
//   const roomInLunch = room.doctors.filter(doc => doc.isLunch === true)

//   const roomNOInLunch = room.doctors.filter(doc => doc.isLunch === false)

//   const roomIsWorkingDoctors = room.doctors.filter(doc => doc.isWorking === true)

//   const roomNOIsWorkingDoctors = room.doctors.filter(doc => doc.isWorking === false)

//   if (roomNOIsWorkingDoctors.length === 1) {
//     roomNOIsWorkingDoctors[0].isNext = true
//     room.doctors.forEach(el => {
//       if (el.id != roomNOIsWorkingDoctors[0].id) {
//         room.doctors[el.id].isNext = false
//       }
//     })
//   }

//   const workAndNoLunch = roomIsWorkingDoctors.filter(doc => doc.isLunch === false)
//   const next = workAndNoLunch.find(el => el.isNext)


//   return NextResponse.json({ room, roomInLunch, roomNOInLunch, roomIsWorkingDoctors, roomNOIsWorkingDoctors, workAndNoLunch, next });