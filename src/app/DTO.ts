export interface Doctor {
  id: number;
  name: string;
  startWork: number;
  endWork: number;
  lunchTime: number;
  counter: number;
  counterSkip: number;
  isNext: boolean;
  isWorking: boolean;
  isLunch: boolean;
  congratulations: boolean;
  finishedEarlierThanExpected: boolean
}

export interface Room {
  roomId: number;
  roomName: string;
  roomStartWork: number;
  roomEndWork: number;
  creatorEmail: string;
  doctors: Doctor[];
  active: number;
  messages: string[]
  finishedDoctors: Doctor[];
  chat: ChatMessage[]
}
export interface ChatMessage {
  name: string;
  id: number | string;
  message: string;
  time: string
}

export interface Rooms {
  rooms: Room[]

}

export interface Secure {
  roomId: number;
  roomPassword: string;
}
export interface RoomSecure {
  rooms: Secure[]
}