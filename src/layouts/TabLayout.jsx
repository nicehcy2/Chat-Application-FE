import { Outlet } from "react-router-dom";
import TopBar from "../components/TopBar";
import NavigationBar from "../components/NavigationBar";

export default function TabLayout() {
  return (
    <>
      <div className="h-[48px] shrink-0">
        <TopBar />
      </div>
      <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden">
        <Outlet />
      </div>
      <div className="h-[68px] shrink-0">
        <NavigationBar />
      </div>
    </>
  );
}
