import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext"
import CompleteButton from "../components/CompleteButton";
import BackButton from "../components/BackButton";
import { userApi } from "../api/userApi";

export default function Login() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { setAuth } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {

    e.preventDefault();

    try {
      const { accessToken, sessionId, userId } = await userApi.login(email, password);

      setAuth({ accessToken, sessionId, userId });

      navigate(state?.from ?? "/", { replace: true });
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
            <p className="text-2xl text-primary font-bold">
              로그인
            </p>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="이메일을 입력해주세요. ex) admin@naver.com"
              className="border border-black/30 rounded-xl p-3 outline-none"
              autoComplete="email"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호를 입력해주세요. ex) admin"
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
          <Link to="/register" className="text-primary font-bold">
            회원가입
          </Link>
          </p>
      </div>
    </div>
  );
}
