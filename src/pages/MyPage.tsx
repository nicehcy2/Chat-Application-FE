import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { userApi } from "../api/userApi";
import type { MyPageUser } from "../api/types";
import { AGE_GROUP_OPTIONS, JOB_GROUP_OPTIONS, labelOf } from "../constants/user";
import { fetchHomeSummary, weekAchievedRate, type HomeSummary } from "../mocks/home";
import { getLocalDailyGoal } from "../mocks/goal";
import StateView from "../components/StateView";
import { thumbFallbackClass } from "../utils/thumb";
import GoldImage from "../assets/images/gold.png";

type Status = "loading" | "success" | "error";
const won = (n: number) => n.toLocaleString("ko-KR");

// TODO: 라우트가 생기면 연결
const SUPPORT_MENUS = ["친구 초대", "자주 묻는 질문", "고객 지원"];

export default function MyPage() {
  const navigate = useNavigate();
  const { auth } = useAuth();
  const userId = auth.userId;
  const [user, setUser] = useState<MyPageUser | null>(null);
  const [summary, setSummary] = useState<HomeSummary | null>(null);
  const [status, setStatus] = useState<Status>("loading");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (userId === null) return;
    let cancelled = false;
    Promise.all([userApi.getUser(userId), fetchHomeSummary()])
      .then(([u, s]) => {
        if (cancelled) return;
        setUser(u);
        setSummary(s);
        setStatus("success");
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, [userId, reloadKey]);

  const dailyGoal = (user?.dayTargetExpenditure || 0) > 0 ? user!.dayTargetExpenditure : getLocalDailyGoal();

  return (
    <div className="flex flex-col gap-3.5 px-4 pt-3.5 pb-6 bg-bgApp min-h-full">
      {status === "loading" && <Skeleton />}

      {status === "error" && (
        <StateView
          icon={<span className="text-[32px] font-extrabold text-danger">!</span>}
          iconBg="bg-dangerSoftBg"
          title="내 정보를 불러오지 못했어요"
          outlineAction={{ label: "다시 시도", onClick: () => { setStatus("loading"); setReloadKey((k) => k + 1); } }}
        />
      )}

      {status === "success" && user && summary && (
        <>
          <div className="bg-white rounded-[20px] p-[18px] flex flex-col gap-4">
            <div className="flex items-center gap-4">
              {/* TODO(서버): MyPageUserInfoResponseDto에 imageUrl 없음 */}
              <div className={`w-[72px] h-[72px] rounded-full shrink-0 ${thumbFallbackClass(user.userId)}`} />
              <div className="min-w-0 flex flex-col gap-[3px]">
                <p className="text-[19px] font-extrabold text-ink truncate">{user.nickname}</p>
                <p className="text-[13px] font-bold text-primary">
                  {labelOf(AGE_GROUP_OPTIONS, user.ageGroup)} · {labelOf(JOB_GROUP_OPTIONS, user.jobGroup)}
                </p>
                <p className="text-[13px] text-inkMuted truncate">{user.email}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => navigate("/mypage/edit")}
              className="h-10 rounded-xl border-[1.4px] border-lineMid bg-white text-inkMid text-[13px] font-bold"
            >
              프로필 수정
            </button>
          </div>

          <div className="bg-white rounded-[20px] p-[18px] flex flex-col gap-3.5">
            <div className="flex items-center justify-between">
              <span className="text-[15px] font-bold text-ink">나의 목표</span>
              <button type="button" onClick={() => navigate("/onboarding/goal", { state: { edit: true } })} className="text-[13px] font-bold text-mint py-2 pl-3">
                수정
              </button>
            </div>
            <div className="flex gap-2.5">
              <div className="flex-1 bg-fillSoft rounded-[14px] p-3.5 flex flex-col gap-1">
                <span className="text-xl font-extrabold text-primary">
                  {dailyGoal > 0 ? won(dailyGoal) : "—"}
                  {dailyGoal > 0 && <span className="text-[13px] font-bold">원</span>}
                </span>
                <span className="text-xs text-inkMuted">하루 목표 지출</span>
              </div>
              <div className="flex-1 bg-fillSoft rounded-[14px] p-3.5 flex flex-col gap-1">
                <span className="text-xl font-extrabold text-primary">
                  {weekAchievedRate(summary.weekAchieved)}
                  <span className="text-[13px] font-bold">%</span>
                </span>
                <span className="text-xs text-inkMuted">이번 주 달성률</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[20px] px-[18px] py-4 flex items-center gap-3">
            <img src={GoldImage} alt="" className="w-[26px] h-[26px]" />
            <div className="flex-1 flex flex-col">
              <span className="text-[15px] font-extrabold text-primary">{won(summary.points)} P</span>
              <span className="text-xs text-inkMuted">이번 주 +{summary.weeklyPoints}P</span>
            </div>
            {/* TODO: 리워드 교환 화면 */}
            <span className="text-[13px] font-bold text-mint">교환</span>
          </div>

          <div className="bg-white rounded-[20px] px-[18px] py-1 flex flex-col">
            {SUPPORT_MENUS.map((label, i) => (
              <div key={label} className={`flex items-center justify-between h-[52px] ${i < SUPPORT_MENUS.length - 1 ? "border-b border-fillInput" : ""}`}>
                <span className="text-[15px] text-ink">{label}</span>
                <span className="text-lg text-lineStrong">›</span>
              </div>
            ))}
          </div>

          <p className="text-center text-xs text-inkDisabled pt-1">버전 1.0.0</p>
        </>
      )}
    </div>
  );
}

function Skeleton() {
  return (
    <div className="flex flex-col gap-3.5 animate-pulse">
      <div className="h-[178px] rounded-[20px] bg-white" />
      <div className="h-[142px] rounded-[20px] bg-white" />
      <div className="h-[74px] rounded-[20px] bg-white" />
      <div className="h-[164px] rounded-[20px] bg-white" />
    </div>
  );
}
