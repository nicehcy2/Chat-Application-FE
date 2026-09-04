import { useEffect, useState } from "react";
import type { ExploreRoom } from "../../mocks/explore";
import { thumbFallbackClass } from "../../utils/thumb";

interface RoomDetailSheetProps {
  room: ExploreRoom | null;
  busy: boolean;
  onClose: () => void;
  onJoin: (room: ExploreRoom) => void;
  onApply: (room: ExploreRoom) => void;
  /** 비공개 방. 비밀번호가 맞으면 true를 돌려준다 */
  onValidatePassword: (room: ExploreRoom, password: string) => Promise<boolean>;
}

const won = (n: number) => n.toLocaleString("ko-KR");

// 탐색 카드 탭 → 바텀시트. 뒤의 목록은 그대로 두어 이탈 비용을 0으로.
export default function RoomDetailSheet({ room, busy, onClose, onJoin, onApply, onValidatePassword }: RoomDetailSheetProps) {
  const [askPassword, setAskPassword] = useState(false);

  useEffect(() => {
    if (!room) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Escape" || busy) return;
      if (askPassword) setAskPassword(false);
      else onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [room, busy, askPassword, onClose]);

  if (!room) return null;

  const full = room.participantCount >= room.maxParticipants;
  const ratio = Math.min(100, (room.participantCount / room.maxParticipants) * 100);
  const isApproval = room.visibility === "APPROVAL";

  const primaryAction = () => {
    if (room.isPrivate) setAskPassword(true);
    else if (isApproval) onApply(room);
    else onJoin(room);
  };

  return (
    <>
      <div className="absolute inset-0 z-20 bg-ink/[0.42]" onClick={busy ? undefined : onClose} />
      <div className="absolute left-0 right-0 bottom-0 z-20 bg-white rounded-t-[28px] px-5 pt-2.5 pb-5 flex flex-col gap-4">
        <div className="w-11 h-1 rounded-full bg-lineMid self-center" />

        <div className="flex items-center gap-3.5">
          {room.thumbnailUrl ? (
            <img src={room.thumbnailUrl} alt="" className="w-[76px] h-[76px] rounded-[22px] object-cover shrink-0" />
          ) : (
            <div className={`w-[76px] h-[76px] rounded-[22px] shrink-0 ${thumbFallbackClass(room.chatRoomId)}`} />
          )}
          <div className="flex-1 min-w-0 flex flex-col gap-[5px]">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="text-lg font-extrabold text-ink truncate">{room.title}</span>
              {room.isPrivate && (
                <span className="text-[11px] font-bold text-inkMid bg-fillInput px-[7px] py-[3px] rounded-[5px] shrink-0">🔒 비공개</span>
              )}
            </div>
            <span className="text-[13px] text-inkMuted">
              인원 {room.participantCount} / {room.maxParticipants}명
            </span>
            <div className="h-[5px] rounded-full bg-fill overflow-hidden mt-0.5">
              <div className="h-full bg-primary rounded-full" style={{ width: `${ratio}%` }} />
            </div>
          </div>
        </div>

        <p className="text-sm leading-[1.6] text-inkMid">{room.description}</p>

        <div className="flex flex-wrap gap-1.5">
          <span className="text-xs font-bold text-mintDeep bg-mintTintBg px-2.5 py-1.5 rounded-lg">일 {won(room.dailyLimit)}원</span>
          <span className="text-xs font-semibold text-inkMid bg-fillInput px-2.5 py-1.5 rounded-lg">{room.ageGroupLabel}</span>
          <span className="text-xs font-semibold text-inkMid bg-fillInput px-2.5 py-1.5 rounded-lg">{room.jobLabel}</span>
        </div>

        <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-fillSoft">
          {room.host.imageUrl ? (
            <img src={room.host.imageUrl} alt="" className="w-[38px] h-[38px] rounded-full object-cover shrink-0" />
          ) : (
            <div className={`w-[38px] h-[38px] rounded-full shrink-0 ${thumbFallbackClass(room.host.userId)}`} />
          )}
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-bold text-ink flex items-center gap-1">
              {room.host.nickname}
              <span className="text-[10px] font-extrabold text-white bg-primary px-1.5 py-0.5 rounded-[5px]">호스트</span>
            </p>
            <p className="text-xs text-inkMuted">
              {room.host.ageGroupLabel} · {room.host.jobLabel} · 방 개설 {room.host.createdDaysAgo}일
            </p>
          </div>
        </div>

        {full ? (
          <DisabledCta label="정원이 가득 찼어요" />
        ) : room.rejoinBlocked ? (
          <DisabledCta label="재입장 제한 중" />
        ) : (
          <button
            type="button"
            onClick={primaryAction}
            disabled={busy}
            className="w-full h-[52px] rounded-2xl bg-primary text-white text-base font-extrabold disabled:opacity-60"
          >
            {busy ? "처리 중…" : isApproval ? "참여 신청하기" : "입장하기"}
          </button>
        )}
      </div>

      {askPassword && (
        <PasswordDialog
          busy={busy}
          onCancel={() => setAskPassword(false)}
          onSubmit={async (password) => {
            const ok = await onValidatePassword(room, password);
            if (!ok) return false;
            setAskPassword(false);
            if (isApproval) onApply(room);
            else onJoin(room);
            return true;
          }}
        />
      )}
    </>
  );
}

function DisabledCta({ label }: { label: string }) {
  return (
    <div className="w-full h-11 rounded-[14px] bg-fillSoft border border-line text-inkDisabled text-[13px] font-bold flex items-center justify-center">
      {label}
    </div>
  );
}

// 2j 프레임이 번들에 없어 ConfirmDialog 규격 + 방 만들기의 4자리 입력 스타일로 구성
function PasswordDialog({
  busy,
  onCancel,
  onSubmit,
}: {
  busy: boolean;
  onCancel: () => void;
  onSubmit: (password: string) => Promise<boolean>;
}) {
  const [password, setPassword] = useState("");
  const [wrong, setWrong] = useState(false);
  const [checking, setChecking] = useState(false);

  const submit = async () => {
    if (password.length !== 4 || checking) return;
    setChecking(true);
    const ok = await onSubmit(password);
    setChecking(false);
    if (!ok) {
      setWrong(true);
      setPassword("");
    }
  };

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center bg-ink/[0.42] px-6" onClick={busy ? undefined : onCancel}>
      <div role="dialog" aria-modal="true" className="w-full bg-white rounded-[22px] pt-[22px] px-5 pb-4 flex flex-col gap-3.5" onClick={(e) => e.stopPropagation()}>
        <div className="flex flex-col gap-[7px] text-center">
          <p className="text-[17px] font-extrabold text-ink">비공개 방이에요</p>
          <p className="text-[13px] leading-[1.6] text-inkMuted">방장에게 받은 4자리 비밀번호를 입력해 주세요</p>
        </div>
        <div className="flex flex-col gap-1.5">
          <div
            className={`h-[46px] rounded-[14px] flex items-center justify-between px-4 border-[1.4px] ${
              wrong ? "bg-dangerTintBg border-danger" : "bg-fillInput border-transparent"
            }`}
          >
            <input
              type="password"
              inputMode="numeric"
              pattern="\d*"
              maxLength={4}
              autoFocus
              value={password}
              onChange={(e) => {
                setPassword(e.target.value.replace(/\D/g, "").slice(0, 4));
                setWrong(false);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") submit();
              }}
              placeholder="••••"
              className="flex-1 min-w-0 bg-transparent text-base tracking-[0.3em] text-ink placeholder:text-inkPlaceholder outline-none"
            />
            <span className="text-xs text-inkDisabled shrink-0">4자리 숫자</span>
          </div>
          {wrong && <span className="text-xs font-semibold text-danger">비밀번호가 맞지 않아요</span>}
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={onCancel} disabled={busy || checking} className="flex-1 h-[46px] rounded-[14px] bg-fillInput text-inkMid text-[15px] font-bold">
            취소
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={password.length !== 4 || busy || checking}
            className="flex-1 h-[46px] rounded-[14px] bg-primary text-white text-[15px] font-extrabold disabled:opacity-40"
          >
            {checking ? "확인 중…" : "입장"}
          </button>
        </div>
      </div>
    </div>
  );
}
