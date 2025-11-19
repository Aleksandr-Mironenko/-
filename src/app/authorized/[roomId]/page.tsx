"use client";
import { useState, useEffect, useMemo, SetStateAction } from "react";
import { useParams, useRouter } from "next/navigation";

const FormCreateDoc = () => {
  const router = useRouter();
  const params = useParams();
  const { roomId } = params as { roomId: string }; // <-- типизация params

  const [password, setPassword] = useState<string>(''); // <-- убрали any
  const [name, setName] = useState<string>('');        // <-- убрали any
  const [timeStartWork, setTimeStartWork] = useState<string>('');
  const [timeEndWork, setTimeEndWork] = useState<string>('');
  const [lunch, setLunch] = useState<string>('');
  const [isErrorLogin, setIsErrorLogin] = useState<boolean>(false);

  const now = new Date();

  const stringValidTime = () => {
    const min: number = now.getMinutes();
    const minutes = min < 10 ? `0${min}` : String(min);
    const h: number = now.getHours();
    const hours = h < 10 ? `0${h}` : String(h);
    setTimeStartWork(`${hours}:${minutes}`);
    setTimeEndWork(`${hours}:${minutes}`);
    setLunch(`${hours}:${minutes}`);
  };

  useEffect(() => {
    stringValidTime();
  }, []);

  const createDocInRoom = async (e: React.FormEvent<HTMLFormElement>) => { // <-- тип FormEvent
    e.preventDefault();

    if (roomId && name && timeStartWork && timeEndWork && lunch && password) {
      const newDoctorInRoom = {
        roomId, name, timeStartWork, timeEndWork, lunch, password
      };
      const res = await fetch("/api/state/add-doctor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newDoctorInRoom),
      });

      const data: { id?: string; error?: string } = await res.json(); // <-- типизация ответа

      if (data.id) {
        router.push(`/och/${roomId}`);
      } else {
        console.log(data.error || "Ошибка при создании врача");
      }
    }
  };

  const login = async (e: React.FormEvent<HTMLFormElement>) => { // <-- тип FormEvent
    e.preventDefault();
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roomId: `${roomId}`, password: `${password}` }),
    });
    const data: { ok: boolean } = await res.json(); // <-- типизация ответа
    if (data.ok) {
      createDocInRoom(e);
    } else {
      setPassword('');
      setIsErrorLogin(true);
    }
  };

  function funcDebounce(func: (value: SetStateAction<string>) => void) { // <-- тип функции
    let timerId: NodeJS.Timeout | null = null; // <-- тип таймера
    return (...args: [SetStateAction<string>]) => {
      if (timerId) clearTimeout(timerId);
      timerId = setTimeout(() => {
        func(...args);
      }, 1000);
    };
  }

  const debouncedSetPassword = useMemo(() => funcDebounce(setPassword), [setPassword]);
  const debouncedSetName = useMemo(() => funcDebounce(setName), [setName]);

  return (
    <>
      <div style={{ cursor: "default", display: "flex", flexDirection: "column" }}>
        <h3 style={{ margin: "20px auto", fontSize: "25px", backgroundImage: "radial-gradient(#f1ccf0ff, #ffffff)" }}>
          Заполните для входа
        </h3>
        <form
          onSubmit={login}
          style={{
            background: "linear-gradient(#e66465, #9198e5)",
            borderRadius: "20px",
            padding: "10px",
            margin: "0 auto",
            maxWidth: "700px",
            border: '1px solid red',
            display: "flex",
            flexDirection: 'column',
            gap: "20px"
          }}
        >
          {isErrorLogin && <p style={{ color: '#343976ff' }}>Неверный пароль, попробуйте еще раз</p>}

          <label>Введите пароль от комнаты:
            <input
              type="password"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => debouncedSetPassword(e.target.value)}
              style={{ borderRadius: "10px", padding: "5px" }}
              placeholder="Password"
            />
          </label>

          <label>Введите ваше имя:
            <input
              type='text'
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => debouncedSetName(e.target.value)}
              placeholder="Name"
              style={{ borderRadius: "10px", padding: "5px" }}
            />
          </label>

          <label>Время начала работы:
            <input
              type='time'
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTimeStartWork(e.target.value)}
              value={timeStartWork}
              style={{ borderRadius: "10px", padding: "5px" }}
            />
          </label>

          <label>Время окончания работы:
            <input
              type='time'
              value={timeEndWork}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTimeEndWork(e.target.value)}
              style={{ borderRadius: "10px", padding: "5px" }}
            />
          </label>

          <label>Время обеда:
            <input
              type='time'
              value={lunch}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLunch(e.target.value)}
              style={{ borderRadius: "10px", padding: "5px" }}
            />
          </label>

          <button
            style={{ cursor: "pointer", borderRadius: "10px", width: "200px", padding: "5px", alignSelf: "center" }}
            type="submit"
          >
            Войти в комнату
          </button>
        </form>
      </div>
    </>
  )
}
export default FormCreateDoc;