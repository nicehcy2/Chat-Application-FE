export default function LabeledInput({ label, value, onChange, maxLength, placeholder = "", error = "", type = "text" }) {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-[17px] font-extrabold text-primary">
        {label} {error && <span className="text-danger text-sm font-normal">{error}</span>}
      </p>
      <div className="relative">
        <input
          type={type}
          maxLength={maxLength}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full h-11 rounded-2xl bg-fillInput border px-4 text-sm text-ink placeholder:text-inkPlaceholder outline-none ${maxLength ? "pr-16" : ""} ${error ? "border-danger" : "border-transparent"}`}
        />
        {maxLength && (
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[13px] text-inkDisabled">
            {value.length}/{maxLength}
          </span>
        )}
      </div>
    </div>
  );
}
