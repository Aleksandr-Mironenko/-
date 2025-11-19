import fs from "fs/promises";
import path from "path";
import { Rooms, RoomSecure } from '@/app/DTO'


//для возможности внесения изменений
export const dataFile = (fileName: string) => {
  return path.join(process.cwd(), "src",
    "app",
    "data",
    fileName);
}

//для чтения состояния
export async function readState(fileName: string): Promise<Rooms | RoomSecure> {
  const json = await fs.readFile(dataFile(fileName), "utf-8");
  return JSON.parse(json);
}





