import type { ReactNode } from "react";

interface Action {
  label: string;
  onClick: () => void;
}

interface StateViewProps {
  /** 80px 원 안에 들어갈 내용. 이미지·글자 모두 가능 */
  icon: ReactNode;
  /** 원 배경 클래스. 예) bg-primaryTintBg */
  iconBg?: string;
  title: string;
  description?: ReactNode;
  /** 채움(primary) 버튼 */
  primaryAction?: Action;
  /** 외곽선 버튼. 재시도처럼 주 CTA가 아닐 때 */
  outlineAction?: Action;
  /** 텍스트 링크 */
  textAction?: Action;
  className?: string;
}

// 빈 상태·에러·404가 같은 골격(원형 아이콘 + 제목 + 설명 + 액션)이라 하나로 쓴다.
export default function StateView({
  icon,
  iconBg = "bg-primaryTintBg",
  title,
  description,
  primaryAction,
  outlineAction,
  textAction,
  className = "",
}: StateViewProps) {
  return (
    <div className={`flex-1 flex flex-col items-center justify-center gap-5 px-10 pb-[60px] ${className}`}>
      <div className={`w-20 h-20 rounded-full flex items-center justify-center ${iconBg}`}>{icon}</div>
      <div className="text-center flex flex-col gap-1.5">
        <p className="text-[17px] font-extrabold text-ink">{title}</p>
        {description && <p className="text-[13px] leading-[1.5] text-inkMuted">{description}</p>}
      </div>
      {primaryAction && (
        <button
          type="button"
          onClick={primaryAction.onClick}
          className="h-12 px-7 rounded-2xl bg-primary text-white text-[15px] font-extrabold"
        >
          {primaryAction.label}
        </button>
      )}
      {outlineAction && (
        <button
          type="button"
          onClick={outlineAction.onClick}
          className="h-11 px-7 rounded-[14px] border-[1.4px] border-primary bg-white text-primary text-sm font-extrabold"
        >
          {outlineAction.label}
        </button>
      )}
      {textAction && (
        <button type="button" onClick={textAction.onClick} className="-mt-3 p-1.5 text-[13px] font-bold text-primary">
          {textAction.label}
        </button>
      )}
    </div>
  );
}
