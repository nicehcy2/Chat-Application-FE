import { matchPath, useLocation } from "react-router-dom";
import NavigationBar from "../components/NavigationBar.jsx";
import TopBar from "../components/TopBar.jsx";

export default function IphoneLayout({ children }) {
  const location = useLocation();
  const isHome = location.pathname === "/";
  const isChat = matchPath("/chats/:chatId", location.pathname);

  return (
    <div className="min-h-screen flex justify-center">
      {/* iPhone Frame */}
      <div
        className="
        w-full h-screen
        sm:w-[390px] sm:h-[844px]
        bg-white border border-black rounded-[40px] shadow-xl overflow-hidden flex flex-col
        "
      >
        {/* Status Bar */}
        <div className="h-10 flex items-center justify-center text-sm font-medium"></div>

        {/* Top Bar (공통 기능은 아님) */}
        {!isHome && !isChat && (
          <div className="h-[48px]">
            <TopBar />
          </div>
        )}

        {/* Screen */}
        <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden">{children}</div>

        {/* Navigation Bar (공통 기능은 아님) */}
        {!isHome && !isChat && (
          <div className="h-[68px]">
            <NavigationBar />
          </div>
        )}

        {/* Home Bar */}
        <div className="h-10 flex items-center justify-center text-sm font-medium"></div>
      </div>
    </div>
  );
}
