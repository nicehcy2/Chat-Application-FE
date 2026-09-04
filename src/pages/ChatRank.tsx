import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { userApi } from "../api/userApi";
import { fetchRoomRank, type RankEntry, type RankWeek } from "../mocks/rank";
import { thumbFallbackClass } from "../utils/thumb";
import StateView from "../components/StateView";
import BackButtonImage from "../assets/images/back-button.png";
import GoldImage from "../assets/images/gold.png";

type Status = "loading" | "success" | "error";
const won = (n: number) => n.toLocaleString("ko-KR");

export default function ChatRank() {
  const navigate = useNavigate();
  const { chatRoomId = "" } = useParams();
  const { state } = useLocation() as { state: { title?: string } | null };
  const { auth } = useAuth();
  const myId = Number(auth.userId);

  const [week, setWeek] = useState<RankWeek>("this");
  const [entries, setEntries] = useState<RankEntry[]>([]);
  const [status, setStatus] = useState<Status>("loading");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    userApi
      .getUser(myId)
      .then((user) => fetchRoomRank(chatRoomId, week, myId, user.nickname))
      .then((list) => {
        if (cancelled) return;
        setEntries(list);
        setStatus("success");
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, [chatRoomId, week, myId, reloadKey]);

  const changeWeek = (next: RankWeek) => {
    if (next === week) return;
    setStatus("loading");
    setWeek(next);
  };

  const myIndex = entries.findIndex((e) => e.userId === myId);
  const me = myIndex >= 0 ? entries[myIndex] : null;
  const above = myIndex > 0 ? entries[myIndex - 1] : null;

  return (
    <div className="flex flex-col h-full bg-bgApp">
      <div className="h-12 shrink-0 flex items-center justify-between px-3 bg-white">
        <div className="flex items-center gap-1.5">
          <button type="button" onClick={() => navigate(-1)} aria-label="뒤로" className="w-10 h-11 flex items-center justify-center">
            <img src={BackButtonImage} alt="" className="w-5 h-5" />
          </button>
          <p className="text-[17px] font-extrabold text-ink">{week === "this" ? "이번 주 랭킹" : "지난 주 랭킹"}</p>
        </div>
        {/* TODO: 방 규칙 화면 */}
        <span className="text-[13px] font-bold text-primary px-2">{state?.title ?? ""}</span>
      </div>

      <div className="flex-1 overflow-y-auto flex flex-col gap-3.5 px-4 pt-3.5 pb-6">
        <div className="flex bg-white rounded-[14px] p-1">
          {(["this", "last"] as RankWeek[]).map((w) => (
            <button
              key={w}
              type="button"
              onClick={() => changeWeek(w)}
              className={`flex-1 h-9 rounded-[11px] text-[13px] transition-colors ease-out ${
                week === w ? "bg-primary text-white font-bold" : "text-inkMuted font-semibold"
              }`}
            >
              {w === "this" ? "이번 주" : "지난 주"}
            </button>
          ))}
        </div>

        {status === "loading" && (
          <div className="flex flex-col gap-3.5 animate-pulse">
            <div className="h-[104px] rounded-[20px] bg-fill" />
            <div className="h-[340px] rounded-[20px] bg-white" />
          </div>
        )}

        {status === "error" && (
          <StateView
            icon={<span className="text-[32px] font-extrabold text-danger">!</span>}
            iconBg="bg-dangerSoftBg"
            title="랭킹을 불러오지 못했어요"
            outlineAction={{ label: "다시 시도", onClick: () => { setStatus("loading"); setReloadKey((k) => k + 1); } }}
          />
        )}

        {status === "success" && (
          <>
            {me && (
              <div className="bg-primary rounded-[20px] p-[18px] flex items-center gap-4">
                <div className="flex flex-col items-center gap-0.5">
                  <span className="text-[11px] font-semibold text-white/70">내 순위</span>
                  <span className="text-[32px] font-extrabold text-white leading-none">{myIndex + 1}</span>
                </div>
                <div className="w-px h-11 bg-white/20" />
                <div className="flex-1 flex flex-col gap-1.5 text-[13px]">
                  <div className="flex justify-between">
                    <span className="text-white/75">달성</span>
                    <span className="text-white font-bold">{me.achievedDays} / 7일</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/75">주간 지출</span>
                    <span className="text-white font-bold">{won(me.weeklySpent)}원</span>
                  </div>
                  {above && (
                    <span className="text-[11px] text-white/70">
                      {myIndex}위와 {Math.max(0, above.achievedDays - me.achievedDays) || "지출"}
                      {above.achievedDays - me.achievedDays > 0 ? "일 차이" : ` ${won(me.weeklySpent - above.weeklySpent)}원 차이`}
                    </span>
                  )}
                </div>
              </div>
            )}

            <div className="bg-white rounded-[20px] px-4 py-1.5 flex flex-col">
              {entries.map((entry, i) => {
                const isMe = entry.userId === myId;
                const rank = i + 1;
                return (
                  <div
                    key={entry.userId}
                    className={`flex items-center gap-3 py-3 ${
                      isMe ? "px-3 -mx-3 rounded-xl bg-primaryTintBg2 border border-primaryBarSoft" : i < entries.length - 1 ? "border-b border-fillInput" : ""
                    }`}
                  >
                    <div className="w-7 flex justify-center">
                      <RankBadge rank={rank} isMe={isMe} />
                    </div>
                    {entry.imageUrl ? (
                      <img src={entry.imageUrl} alt="" className="w-9 h-9 rounded-xl object-cover shrink-0" />
                    ) : (
                      <div className={`w-9 h-9 rounded-xl shrink-0 ${thumbFallbackClass(entry.userId)}`} />
                    )}
                    <div className="flex-1 min-w-0 flex flex-col">
                      <span className="text-sm font-bold text-ink truncate">
                        {entry.nickname} {isMe && <span className="text-[11px] font-bold text-primary">나</span>}
                      </span>
                      <span className={`text-xs font-semibold ${entry.achievedDays >= 5 ? "text-mintDeep" : "text-inkMuted"}`}>{entry.achievedDays}일 달성</span>
                    </div>
                    <span className="text-sm font-bold text-ink">{won(entry.weeklySpent)}원</span>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function RankBadge({ rank, isMe }: { rank: number; isMe: boolean }) {
  if (rank === 1) return <img src={GoldImage} alt="1위" className="w-6 h-6" />;
  if (rank === 2) return <span className="w-6 h-6 rounded-full bg-line text-inkMid text-xs font-extrabold flex items-center justify-center">2</span>;
  if (rank === 3) return <span className="w-6 h-6 rounded-full bg-thumbPeach text-warnDeep text-xs font-extrabold flex items-center justify-center">3</span>;
  return <span className={`text-sm ${isMe ? "font-extrabold text-primary" : "font-bold text-inkMuted"}`}>{rank}</span>;
}
