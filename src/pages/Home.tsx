import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { userApi } from "../api/userApi";
import { chatApi } from "../api/chatApi";
import type { ChatRoomInfoResponseDto } from "../api/types";
import { fetchHomeSummary, type HomeSummary } from "../mocks/home";
import { addExpenseRecord, type NewExpenseRecord } from "../mocks/expenses";
import { getLocalDailyGoal, isGoalSkipped } from "../mocks/goal";
import { thumbFallbackClass } from "../utils/thumb";
import StateView from "../components/StateView";
import ExpenseRecordSheet from "../components/expense/ExpenseRecordSheet";
import GoldImage from "../assets/images/gold.png";

type Status = "loading" | "success" | "error";

interface HomeData {
  nickname: string;
  dailyLimit: number;
  summary: HomeSummary;
  rooms: ChatRoomInfoResponseDto[];
}

const WEEKDAY_LABELS = ["월", "화", "수", "목", "금", "토", "일"];
const won = (n: number) => n.toLocaleString("ko-KR");

const formatToday = () => new Date().toLocaleDateString("ko-KR", { month: "long", day: "numeric", weekday: "long" });

function weekDates(): Date[] {
  const today = new Date();
  const mondayOffset = (today.getDay() + 6) % 7;
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - mondayOffset + i);
    return d;
  });
}

export default function Home() {
  const navigate = useNavigate();
  const { auth } = useAuth();
  const userId = auth.userId;
  const [data, setData] = useState<HomeData | null>(null);
  const [status, setStatus] = useState<Status>("loading");
  const [reloadKey, setReloadKey] = useState(0);
  const [sheetOpen, setSheetOpen] = useState(false);

  useEffect(() => {
    if (userId === null) return;
    let cancelled = false;
    Promise.all([userApi.getUser(userId), fetchHomeSummary(), chatApi.getRooms()])
      .then(([user, summary, rooms]) => {
        if (cancelled) return;
        // 서버 값이 있으면 우선, 없으면 로컬 저장값. 둘 다 0이고 건너뛴 적 없으면 목표 설정으로 보낸다.
        const dailyLimit = user.dayTargetExpenditure > 0 ? user.dayTargetExpenditure : getLocalDailyGoal();
        if (dailyLimit === 0 && !isGoalSkipped()) {
          navigate("/onboarding/goal", { replace: true });
          return;
        }
        setData({ nickname: user.nickname, dailyLimit, summary, rooms: rooms.slice(0, 2) });
        setStatus("success");
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, [userId, reloadKey, navigate]);

  const reload = () => {
    setStatus("loading");
    setReloadKey((k) => k + 1);
  };

  const recordExpense = async (record: NewExpenseRecord) => {
    await addExpenseRecord(record);
    reload();
  };

  return (
    <div className="relative flex flex-col gap-3.5 px-4 pt-4 pb-6 bg-bgApp min-h-full">
      {status === "loading" && <Skeleton />}

      {status === "error" && (
        <StateView
          icon={<span className="text-[32px] font-extrabold text-danger">!</span>}
          iconBg="bg-dangerSoftBg"
          title="홈 정보를 불러오지 못했어요"
          description={
            <>
              네트워크 연결을 확인하고
              <br />
              다시 시도해주세요
            </>
          }
          outlineAction={{ label: "다시 시도", onClick: reload }}
        />
      )}

      {status === "success" && data && (
        <>
          <div>
            <p className="text-xs font-semibold text-inkMuted">{formatToday()}</p>
            <p className="text-[21px] font-extrabold text-ink mt-0.5">{data.nickname}님, 오늘도 무지출 가볼까요?</p>
          </div>

          <HeroCard
            dailyLimit={data.dailyLimit}
            summary={data.summary}
            onRecord={() => setSheetOpen(true)}
            onSetGoal={() => navigate("/onboarding/goal", { state: { edit: true } })}
          />
          <WeekCard summary={data.summary} />
          <GroupsCard rooms={data.rooms} />
          <RewardCard summary={data.summary} />

          <ExpenseRecordSheet
            open={sheetOpen}
            dailyLimit={data.dailyLimit}
            usedToday={data.summary.usedToday}
            shareTarget={data.rooms[0] ? { chatRoomId: data.rooms[0].chatRoomId, title: data.rooms[0].chatRoomTitle } : null}
            onClose={() => setSheetOpen(false)}
            onSubmit={recordExpense}
          />
        </>
      )}
    </div>
  );
}

function HeroCard({
  dailyLimit,
  summary,
  onRecord,
  onSetGoal,
}: {
  dailyLimit: number;
  summary: HomeSummary;
  onRecord: () => void;
  onSetGoal: () => void;
}) {
  // 목표를 건너뛴 경우 — 한도 카드 대신 '목표 정하기'
  if (dailyLimit === 0) {
    return (
      <div className="bg-primary rounded-[22px] p-5 flex flex-col gap-4">
        <div>
          <p className="text-xs font-semibold text-white/[0.72]">오늘 남은 한도</p>
          <p className="text-[21px] font-extrabold text-white leading-[1.25] mt-1">
            하루 목표를 정하면
            <br />
            남은 한도를 알려드려요
          </p>
        </div>
        <button type="button" onClick={onSetGoal} className="h-[46px] rounded-[14px] bg-white text-primaryDeep text-[15px] font-extrabold">
          목표 정하기
        </button>
      </div>
    );
  }

  const remaining = Math.max(0, dailyLimit - summary.usedToday);
  const usedRatio = Math.min(100, (summary.usedToday / dailyLimit) * 100);

  return (
    <div className="bg-primary rounded-[22px] p-5 flex flex-col gap-4">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-xs font-semibold text-white/[0.72]">오늘 남은 한도</p>
          <p className="text-[34px] font-extrabold text-white leading-[1.1] mt-1">
            {won(remaining)}
            <span className="text-xl font-bold">원</span>
          </p>
        </div>
        {summary.streakDays > 0 && (
          <span className="bg-white/[0.16] text-white text-xs font-bold px-2.5 py-1.5 rounded-full">{summary.streakDays}일 연속 달성</span>
        )}
      </div>
      <div className="flex flex-col gap-[7px]">
        <div className="h-2 rounded-full bg-white/[0.22] overflow-hidden">
          <div className="h-full bg-white rounded-full transition-[width] duration-[220ms] ease-out" style={{ width: `${usedRatio}%` }} />
        </div>
        <div className="flex justify-between text-[11px] font-semibold text-white/80">
          <span>사용 {won(summary.usedToday)}원</span>
          <span>한도 {won(dailyLimit)}원</span>
        </div>
      </div>
      <button type="button" onClick={onRecord} className="h-[46px] rounded-[14px] bg-white text-primaryDeep text-[15px] font-extrabold">
        ＋ 지출 기록하기
      </button>
    </div>
  );
}

function WeekCard({ summary }: { summary: HomeSummary }) {
  const dates = weekDates();
  const todayIndex = (new Date().getDay() + 6) % 7;
  const achievedCount = summary.weekAchieved.filter(Boolean).length;

  return (
    <div className="bg-white rounded-[18px] p-4 flex flex-col gap-3">
      <div className="flex justify-between items-baseline">
        <p className="text-[15px] font-bold text-ink">이번 주 달성</p>
        <span className="text-[13px] font-bold text-mint">{achievedCount} / 7일</span>
      </div>
      <div className="flex justify-between">
        {dates.map((date, i) => {
          const isToday = i === todayIndex;
          const achieved = i < todayIndex && summary.weekAchieved[i];
          const circle = achieved
            ? "bg-mint text-white font-extrabold"
            : isToday
              ? "bg-primaryTintBg border-2 border-primary text-primary font-extrabold"
              : "bg-fill text-inkFaint font-bold";
          const label = isToday ? "text-primary font-bold" : i < todayIndex ? "text-inkMuted" : "text-inkFaint";
          return (
            <div key={i} className="flex flex-col items-center gap-1.5">
              <div className={`w-[30px] h-[30px] rounded-full text-xs flex items-center justify-center ${circle}`}>{achieved ? "✓" : date.getDate()}</div>
              <span className={`text-[11px] ${label}`}>{isToday ? "오늘" : WEEKDAY_LABELS[i]}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function GroupsCard({ rooms }: { rooms: ChatRoomInfoResponseDto[] }) {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-[18px] p-4 flex flex-col gap-3">
      <div className="flex justify-between items-baseline">
        <p className="text-[15px] font-bold text-ink">나의 채팅 그룹</p>
        <button type="button" onClick={() => navigate("/chats")} className="text-[13px] font-bold text-primary">
          전체보기
        </button>
      </div>
      {rooms.length === 0 && (
        <p className="text-[13px] text-inkMuted">
          아직 참여한 그룹이 없어요.{" "}
          <button type="button" onClick={() => navigate("/chats/explore")} className="text-primary font-bold">
            둘러보기
          </button>
        </p>
      )}
      {rooms.map((room, i) => (
        <div key={room.chatRoomId}>
          {i > 0 && <div className="h-px bg-fill mb-3" />}
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() =>
              navigate(`/chats/${room.chatRoomId}`, {
                state: { title: room.chatRoomTitle, participationCount: room.participationCount },
              })
            }
          >
            {room.chatRoomThumbnail ? (
              <img src={room.chatRoomThumbnail} alt="" className="w-11 h-11 rounded-[14px] object-cover shrink-0" />
            ) : (
              <div className={`w-11 h-11 rounded-[14px] shrink-0 ${thumbFallbackClass(room.chatRoomId)}`} />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-ink truncate">
                {room.chatRoomTitle} <span className="text-[11px] font-semibold text-primary">{room.participationCount}</span>
              </p>
              <p className="text-xs text-inkMuted truncate">{room.lastChatMessage ?? "아직 대화가 없어요"}</p>
            </div>
            {room.unreadChatCount > 0 && (
              <span className="h-6 min-w-[24px] px-2 rounded-full bg-mint text-white text-xs font-bold flex items-center justify-center shrink-0">
                {room.unreadChatCount > 99 ? "99+" : room.unreadChatCount}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function RewardCard({ summary }: { summary: HomeSummary }) {
  return (
    <div className="bg-white rounded-[18px] p-4 flex items-center gap-3">
      <img src={GoldImage} alt="" className="w-[26px] h-[26px]" />
      <div className="flex-1">
        <p className="text-[15px] font-extrabold text-primary">{won(summary.points)} P</p>
        <p className="text-xs text-inkMuted">이번 주 +{summary.weeklyPoints}P 적립</p>
      </div>
      {/* TODO: 리워드 교환 화면 */}
      <span className="text-[13px] font-bold text-mint">교환</span>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="flex flex-col gap-3.5 animate-pulse">
      <div className="h-4 w-24 rounded bg-fill" />
      <div className="h-7 w-64 rounded bg-fill" />
      <div className="h-[214px] rounded-[22px] bg-fill" />
      <div className="h-[118px] rounded-[18px] bg-white" />
      <div className="h-[150px] rounded-[18px] bg-white" />
      <div className="h-[74px] rounded-[18px] bg-white" />
    </div>
  );
}
