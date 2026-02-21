import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext"
import CompleteButton from "../components/CompleteButton";
import BackButton from "../components/BackButton";

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

      const { accessToken, sessionId, userId } = await res.json(); // { accessToken, userId }

      setAuth({ accessToken, sessionId, userId }); // chats에서 사용할 인증 값

      navigate("/chats");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="h-full">
      <div className="p-4">
        <BackButton />
      </div>
      <div className="flex flex-col px-4 justify-center h-full gap-8 pb-20">
        <form onSubmit={handleSubmit} className="flex flex-col gap-12">
          <div className="flex flex-col gap-4">
            <p className="text-2xl text-[#583FE7] font-bold tracking-[-0.08em]">
              로그인
            </p>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="이메일을 입력해주세요."
              className="border border-black/30 rounded-xl p-3 outline-none"
              autoComplete="email"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="전화번호를 입력해주세요."
              className="border border-black/30 rounded-xl p-3 outline-none"
              autoComplete="current-password"
            />
            <p className="text-xs text-right text-gray-500">
              <Link to="/register">비밀번호 찾기</Link>
            </p>
          </div>
          <CompleteButton label="로그인" />
        </form>
        <p className="text-xs text-center text-gray-500">아직 회원이 아니신가요?{" "} 
          <Link to="/register" className="text-[#583FE7] font-bold">
            회원가입
          </Link>
          </p>
      </div>
    </div>
  );
}
