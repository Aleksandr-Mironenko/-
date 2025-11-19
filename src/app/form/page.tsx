"use client"
import { useState } from "react";
const Form = () => {
  const [name, setName] = useState/*<{ count: string }>*/('');
  const [timeStartWork, setTimeStartWork] = useState/*<{ count: number } | null>*/('');
  const [timeEndWork, setTimeEndWork] = useState/*<{ count: number } | null>*/('');
  const [lunchTime, setLunchTime] = useState/*<{ count: number } | null>*/('');




  return (
    <form style={{ border: '1px solid red', display: 'flex', flexDirection: 'column', gap: "20px" }}>

      <label>Имя врача:
        <input
          type="text"
          value={name || ''}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name" />
      </label>



      <label>Время начала работы:
        <input
          type='time'
          value={timeStartWork}
          onChange={(e) => setTimeStartWork(e.target.value)}
        />
      </label>

      <label>Время окончания работы:
        <input
          type='time'
          value={timeEndWork}
          onChange={(e) => setTimeEndWork(e.target.value)}
        />
      </label>

      <label  >Время обеда:
        <input
          type='time'
          value={lunchTime}
          onChange={(e) => setLunchTime((e.target.value))}
        /></label>

    </form>
  )
}
export default Form;