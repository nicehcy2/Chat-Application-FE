import React from "react";
import { useNavigate } from "react-router-dom";

const chatRoomList = [
  {
    chatRoomId: 1,
    chatRoomTitle: "무지출이 대세다",
    chatRoomThumbnail: "image.com", // 이미지 S3 주소
    chatRoomRule: "string", // 채팅방 규칙
    participationCount: 45, // 현재 인원수
    lastChatMessage: "지금 양복 조던을 방송 중에 찾고 있었다고...",
    updatedAt: "오후 12:54",
  },
  {
    chatRoomId: 2,
    chatRoomTitle: "같은 실수 반복 금지",
    chatRoomThumbnail: "image.com", // 이미지 S3 주소
    chatRoomRule: "string", // 채팅방 규칙
    participationCount: 12, // 현재 인원수
    lastChatMessage: "안녕하세여!",
    updatedAt: "오전 11:54",
  },
  {
    chatRoomId: 3,
    chatRoomTitle: "피어나 모여!",
    chatRoomThumbnail: "image.com", // 이미지 S3 주소
    chatRoomRule: "string", // 채팅방 규칙
    participationCount: 45, // 현재 인원수
    lastChatMessage: "또 사셨어요? ㅋㅋㅋ.",
    updatedAt: "어제",
  },
];

function ChatRoomList(props) {
  const navigate = useNavigate();

  if (chatRoomList.length === 0) {
    return (
      <div>
        <div>가입한 채팅방이 없어요.</div>
        <div>우측 하단 버튼을 눌러 채팅방을 둘러보세요.</div>
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-3 px-4 py-2">
      {chatRoomList.map((chatRoom) => (
        <div
          key={chatRoom.chatRoomId}
          onClick={() => navigate(`/chats/${chatRoom.chatRoomId}`)}
          className="
            flex items-center gap-4
            rounded-xl border border-gray-200
            bg-white p-4
            cursor-pointer
            hover:bg-gray-50
            active:bg-gray-100
            transition
          "
        >
          {/* 썸네일 */}
          <div className="h-12 w-12 flex-shrink-0 rounded-full bg-gray-200" />

          {/* 중앙 내용 */}
          <div className="flex flex-col flex-1 overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-gray-900 truncate">
                {chatRoom.chatRoomTitle}
              </span>
              <span className="text-xs text-gray-400">
                {chatRoom.updatedAt}
              </span>
            </div>

            <div className="mt-1 text-sm text-gray-500 truncate">
              {chatRoom.lastChatMessage}
            </div>
          </div>

          {/* 인원수 */}
          <div className="text-xs text-gray-500 whitespace-nowrap">
            {chatRoom.participationCount}명
          </div>
        </div>
      ))}
    </div>
  );
}

export default ChatRoomList;
