import { useNavigate } from "react-router-dom";

import LogoImage from "../assets/images/logo.png";
import AlarmImage from "../assets/images/alarm.png";
import OptionsImage from "../assets/images/options-horizontal.png";

// title이 없으면 로고형(홈), 있으면 제목형. 아이콘은 44×44 히트 영역 안에 둔다.
export default function TopBar({ title, hasUnreadAlarm = false }) {
  const navigate = useNavigate();

  return (
    <div className="flex flex-row justify-between items-center h-full px-4">
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
