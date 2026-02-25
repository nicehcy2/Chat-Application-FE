const maxNicknameLen = 20;

export default function NicknameInput({ value, onChange }) {
  return (
    <div className="flex flex-row justify-between items-start">
      <p className="font-bold">1. 닉네임</p>
      <div className="relative">
        <input type="text"
          className="w-45 h-9 rounded-2xl bg-gray-100 border pl-4 pr-12"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          maxLength={maxNicknameLen}
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">{value.length}/{maxNicknameLen}</span>
      </div>
    </div>
  );
}
