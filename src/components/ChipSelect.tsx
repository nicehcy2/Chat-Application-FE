export interface ChipOption<T extends string> {
  label: string;
  value: T;
}

interface ChipSelectProps<T extends string> {
  options: ChipOption<T>[];
  value: T | "" | null;
  onChange: (value: T) => void;
  /**
   * lg: 44px, 남은 폭을 균등 분할 (성별)
   * grid: 38px, 균등 분할 (직업)
   * wrap: 38px, 내용 폭, 줄바꿈 (연령대)
   */
  size?: "lg" | "grid" | "wrap";
}

const SIZE_CLASS = {
  lg: "flex-1 h-11 rounded-xl text-sm",
  grid: "flex-1 h-[38px] rounded-xl text-[13px]",
  wrap: "h-[38px] px-3.5 rounded-xl text-[13px]",
};

// 드롭다운 대신 탭 한 번으로 끝나는 단일 선택 칩
export default function ChipSelect<T extends string>({ options, value, onChange, size = "grid" }: ChipSelectProps<T>) {
  return (
    <div className={`flex gap-[7px] ${size === "wrap" ? "flex-wrap" : ""}`}>
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            aria-pressed={selected}
            className={`transition-colors ease-out ${SIZE_CLASS[size]} ${
              selected ? "bg-primary text-white font-bold" : "bg-fillInput text-inkMid font-semibold"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
