import { useState } from "react";
import { useNavigate } from "react-router-dom";
import BackButton from "../components/BackButton";
import NicknameInput from "../components/NicknameInput";
import { useAuthFetch } from "../hooks/useAuthFetch";
import LabeledSelect from "../components/LabeledSelect";
import { useAuth } from "../contexts/AuthContext";

const GENDER_OPTIONS = ["여자", "남자"];
const AGE_OPTIONS = ["14~19세", "20대", "30대", "40대", "50대", "60대 이상"];
const JOB_OPTIONS = ["대학(원)생", "직장인", "주부", "자영업자"];
const SAVE_PROFILE_URL = "http://localhost:8072/user-service/profile/edit";

export default function EditProfile() {
  const [nickname, setNickname] = useState("");
  const [gender, setGender] = useState("");
  const [age, setAge] = useState("");
  const [job, setJob] = useState("");
  const { auth } = useAuth();
  const navigate = useNavigate();

  const authFetch = useAuthFetch();

  const saveEditProfile = async () => {

    try {
      const response = await authFetch(
        `${SAVE_PROFILE_URL}`,
        {
          headers: {
            Authorization: `Bearer ${auth.accessToken}`,
            Accept: "application/json",
          },
        },
      );
      if (response.ok) {
        navigate("/profile");
        console.log("프로필 저장 성공");
      } else {
        console.error("프로필 저장 실패:", response.status);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  }

    return (
      <div className="px-4">
        <div className="flex flex-row py-2 justify-between items-center">
          <div className="flex flex-row gap-3 items-center">
            <BackButton />
            <p className="text-xl tracking-[-0.06em]">프로필 수정</p>
          </div>
          <button className="font-bold text-[#583FE7]"
            onClick={saveEditProfile}>저장</button>
        </div>
        <div className="flex flex-col gap-8">
          <div className="flex flex-col justify-between items-center py-2">
            <div className="relative w-28 h-28 rounded-full bg-gray-300">
              <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-white text-sm font-bold">편집</span>
            </div>
          </div>
          <div className="flex flex-col gap-12">
            <NicknameInput value={nickname} onChange={setNickname} />
            <div className="flex flex-row items-start">
              <p className="font-bold w-32 shrink-0">2. 성별</p>
              <div className="flex-1"><LabeledSelect label="" options={GENDER_OPTIONS} value={gender} onChange={setGender} /></div>
            </div>
            <div className="flex flex-row items-start">
              <p className="font-bold w-32 shrink-0">3. 연령대</p>
              <div className="flex-1"><LabeledSelect label="" options={AGE_OPTIONS} value={age} onChange={setAge} /></div>
            </div>
            <div className="flex flex-row items-start">
              <p className="font-bold w-32 shrink-0">4. 현재 하는 일</p>
              <div className="flex-1"><LabeledSelect label="" options={JOB_OPTIONS} value={job} onChange={setJob} /></div>
            </div>
          </div>
        </div>
      </div>
    )
}