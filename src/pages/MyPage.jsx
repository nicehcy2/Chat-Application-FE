import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../assets/images/logo.png"
import GoldImage from "../assets/images/gold.png"
import { useAuth } from "../contexts/AuthContext";
import { userApi } from "../api/userApi";
import { AGE_GROUP_OPTIONS, JOB_GROUP_OPTIONS, labelOf } from "../constants/user";

export default function MyPage() {

    const [user, setUser] = useState({});
    const { auth, logout } = useAuth();
    const navigate = useNavigate();

    // TODO: 라우트가 생기면 순서대로 연결
    const PENDING_MENUS = ["친구 초대", "자주 묻는 질문", "고객 지원", "서비스 이용 약관", "탈퇴하기"];

    useEffect(() => {
        userApi.getUser(auth.userId)
            .then(setUser)
            .catch((error) => console.error("유저 정보 조회 실패:", error));
    }, [auth.userId]);

    return (
        <div className="flex flex-col gap-4 bg-gray-100">
            <div className="flex flex-row items-center gap-4 bg-white px-4 py-4">
                <img className="w-20 h-20 rounded-full object-cover shrink-0"
                    src={user.imageUrl ?? Logo}
                    alt="profile"
                />
                <div className="flex flex-1 flex-col gap-1">
                    <div>
                        <p className="text-xl font-bold">{user.nickname ?? 'null'}</p>
                        <p className="text-sm text-primary">{labelOf(AGE_GROUP_OPTIONS, user.ageGroup)} · {labelOf(JOB_GROUP_OPTIONS, user.jobGroup)}</p>
                        <p className="text-sm text-gray-500">{user.email ?? 'null'}</p>
                    </div>
                    <button className="mt-1 w-full py-2 border border-gray-300 rounded-lg text-sm bg-gray-50" 
                        onClick={() => navigate('/mypage/edit')}>
                        프로필 수정
                    </button>
                </div>
            </div>
            <div className="bg-white px-4 py-4 flex flex-col gap-4">
                <div className="flex flex-row justify-between items-end">
                    <p className="text-lg">나의 하루 목표 지출액</p>
                    <p className="text-sm text-teal-400 font-bold">수정</p>
                </div>
                <div className="flex flex-row justify-between">
                    <div className="flex flex-col justify-center items-center border rounded-lg px-7 py-4 gap-2">
                        <p className="text-lg font-bold text-primary">{user.dayTargetExpenditure ?? '-'}원</p>
                        <p className="text-xs">일일 목표 지출 한도</p>
                    </div>
                    <div className="flex flex-col justify-center items-center border rounded-lg px-6 py-4 gap-2">
                        <p className="text-lg font-bold  text-primary">{user.targetRate ?? '-'}%</p>
                        <p className="text-xs">일주일 기준 목표달성률</p>
                    </div>
                </div>
                <div className="flex flex-row">
                    <p className="text-lg">나의 리워드</p>
                </div>
                <div className="border rounded-lg flex justify-center items-center py-4 pr-10 gap-3">
                    <img className="w-6 h-6 rounded-full object-cover"
                        src={GoldImage}
                        alt="gold"
                    />  
                    <p className="text-lg font-bold text-primary">{user.reward ?? 0}</p>
                </div>
            </div>
            <div className="flex flex-col bg-white px-4 py-4 gap-6">
                {PENDING_MENUS.map((label) => (
                    <div key={label} className="text-base text-inkDisabled pointer-events-none">{label}</div>
                ))}
                <div className="text-base cursor-pointer" onClick={logout}>로그아웃</div>
            </div>
        </div>
    );
}