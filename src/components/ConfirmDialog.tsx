import { useEffect } from "react";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel: string;
  cancelLabel?: string;
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

// 파괴적 동작(나가기·강퇴) 확인용. 부모가 position: relative인 프레임 영역이어야 한다.
export default function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel = "취소",
  busy = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !busy) onCancel();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, busy, onCancel]);

  if (!open) return null;

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center bg-ink/[0.42] px-6" onClick={busy ? undefined : onCancel}>
      <div
        role="dialog"
        aria-modal="true"
        className="w-full bg-white rounded-[22px] pt-[22px] px-5 pb-4 flex flex-col gap-3.5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col gap-[7px] text-center">
          <p className="text-[17px] font-extrabold text-ink">{title}</p>
          {description && <p className="text-[13px] leading-[1.6] text-inkMuted">{description}</p>}
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="flex-1 h-[46px] rounded-[14px] bg-fillInput text-inkMid text-[15px] font-bold"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className="flex-1 h-[46px] rounded-[14px] bg-danger text-white text-[15px] font-extrabold disabled:opacity-60"
          >
            {busy ? "처리 중…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
