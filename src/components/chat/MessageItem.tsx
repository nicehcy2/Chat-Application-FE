import type { ChatRoomParticipantDto, MessageDto } from "../../api/types";
import { formatTime } from "../../utils/date";
import { thumbFallbackClass } from "../../utils/thumb";

interface MessageItemProps {
  message: MessageDto;
  sender?: ChatRoomParticipantDto;
  isMine: boolean;
  /** 같은 사람이 이어서 보낸 메시지면 프로필을 생략하고 꼬리 라운드만 바꾼다 */
  isContinuation: boolean;
  unread: number;
}

const BUBBLE_MAX = "max-w-[262px]";

export default function MessageItem({ message, sender, isMine, isContinuation, unread }: MessageItemProps) {
  const meta = (
    <div className={`flex flex-col shrink-0 leading-[1.2] ${isMine ? "items-end" : "items-start"}`}>
      {unread > 0 && <span className="text-[10px] font-bold text-primary">{unread}</span>}
      <span className="text-[10px] text-inkDisabled">{formatTime(message.timestamp)}</span>
    </div>
  );

  if (isMine) {
    return (
      <div className="flex justify-end items-end gap-1.5">
        {meta}
        <Bubble message={message} className="bg-primary text-white rounded-[16px_16px_5px_16px]" />
      </div>
    );
  }

  const nickname = message.nickname ?? sender?.nickname ?? String(message.senderId);
  const imageUrl = message.senderImageUrl ?? sender?.imageUrl ?? null;
  const tail = isContinuation ? "rounded-[5px_16px_16px_5px]" : "rounded-[16px_16px_16px_5px]";

  return (
    <div className={`flex gap-2 ${isContinuation ? "-mt-1.5" : ""}`}>
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
          <Bubble message={message} className={`bg-fillInput text-ink ${tail}`} />
          {meta}
        </div>
      </div>
    </div>
  );
}

function Bubble({ message, className }: { message: MessageDto; className: string }) {
  if (message.messageType === "IMAGE") {
    // TODO(3순위): 이미지 업로드/갤러리 연동
    return (
      <div className={`w-[168px] h-[126px] border border-dashed border-lineMid flex flex-col items-center justify-center gap-1.5 ${className}`}>
        <span className="w-[26px] h-[22px] border-[1.6px] border-inkDisabled rounded" />
        <span className="text-[11px] font-semibold text-inkDisabled">IMAGE</span>
      </div>
    );
  }
  if (message.messageType === "RECEIPT") {
    // TODO(3순위): 영수증 메시지 + 지출 도메인 연동
    return (
      <div className={`w-[200px] border border-dashed border-lineMid p-3 flex flex-col gap-2 ${className}`}>
        <span className="text-[11px] font-extrabold text-inkMuted">RECEIPT</span>
        <span className="text-[19px] font-extrabold">{message.content}</span>
      </div>
    );
  }
  return (
    <div className={`${BUBBLE_MAX} px-[13px] py-2.5 text-[15px] leading-[1.45] break-words ${className}`}>
      {message.content}
    </div>
  );
}
