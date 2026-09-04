import { useNavigate } from "react-router-dom";
import LogoImage from "../assets/images/logo.png";

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-[22px] px-10 pb-10 bg-white">
      <img src={LogoImage} alt="" className="w-16 h-[62px] opacity-60" />
      <div className="text-center flex flex-col gap-1.5">
        <p className="text-[19px] font-extrabold text-ink">페이지를 찾을 수 없어요</p>
        <p className="text-[13px] leading-[1.5] text-inkMuted">
          주소가 잘못됐거나
          <br />
          아직 준비 중인 기능이에요
        </p>
      </div>
      <button
        type="button"
        onClick={() => navigate("/", { replace: true })}
        className="h-12 px-8 rounded-2xl bg-primary text-white text-[15px] font-extrabold"
      >
        홈으로
      </button>
    </div>
  );
}
