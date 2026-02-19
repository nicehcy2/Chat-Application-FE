export default function LabeledSelect({ label, options, value, onChange }) {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-xl text-[#583FE7] font-bold tracking-[-0.08em]">
        {label}
      </p>
      <div className="grid grid-cols-2 gap-3">
        {options.map((option) => (
          <button
            key={option}
            onClick={() => onChange(option)}
            className={`h-10 rounded-2xl border text-sm font-medium
              ${
                value === option
                  ? "bg-[#583FE7] text-white border-[#583FE7]"
                  : "bg-gray-100 text-gray-700 border-transparent"
              }`}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}
