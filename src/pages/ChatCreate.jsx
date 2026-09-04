import BackButton from "../components/BackButton";

// TODO: POST /api/chats 연동 (서버 구현 대기)
export default function ChatCreate() {
  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-row items-center gap-3 p-4">
        <BackButton />
        <p className="text-xl font-bold">채팅방 만들기</p>
      </div>
      <div className="flex flex-1 items-center justify-center text-gray-400">준비 중이에요.</div>
    </div>
  );
}
