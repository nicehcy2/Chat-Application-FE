import type { ChatRoomParticipantDto, MessageDto } from "../../api/types";
import { formatTime } from "../../utils/date";
import { thumbFallbackClass } from "../../utils/thumb";

interface MessageItemProps {
  message: MessageDto;
  sender?: ChatRoomParticipantDto;
  isMine: boolean;
  /** 같은 사람이 이어서 보낸 메시지면 프로필을 생략하고 모서리만 바꾼다 */
  isContinuation: boolean;
  unread: number;
}

const BUBBLE_MAX = "max-w-[250px]";

export default function MessageItem({ message, sender, isMine, isContinuation, unread }: MessageItemProps) {
  const time = <span className="text-[10px] text-inkDisabled whitespace-nowrap">{formatTime(message.timestamp)}</span>;

  if (isMine) {
    return (
      <div className={`flex justify-end items-end gap-1.5 ${isContinuation ? "" : "mt-2"}`}>
        <div className="flex flex-col items-end gap-px shrink-0">
          {unread > 0 && <span className="text-[10px] font-bold text-primary">{unread}</span>}
          {time}
        </div>
        <Bubble
          message={message}
          mine
          className={`bg-primary text-white ${isContinuation ? "rounded-[16px_4px_16px_16px]" : "rounded-[16px_16px_4px_16px]"}`}
        />
      </div>
    );
  }

  const nickname = message.nickname ?? sender?.nickname ?? String(message.senderId);
  const imageUrl = message.senderImageUrl ?? sender?.imageUrl ?? null;

  return (
    <div className={`flex items-start gap-2 ${isContinuation ? "" : "mt-2"}`}>
      {isContinuation ? (
        <div className="w-10 shrink-0" />
      ) : imageUrl ? (
        <img src={imageUrl} alt="" className="w-10 h-10 rounded-[14px] object-cover shrink-0" />
      ) : (
        <div className={`w-10 h-10 rounded-[14px] shrink-0 ${thumbFallbackClass(message.senderId)}`} />
      )}
      <div className={`flex flex-col gap-1 ${BUBBLE_MAX}`}>
        {!isContinuation && <span className="text-xs font-bold text-inkMid">{nickname}</span>}
        <div className="flex items-end gap-1.5">
          <Bubble
            message={message}
            mine={false}
            className={`bg-fillInput text-ink ${isContinuation ? "rounded-[4px_16px_16px_16px]" : "rounded-[16px_16px_16px_4px]"}`}
          />
          <div className="flex flex-col items-start gap-px shrink-0">
            {unread > 0 && <span className="text-[10px] font-bold text-primary">{unread}</span>}
            {time}
          </div>
        </div>
      </div>
    </div>
  );
}

function Bubble({ message, mine, className }: { message: MessageDto; mine: boolean; className: string }) {
  if (message.messageType === "IMAGE") {
    // TODO(3순위): 이미지 업로드/갤러리 연동
    return (
      <div className={`w-[168px] h-[126px] border border-dashed border-lineMid flex flex-col items-center justify-center gap-1.5 ${className}`}>
        <span className="w-[26px] h-[22px] border-[1.6px] border-current opacity-50 rounded" />
        <span className="text-[11px] font-semibold opacity-60">이미지</span>
      </div>
    );
  }
  if (message.messageType === "RECEIPT") {
    // TODO(서버): 영수증 메시지 페이로드 확정 시 금액·남은 한도 분리 표시
    return (
      <div className={`${BUBBLE_MAX} px-3.5 py-3 flex flex-col gap-2 ${className}`}>
        <span className={`text-[11px] font-semibold ${mine ? "text-white/[0.72]" : "text-inkMuted"}`}>오늘 지출 인증</span>
        <span className="text-[15px] font-bold break-words">{message.content}</span>
      </div>
    );
  }
  return <div className={`${BUBBLE_MAX} px-3.5 py-2.5 text-[15px] leading-[1.4] break-words ${className}`}>{message.content}</div>;
}
