"use client";
import { useParams, useRouter } from "next/navigation";

const LoginedTrue = () => {
  const params = useParams();
  const { roomId } = params
  const router = useRouter()

  return (
    <div>
      Вы уже успешно вошли!
      Доступно добавиться 1 раз
      <button onClick={() => {
        router.push(`/och/${roomId}`);
      }}>Перейти обратно в комнату</button>
    </div>
  )
}
export default LoginedTrue;