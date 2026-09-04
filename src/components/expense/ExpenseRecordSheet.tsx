import { useEffect, useState } from "react";
import Toggle from "../Toggle";
import { EXPENSE_CATEGORIES, type ExpenseCategory, type NewExpenseRecord } from "../../mocks/expenses";

export interface ShareTarget {
  chatRoomId: number | string;
  title: string;
}

interface ExpenseRecordSheetProps {
  open: boolean;
  dailyLimit: number;
  usedToday: number;
  /** 열린 곳이 채팅방이면 그 방, 아니면 대표 방(없으면 null → 토글 숨김) */
  shareTarget: ShareTarget | null;
  onClose: () => void;
  onSubmit: (record: NewExpenseRecord, share: boolean) => Promise<void>;
}

const AMOUNT_MAX = 10_000_000;
const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "000", "0", "⌫"] as const;
const won = (n: number) => n.toLocaleString("ko-KR");

// 홈 CTA·채팅 ＋ 어디서나 같은 시트. 금액 먼저(키패드 내장), 카테고리는 한 줄 칩, 메모는 선택.
export default function ExpenseRecordSheet({ open, dailyLimit, usedToday, shareTarget, onClose, onSubmit }: ExpenseRecordSheetProps) {
  const [digits, setDigits] = useState("");
  const [category, setCategory] = useState<ExpenseCategory>("FOOD");
  const [memo, setMemo] = useState("");
  const [share, setShare] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !submitting) onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, submitting, onClose]);

  if (!open) return null;

  const amount = Number(digits || "0");
  const remaining = dailyLimit - usedToday - amount;

  const press = (key: (typeof KEYS)[number]) => {
    if (key === "⌫") return setDigits((d) => d.slice(0, -1));
    setDigits((d) => {
      const next = (d + key).replace(/^0+(?=\d)/, "");
      return Number(next) > AMOUNT_MAX ? d : next;
    });
  };

  const submit = async () => {
    if (amount <= 0 || submitting) return;
    setSubmitting(true);
    setError("");
    try {
      await onSubmit({ amount, category, memo: memo.trim() }, share && shareTarget !== null);
      setDigits("");
      setMemo("");
      onClose();
    } catch {
      setError("기록하지 못했어요. 잠시 후 다시 시도해주세요.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="absolute inset-0 z-20 bg-ink/35" onClick={submitting ? undefined : onClose} />
      <div className="absolute left-0 right-0 bottom-0 z-20 bg-white rounded-t-3xl px-5 pt-2.5 flex flex-col gap-4">
        <div className="w-9 h-1 rounded-full bg-lineMid self-center" />

        <div className="flex items-center justify-between">
          <span className="text-[17px] font-extrabold text-ink">지출 기록</span>
          <button type="button" onClick={onClose} disabled={submitting} className="py-2 text-sm font-semibold text-inkMuted">
            취소
          </button>
        </div>

        <div className="flex flex-col items-center gap-1.5 py-1.5">
          <div className="flex items-baseline gap-0.5 text-[40px] font-extrabold text-ink leading-none">
            {won(amount)}
            <span className="text-[22px] font-bold">원</span>
            <span className="inline-block w-0.5 h-9 bg-primary rounded-[1px] ml-0.5 animate-pulse" />
          </div>
          {dailyLimit > 0 && (
            <p className="text-xs text-inkMuted">
              기록 후 남는 한도{" "}
              <span className={`font-bold ${remaining < 0 ? "text-danger" : "text-mintDeep"}`}>{won(remaining)}원</span>
            </p>
          )}
        </div>

        <div className="flex gap-[7px] overflow-x-auto [&::-webkit-scrollbar]:hidden">
          {EXPENSE_CATEGORIES.map((c) => {
            const selected = c.value === category;
            return (
              <button
                key={c.value}
                type="button"
                onClick={() => setCategory(c.value)}
                className={`h-9 px-3.5 rounded-full text-[13px] whitespace-nowrap shrink-0 transition-colors ease-out ${
                  selected ? "bg-primary text-white font-bold" : "bg-fillInput text-inkMid font-semibold"
                }`}
              >
                {c.label}
              </button>
            );
          })}
        </div>

        <input
          type="text"
          value={memo}
          maxLength={30}
          onChange={(e) => setMemo(e.target.value)}
          placeholder="메모 (선택)"
          className="h-11 rounded-[14px] bg-fillInput px-4 text-sm text-ink placeholder:text-inkPlaceholder outline-none"
        />

        {shareTarget && (
          <div className="flex items-center justify-between py-0.5">
            <div className="flex flex-col">
              <span className="text-sm font-bold text-ink">채팅방에 인증 공유</span>
              <span className="text-xs text-inkMuted">{shareTarget.title}</span>
            </div>
            <Toggle on={share} onChange={setShare} label="채팅방에 인증 공유" />
          </div>
        )}

        <div className="grid grid-cols-3 gap-2">
          {KEYS.map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => press(key)}
              className={`h-[50px] rounded-xl bg-fillSoft text-ink font-semibold active:bg-fillInput ${key === "000" ? "text-base" : "text-xl"}`}
              aria-label={key === "⌫" ? "지우기" : key}
            >
              {key === "⌫" ? <BackspaceIcon /> : key}
            </button>
          ))}
        </div>

        {error && <p className="text-[13px] text-danger -mt-1">{error}</p>}

        <div className="pb-4">
          <button
            type="button"
            onClick={submit}
            disabled={amount <= 0 || submitting}
            className="w-full h-12 rounded-2xl bg-primary text-white text-base font-extrabold disabled:bg-lineStrong"
          >
            {submitting ? "기록 중…" : "기록하기"}
          </button>
        </div>
      </div>
    </>
  );
}

function BackspaceIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto">
      <path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z" />
      <path d="m18 9-6 6M12 9l6 6" />
    </svg>
  );
}
