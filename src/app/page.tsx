"use client";

import React, { useEffect, useState } from "react";

import { useRouter } from 'next/navigation'



const AllRooms = () => {
  const [rooms, setRooms] = useState([])
  const [empty, setEmpty] = useState<boolean>(false)
  const [logged, setLogged] = useState<boolean>(false)
  const [idDoc, setIdDoc] = useState<number | string>('')
  const [roomId, setRoomId] = useState<number | string>('')

  const fetchRooms = async () => {
    const res = await fetch("/api/state/rooms");
    if (res.status === 450) setEmpty(true)
    const data = await res.json();

    setRooms(data.rooms)
  }

  const router = useRouter()

  const createNewRooms = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    router.push('/createRoom')
  }

  const checkAuth = async () => {
    const response = await fetch("/api/auth", {
      credentials: "include",
    });
    const res = await response.json();

    if (res.ok) {
      setLogged(res.ok);
      setIdDoc(res.userId);
      setRoomId(res.roomId);

    } else {
      setLogged(res.ok);
    }
  }

  useEffect(() => {
    checkAuth()
  }, [])

  const clickroom = (id: string | number) => {
    if (logged && idDoc && roomId && id == roomId) {
      router.push(`/och/${id}`)
    } else {
      router.push(`/authorized/${id}`)
    }
  }

  const listrooms = rooms?.map((room, index) => (
    <li style={{
      cursor: "pointer",
      margin: "5px 0"
    }} onClick={() => clickroom(room[1])} key={room[1]} className="room">
      <h3>{index + 1}. Комната: {room[0]}</h3>
    </li>
  )
  );

  useEffect(() => {
    fetchRooms()
  }, [])

  return (
    <>
      <div style={{ cursor: "default", display: "flex", flexDirection: "column" }}>
        <div style={{ display: "inline-block", margin: "20px auto", fontSize: "25px", backgroundImage: "radial-gradient(#f1ccf0ff, #ffffff)" }}>
          <p >{empty ? "Пока комнаты не созданы - ты будешь первым" : "Выбери комнату или создай новую"} </p>
        </div>
        <div style={{ background: "linear-gradient(#e66465, #9198e5)", display: "flex", flexDirection: "column", margin: "0 auto", padding: "10px", border: "1px solid red", borderRadius: "20px" }}>

          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", margin: "15px 0" }}>
            <h4 style={{ fontSize: "20px" }}>Список комнат</h4>

            {rooms?.length > 0 ? (<ol className="list-rooms" style={{ display: "flex", flexDirection: "column", alignItems: "center", maxWidth: "700px", listStyleType: "none" }}>
              {/* style={{ background: "linear-gradient(#e66465, #9198e5)", display: "flex", borderRadius: "20px", padding: "10px", 
            margin: "0 auto", maxWidth: "700px", border: '1px solid red', display: "flex", flexDirection: 'column', gap: "20px" }} */}

              {listrooms}
            </ol>) : <p><b>пуст</b></p>
            }
            <button style={{ cursor: "pointer", backgroundImage: "radial-gradient(#f1ccf0ff, #ffffff)", margin: "15px 0 0", borderRadius: "10px", width: "200px", padding: "5px", }} onClick={createNewRooms}>Cоздать комнату</button>
            <div style={{ margin: "15px 0 0", padding: "5px" }}> <p>Этот ресурс позволяет отслеживать очерёдность в очереди.</p>
              <p> Принцип работы - нахождеие в комнате.</p>
              <p>Желающий создать комнату должен придумать пароль и передать его </p>
              <p>только тем лицам, которых нужно включить в очередь</p>
            </div>
          </div>
        </div>

      </div >
    </>
  )
}
export default AllRooms;

// "use client";
// import { useRouter } from 'next/navigation'
// import { useEffect, useState } from "react";
// import Form from "./form/page";
// import Page2 from "./age2/page";
// import AllRooms from "./allRooms/page";
// import FormCreateRoom from "./createRoom/page";

// export default function Page(id: number) {
//   const router = useRouter()
//   console.log(id)

//   const [allstate, setAllstate] = useState<object | null>(null);
//   let inLunch: number[] = [];

//   const times = new Date();


//   async function fetchState() {
//     const res = await fetch("/api/state");



//     const data = await res.json();
//     const newState = checkedlunch(data);

//     setAllstate(newState)
//   }

//   // async function increment() {
//   //   if (!state) return;
//   //   const newState = { count: state.count + 1 };
//   //   setState(newState); // оптимистично обновляем
//   //   await fetch("/api/state", {
//   //     method: "POST",
//   //     headers: { "Content-Type": "application/json" },
//   //     body: JSON.stringify(newState),
//   //   });
//   // }


//   const checkedlunch = (elem: object) => {
//     const docs = elem && Object(elem).doctors.map((el: { id: number, lunchTime: string, isLunch: boolean }) => {
//       const [hours, minutes] = el.lunchTime.split(':').map(Number);
//       console.log('52', hours, minutes)
//       const totalMinutes = minutes ? Number(hours) * 60 + Number(minutes) : Number(hours) * 60
//       console.log('54', totalMinutes)
//       const timeMin = validTimeLunch()
//       console.log('56', timeMin)
//       if (el.isLunch === true && timeMin - totalMinutes > 80) {
//         el.isLunch = false
//         inLunch = inLunch.filter(i => i !== el.id)
//       }
//       if (el.isLunch === false && timeMin - totalMinutes >= 0 && timeMin - totalMinutes < 80) {
//         el.isLunch = true
//         inLunch = [...inLunch, el.id]
//       }
//       return el
//     })
//     return { ...elem, doctors: docs }
//   }

//   const updateState = async () => {
//     if (!allstate) return;
//     const newState = checkedlunch(allstate);
//     console.log('51', newState);
//     await fetch("/api/state", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(newState),
//     });
//   }

//   useEffect(() => {
//     fetchState()
//     updateState()
//   }, []);


//   const validTimeLunch = (): number => {
//     const minutes: number = times.getMinutes();
//     const hours: number = times.getHours();

//     return hours * 60 + minutes - 20;
//   };

//   if (!allstate) return <div>Loading...</div>;


//   return (
//     <main style={{ background: "linear-gradient(#e66465, #9198e5)" }} className="flex flex-col items-center justify-center h-screen">
//       <button onClick={() => updateState()}>обновить на сервере</button>
//       <h1 className="text-3xl font-bold mb-4">Shared Counter</h1>


//       <button onClick={() => router.push('/och')}>пгопопгш</button>


//       <Page2 />
//       <AllRooms />
//       <Form />
//       <FormCreateRoom />
//     </main>
//   );
// }



{/* <div style={{ border: '1px solid gray', padding: '20px', margin: '20px 0' }}>
        <p className="text-2xl mb-4">{state.count}</p>
        <button
          onClick={increment}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        >
          +1111111111111111111111
        </button>
      </div> */}