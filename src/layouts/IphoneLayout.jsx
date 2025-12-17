import { useLocation } from "react-router-dom";
import NavigationBar from "../components/NavigationBar.jsx";
import Title from "../components/Title.jsx";

export default function IphoneLayout({ children }) {
  const location = useLocation();
  const isHome = location.pathname === "/";

  return (
    <div className="min-h-screen">
      {/* iPhone Frame */}
      <div className="w-[390px] h-[844px] bg-white border border-black rounded-[40px] shadow-xl overflow-hidden flex flex-col">
        {/* Status Bar */}
        <div className="h-10 flex items-center justify-center text-sm font-medium"></div>

        {/* Title Bar (공통 기능은 아님) */}
        {!isHome && (
          <div className="h-[48px]">
            <Title />
          </div>
        )}

        {/* Screen */}
        <div className="flex-1 overflow-hidden">{children}</div>

        {/* Navigation Bar (공통 기능은 아님) */}
        {!isHome && (
          <div className="h-[60px]">
            <NavigationBar />
          </div>
        )}

        {/* Home Bar */}
        <div className="h-10 flex items-center justify-center text-sm font-medium"></div>
      </div>
    </div>
  );
}
