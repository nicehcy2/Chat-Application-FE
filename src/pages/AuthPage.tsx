import { useLocation, useNavigate } from "react-router-dom";
import LogoImage from "../assets/images/logo.png";

// 로그인은 채움, 회원가입은 외곽선 — 재방문 유저의 기본 행동을 명확히
export default function AuthPage() {
  const navigate = useNavigate();
  const { state } = useLocation();

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex-1 flex flex-col items-center justify-center gap-[22px] px-8">
        <img src={LogoImage} alt="" className="w-[88px] h-[84px]" />
        <div className="text-center flex flex-col gap-2">
          <p className="text-[22px] font-extrabold text-ink">오늘 아낀 만큼, 함께 인증해요</p>
          <p className="text-sm leading-[1.5] text-inkMuted">
            하루 한도를 정하고
            <br />
            채팅방에서 서로 지켜봐요
          </p>
        </div>
      </div>
      <div className="flex flex-col gap-2.5 px-5 pb-6">
        <button
          type="button"
          onClick={() => navigate("/login", { state })}
          className="h-12 rounded-2xl bg-primary text-white text-base font-extrabold"
        >
          로그인
        </button>
        <button
          type="button"
          onClick={() => navigate("/register")}
          className="h-12 rounded-2xl border-[1.4px] border-primary bg-white text-primary text-base font-extrabold"
        >
          회원가입
        </button>
        <p className="text-center text-xs text-inkDisabled mt-1.5">계속하면 서비스 이용약관에 동의하게 됩니다</p>
      </div>
    </div>
  );
}
