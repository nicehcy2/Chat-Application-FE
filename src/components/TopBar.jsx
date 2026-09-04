import { useNavigate } from "react-router-dom";
import { hasUnreadNotifications } from "../mocks/notifications";

import LogoImage from "../assets/images/logo.png";
import AlarmImage from "../assets/images/alarm.png";
import OptionsImage from "../assets/images/options-horizontal.png";
import BackButtonImage from "../assets/images/back-button.png";

// title 없음 → 로고형(홈). title만 → 제목형. back → 뒤로가기 + 제목(우측 아이콘 없음).
// right: "options"(기본) | "settings"(마이페이지 톱니). 아이콘은 44px 히트 영역 안에 둔다.
export default function TopBar({ title, back = false, right = "options" }) {
  const navigate = useNavigate();
  // TODO(서버): 알림 API 연동 시 실데이터로
  const unread = hasUnreadNotifications();

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
        <button type="button" className="relative w-11 h-11 flex items-center justify-center" aria-label="알림" onClick={() => navigate("/notifications")}>
          <img src={AlarmImage} alt="" className="w-5 h-5" />
          {unread && <span className="absolute top-[9px] right-[10px] w-2 h-2 rounded-full bg-mint border-2 border-white" />}
        </button>
        {right === "settings" ? (
          <button type="button" className="w-11 h-11 flex items-center justify-center text-inkMid" aria-label="설정" onClick={() => navigate("/settings")}>
            <GearIcon />
          </button>
        ) : (
          /* TODO: 옵션 메뉴 미정 */
          <button type="button" className="w-11 h-11 flex items-center justify-center" aria-label="옵션">
            <img src={OptionsImage} alt="" className="w-4 h-[3px]" />
          </button>
        )}
      </div>
    </div>
  );
}

function GearIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
    </svg>
  );
}
