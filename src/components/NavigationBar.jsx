import React from "react";
import { useNavigate } from "react-router-dom";

import HomeImage from "../assets/images/home.png";
import MessageSquareImage from "../assets/images/message-square.png";
import PieChartImage from "../assets/images/pie-chart.png";
import UserImage from "../assets/images/user.png";

function NavigationBar() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-row justify-evenly items-center h-full border-2">
      <div
        className="flex flex-col items-center gap-[0.8px] font-sans text-sm"
        onClick={() => navigate("/")}
      >
        <img
          src={HomeImage}
          className="w-[22px] h-[22px]"
          alt="홈 네비게이션 이미지"
        ></img>
        <div>홈</div>
      </div>
      <div
        className="flex flex-col items-center gap-[0.8px] font-sans text-sm"
        onClick={() => navigate("/chats")}
      >
        <img
          src={MessageSquareImage}
          className="w-[22px] h-[22px]"
          alt="채팅방 네비게이션 이미지"
        ></img>
        <div>채팅방</div>
      </div>
      <div
        className="flex flex-col items-center gap-[0.8px] font-sans text-sm"
        onClick={() => navigate("/")}
      >
        <img
          src={PieChartImage}
          className="w-[22px] h-[22px]"
          alt="지출 네비게이션 이미지"
        ></img>
        <div>지출</div>
      </div>
      <div
        className="flex flex-col items-center gap-[0.8px] font-sans text-sm"
        onClick={() => navigate("/")}
      >
        <img
          src={UserImage}
          className="w-[22px] h-[22px]"
          alt="마이페이지 네비게이션 이미지"
        ></img>
        <div>마이페이지</div>
      </div>
    </div>
  );
}

export default NavigationBar;
