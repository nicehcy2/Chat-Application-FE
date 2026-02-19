export default function LabeledInput({ label, value, onChange, maxLength, placeholder = "", error }) {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-xl text-[#583FE7] font-bold tracking-[-0.08em]">
        {label} {error && <span className="text-red-500 text-sm font-normal">{error}</span>}
      </p>
      <div className="relative">
        <input
          type="text"
          maxLength={maxLength}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full h-10 rounded-2xl bg-gray-100 border px-4 ${error ? "border-red-500" : "border-transparent"}`}
        />
        {maxLength && (
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-400">
            {value.length}/{maxLength}
          </span>
        )}
      </div>
    </div>
  );
}
