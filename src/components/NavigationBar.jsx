import { useLocation, useNavigate } from "react-router-dom";

import HomeImage from "../assets/images/home.png";
import MessageSquareImage from "../assets/images/message-square.png";
import PieChartImage from "../assets/images/pie-chart.png";
import UserImage from "../assets/images/user.png";

const TABS = [
  { to: "/", label: "홈", icon: HomeImage },
  { to: "/chats", label: "채팅방", icon: MessageSquareImage },
  { to: "/expenses", label: "지출", icon: PieChartImage },
  { to: "/mypage", label: "마이페이지", icon: UserImage },
];

const isActive = (pathname, to) => (to === "/" ? pathname === "/" : pathname.startsWith(to));

export default function NavigationBar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (
    <nav className="flex flex-row justify-evenly items-center h-full bg-white border-t border-line">
      {TABS.map((tab) => {
        const active = isActive(pathname, tab.to);
        return (
          <button
            key={tab.to}
            type="button"
            onClick={() => navigate(tab.to)}
            aria-current={active ? "page" : undefined}
            className={`flex flex-col items-center gap-[3px] w-16 h-full justify-center transition-opacity ease-out ${
              active ? "" : "opacity-40"
            }`}
          >
            <img src={tab.icon} alt="" className="w-[22px] h-[22px]" />
            <span className={`text-xs ${active ? "text-primary font-bold" : "text-ink"}`}>{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
