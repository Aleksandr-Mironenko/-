// import { NextResponse } from "next/server";
// import jwt from "jsonwebtoken";
// import { readState } from '@/app/helpers/getState'
// import { cookies } from "next/headers";
// import { Secure } from '@/app/DTO'

// const SECRET = process.env.JWT_SECRET

// export async function POST(req: Request) {
//   const { roomId, password } = await req.json();

//   const stateSecure = await readState("state-password.json") as unknown as Secure;

//   if (stateSecure.roomId !== roomId || stateSecure.roomPassword !== password) {
//     return NextResponse.json({ error: "Password error" }, { status: 401 });
//   } else {
//     const cookieStore = await cookies();
//     const token = cookieStore.get("token")?.value;
//     if (token) {
//       (await cookies()).delete('token')
//     }
//     if (!SECRET) {
//       throw new Error("JWT_SECRET is not defined");
//     }
//     const newToken = jwt.sign({ password, roomId }, SECRET, { expiresIn: '14h' });
//     cookieStore.set({
//       name: "jwt",
//       value: newToken,
//       maxAge: 60 * 60 * 14,
//       httpOnly: true,
//       sameSite: "strict",
//       path: "/",
//     });

//     cookieStore.set({
//       name: "roomId",
//       value: roomId,
//       maxAge: 60 * 60 * 14,
//       httpOnly: true,
//       sameSite: "strict",
//       path: "/",
//     });

//   }
//   return NextResponse.json({ ok: true });
// }




import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import fs from "fs/promises";
import { cookies } from "next/headers";
import { readState, dataFile } from "@/app/helpers/getState";

interface RoomSecure {
  roomId: number;
  roomPassword: string;
}

const SECRET: string = process.env.JWT_SECRET ||
  (() => { throw new Error("JWT_SECRET is not defined in environment variables"); })();

export async function POST(req: Request) {
  const { roomId, password } = await req.json();

  const cookieStore = await cookies();
  const token = cookieStore.get("jwt")?.value;
  const roomid = cookieStore.get("roomId")?.value;
  const userId = cookieStore.get("userId")?.value;

  if (token && roomid && userId) {
    const state = await readState("state.json");

    const roomIndex = state.rooms.findIndex((el) => el.roomId === Number(roomid));
    if (roomIndex !== -1) {
      const room = structuredClone(state.rooms[roomIndex])

      const docindex = room.doctors.findIndex((el) => el.id === Number(userId));
      if (docindex !== -1) {
        room.doctors.splice(docindex, 1)

        state.rooms[roomIndex] = room;

        await fs.writeFile(dataFile("state.json"), JSON.stringify(state, null, 2));
      }
    }
  }

  const stateSecure = await readState("state-password.json");

  const foundRoom = stateSecure.rooms.find(room => room.roomId === Number(roomId));
  if (!foundRoom || foundRoom.roomPassword !== password) {
    return NextResponse.json({ error: "Password error" }, { status: 401 });
  }
  const newToken = jwt.sign({ password, roomId }, SECRET, { expiresIn: '14h' });
  const save = NextResponse.json({ ok: true });
  save.cookies.set({
    name: "jwt",
    value: newToken,
    maxAge: 60 * 60 * 14,
    httpOnly: true,
    sameSite: "strict",
    path: "/",
  });

  save.cookies.set({
    name: "roomId",
    value: roomId,
    maxAge: 60 * 60 * 14,
    httpOnly: true,
    sameSite: "strict",
    path: "/",
  });
  return save;
}




