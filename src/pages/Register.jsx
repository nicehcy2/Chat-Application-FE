import React, { useState } from "react";
import { useNavigate, useParams } from 'react-router-dom';
import BackButtonImage from "../assets/images/back-button.png";

function Register() {

    const navigate = useNavigate();
    const [nickname, setNickname] = useState("");
    const maxNicknameLen = 10;
    
    return (
        <div className="h-full">
            <div className="p-4">
                <img
                    src={BackButtonImage}
                    alt="뒤로가기 버튼"
                    className="w-5 h-5"
                    onClick={() => navigate(-1)}
                ></img>
            </div>
            <div className="px-5">
                <p class="text-xl text-[#583FE7] font-bold tracking-[-0.08em]">
                1. 닉네임
                </p>
                <div className="relative">
                    <input
                        type="text"
                        maxLength={maxNicknameLen}
                        placeholder=""
                        value={nickname}
                        onChange={(e) => setNickname(e.target.value)}
                        className="w-full h-10 rounded-2xl bg-gray-100"/>
                    <span className="absolute right-4 top-1/2 -translate-y-1/2">
                        {nickname.length}/{maxNicknameLen}
                    </span>
                </div>
            </div>
        </div>
    )
}

export default Register
