import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { chatApi } from "../api/chatApi";
import type { ChatRoomInfoResponseDto } from "../api/types";
import { formatListTime } from "../utils/date";
import MessageSquareImage from "../assets/images/message-square.png";

type Status = "loading" | "success" | "empty" | "error";

// 썸네일이 없을 때 방 id로 고정되는 플레이스홀더 색
const THUMB_FALLBACKS = ["bg-primaryBarSoft", "bg-mintSoft", "bg-[#F5E4D0]", "bg-[#E3E7F5]"];
const thumbClass = (id: number) => THUMB_FALLBACKS[id % THUMB_FALLBACKS.length];

export default function ChatRoomList() {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState<ChatRoomInfoResponseDto[]>([]);
  const [status, setStatus] = useState<Status>("loading");

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

  const retry = () => {
    setStatus("loading");
    fetchRooms();
  };

  const openRoom = (room: ChatRoomInfoResponseDto) =>
    navigate(`/chats/${room.chatRoomId}`, {
      state: { title: room.chatRoomTitle, participationCount: room.participationCount },
    });

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex gap-2 px-4 pt-1.5 pb-3 shrink-0">
        <button
          type="button"
          onClick={() => navigate("/chats/create")}
          className="flex-1 h-11 rounded-[14px] bg-primary text-white text-sm font-extrabold flex items-center justify-center gap-1.5"
        >
          ＋ 방 만들기
        </button>
        <button
          type="button"
          onClick={() => navigate("/chats/explore")}
          className="flex-1 h-11 rounded-[14px] border-[1.4px] border-lineMid bg-white text-primaryDeep text-sm font-extrabold flex items-center justify-center gap-1.5"
        >
          <SearchIcon />
          탐색
        </button>
      </div>

      {status === "loading" && <ListSkeleton />}

      {status === "success" && (
        <>
          <div className="px-4 pb-1 text-[13px] font-semibold text-inkMuted">참여 중 {rooms.length}개</div>
          <div className="flex flex-col gap-0.5 px-4 pt-1 pb-5">
            {rooms.map((room) => (
              <div
                key={room.chatRoomId}
                onClick={() => openRoom(room)}
                className="flex items-center gap-3.5 py-3 cursor-pointer active:bg-fillInput transition-colors"
              >
                {room.chatRoomThumbnail ? (
                  <img src={room.chatRoomThumbnail} alt="" className="w-[68px] h-[68px] rounded-[18px] object-cover shrink-0" />
                ) : (
                  <div className={`w-[68px] h-[68px] rounded-[18px] shrink-0 ${thumbClass(room.chatRoomId)}`} />
                )}
                <div className="flex flex-1 min-w-0 flex-col gap-1.5">
                  <div className="flex justify-between items-baseline gap-2">
                    <div className="min-w-0 truncate">
                      <span className="text-[15px] font-bold text-ink">{room.chatRoomTitle}</span>
                      <span className="ml-[5px] text-xs font-semibold text-primary">{room.participationCount}</span>
                    </div>
                    <span className="text-[11px] text-inkDisabled shrink-0">{formatListTime(room.updatedAt)}</span>
                  </div>
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex-1 min-w-0 text-xs leading-[1.45] text-inkMuted line-clamp-2">
                      {room.lastChatMessage}
                    </div>
                    {room.unreadChatCount > 0 && (
                      <div className="h-[22px] min-w-[22px] px-[7px] rounded-full bg-mint text-white text-[11px] font-extrabold flex items-center justify-center shrink-0">
                        {room.unreadChatCount > 99 ? "99+" : room.unreadChatCount}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {status === "empty" && (
        <div className="flex-1 flex flex-col items-center justify-center gap-[18px] px-8">
          <div className="w-[104px] h-[104px] rounded-[32px] bg-bgApp flex items-center justify-center">
            <img src={MessageSquareImage} alt="" className="w-10 h-10 opacity-60" />
          </div>
          <div className="text-center flex flex-col gap-1.5">
            <p className="text-[17px] font-extrabold text-ink">참여 중인 채팅방이 없어요</p>
            <p className="text-[13px] leading-[1.55] text-inkMuted">
              목표가 비슷한 사람들과 함께하면
              <br />
              훨씬 오래 갑니다
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate("/chats/explore")}
            className="w-full h-[50px] rounded-2xl bg-primary text-white text-[15px] font-extrabold"
          >
            탐색하러 가기
          </button>
        </div>
      )}

      {status === "error" && (
        <div className="mx-4 mb-5 mt-auto flex items-center gap-3 p-3.5 rounded-2xl border border-dangerLine bg-dangerTintBg">
          <div className="w-8 h-8 rounded-full bg-dangerSoft text-dangerDeep text-[15px] font-extrabold flex items-center justify-center shrink-0">
            !
          </div>
          <div className="flex-1">
            <p className="text-[13px] font-bold text-ink">목록을 불러오지 못했어요</p>
            <p className="text-xs text-inkMuted">네트워크 상태를 확인해 주세요</p>
          </div>
          <button
            type="button"
            onClick={retry}
            className="h-[34px] px-3 rounded-[10px] border-[1.2px] border-danger bg-white text-danger text-xs font-extrabold shrink-0"
          >
            재시도
          </button>
        </div>
      )}
    </div>
  );
}

function SearchIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-5.2-5.2" strokeLinecap="round" />
    </svg>
  );
}

function ListSkeleton() {
  return (
    <div className="flex flex-col gap-0.5 px-4 pt-1 animate-pulse">
      {[0, 1, 2].map((i) => (
        <div key={i} className="flex items-center gap-3.5 py-3">
          <div className="w-[68px] h-[68px] rounded-[18px] bg-fill shrink-0" />
          <div className="flex flex-1 flex-col gap-2">
            <div className="flex justify-between gap-2">
              <div className="h-[13px] w-[130px] rounded-[5px] bg-fill" />
              <div className="h-[11px] w-11 rounded-[5px] bg-bgApp" />
            </div>
            <div className="h-[11px] w-full rounded-[5px] bg-bgApp" />
          </div>
        </div>
      ))}
    </div>
  );
}
