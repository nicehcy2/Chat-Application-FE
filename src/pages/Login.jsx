import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext"

export default function Login() {
  const navigate = useNavigate();
  const { setAuth } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const URL = "http://localhost:8072/user-service/login";

  const handleSubmit = async (e) => {

    e.preventDefault();

    try {
      const res = await fetch(`${URL}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        credentials: "include", // 쿠키 받기/보내기
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        throw new Error("login failed");
      }

      const { accessToken, sessionId } = await res.json(); // { accessToken, userId }

      setAuth({ accessToken, sessionId }); // chats에서 사용할 인증 값

      navigate("/chats");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <form onSubmit={handleSubmit} className="flex flex-col">
        <label className="flex flex-col">
          <span className="text-sm">이메일</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@example.com"
            className="border border-black/30 rounded-xl p-3 outline-none"
            autoComplete="email"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-sm">비밀번호</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="비밀번호"
            className="border border-black/30 rounded-xl p-3 outline-none"
            autoComplete="current-password"
          />
        </label>
        <button
          type="submit"
          className="border border-black rounded-xl p-3 disabled:opacity-60"
        >
          로그인
        </button>
      </form>
    </div>
  );
}
