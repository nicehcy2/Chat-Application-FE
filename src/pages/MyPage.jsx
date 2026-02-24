import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function MyPage() {

    const [user, setUser] = useState("");

    return (
        <div className="px-4 flex flex-col gap-8">
            <div className="flex flex-row">
                <image>ㅋ</image>
                <div>
                    <p>{user.nickname}</p>
                    <p>{user.ageGroup} · {user.jobGroup}</p>
                    <p>{user.email}</p>
                    <button>
                        프로필 수정
                    </button>
                </div>
            </div>
            <div>
                <div className="flex flex-row">
                    <p>나의 하루 목표 지출액</p>
                    <p>수정</p>
                </div>
                <div className="flex flex-row gap-4">
                    <div className="flex flex-col border">
                        <p>원</p>
                        <p>일일 목표 지출 한도</p>
                    </div>
                    <div className="flex flex-col border">
                        <p>%</p>
                        <p>일주일 기준 목표달성률</p>
                    </div>
                </div>
                <div>
                    <div className="flex flex-row">
                        <p>나의 리워드</p>
                        <div></div>
                    </div>
                </div>
                <div>
                    3122
                </div>
            </div>
            <div className="flex flex-1 flex-col gap-4">
                <div>친구 초대</div>
                <div>자주 묻는 질문</div>
                <div>고객 지원</div>
                <div>서비스 이용 약관</div>
                <div>로그아웃</div>
                <div>탈퇴하기</div>
            </div>
        </div>
    );
}