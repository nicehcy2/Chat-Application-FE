import { Outlet, useLocation } from "react-router-dom";
import TopBar from "../components/TopBar";
import NavigationBar from "../components/NavigationBar";

// 홈은 로고형 TopBar. 나머지는 제목형, 하위 화면은 뒤로가기형.
const HEADERS = {
  "/chats": { title: "채팅방" },
  "/chats/explore": { title: "채팅방 둘러보기", back: true },
  "/expenses": { title: "지출" },
  "/mypage": { title: "마이페이지", right: "settings" },
};

export default function TabLayout() {
  const { pathname } = useLocation();
  const header = HEADERS[pathname] ?? {};

  return (
    <>
      <div className="h-12 shrink-0">
        <TopBar title={header.title} back={header.back} right={header.right} />
      </div>
      <div className="relative flex-1 min-h-0 flex flex-col overflow-y-auto [&::-webkit-scrollbar]:hidden">
        <Outlet />
      </div>
      <div className="h-[68px] shrink-0">
        <NavigationBar />
      </div>
    </>
  );
}
