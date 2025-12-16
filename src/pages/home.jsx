import React from "react";
import { useNavigate } from "react-router-dom";
import LogoImage from "../assets/images/logo.png";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-col items-center pt-36">
        <img src={LogoImage} alt="logo" className="w-[108px] h-[102px]" />
      </div>
      <div className="mt-48 flex flex-col gap-2 p-3">
        <input
          type="text"
          placeholder="이름을 입력해주세요."
          className="border border-black rounded-xl p-3"
        />
        <button
          className="border border-black rounded-xl p-3"
          onClick={() => navigate("/chats")}
        >
          시작하기
        </button>
      </div>
    </div>
  );
}
