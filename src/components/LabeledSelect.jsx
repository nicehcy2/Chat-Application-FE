export default function LabeledSelect({ label, options, value, onChange }) {
  return (
    <div className="flex flex-col gap-4">
      {label && <p className="text-xl text-primary font-bold">{label}</p>}
      <div className="grid grid-cols-2 gap-3">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`h-10 rounded-2xl border text-sm font-medium
              ${
                value === option.value
                  ? "bg-primary text-white border-primary"
                  : "bg-gray-100 text-gray-700 border-transparent"
              }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
