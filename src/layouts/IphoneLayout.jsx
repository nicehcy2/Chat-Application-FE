import { Outlet } from "react-router-dom";

export default function IphoneLayout() {
  return (
    <div className="min-h-screen flex justify-center">
      <div
        className="
        w-full h-screen
        sm:w-[390px] sm:h-[844px]
        bg-white border border-black rounded-[40px] shadow-xl overflow-hidden flex flex-col
        "
      >
        {/* Status Bar */}
        <div className="h-10 shrink-0" />

        {/* 상태바·홈바 사이 영역. 페이지가 h-full로 채울 기준이 된다. */}
        <div className="flex-1 min-h-0 flex flex-col overflow-y-auto [&::-webkit-scrollbar]:hidden">
          <Outlet />
        </div>

        {/* Home Bar */}
        <div className="h-10 shrink-0" />
      </div>
    </div>
  );
}
