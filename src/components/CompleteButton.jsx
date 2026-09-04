export default function CompleteButton({ label, onChange, disabled = false, type = "button" }) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onChange}
      className={`w-full h-12 rounded-2xl text-base font-extrabold text-white transition-colors ease-out ${
        disabled ? "bg-lineStrong pointer-events-none" : "bg-primary"
      }`}
    >
      {label}
    </button>
  );
}
