import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { chatApi } from "../api/chatApi";
import { ApiError } from "../api/client";
import type { ChatRoomParticipantDto } from "../api/types";
import { useChatRoom } from "../hooks/useChatRoom";
import { formatDateChip, isSameDay } from "../utils/date";
import { addExpenseRecord, getTodayUsed, type NewExpenseRecord } from "../mocks/expenses";
import { getLocalDailyGoal } from "../mocks/goal";
import MessageItem from "../components/chat/MessageItem";
import ParticipantsDrawer from "../components/chat/ParticipantsDrawer";
import ConfirmDialog from "../components/ConfirmDialog";
import StateView from "../components/StateView";
import ExpenseRecordSheet from "../components/expense/ExpenseRecordSheet";

import SendButtonImage from "../assets/images/chat-send-button.png";
import BackButtonImage from "../assets/images/back-button.png";
import ChatRankButtonImage from "../assets/images/chat-rank.png";
import ChatOptionImage from "../assets/images/chat-option.png";

const LOAD_OLDER_THRESHOLD_PX = 40;
const won = (n: number) => n.toLocaleString("ko-KR");

interface RoomLocationState {
  title?: string;
  participationCount?: number;
}

type Dialog = { kind: "leave" } | { kind: "kick"; target: ChatRoomParticipantDto } | null;

// 방 ID가 바뀌면 useChatRoom의 상태(메시지·참여자·읽음 커서)를 전부 새로 시작해야 하므로 key로 다시 마운트한다.
export default function Chat() {
  const { chatRoomId = "" } = useParams();
  return <ChatRoom key={chatRoomId} roomId={chatRoomId} />;
}

function ChatRoom({ roomId }: { roomId: string }) {
  const navigate = useNavigate();
  const { state } = useLocation() as { state: RoomLocationState | null };
  const room = useChatRoom(roomId);
  const { myId, isHost, status, retry, messages, participants, unreadCountOf, hasMore, loadingOlder, loadOlder, send } = room;

  const [inputValue, setInputValue] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [dialog, setDialog] = useState<Dialog>(null);
  const [actionBusy, setActionBusy] = useState(false);
  const [actionError, setActionError] = useState("");

  const listRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const lastTsidRef = useRef<string | null>(null);
  const scrollHeightBeforePrependRef = useRef<number | null>(null);

  // 목록에서 넘어온 state가 없으면(새로고침·직접 진입) 방 목록에서 찾아 채운다.
  // TODO(서버): 단일 방 조회 GET /api/chats/{id}가 생기면 그걸로 교체
  const [fallbackTitle, setFallbackTitle] = useState<string | null>(null);
  const stateTitle = state?.title;
  useEffect(() => {
    if (stateTitle) return;
    let cancelled = false;
    chatApi
      .getRooms()
      .then((rooms) => {
        if (cancelled) return;
        const found = rooms.find((r) => String(r.chatRoomId) === roomId);
        setFallbackTitle(found?.chatRoomTitle || "채팅방");
      })
      .catch(() => {
        if (!cancelled) setFallbackTitle("채팅방");
      });
    return () => {
      cancelled = true;
    };
  }, [roomId, stateTitle]);

  const participantList = Object.values(participants);
  const title = stateTitle || fallbackTitle;
  const participantCount = participantList.length || state?.participationCount;

  useLayoutEffect(() => {
    const list = listRef.current;
    if (!list || messages.length === 0) return;

    if (scrollHeightBeforePrependRef.current !== null) {
      list.scrollTop += list.scrollHeight - scrollHeightBeforePrependRef.current;
      scrollHeightBeforePrependRef.current = null;
      return;
    }

    const lastTsid = messages[messages.length - 1].messageTSID;
    if (lastTsid !== lastTsidRef.current) {
      lastTsidRef.current = lastTsid;
      bottomRef.current?.scrollIntoView();
    }
  }, [messages]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const list = e.currentTarget;
    if (list.scrollTop > LOAD_OLDER_THRESHOLD_PX || !hasMore || loadingOlder) return;
    scrollHeightBeforePrependRef.current = list.scrollHeight;
    loadOlder();
  };

  const handleSend = () => {
    if (send(inputValue)) setInputValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // 한글 입력 중 Enter는 조합 확정이므로 전송하지 않는다.
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      handleSend();
    }
  };

  // 지출 기록 후 "인증 공유"가 켜져 있으면 RECEIPT 메시지로 방에 발행한다.
  const recordExpense = async (record: NewExpenseRecord, share: boolean) => {
    await addExpenseRecord(record);
    if (share) send(`${record.memo || "지출"} · ${won(record.amount)}원`, "RECEIPT");
  };

  const runAction = async (task: () => Promise<unknown>, onDone: () => void) => {
    setActionBusy(true);
    setActionError("");
    try {
      await task();
      onDone();
    } catch (e) {
      setActionError(e instanceof ApiError ? e.message : "요청을 처리하지 못했어요.");
      setDialog(null);
    } finally {
      setActionBusy(false);
    }
  };

  const confirmDialog = () => {
    if (!dialog) return;
    if (dialog.kind === "leave") {
      runAction(() => chatApi.leaveRoom(roomId), () => navigate("/chats", { replace: true }));
    } else {
      const target = dialog.target;
      runAction(() => chatApi.kickMember(roomId, target.userId), () => setDialog(null));
    }
  };

  return (
    <div className="relative flex flex-col h-full bg-white">
      {/* 헤더 */}
      <div className="h-[52px] shrink-0 flex items-center justify-between pl-3 pr-2 border-b border-fillInput">
        <div className="flex items-center gap-1 min-w-0">
          <button type="button" onClick={() => navigate(-1)} aria-label="뒤로" className="w-10 h-11 flex items-center justify-center shrink-0">
            <img src={BackButtonImage} alt="" className="w-5 h-5" />
          </button>
          <div className="min-w-0 flex flex-col">
            {title ? (
              <div className="flex items-baseline gap-1.5 min-w-0">
                <span className="text-base font-extrabold text-ink truncate">{title}</span>
                {participantCount ? <span className="text-[13px] font-bold text-primaryDeep shrink-0">{participantCount}</span> : null}
              </div>
            ) : (
              <div className="h-3.5 w-[120px] rounded bg-fill animate-pulse" />
            )}
            {/* TODO(서버): 방 규칙(일 한도)·오늘 달성 인원이 오면 서브라인에 표시 */}
          </div>
        </div>
        <div className="flex items-center shrink-0">
          <button
            type="button"
            aria-label="랭킹"
            onClick={() => navigate(`/chats/${roomId}/rank`, { state: { title } })}
            className="w-11 h-11 flex items-center justify-center"
          >
            <img src={ChatRankButtonImage} alt="" className="w-4 h-6" />
          </button>
          <button type="button" aria-label="방 옵션" onClick={() => setDrawerOpen(true)} className="w-11 h-11 flex items-center justify-center">
            <img src={ChatOptionImage} alt="" className="w-5 h-4" />
          </button>
        </div>
      </div>

      {/* 메시지 영역 */}
      <div ref={listRef} onScroll={handleScroll} className="flex-1 overflow-y-auto flex flex-col">
        {status === "loading" && <MessageSkeleton />}

        {status === "error" && (
          <StateView
            icon={<span className="text-[32px] font-extrabold text-danger">!</span>}
            iconBg="bg-dangerSoftBg"
            title="대화를 불러오지 못했어요"
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

        {status === "ready" && (
          <div className="flex flex-col gap-1 px-4 py-3 mt-auto">
            {actionError && <p className="text-center text-xs text-danger">{actionError}</p>}

            {loadingOlder && (
              <div className="flex items-center justify-center gap-2 py-1">
                <span className="w-3.5 h-3.5 rounded-full border-2 border-lineMid border-t-primary animate-spin" />
                <span className="text-xs text-inkMuted">이전 메시지를 불러오는 중</span>
              </div>
            )}

            {messages.map((msg, index) => {
              const prev = messages[index - 1];
              const showDate = !prev || !isSameDay(prev.timestamp, msg.timestamp);
              const isContinuation = !showDate && !!prev && prev.senderId === msg.senderId;
              return (
                <div key={msg.messageTSID} className="flex flex-col">
                  {showDate && (
                    <div className="flex justify-center mb-2 mt-1">
                      <span className="text-[11px] text-inkMuted bg-fillInput px-2.5 py-1 rounded-full">{formatDateChip(msg.timestamp)}</span>
                    </div>
                  )}
                  <MessageItem
                    message={msg}
                    sender={participants[msg.senderId]}
                    isMine={msg.senderId === myId}
                    isContinuation={isContinuation}
                    unread={unreadCountOf(msg)}
                  />
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* 입력 바 */}
      <div className="shrink-0 flex items-center gap-2 px-3 py-2 border-t border-fillInput">
        <button
          type="button"
          aria-label="지출 기록"
          onClick={() => setSheetOpen(true)}
          className="w-11 h-11 rounded-full bg-fillInput text-inkMid flex items-center justify-center shrink-0"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
        </button>
        <input
          type="text"
          value={inputValue}
          placeholder="메시지를 입력하세요"
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 min-w-0 h-11 rounded-full bg-fillInput px-4 text-sm text-ink placeholder:text-inkPlaceholder outline-none"
        />
        <button type="button" onClick={handleSend} aria-label="전송" className="w-11 h-11 rounded-full bg-primary flex items-center justify-center shrink-0">
          <img src={SendButtonImage} alt="" className="w-5 h-5" />
        </button>
      </div>

      <ExpenseRecordSheet
        open={sheetOpen}
        dailyLimit={getLocalDailyGoal()}
        usedToday={getTodayUsed()}
        shareTarget={{ chatRoomId: roomId, title: title ?? "이 채팅방" }}
        onClose={() => setSheetOpen(false)}
        onSubmit={recordExpense}
      />

      <ParticipantsDrawer
        open={drawerOpen}
        participants={participantList}
        myId={myId}
        isHost={isHost}
        onClose={() => setDrawerOpen(false)}
        onKick={(target) => setDialog({ kind: "kick", target })}
        onLeave={() => setDialog({ kind: "leave" })}
      />

      <ConfirmDialog
        open={dialog?.kind === "leave"}
        title="방을 나갈까요?"
        description={
          isHost
            ? "호스트가 나가면 가장 오래 참여한 멤버에게 방장이 위임됩니다. 대화 내용은 다시 볼 수 없어요."
            : "대화 내용은 다시 볼 수 없어요."
        }
        confirmLabel="나가기"
        busy={actionBusy}
        onConfirm={confirmDialog}
        onCancel={() => setDialog(null)}
      />
      <ConfirmDialog
        open={dialog?.kind === "kick"}
        title={dialog?.kind === "kick" ? `${dialog.target.nickname}님을 내보낼까요?` : ""}
        description="내보낸 멤버는 이 방에 다시 들어올 수 없어요."
        confirmLabel="강퇴"
        busy={actionBusy}
        onConfirm={confirmDialog}
        onCancel={() => setDialog(null)}
      />
    </div>
  );
}

function MessageSkeleton() {
  return (
    <div className="flex flex-col gap-3 px-4 py-3 animate-pulse">
      <div className="flex gap-2">
        <div className="w-10 h-10 rounded-[14px] bg-fill" />
        <div className="w-[200px] h-10 rounded-2xl bg-fillInput" />
      </div>
      <div className="flex justify-end">
        <div className="w-[180px] h-10 rounded-2xl bg-primaryBarSoft" />
      </div>
      <div className="flex gap-2">
        <div className="w-10 h-10 rounded-[14px] bg-fill" />
        <div className="w-[150px] h-10 rounded-2xl bg-fillInput" />
      </div>
    </div>
  );
}
