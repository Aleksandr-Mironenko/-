"use client";
import { useState, useRef, useEffect, startTransition, useMemo } from 'react'
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { Room, Doctor } from '@/app/DTO'
import arrow from '../../../../public/arrow.svg'
import Confetti from 'js-confetti'
import { notification, Space } from 'antd';
import styles from './page.module.scss';


export default function Och() {
  const params = useParams();

  const confettiRef = useRef<Confetti | null>(null);
  const [allstate, setAllstate] = useState<Room>({
    roomId: 0,
    roomName: '',
    roomStartWork: 0,
    roomEndWork: 0,
    creatorEmail: '',
    doctors: [],
    messages: [],
    active: -1,
    finishedDoctors: [],
    chat: []
  }
  );

  const [id, setId] = useState<number | undefined>(undefined);
  const [roomId, setRoomId] = useState<number>(0);
  const [loggedIn, setLoggedIn] = useState<boolean>(false);
  const [roomInLunch, setRoomInLunch] = useState<Doctor[]>([]);
  const [roomNOInLunch, setRoomNOInLunch] = useState<Doctor[]>([]);

  const [reason, setReason] = useState<string>('')
  const [roomIsWorkingDoctors, setRoomIsWorkingDoctors] = useState<Doctor[]>([]);
  const [roomNOIsWorkingDoctors, setRoomNOIsWorkingDoctors] = useState<Doctor[]>([]);
  const [workAndNoLunch, setWorkAndNoLunch] = useState<Doctor[]>([]);
  const [newMessage, setNewMessage] = useState<string>('')
  const [different, setDifferent] = useState<boolean>(false)
  const [nexttDoctor, setNexttDoctor] = useState<string>("")

  const router = useRouter()
  const { roomid } = params

  const checkAuth = async () => {
    const response = await fetch("/api/auth", {
      credentials: "include",
    });
    const res = await response.json();
    if (res.ok) {
      setLoggedIn(res.ok);
      setId(res.userId);
      setRoomId(res.roomId);

    } else {
      setLoggedIn(res.ok);
      if (!loggedIn) {
        router.push(`/authorized/${roomid}`);
      }
    }
    funcAsynUpdate()
  }

  async function fetchState() {
    const res = await fetch(`/api/state/${roomid}`);
    const data = await res.json();

    if (data.room === undefined || data.room === null) {
      router.push(`/allRooms`)
    } else {
      setDifferent(data.room.messages.length !== allstate.messages.length)
      setAllstate(data.room)
      setRoomInLunch(data.roomInLunch)
      setRoomNOInLunch(data.roomNOInLunch)
      setRoomIsWorkingDoctors(data.roomIsWorkingDoctors)
      setRoomNOIsWorkingDoctors(data.roomNOIsWorkingDoctors)
      setWorkAndNoLunch(data.workAndNoLunch)
      if (data.next?.name) {
        setNexttDoctor(prev => prev || data.next.name)
      }
    }
  }

  useEffect(() => {
    checkAuth()
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (loggedIn) {
        fetchState()
      } else {
        router.push(`/authorized/${roomid}`);
      }
    }, 500)
    return clearTimeout(timer)
  }, [loggedIn]);

  const createDoctor = () => {
    startTransition(() => {
      if (loggedIn) {
        router.push(`/logined/${roomid}`);
      } else {
        router.push(`/authorized/${roomid}`);
      }
    });
  };

  const funcAsynUpdate = async () => {
    const response = await fetch("/api/update-doctors");
    const res = await response.json()
    if (res.update) {
      fetchState()
    }
    if (res.cookiesCleared) {
      setLoggedIn(false)
    }
  }

  const funcNextDoctor = async () => {
    const response = await fetch("/api/next-doctor", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roomid, reason }),
    });
    const res = await response.json()
    setRoomInLunch(res.roomInLunch)
    setRoomNOInLunch(res.roomNOInLunch)
    setNexttDoctor(res.nextDoctor)
    setWorkAndNoLunch(res.isWorkingNolunch)
    funcAsynUpdate()
    setReason('')
  }

  const docButtons = (<>
    <button className={styles.room__list_buttons_take}
      disabled={reason !== ''}
      onClick={() => funcNextDoctor()}> Беру </button>
    <span>
      <span>
        <button className={styles.room__list_buttons_notake}
        > Не беру</button>
        <input
          className={styles.room__list_buttons_notake_input}
          type="text"
          value={reason}
          placeholder='Напиши причину'
          onChange={(e) => setReason(e.target.value)} />
      </span>
    </span>
  </>)

  const funcDeleteDoctor = async () => {
    const requst = await fetch("/api/delete-doctor", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, roomId }),
    })
    const res = await requst.json()
    if (res.ok) {
      setLoggedIn(false)
      router.push(`/authorized/${roomid}`);
    }
    funcAsynUpdate()
  }

  const mapdDoctors = workAndNoLunch?.map((el: { isLunch: boolean; name: string, id: number, isNext: boolean }, index: number) => {
    const isMyDoctor = Number(id) === el.id
    const isMyRoom = Number(roomId) === Number(roomid)
    const canSeeButtons = el.isNext && isMyDoctor && isMyRoom
    if (nexttDoctor === '' && el.isNext) {
      setNexttDoctor(el.name)
    }
    const markerNextDoctor = (<>
      <Image
        className={styles.room__marker_image} src={arrow} alt="→" width={16} height={16}
      />
      <span className={styles.room__marker_text} >

        {el.isLunch === false &&
          canSeeButtons ?
          "Ваша очередь! " :
          "Принимает этот врач"}
      </span>
    </>)

    return (
      <li className={styles.room__items_list}
        key={el.id}>
        <span
          className={styles.room__index_list} >
          {`${index + 1}.`}
          <span
            className={styles.room__name_list}
          > {el.name}</span>
        </span>
        {el.isNext && markerNextDoctor}
        {canSeeButtons && docButtons}
      </li >)
  })

  const lunchDoctor = roomInLunch?.map((el: { name: string, id: number }) => <li
    className={styles.room__info_lunch_items}
    key={el.id}><b>{el.name}</b></li>)

  const mapchaat = allstate?.chat?.map(el => {
    return (
      <li
        key={el.id}
        className={styles.room__chat_item} >

        <span
          className={styles.room__chat_left} >
          <span
            className={styles.room__chat_left_name} >
            {el.name}
          </span>
          <span
            className={styles.room__chat_left_time} >
            {`написал(а) в:${el.time}`}</span>

        </span>
        <div
          className={styles.room__chat_rigth} >
          {el.message}
        </div>

      </li >
    )
  })
  function funcDebounce(func: { (value: SetStateAction<string>): void; (value: SetStateAction<string>): void; (value: SetStateAction<string>): void; (value: SetStateAction<string>): void; (value: SetStateAction<string>): void; (arg0: any): void; }) {
    let timerId = null
    return (...args) => {
      clearTimeout(timerId)
      timerId = setTimeout(() => {
        func(...args)
      }, 300
      )
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const message = newMessage.trim()
    const respons = await fetch("/api/send-message", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roomid, message, id }),
    })
    if (respons.ok) {
      const result = await respons.json()
    }
    funcAsynUpdate()
    setNewMessage('')
  }

  const debouncedSetNewMessage = useMemo(() => funcDebounce(setNewMessage), [setNewMessage]);
  const chat = (
    <div
      className={styles.room__chat} >
      <form
        className={styles.room__chat_form}
        onSubmit={handleSubmit}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            handleSubmit(e);
          }
        }}
      >
        <label
          className={styles.room__chat_form_title_wrapper}
        >
          <div
            className={styles.room__chat_form_title}
          >Чатик
          </div>


          <textarea
            className={styles.room__chat_form_textarea}
            placeholder=' Есть что написать?' rows={3} onChange={(e) => debouncedSetNewMessage(e.target.value)}
          />
        </label>

        <button
          className={styles.room__chat_form_send}
          type="submit">ОТПРАВИТЬ</button>


      </form>
      <ol
        className={styles.room__chat_list}
      >
        {mapchaat}
      </ol>

    </div >
  )


  const [api, contextHolder] = notification.useNotification();

  const openNotificationWithIcon = (text) => {
    api["info"]({
      message: 'Notification Title',
      description: `${text}`,
    });
  };


  useEffect(() => {
    if (different) {
      openNotificationWithIcon(allstate.messages[allstate.messages.length - 1])
    }
  }, [different])


  const findingDoc = allstate.doctors.find(el => el.id == id)




  useEffect(() => {
    confettiRef.current = new Confetti();
  }, []);


  useEffect(() => {
    if (findingDoc != undefined && findingDoc.congratulations && roomId && id && roomId == allstate.roomId) {

      const interval = setInterval(() => {
        confettiRef.current?.addConfetti()
      }, 500);
      return () => clearInterval(interval);
    }
  },)

  return (

    <div className={styles.room} >
      <div
        className={styles.room__queue} >
        {contextHolder}
        <Space></Space>

        <h3
          className={styles.room__title} >
          {`Очередь врачей: ${allstate.roomName}`} </h3>

        <ol
          className={styles.room__list} >
          {mapdDoctors}
        </ol>
        <div className={styles.room__info_wrapper} >

          <div
            className={styles.room__info}
          >
            <div
              className={styles.room__info_next}
            >
              Принимает следующего пациента:
              <b>{nexttDoctor} </b>
            </div>

            <div
              className={styles.room__info_lunch}>
              <p
                className={styles.room__info_lunch_title}
              >
                На обеде: </p>
              <ul
                className={styles.room__info_lunch_list} >
                {lunchDoctor}
              </ul>
            </div>
          </div>
          {loggedIn && <button
            className={styles.room__delete_user}

            onClick={() => funcDeleteDoctor()}
          >
            Удалиться раньше
          </button>}
        </div>



      </div>
      {!loggedIn && <button
        className={styles.room__add_user}
        onClick={() => createDoctor()}
      >
        Встать в очередь
      </button>}
      <button
        onClick={() => funcAsynUpdate()}
      > Кнопка обновления флагов для дальнейшей автоматической работы</button >
      <button
        onClick={() => funcNextDoctor()}
      >
        Пациент взят следующая очередь
      </button>
      {loggedIn && chat}



    </div >)
} 