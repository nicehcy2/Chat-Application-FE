import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { chatApi } from "../api/chatApi";
import { ApiError } from "../api/client";
import { useAuth } from "../contexts/AuthContext";
import {
  EXPLORE_FILTERS,
  applyRoom,
  fetchExploreRooms,
  type ExploreFilter,
  type ExploreRoom,
} from "../mocks/explore";
import { thumbFallbackClass } from "../utils/thumb";
import RoomDetailSheet, { type RoomAction } from "../components/explore/RoomDetailSheet";
import StateView from "../components/StateView";

type Status = "loading" | "success" | "empty" | "error";

const SEARCH_DEBOUNCE_MS = 300;
const won = (n: number) => n.toLocaleString("ko-KR");

const JOIN_ERROR_MESSAGE: Record<string, string> = {
  CHATROOM4032: "재입장이 제한된 방이에요",
  CHATROOM409: "정원이 가득 찼어요",
  // 같은 유저의 동시 요청(unique 위반)
  "409": "잠시 후 다시 시도해주세요",
  CHATROOM404: "사라진 방이에요",
};
const JOIN_ERROR_ACTION: Partial<Record<string, RoomAction>> = {
  CHATROOM4032: "blocked",
  CHATROOM409: "full",
};

export default function ChatRoomExplore() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [filter, setFilter] = useState<ExploreFilter>("인기");
  const [rooms, setRooms] = useState<ExploreRoom[]>([]);
  const [status, setStatus] = useState<Status>("loading");
  const [reloadKey, setReloadKey] = useState(0);
  const [actions, setActions] = useState<Record<number, RoomAction>>({});
  const [actionError, setActionError] = useState("");
  const [selected, setSelected] = useState<ExploreRoom | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    let cancelled = false;
    fetchExploreRooms(debouncedQuery, filter)
      .then((list) => {
        if (cancelled) return;
        setRooms(list);
        setStatus(list.length === 0 ? "empty" : "success");
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, [debouncedQuery, filter, reloadKey]);

  const changeFilter = (next: ExploreFilter) => {
    setStatus("loading");
    setFilter(next);
  };

  const resetFilters = () => {
    setStatus("loading");
    setQuery("");
    setFilter("인기");
  };

  const retry = () => {
    setStatus("loading");
    setReloadKey((k) => k + 1);
  };

  const setAction = (id: number, action: RoomAction) => setActions((prev) => ({ ...prev, [id]: action }));
  const busyRoomId = Object.entries(actions).find(([, a]) => a === "joining")?.[0];

  const enterRoom = (room: ExploreRoom, participationCount: number) =>
    navigate(`/chats/${room.chatRoomId}`, { state: { title: room.title, participationCount } });

  /** 비밀번호가 틀렸을 때만 false. 비밀번호 다이얼로그가 그 값으로 열림 여부를 정한다 */
  const handleJoin = async (room: ExploreRoom, password?: string): Promise<boolean> => {
    setAction(room.chatRoomId, "joining");
    setActionError("");
    try {
      await chatApi.joinRoom(room.chatRoomId, password);
      enterRoom(room, room.participantCount + 1);
      return true;
    } catch (err) {
      const code = err instanceof ApiError ? (err.code ?? "") : "";

      // 이미 참여 중이면 오류가 아니라 그 방으로 보낸다
      if (code === "CHATROOM4091") {
        enterRoom(room, room.participantCount);
        return true;
      }
      if (code === "CHATROOM4031") {
        setAction(room.chatRoomId, "idle");
        if (password === undefined) setActionError("비밀번호가 맞지 않아요");
        return false;
      }

      setSelected(null);
      setAction(room.chatRoomId, JOIN_ERROR_ACTION[code] ?? "idle");
      if (code === "USER404") {
        // 토큰의 사용자가 DB에 없음. 세션을 비우면 ProtectedRoute가 로그인으로 보낸다
        await logout();
        return true;
      }
      if (code === "CHATROOM404") setReloadKey((k) => k + 1);
      setActionError(JOIN_ERROR_MESSAGE[code] ?? "참여하지 못했어요. 잠시 후 다시 시도해주세요.");
      return true;
    }
  };

  // TODO(서버): 승인제 신청 API 없음. 목 유지
  const handleApply = async (room: ExploreRoom) => {
    setAction(room.chatRoomId, "joining");
    setActionError("");
    try {
      await applyRoom(room.chatRoomId);
      setAction(room.chatRoomId, "applied");
      setSelected(null);
    } catch {
      setAction(room.chatRoomId, "idle");
      setActionError("신청하지 못했어요. 잠시 후 다시 시도해주세요.");
    }
  };

  return (
    <div className="relative flex flex-col h-full bg-white">
      <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden">
        <div className="sticky top-0 z-10 bg-white px-4 pt-2 pb-3 flex flex-col gap-3">
          <label className="h-11 rounded-[14px] bg-fillInput px-3.5 flex items-center gap-2">
            <SearchIcon />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="방 이름 · 태그로 검색"
              className="flex-1 bg-transparent text-sm text-ink placeholder:text-inkPlaceholder outline-none"
            />
          </label>
          <div className="flex gap-[7px] overflow-x-auto [&::-webkit-scrollbar]:hidden">
            {EXPLORE_FILTERS.map((chip) => {
              const active = chip === filter;
              return (
                <button
                  key={chip}
                  type="button"
                  onClick={() => changeFilter(chip)}
                  className={`px-[13px] py-2 rounded-full text-[13px] whitespace-nowrap transition-colors ease-out ${
                    active ? "bg-primary text-white font-bold" : "bg-fillInput text-inkMid font-semibold"
                  }`}
                >
                  {chip}
                </button>
              );
            })}
          </div>
        </div>

        <div className="px-4 pt-1 pb-6 flex flex-col gap-2">
          {actionError && <p className="text-[13px] text-danger py-1">{actionError}</p>}

          {status === "loading" && <ListSkeleton />}

          {status === "error" && (
            <StateView
              className="py-10 pb-10"
              icon={<span className="text-[32px] font-extrabold text-danger">!</span>}
              iconBg="bg-dangerSoftBg"
              title="방 목록을 불러오지 못했어요"
              outlineAction={{ label: "다시 시도", onClick: retry }}
            />
          )}

          {status === "empty" && (
            <StateView
              className="py-10 pb-10"
              icon={<SearchIcon />}
              title="조건에 맞는 방이 없어요"
              description="검색어나 필터를 바꿔보세요"
              outlineAction={{ label: "필터 초기화", onClick: resetFilters }}
            />
          )}

          {status === "success" && (
            <>
              <p className="text-[13px] font-semibold text-inkMuted py-1">내 목표와 비슷한 방 · {rooms.length}개</p>
              {rooms.map((room, i) => (
                <RoomCard
                  key={room.chatRoomId}
                  room={room}
                  action={actions[room.chatRoomId] ?? "idle"}
                  isLast={i === rooms.length - 1}
                  onOpen={() => setSelected(room)}
                  onJoin={() => (room.isPrivate ? setSelected(room) : handleJoin(room))}
                  onApply={() => (room.isPrivate ? setSelected(room) : handleApply(room))}
                />
              ))}
            </>
          )}
        </div>
      </div>

      <RoomDetailSheet
        room={selected}
        action={selected ? (actions[selected.chatRoomId] ?? "idle") : "idle"}
        busy={busyRoomId !== undefined}
        onClose={() => setSelected(null)}
        onJoin={handleJoin}
        onApply={handleApply}
      />
    </div>
  );
}

function RoomCard({
  room,
  action,
  isLast,
  onOpen,
  onJoin,
  onApply,
}: {
  room: ExploreRoom;
  action: RoomAction;
  isLast: boolean;
  onOpen: () => void;
  onJoin: () => void;
  onApply: () => void;
}) {
  const full = action === "full" || room.participantCount >= room.maxParticipants;

  return (
    <div className={`flex gap-3.5 py-3 ${isLast ? "" : "border-b border-fillInput"}`}>
      <div className="flex flex-1 min-w-0 gap-3.5 cursor-pointer" onClick={onOpen}>
        {room.thumbnailUrl ? (
          <img src={room.thumbnailUrl} alt="" className="w-[68px] h-[68px] rounded-2xl object-cover shrink-0" />
        ) : (
          <div className={`w-[68px] h-[68px] rounded-2xl shrink-0 ${thumbFallbackClass(room.chatRoomId)}`} />
        )}
        <div className="flex-1 min-w-0 flex flex-col gap-[5px]">
          <div className="flex items-baseline gap-[5px]">
            <span className="text-[15px] font-bold text-ink truncate">{room.title}</span>
            <span className="text-xs font-semibold text-primary shrink-0">
              {room.participantCount}/{room.maxParticipants}
            </span>
          </div>
          <p className="text-xs text-inkMuted leading-[1.45] line-clamp-2">{room.description}</p>
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold text-mintDeep bg-mintTintBg px-2 py-1 rounded-md">
              일 {won(room.dailyLimit)}원
            </span>
            <span className="text-[11px] font-semibold text-inkSub bg-fillInput px-2 py-1 rounded-md">
              {room.visibility === "APPROVAL" ? "승인제" : room.tag}
            </span>
          </div>
        </div>
      </div>
      <ActionButton room={room} full={full} action={action} onJoin={onJoin} onApply={onApply} />
    </div>
  );
}

function ActionButton({
  room,
  full,
  action,
  onJoin,
  onApply,
}: {
  room: ExploreRoom;
  full: boolean;
  action: RoomAction;
  onJoin: () => void;
  onApply: () => void;
}) {
  const base = "self-center h-9 px-3.5 rounded-xl text-[13px] font-extrabold shrink-0 transition-colors ease-out";
  const disabledClass = `${base} border-[1.4px] border-lineMid bg-fillSoft text-inkDisabled pointer-events-none`;
  const activeClass = `${base} border-[1.4px] border-primary bg-white text-primary`;

  if (full) return <button type="button" className={disabledClass}>마감</button>;
  if (action === "blocked") return <button type="button" className={disabledClass}>제한</button>;
  if (action === "applied") return <button type="button" className={disabledClass}>신청됨</button>;
  if (action === "joining") return <button type="button" className={disabledClass}>…</button>;

  const isApproval = room.visibility === "APPROVAL";
  return (
    <button type="button" onClick={isApproval ? onApply : onJoin} className={activeClass}>
      {isApproval ? "신청" : "참여"}
    </button>
  );
}

function SearchIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" className="stroke-inkPlaceholder shrink-0" strokeWidth="2.2">
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-5.2-5.2" strokeLinecap="round" />
    </svg>
  );
}

function ListSkeleton() {
  return (
    <div className="flex flex-col animate-pulse">
      {[0, 1, 2].map((i) => (
        <div key={i} className="flex gap-3.5 py-3 border-b border-fillInput">
          <div className="w-[68px] h-[68px] rounded-2xl bg-fill shrink-0" />
          <div className="flex-1 flex flex-col gap-2 pt-1">
            <div className="h-[15px] w-40 rounded bg-fill" />
            <div className="h-3 w-full rounded bg-bgApp" />
            <div className="h-5 w-24 rounded-md bg-bgApp" />
          </div>
        </div>
      ))}
    </div>
  );
}
