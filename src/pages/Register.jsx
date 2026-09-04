import { useState } from "react";
import { useNavigate } from 'react-router-dom';
import BackButton from "../components/BackButton";
import LabeledInput from "../components/LabeledInput";
import LabeledSelect from "../components/LabeledSelect";
import CompleteButton from "../components/CompleteButton";
import { userApi } from "../api/userApi";
import {
  AGE_GROUP_OPTIONS,
  EMAIL_MAX_LEN,
  GENDER_OPTIONS,
  JOB_GROUP_OPTIONS,
  NICKNAME_MAX_LEN,
  PASSWORD_MAX_LEN,
  UNDECIDED,
} from "../constants/user";

export default function Register() {

    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [nickname, setNickname] = useState("");
    const [birthDay, setBirthDay] = useState("");
    const [birthDayError, setBirthDayError] = useState("");
    const [gender, setGender] = useState("");
    const [ageGroup, setAgeGroup] = useState("");
    const [jobGroup, setJobGroup] = useState("");
    const [nicknameError, setNicknameError] = useState("");
    const [emailError, setEmailError] = useState("");
    const [emailChecked, setEmailChecked] = useState(false);
    const [passwordError, setPasswordError] = useState("");
    
    const handleEmailCheck = async () => {
        if (!email) {
            setEmailError("이메일을 입력해주세요.");
            return;
        }
        try {
            const isDuplicate = await userApi.checkEmail(email);
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

            await userApi.signup({
              email,
              password,
              nickname,
              birthDay,
              gender: gender || UNDECIDED,
              ageGroup: ageGroup || UNDECIDED,
              jobGroup: jobGroup || UNDECIDED,
            });

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
            <p className="text-xl text-primary font-bold tracking-[-0.08em]">
              1. 이메일{" "}
              {emailError && <span className="text-red-500 text-sm font-normal">{emailError}</span>}
              {emailChecked && !emailError && <span className="text-green-500 text-sm font-normal">사용 가능한 이메일입니다.</span>}
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                maxLength={EMAIL_MAX_LEN}
                value={email}
                onChange={(e) => { setEmail(e.target.value); setEmailChecked(false); if (e.target.value) setEmailError(""); }}
                className={`flex-1 h-10 rounded-2xl bg-gray-100 border px-4 ${emailError ? "border-red-500" : "border-transparent"}`}
              />
              <button
                onClick={handleEmailCheck}
                className="h-10 px-2 rounded-2xl bg-primary text-white text-sm font-medium whitespace-nowrap"
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
            maxLength={PASSWORD_MAX_LEN}
            error={passwordError}
          />
          <LabeledInput
            label="3. 닉네임"
            value={nickname}
            onChange={(value) => {
              setNickname(value);
              if (value) setNicknameError("");
            }}
            maxLength={NICKNAME_MAX_LEN}
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
            options={GENDER_OPTIONS}
            value={gender}
            onChange={setGender}
          />
          <LabeledSelect
            label="6. 연령대를 알려주세요."
            options={AGE_GROUP_OPTIONS}
            value={ageGroup}
            onChange={setAgeGroup}
          />
          <LabeledSelect
            label="7. 현재 하시는 일을 알려주세요."
            options={JOB_GROUP_OPTIONS}
            value={jobGroup}
            onChange={setJobGroup}
          />
          <CompleteButton label="완료" onChange={handleSubmit} />
        </div>
      </div>
    );
}
