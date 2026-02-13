import React from "react";
import { useNavigate } from "react-router-dom";
import LogoImage from "../assets/images/logo.png";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-1 flex-col items-center justify-center">
        <img src={LogoImage} alt="logo" className="w-[108px] h-[102px]" />
      </div>
      <div className="mb-16 flex flex-col gap-2 p-3">
        <button
          className="border border-black rounded-xl p-3"
          onClick={() => navigate("/login")}
        >
          로그인
        </button>
        <button
          className="border border-black rounded-xl p-3"
          onClick={() => navigate("/register")}
        >
          회원가입
        </button>
      </div>
    </div>
  );
}
