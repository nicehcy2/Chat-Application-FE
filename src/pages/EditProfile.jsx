import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import BackButton from "../components/BackButton";
import LabeledInput from "../components/LabeledInput";
import LabeledSelect from "../components/LabeledSelect";
import { useAuth } from "../contexts/AuthContext";
import { userApi } from "../api/userApi";
import {
  AGE_GROUP_OPTIONS,
  GENDER_OPTIONS,
  JOB_GROUP_OPTIONS,
  NICKNAME_MAX_LEN,
} from "../constants/user";

export default function EditProfile() {
  const [nickname, setNickname] = useState("");
  const [gender, setGender] = useState("");
  const [ageGroup, setAgeGroup] = useState("");
  const [jobGroup, setJobGroup] = useState("");
  const { auth } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    userApi.getUser(auth.userId)
      .then((user) => {
        setNickname(user.nickname ?? "");
        setGender(user.gender ?? "");
        setAgeGroup(user.ageGroup ?? "");
        setJobGroup(user.jobGroup ?? "");
      })
      .catch((error) => console.error("프로필 조회 실패:", error));
  }, [auth.userId]);

  const saveEditProfile = async () => {
    try {
      await userApi.editProfile(auth.userId, { nickname, gender, ageGroup, jobGroup });
      navigate("/mypage");
    } catch (error) {
      console.error("프로필 저장 실패:", error);
    }
  };

  return (
    <div className="px-4">
      <div className="flex flex-row py-2 justify-between items-center">
        <div className="flex flex-row gap-3 items-center">
          <BackButton />
          <p className="text-xl">프로필 수정</p>
        </div>
        <button className="font-bold text-primary" onClick={saveEditProfile}>저장</button>
      </div>
      <div className="flex flex-col gap-8">
        <div className="flex flex-col justify-between items-center py-2">
          <div className="relative w-28 h-28 rounded-full bg-gray-300">
            <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-white text-sm font-bold">편집</span>
          </div>
        </div>
        <LabeledInput
          label="1. 닉네임"
          value={nickname}
          onChange={setNickname}
          maxLength={NICKNAME_MAX_LEN}
        />
        <LabeledSelect label="2. 성별" options={GENDER_OPTIONS} value={gender} onChange={setGender} />
        <LabeledSelect label="3. 연령대" options={AGE_GROUP_OPTIONS} value={ageGroup} onChange={setAgeGroup} />
        <LabeledSelect label="4. 현재 하는 일" options={JOB_GROUP_OPTIONS} value={jobGroup} onChange={setJobGroup} />
      </div>
    </div>
  );
}
