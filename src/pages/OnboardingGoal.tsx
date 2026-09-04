import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getLocalDailyGoal, saveDailyGoal, skipGoal } from "../mocks/goal";

const STEP = 1_000;
const MIN = 1_000;
const PRESETS = [10_000, 15_000, 20_000, 30_000];
const won = (n: number) => n.toLocaleString("ko-KR");

// 가입 직후 1회 노출. 건너뛰면 홈 한도 카드가 '목표 정하기' CTA로 대체된다.
export default function OnboardingGoal() {
  const navigate = useNavigate();
  const { state } = useLocation() as { state: { edit?: boolean } | null };
  const editing = state?.edit ?? false;
  const [amount, setAmount] = useState(() => getLocalDailyGoal() || 15_000);
  const [saving, setSaving] = useState(false);

  const change = (next: number) => setAmount(Math.max(MIN, next));

  const finish = async () => {
    if (saving) return;
    setSaving(true);
    // TODO(서버): 하루 목표 저장 API 연동
    await saveDailyGoal(amount);
    setSaving(false);
    if (editing) navigate(-1);
    else navigate("/", { replace: true });
  };

  const skip = () => {
    skipGoal();
    navigate("/", { replace: true });
  };

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="h-12 shrink-0 flex items-center justify-end px-5">
        <button type="button" onClick={editing ? () => navigate(-1) : skip} className="text-[13px] font-semibold text-inkMuted py-2">
          {editing ? "취소" : "나중에 하기"}
        </button>
      </div>

      <div className="flex-1 flex flex-col gap-9 px-5 pt-7 overflow-y-auto">
        <div className="flex flex-col gap-2">
          <p className="text-[26px] font-extrabold text-ink leading-[1.25]">
            하루에 얼마까지
            <br />쓸 수 있을까요?
          </p>
          <p className="text-sm leading-[1.5] text-inkMuted">
            이 금액이 홈 화면의 ‘오늘 남은 한도’ 기준이 돼요. 나중에 지출 탭에서 바꿀 수 있어요.
          </p>
        </div>

        <div className="flex flex-col gap-[18px]">
          <div className="h-[72px] rounded-[20px] border-[1.5px] border-primary px-4 flex items-center justify-between">
            <button type="button" onClick={() => change(amount - STEP)} aria-label="줄이기" className="w-10 h-10 rounded-full bg-fillInput text-inkMid text-xl">
              −
            </button>
            <span className="text-[32px] font-extrabold text-ink">
              {won(amount)}
              <span className="text-lg font-bold">원</span>
            </span>
            <button type="button" onClick={() => change(amount + STEP)} aria-label="늘리기" className="w-10 h-10 rounded-full bg-primaryTintBg text-primary text-xl">
              ＋
            </button>
          </div>
          <div className="flex gap-[7px]">
            {PRESETS.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setAmount(preset)}
                className={`flex-1 h-10 rounded-xl text-[13px] transition-colors ease-out ${
                  amount === preset ? "bg-primary text-white font-bold" : "bg-fillInput text-inkMid font-semibold"
                }`}
              >
                {won(preset)}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-bgApp rounded-[18px] p-4 flex flex-col gap-2.5 text-[13px]">
          <div className="flex justify-between">
            <span className="text-inkMuted">한 달 기준</span>
            <span className="font-bold text-ink">약 {won(amount * 30)}원</span>
          </div>
          <div className="flex justify-between">
            <span className="text-inkMuted">채팅방 참여 시</span>
            <span className="font-bold text-ink">방의 한도가 우선 적용</span>
          </div>
        </div>
      </div>

      <div className="shrink-0 px-5 pt-3 pb-4">
        <button type="button" onClick={finish} disabled={saving} className="w-full h-12 rounded-2xl bg-primary text-white text-base font-extrabold disabled:opacity-60">
          {editing ? "저장" : "시작하기"}
        </button>
      </div>
    </div>
  );
}
