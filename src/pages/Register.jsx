import { useState } from "react";
import { useNavigate } from 'react-router-dom';
import BackButton from "../components/BackButton";
import LabeledInput from "../components/LabeledInput";
import LabeledSelect from "../components/LabeledSelect";
import CompleteButton from "../components/CompleteButton";

export default function Register() {

    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [nickname, setNickname] = useState("");
    const [birthDay, setBirthDay] = useState("");
    const [birthDayError, setBirthDayError] = useState("");
    const [gender, setGender] = useState("");
    const [ageGroup, setAgeGroup] = useState("");
    const [job, setJob] = useState("");
    const [nicknameError, setNicknameError] = useState("");
    const [emailError, setEmailError] = useState("");
    const [emailChecked, setEmailChecked] = useState(false);
    const [passwordError, setPasswordError] = useState("");
    const maxNicknameLen = 20;
    const maxEmailLen = 100;
    const maxPasswordLen = 20;

    const GATEWAY_SERVER_URL = "http://localhost:8072";
    const REGISTER_URL = "/user-service/signup";

    const handleEmailCheck = async () => {
        if (!email) {
            setEmailError("이메일을 입력해주세요.");
            return;
        }
        try {
            const res = await fetch(`${GATEWAY_SERVER_URL}${REGISTER_URL}/email/check?email=${email}`);
            console.log(res);
            const isDuplicate = await res.json();
            if (isDuplicate) {
                setEmailError("이미 사용 중인 이메일입니다.");
                return;
            }
            setEmailChecked(true);
            setEmailError("");
        } catch (error) {
            setEmailError("이메일 확인 중 오류가 발생했습니다.");
        }
    };

    const handleSubmit = async () => {
        try {
            let hasError = false;

            if (!emailChecked) {
                setEmailError("이메일 중복 확인을 해주세요.");
                hasError = true;
            }

            if (!password) {
                setPasswordError("비밀번호를 입력해주세요.");
                hasError = true;
            }

            if (!nickname) {
                setNicknameError("닉네임을 입력해주세요.");
                hasError = true;
            }

            if (!/^\d{8}$/.test(birthDay)) {
                setBirthDayError("생년월일 8자리를 입력해주세요. (예: 20020330)");
                hasError = true;
            }

            if (hasError) return;

        const genderCode = gender === "남자" ? "M" : gender === "여자" ? "W" : "UNDECIDED";

        const ageGroupMap = {
            "14~19세": "TEENAGER",
            "20대": "TWENTIES",
            "30대": "THIRTIES",
            "40대": "FORTIES",
            "50대": "FIFTIES",
            "60대 이상": "SIXTIES_AND_ABOVE",
        };

        const jobGroupMap = {
            "학생": "STUDENT",
            "직장인": "EMPLOYEE",
            "주부": "HOMEMAKER",
            "자영업자": "SELF_EMPLOYED",
        };

        const res = await fetch(GATEWAY_SERVER_URL + REGISTER_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                credentials: "include",
                body: JSON.stringify({
                  email,
                  password,
                  nickname,
                  birthDay,
                  gender: genderCode,
                  userRole: "USER",
                  ageGroup: ageGroupMap[ageGroup] ?? "UNDECIDED",
                  jobGroup: jobGroupMap[job] ?? "UNDECIDED",
                  imageUrl: "image.url",
                  reward: 0,
                  status: true,
                  dayTargetExpenditure: 0,
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
          <div className="flex flex-col gap-4">
            <p className="text-xl text-[#583FE7] font-bold tracking-[-0.08em]">
              1. 이메일{" "}
              {emailError && <span className="text-red-500 text-sm font-normal">{emailError}</span>}
              {emailChecked && !emailError && <span className="text-green-500 text-sm font-normal">사용 가능한 이메일입니다.</span>}
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                maxLength={maxEmailLen}
                value={email}
                onChange={(e) => { setEmail(e.target.value); setEmailChecked(false); if (e.target.value) setEmailError(""); }}
                className={`flex-1 h-10 rounded-2xl bg-gray-100 border px-4 ${emailError ? "border-red-500" : "border-transparent"}`}
              />
              <button
                onClick={handleEmailCheck}
                className="h-10 px-2 rounded-2xl bg-[#583FE7] text-white text-sm font-medium whitespace-nowrap"
              >
                중복 확인
              </button>
            </div>
          </div>
          <LabeledInput
            label="2. 비밀번호"
            type="password"
            value={password}
            onChange={(value) => {
              setPassword(value);
              if (value) setPasswordError("");
            }}
            maxLength={maxPasswordLen}
            error={passwordError}
          />
          <LabeledInput
            label="3. 닉네임"
            value={nickname}
            onChange={(value) => {
              setNickname(value);
              if (value) setNicknameError("");
            }}
            maxLength={maxNicknameLen}
            error={nicknameError}
          />
          <LabeledInput
            label="4. 생년월일"
            value={birthDay}
            onChange={(value) => {
              setBirthDay(value);
              if (value) setBirthDayError("");
            }}
            maxLength={8}
            placeholder="20020330"
            error={birthDayError}
          />
          <LabeledSelect
            label="5. 성별을 알려주세요."
            options={["여자", "남자"]}
            value={gender}
            onChange={setGender}
          />
          <LabeledSelect
            label="6. 연령대를 알려주세요."
            options={["14~19세", "20대", "30대", "40대", "50대", "60대 이상"]}
            value={ageGroup}
            onChange={setAgeGroup}
          />
          <LabeledSelect
            label="7. 현재 하시는 일을 알려주세요."
            options={["학생", "직장인", "주부", "자영업자"]}
            value={job}
            onChange={setJob}
          />
          <CompleteButton label="완료" onChange={handleSubmit} />
        </div>
      </div>
    );
}
