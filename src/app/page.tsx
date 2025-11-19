"use client";
import { useRouter } from 'next/navigation'
import { useEffect, useState } from "react";
import Form from "./form/page";
import Page2 from "./age2/page";
import AllRooms from "./allRooms/page";
import FormCreateRoom from "./createRoom/page";

export default function Page(id: number) {
  const router = useRouter()
  console.log(id)

  const [allstate, setAllstate] = useState<object | null>(null);
  let inLunch: number[] = [];

  const times = new Date();


  async function fetchState() {
    const res = await fetch("/api/state");



    const data = await res.json();
    const newState = checkedlunch(data);

    setAllstate(newState)
  }

  // async function increment() {
  //   if (!state) return;
  //   const newState = { count: state.count + 1 };
  //   setState(newState); // оптимистично обновляем
  //   await fetch("/api/state", {
  //     method: "POST",
  //     headers: { "Content-Type": "application/json" },
  //     body: JSON.stringify(newState),
  //   });
  // }


  const checkedlunch = (elem: object) => {
    const docs = elem && Object(elem).doctors.map((el: { id: number, lunchTime: string, isLunch: boolean }) => {
      const [hours, minutes] = el.lunchTime.split(':').map(Number);
      console.log('52', hours, minutes)
      const totalMinutes = minutes ? Number(hours) * 60 + Number(minutes) : Number(hours) * 60
      console.log('54', totalMinutes)
      const timeMin = validTimeLunch()
      console.log('56', timeMin)
      if (el.isLunch === true && timeMin - totalMinutes > 80) {
        el.isLunch = false
        inLunch = inLunch.filter(i => i !== el.id)
      }
      if (el.isLunch === false && timeMin - totalMinutes >= 0 && timeMin - totalMinutes < 80) {
        el.isLunch = true
        inLunch = [...inLunch, el.id]
      }
      return el
    })
    return { ...elem, doctors: docs }
  }

  const updateState = async () => {
    if (!allstate) return;
    const newState = checkedlunch(allstate);
    console.log('51', newState);
    await fetch("/api/state", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newState),
    });
  }

  useEffect(() => {
    fetchState()
    updateState()
  }, []);


  const validTimeLunch = (): number => {
    const minutes: number = times.getMinutes();
    const hours: number = times.getHours();

    return hours * 60 + minutes - 20;
  };

  if (!allstate) return <div>Loading...</div>;


  return (
    <main style={{ background: "linear-gradient(#e66465, #9198e5)" }} className="flex flex-col items-center justify-center h-screen">
      <button onClick={() => updateState()}>обновить на сервере</button>
      <h1 className="text-3xl font-bold mb-4">Shared Counter</h1>


      <button onClick={() => router.push('/och')}>пгопопгш</button>


      <Page2 />
      <AllRooms />
      <Form />
      <FormCreateRoom />
    </main>
  );
}



{/* <div style={{ border: '1px solid gray', padding: '20px', margin: '20px 0' }}>
        <p className="text-2xl mb-4">{state.count}</p>
        <button
          onClick={increment}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        >
          +1111111111111111111111
        </button>
      </div> */}