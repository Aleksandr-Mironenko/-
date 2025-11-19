import { NextResponse } from "next/server";
import fs from "fs/promises";
import { dataFile, readState } from '../../helpers/getState'

//получить
export async function GET() {
  const state = await readState("state.json");
  return NextResponse.json(state);//staterooms
}

// обновить 
export async function POST(req: Request) {
  const body = await req.json();

  if ((typeof body.doctors !== "object" && !Array.isArray(body.doctors))) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const updatedState = await readState("state.json");
  await fs.writeFile(dataFile("state.json"), JSON.stringify(body, null, 2));
  return NextResponse.json({ success: true, updatedState });
}
