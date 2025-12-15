export default function IphoneLayout({ children }) {
  return (
    <div className="min-h-screen">
      {/* iPhone Frame */}
      <div className="w-[390px] h-[844px] bg-white border border-black rounded-[40px] shadow-xl overflow-hidden flex flex-col">
        {/* Status Bar */}
        <div className="h-10 flex items-center justify-center text-sm font-medium"></div>
        {/* Screen */}
        <div className="flex-1 overflow-hidden">{children}</div>
        {/* Home Bar */}
        <div className="h-10 flex items-center justify-center text-sm font-medium"></div>
      </div>
    </div>
  );
}
