import { useState } from "react";
import { useNavigate } from 'react-router-dom';
import BackButton from "../components/BackButton";
import LabeledInput from "../components/LabeledInput";
import LabeledSelect from "../components/LabeledSelect";
import CompleteButton from "../components/CompleteButton";

function Register() {

    const navigate = useNavigate();
    const [nickname, setNickname] = useState("");
    const [gender, setGender] = useState("");
    const [ageGroup, setAgeGroup] = useState("");
    const [job, setJob] = useState("");
    const [nicknameError, setNicknameError] = useState("");
    const maxNicknameLen = 10;

    const GATEWAY_SERVER_URL = "http://localhost:8072";
    const REGISTER_URL = "/user-service/signup";

    const handleSubmit = async () => {
        try {
            
            if (!nickname) {
                setNicknameError("닉네임을 입력해주세요.");
                return;
            }

        const genderCode = gender === "남자" ? "M" :"W";

        const res = await fetch(GATEWAY_SERVER_URL + REGISTER_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                credentials: "include",
                // TODO: json 값 사용자 입력에 맞추도록 바꾸자.
                body: JSON.stringify({ 
                  nickname, 
                  password: "1234",
                  gender: genderCode,
                  userRole: "USER",
                  email: `${nickname}@naver.com`,
                  ImageUrl: "image.url"
                }),
            })

            if (!res.ok) throw new Error("register failed");

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

        <div className="px-5 flex flex-col gap-8">
          <LabeledInput
            label="1. 닉네임"
            value={nickname}
            onChange={(value) => {
              setNickname(value);
              if (value) setNicknameError("");
            }}
            maxLength={maxNicknameLen}
            error={nicknameError}
          />
          <LabeledSelect
            label="2. 성별을 알려주세요."
            options={["여자", "남자"]}
            value={gender}
            onChange={setGender}
          />
          <LabeledSelect
            label="3. 연령대를 알려주세요."
            options={["14~19세", "20대", "30대", "40대", "50대", "60대 이상"]}
            value={ageGroup}
            onChange={setAgeGroup}
          />
          <LabeledSelect
            label="4. 현재 하시는 일을 알려주세요."
            options={["학생", "직장인", "주부", "자영업자"]}
            value={job}
            onChange={setJob}
          />
          <CompleteButton label="완료" onChange={handleSubmit} />
        </div>
      </div>
    );
}

export default Register
