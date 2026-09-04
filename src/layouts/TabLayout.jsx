import { Outlet, useLocation } from "react-router-dom";
import TopBar from "../components/TopBar";
import NavigationBar from "../components/NavigationBar";

// 홈은 로고형 TopBar, 나머지 탭 화면은 제목형.
const TITLES = {
  "/chats": "채팅방",
  "/expenses": "지출",
  "/mypage": "마이페이지",
};

export default function TabLayout() {
  const { pathname } = useLocation();

  return (
    <>
      <div className="h-12 shrink-0">
        <TopBar title={TITLES[pathname]} />
      </div>
      <div className="flex-1 min-h-0 flex flex-col overflow-y-auto [&::-webkit-scrollbar]:hidden">
        <Outlet />
      </div>
      <div className="h-[68px] shrink-0">
        <NavigationBar />
      </div>
    </>
  );
}
