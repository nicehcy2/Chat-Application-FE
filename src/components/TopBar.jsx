import { useNavigate } from "react-router-dom";

import LogoImage from "../assets/images/logo.png";
import AlarmImage from "../assets/images/alarm.png";
import OptionsImage from "../assets/images/options-horizontal.png";
import BackButtonImage from "../assets/images/back-button.png";

// title 없음 → 로고형(홈). title만 → 제목형. back → 뒤로가기 + 제목(우측 아이콘 없음).
// 아이콘은 44px 히트 영역 안에 둔다.
export default function TopBar({ title, back = false, hasUnreadAlarm = false }) {
  const navigate = useNavigate();

  if (back) {
    return (
      <div className="flex items-center gap-1.5 h-full px-3 bg-white">
        <button type="button" className="w-10 h-11 flex items-center justify-center" onClick={() => navigate(-1)} aria-label="뒤로">
          <img src={BackButtonImage} alt="" className="w-5 h-5" />
        </button>
        <p className="text-[17px] font-extrabold text-ink">{title}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-row justify-between items-center h-full px-4 bg-white">
      {title ? (
        <p className="text-[17px] font-extrabold text-ink">{title}</p>
      ) : (
        <button type="button" className="w-11 h-11 -ml-3 flex items-center justify-center" onClick={() => navigate("/")}>
          <img src={LogoImage} alt="홈" className="w-[23px] h-[23px]" />
        </button>
      )}
      <div className="flex flex-row items-center gap-3.5 -mr-3">
        <button type="button" className="relative w-11 h-11 flex items-center justify-center" aria-label="알림">
          <img src={AlarmImage} alt="" className="w-5 h-5" />
          {hasUnreadAlarm && (
            <span className="absolute top-[9px] right-[10px] w-2 h-2 rounded-full bg-mint border-2 border-white" />
          )}
        </button>
        <button type="button" className="w-11 h-11 flex items-center justify-center" aria-label="옵션">
          <img src={OptionsImage} alt="" className="w-4 h-[3px]" />
        </button>
      </div>
    </div>
  );
}
