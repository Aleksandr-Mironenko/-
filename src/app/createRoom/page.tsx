"use client";
import { useState, useMemo, useEffect, SetStateAction } from "react";
import { useRouter } from 'next/navigation';

const FormCreateRoom = () => {
  const [name, setName] = useState<string>('');
  const [timeStartWork, setTimeStartWork] = useState<string>('');
  const [timeEndWork, setTimeEndWork] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  const now = new Date();

  const stringValidTime = () => {
    const min: number = now.getMinutes();
    const minutes = min < 10 ? `0${min}` : String(min);
    const h: number = now.getHours();
    const hours = h < 10 ? `0${h}` : String(h);
    setTimeStartWork(`${hours}:${minutes}`);
    setTimeEndWork(`${hours}:${minutes}`);
  };

  const router = useRouter();

  const createRoom = async (e: React.FormEvent<HTMLFormElement>) => { // <-- типизация события
    e.preventDefault();

    if (name && timeStartWork && timeEndWork && email && password) {
      const dataNewRoom = { name, timeStartWork, timeEndWork, email, password };
      const res = await fetch("/api/state/add-room", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataNewRoom),
      });
      const data: { ok?: boolean; roomId?: string; error?: string } = await res.json(); // <-- типизация ответа

      if (!data.ok && data.roomId) {
        router.push(`/authorized/${data.roomId}`);
      } else {
        console.log(data.error || "Ошибка при создании комнаты");
      }
    }
  };

  useEffect(() => {
    stringValidTime();
  }, []);

  function funcDebounce(func: (value: SetStateAction<string>) => void) { // <-- тип функции
    let timerId: NodeJS.Timeout | null = null; // <-- тип таймера
    return (...args: [SetStateAction<string>]) => {
      if (timerId) clearTimeout(timerId);
      timerId = setTimeout(() => {
        func(...args);
      }, 1000);
    };
  }

  const debouncedSetName = useMemo(() => funcDebounce(setName), [setName]);
  const debouncedSetTimeStartWork = useMemo(() => funcDebounce(setTimeStartWork), [setTimeStartWork]);
  const debouncedSetTimeEndWork = useMemo(() => funcDebounce(setTimeEndWork), [setTimeEndWork]);
  const debouncedSetEemail = useMemo(() => funcDebounce(setEmail), [setEmail]);
  const debouncedSetPassword = useMemo(() => funcDebounce(setPassword), [setPassword]);

  return (
    <div style={{ cursor: "default", display: "flex", flexDirection: "column" }}>
      <h3 style={{ margin: "20px auto", fontSize: "25px", backgroundImage: "radial-gradient(#f1ccf0ff, #ffffff)" }}>
        Почувствуй себя творцом
      </h3>
      <form
        onSubmit={createRoom}
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
        <label>Название комнаты:
          <input
            type="text"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => debouncedSetName(e.target.value)} // <-- тип события
            placeholder="Name"
            style={{ borderRadius: "10px", padding: "5px" }}
          />
        </label>

        <label>Время начала работы:
          <input
            type='time'
            value={timeStartWork}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => debouncedSetTimeStartWork(e.target.value)}
            style={{ borderRadius: "10px", padding: "5px" }}
          />
        </label>

        <label>Время окончания работы:
          <input
            type='time'
            value={timeEndWork}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => debouncedSetTimeEndWork(e.target.value)}
            style={{ borderRadius: "10px", padding: "5px" }}
          />
        </label>

        <label>Куда отправить данные:
          <input
            type='email'
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => debouncedSetEemail(e.target.value)}
            style={{ borderRadius: "10px", padding: "5px" }}
            placeholder="Email"
          />
        </label>

        <label>Придумайте пароль для входа:
          <input
            type='password'
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => debouncedSetPassword(e.target.value)}
            style={{ borderRadius: "10px", padding: "5px" }}
            placeholder="*****"
          />
        </label>

        <button
          style={{
            cursor: "pointer",
            backgroundImage: "radial-gradient(#f1ccf0ff, #ffffff)",
            borderRadius: "10px",
            width: "200px",
            padding: "5px",
            alignSelf: "center"
          }}
          type="submit"
        >
          Создать комнату
        </button>
      </form>
    </div>
  );
};

export default FormCreateRoom;