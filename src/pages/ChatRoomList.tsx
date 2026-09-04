import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { chatApi } from "../api/chatApi";
import type { ChatRoomInfoResponseDto } from "../api/types";
import { formatListTime } from "../utils/date";
import { thumbFallbackClass } from "../utils/thumb";
import StateView from "../components/StateView";
import MessageSquareImage from "../assets/images/message-square.png";

type Status = "loading" | "success" | "empty" | "error";

export default function ChatRoomList() {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState<ChatRoomInfoResponseDto[]>([]);
  const [status, setStatus] = useState<Status>("loading");
  const [fabOpen, setFabOpen] = useState(false);

  const fetchRooms = useCallback(
    () =>
      chatApi
        .getRooms()
        .then((list) => {
          setRooms(list);
          setStatus(list.length === 0 ? "empty" : "success");
        })
        .catch(() => setStatus("error")),
    [],
  );

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  useEffect(() => {
    if (!fabOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setFabOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [fabOpen]);

  const retry = () => {
    setStatus("loading");
    fetchRooms();
  };

  const openRoom = (room: ChatRoomInfoResponseDto) =>
    navigate(`/chats/${room.chatRoomId}`, {
      state: { title: room.chatRoomTitle, participationCount: room.participationCount },
    });

  const go = (path: string) => {
    setFabOpen(false);
    navigate(path);
  };

  const totalUnread = rooms.reduce((sum, room) => sum + room.unreadChatCount, 0);

  return (
    <div className="relative flex flex-col h-full bg-white">
      <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden flex flex-col">
        {status === "loading" && <ListSkeleton />}

        {status === "success" && (
          <>
            <div className="flex items-center justify-between px-4 pt-3 pb-1">
              <div className="flex items-center gap-2">
                <span className="text-[15px] font-bold text-ink">나의 채팅 그룹</span>
                <span className="h-[22px] min-w-[22px] px-2 rounded-full bg-primaryTintBg text-primary text-xs font-extrabold flex items-center justify-center">
                  {rooms.length}
                </span>
                {totalUnread > 0 && <span className="text-xs font-semibold text-mintDeep">안 읽음 {totalUnread > 99 ? "99+" : totalUnread}</span>}
              </div>
              <button type="button" onClick={() => navigate("/chats/explore")} className="py-2 pl-3 text-[13px] font-bold text-primary">
                탐색 ›
              </button>
            </div>
            <div className="flex flex-col px-4 pb-24">
              {rooms.map((room, i) => (
                <div
                  key={room.chatRoomId}
                  onClick={() => openRoom(room)}
                  className={`flex gap-3.5 py-3 cursor-pointer active:bg-fillInput transition-colors ${
                    i === rooms.length - 1 ? "" : "border-b border-fillInput"
                  }`}
                >
                  {room.chatRoomThumbnail ? (
                    <img src={room.chatRoomThumbnail} alt="" className="w-[68px] h-[68px] rounded-2xl object-cover shrink-0" />
                  ) : (
                    <div className={`w-[68px] h-[68px] rounded-2xl shrink-0 ${thumbFallbackClass(room.chatRoomId)}`} />
                  )}
                  <div className="flex-1 min-w-0 flex flex-col justify-center gap-[5px]">
                    <div className="flex justify-between items-baseline gap-2">
                      <div className="flex items-baseline gap-[5px] min-w-0">
                        <span className="text-[15px] font-bold text-ink truncate">{room.chatRoomTitle}</span>
                        <span className="text-xs font-semibold text-primary shrink-0">{room.participationCount}</span>
                      </div>
                      <span className="text-[11px] text-inkDisabled shrink-0">{formatListTime(room.updatedAt)}</span>
                    </div>
                    <div className="flex justify-between items-start gap-2.5">
                      <p className={`flex-1 min-w-0 text-[13px] leading-[1.4] line-clamp-2 ${room.lastChatMessage ? "text-inkMuted" : "text-inkDisabled italic"}`}>
                        {room.lastChatMessage ?? "아직 대화가 없어요"}
                      </p>
                      {room.unreadChatCount > 0 && (
                        <span className="h-[22px] min-w-[22px] px-[7px] rounded-full bg-mint text-white text-xs font-bold flex items-center justify-center shrink-0">
                          {room.unreadChatCount > 99 ? "99+" : room.unreadChatCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {status === "empty" && (
          <StateView
            icon={<img src={MessageSquareImage} alt="" className="w-8 h-8" />}
            title="아직 참여한 채팅방이 없어요"
            description={
              <>
                비슷한 목표를 가진 사람들과
                <br />
                서로 지출을 지켜봐요
              </>
            }
            primaryAction={{ label: "채팅방 둘러보기", onClick: () => navigate("/chats/explore") }}
            textAction={{ label: "직접 만들기", onClick: () => navigate("/chats/create") }}
          />
        )}

        {status === "error" && (
          <StateView
            icon={<span className="text-[32px] font-extrabold text-danger">!</span>}
            iconBg="bg-dangerSoftBg"
            title="채팅방을 불러오지 못했어요"
            description={
              <>
                네트워크 연결을 확인하고
                <br />
                다시 시도해주세요
              </>
            }
            outlineAction={{ label: "다시 시도", onClick: retry }}
          />
        )}
      </div>

      {/* FAB 딤 — 바깥 탭·ESC로 닫힘 */}
      {fabOpen && <div className="absolute inset-0 z-10 bg-ink/35" onClick={() => setFabOpen(false)} />}

      {fabOpen && (
        <div className="absolute right-4 bottom-[84px] z-10 flex flex-col items-end gap-2.5">
          <FabMenuItem label="채팅방 만들기" icon={<PlusCircleIcon />} onClick={() => go("/chats/create")} />
          <FabMenuItem label="채팅방 둘러보기" icon={<SearchIcon />} onClick={() => go("/chats/explore")} />
        </div>
      )}

      {status !== "loading" && (
        <button
          type="button"
          aria-label={fabOpen ? "메뉴 닫기" : "메뉴 열기"}
          onClick={() => setFabOpen((open) => !open)}
          className="absolute right-4 bottom-4 z-10 w-14 h-14 rounded-full bg-primary text-white flex items-center justify-center shadow-[0_8px_20px_rgba(88,63,231,0.35)]"
        >
          <svg className={`w-6 h-6 transition-transform ease-out ${fabOpen ? "rotate-45" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
            <path strokeLinecap="round" d="M12 5v14M5 12h14" />
          </svg>
        </button>
      )}
    </div>
  );
}

function FabMenuItem({ label, icon, onClick }: { label: string; icon: React.ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-2.5 bg-white rounded-full pl-3.5 pr-[18px] py-[11px] text-sm font-bold text-ink shadow-[0_6px_18px_rgba(23,22,28,0.18)]"
    >
      {icon}
      {label}
    </button>
  );
}

function PlusCircleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#583FE7" strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v8M8 12h8" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#11B5A4" strokeWidth="2.2" strokeLinecap="round">
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-5.2-5.2" />
    </svg>
  );
}

function ListSkeleton() {
  return (
    <div className="flex flex-col px-4 pt-3 animate-pulse">
      <div className="w-24 h-3 rounded-md bg-fill mb-3" />
      {[140, 110, 150].map((w, i) => (
        <div key={i} className="flex gap-3.5 py-3 border-b border-fillInput">
          <div className="w-[68px] h-[68px] rounded-2xl bg-fill shrink-0" />
          <div className="flex-1 flex flex-col justify-center gap-2.5">
            <div className="flex justify-between">
              <div className="h-3.5 rounded-[7px] bg-fill" style={{ width: w }} />
              <div className="w-12 h-2.5 rounded-[5px] bg-fill" />
            </div>
            <div className="w-[220px] max-w-full h-3 rounded-md bg-fill" />
          </div>
        </div>
      ))}
    </div>
  );
}
