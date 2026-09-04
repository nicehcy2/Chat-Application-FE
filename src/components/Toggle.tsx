interface ToggleProps {
  on: boolean;
  onChange: (next: boolean) => void;
  label?: string;
}

export default function Toggle({ on, onChange, label }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={() => onChange(!on)}
      className={`relative w-12 h-7 rounded-full shrink-0 transition-colors ease-out ${on ? "bg-mint" : "bg-lineMid"}`}
    >
      <span
        className={`absolute top-[3px] w-[22px] h-[22px] rounded-full bg-white transition-[left] duration-[220ms] ease-out ${
          on ? "left-[23px]" : "left-[3px]"
        }`}
      />
    </button>
  );
}
