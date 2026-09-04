import { useEffect, useState } from "react";
import type { ChatRoomParticipantDto } from "../../api/types";
import { thumbFallbackClass } from "../../utils/thumb";

interface ParticipantsDrawerProps {
  open: boolean;
  participants: ChatRoomParticipantDto[];
  myId: number;
  isHost: boolean;
  onClose: () => void;
  onKick: (participant: ChatRoomParticipantDto) => void;
  onLeave: () => void;
}

export default function ParticipantsDrawer({
  open,
  participants,
  myId,
  isHost,
  onClose,
  onKick,
  onLeave,
}: ParticipantsDrawerProps) {
  // TODO: 알림 설정 API 연동 전까지 화면 상태만
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const host = participants.find((p) => p.isHost);
  const members = participants.filter((p) => !p.isHost);

  return (
    <>
      <div className="absolute inset-0 z-20 bg-ink/[0.42]" onClick={onClose} />
      <aside className="absolute top-0 right-0 bottom-0 z-20 w-[312px] bg-white flex flex-col rounded-l-[28px] overflow-hidden">
        <div className="h-[52px] shrink-0 flex items-center justify-between pl-[18px] pr-2 border-b border-fillInput">
          <p className="text-base font-extrabold text-ink">
            참여자 <span className="text-primary">{participants.length}</span>
          </p>
          <button type="button" onClick={onClose} aria-label="닫기" className="w-11 h-11 flex items-center justify-center text-[19px] text-inkMuted">
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-2">
          {host && (
            <>
              <SectionLabel>호스트</SectionLabel>
              <ParticipantRow participant={host} isMe={host.userId === myId} badge="host" />
              <div className="h-px bg-fillInput mx-[18px] my-1.5" />
            </>
          )}
          <SectionLabel>멤버 {members.length}</SectionLabel>
          {members.map((p) => (
            <ParticipantRow
              key={p.userId}
              participant={p}
              isMe={p.userId === myId}
              action={
                isHost && p.userId !== myId ? (
                  <button
                    type="button"
                    onClick={() => onKick(p)}
                    className="h-8 px-2.5 rounded-[9px] border-[1.2px] border-dangerLineSoft bg-white text-danger text-xs font-bold shrink-0"
                  >
                    강퇴
                  </button>
                ) : undefined
              }
            />
          ))}
        </div>

        <div className="shrink-0 border-t border-fillInput pt-3 px-[18px] pb-4 flex flex-col gap-2">
          <label className="flex items-center justify-between py-2 cursor-pointer">
            <span className="text-sm text-ink">알림 끄기</span>
            <span
              role="switch"
              aria-checked={muted}
              onClick={() => setMuted((m) => !m)}
              className={`w-11 h-[26px] rounded-full p-[3px] flex items-center transition-colors ease-out ${
                muted ? "bg-primary justify-end" : "bg-lineMid justify-start"
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-white" />
            </span>
          </label>
          <button
            type="button"
            onClick={onLeave}
            className="w-full h-[46px] rounded-[14px] border-[1.4px] border-dangerLineSoft bg-white text-danger text-sm font-extrabold"
          >
            방 나가기
          </button>
        </div>
      </aside>
    </>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="px-[18px] py-1.5 text-xs font-bold text-inkMuted">{children}</p>;
}

function ParticipantRow({
  participant,
  isMe,
  badge,
  action,
}: {
  participant: ChatRoomParticipantDto;
  isMe: boolean;
  badge?: "host";
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2.5 px-[18px] py-2.5">
      {participant.imageUrl ? (
        <img src={participant.imageUrl} alt="" className="w-10 h-10 rounded-[14px] object-cover shrink-0" />
      ) : (
        <div className={`w-10 h-10 rounded-[14px] shrink-0 ${thumbFallbackClass(participant.userId)}`} />
      )}
      <div className="flex-1 min-w-0">
        <p className={`text-sm text-ink truncate flex items-center gap-[5px] ${badge ? "font-bold" : "font-semibold"}`}>
          {participant.nickname}
          {badge === "host" && (
            <span className="text-[10px] font-extrabold text-white bg-primary px-1.5 py-0.5 rounded-[5px]">호스트</span>
          )}
          {isMe && <span className="text-[11px] font-bold text-primary">나</span>}
        </p>
      </div>
      {action}
    </div>
  );
}
