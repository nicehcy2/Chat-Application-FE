import React from "react";

import LogoImage from "../assets/images/logo.png";
import AlarmImage from "../assets/images/alarm.png";
import OptionsImage from "../assets/images/options-horizontal.png";
import { useNavigate } from "react-router-dom";

export default function Title() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-row justify-between px-4 h-full items-center">
      <img
        src={LogoImage}
        alt="logo"
        className="w-[23px] h-[23px]"
        onClick={() => navigate("/")}
      ></img>
      <div className="flex flex-row h-full items-center gap-2">
        <img src={AlarmImage} alt="logo" className="w-[19px] h-[19px]"></img>
        <img src={OptionsImage} alt="logo" className="w-[16px] h-[2px]"></img>
      </div>
    </div>
  );
}
