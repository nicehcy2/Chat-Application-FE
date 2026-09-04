import { useNavigate } from "react-router-dom";

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center gap-2 h-full px-4">
      <p className="text-[15px] font-bold text-ink">페이지를 찾을 수 없어요.</p>
      <p className="text-[13px] text-inkMuted">주소가 바뀌었거나 아직 준비 중인 화면이에요.</p>
      <button
        type="button"
        onClick={() => navigate("/", { replace: true })}
        className="mt-2 h-9 px-3.5 rounded-xl border-[1.4px] border-primary text-primary text-[13px] font-extrabold"
      >
        홈으로
      </button>
    </div>
  );
}
