import React from "react";
import { useNavigate } from "react-router-dom";

const chatRoomList = [
  {
    chatRoomId: 1,
    chatRoomTitle: "무지출이 대세다",
    chatRoomThumbnail: "image.com", // 이미지 S3 주소
    chatRoomRule: "string", // 채팅방 규칙
    participationCount: 45, // 현재 인원수
    lastChatMessage: `지금 양복 조던을 방송 중에 찾고 있었다고 합니다. 이 양조가 왜 거래되는 건지 이해가 되지 않네요.`,
    unreadChatCount: 3,
    updatedAt: "오후 12:54",
  },
  {
    chatRoomId: 2,
    chatRoomTitle: "같은 실수 반복 금지",
    chatRoomThumbnail: "image.com", // 이미지 S3 주소
    chatRoomRule: "string", // 채팅방 규칙
    participationCount: 12, // 현재 인원수
    lastChatMessage: "안녕하세여!",
    unreadChatCount: 3,
    updatedAt: "오전 11:54",
  },
  {
    chatRoomId: 3,
    chatRoomTitle: "피어나 모여!",
    chatRoomThumbnail: "image.com", // 이미지 S3 주소
    chatRoomRule: "string", // 채팅방 규칙
    participationCount: 45, // 현재 인원수
    lastChatMessage: "또 사셨어요? ㅋㅋㅋ.",
    unreadChatCount: 0,
    updatedAt: "어제",
  },
  {
    chatRoomId: 3,
    chatRoomTitle: "피어나 모여!",
    chatRoomThumbnail: "image.com", // 이미지 S3 주소
    chatRoomRule: "string", // 채팅방 규칙
    participationCount: 45, // 현재 인원수
    lastChatMessage: "또 사셨어요? ㅋㅋㅋ.",
    unreadChatCount: 0,
    updatedAt: "어제",
  },
  {
    chatRoomId: 3,
    chatRoomTitle: "피어나 모여!",
    chatRoomThumbnail: "image.com", // 이미지 S3 주소
    chatRoomRule: "string", // 채팅방 규칙
    participationCount: 45, // 현재 인원수
    lastChatMessage: "또 사셨어요? ㅋㅋㅋ.",
    unreadChatCount: 0,
    updatedAt: "어제",
  },
  {
    chatRoomId: 3,
    chatRoomTitle: "피어나 모여!",
    chatRoomThumbnail: "image.com", // 이미지 S3 주소
    chatRoomRule: "string", // 채팅방 규칙
    participationCount: 45, // 현재 인원수
    lastChatMessage: "또 사셨어요? ㅋㅋㅋ.",
    unreadChatCount: 0,
    updatedAt: "어제",
  },
  {
    chatRoomId: 3,
    chatRoomTitle: "피어나 모여!!",
    chatRoomThumbnail: "image.com", // 이미지 S3 주소
    chatRoomRule: "string", // 채팅방 규칙
    participationCount: 45, // 현재 인원수
    lastChatMessage: "또 사셨어요? ㅋㅋㅋ.",
    unreadChatCount: 0,
    updatedAt: "어제",
  },
  {
    chatRoomId: 3,
    chatRoomTitle: "피어나 모여!!!",
    chatRoomThumbnail: "image.com", // 이미지 S3 주소
    chatRoomRule: "string", // 채팅방 규칙
    participationCount: 45, // 현재 인원수
    lastChatMessage: "또 사셨어요? ㅋㅋㅋ.",
    unreadChatCount: 0,
    updatedAt: "어제",
  },
  {
    chatRoomId: 3,
    chatRoomTitle: "피어나 모여!!!!!!",
    chatRoomThumbnail: "image.com", // 이미지 S3 주소
    chatRoomRule: "string", // 채팅방 규칙
    participationCount: 45, // 현재 인원수
    lastChatMessage: "또 사셨어요? ㅋㅋㅋ.",
    unreadChatCount: 0,
    updatedAt: "어제",
  },
  {
    chatRoomId: 3,
    chatRoomTitle: "피어나 모여!",
    chatRoomThumbnail: "image.com", // 이미지 S3 주소
    chatRoomRule: "string", // 채팅방 규칙
    participationCount: 451, // 현재 인원수
    lastChatMessage: "또 사셨어요? ㅋㅋㅋ.",
    unreadChatCount: 0,
    updatedAt: "어제",
  },
  {
    chatRoomId: 3,
    chatRoomTitle: "피어나 모여!",
    chatRoomThumbnail: "image.com", // 이미지 S3 주소
    chatRoomRule: "string", // 채팅방 규칙
    participationCount: 45, // 현재 인원수
    lastChatMessage: "또 사셨어요? ㅋㅋㅋ.",
    unreadChatCount: 0,
    updatedAt: "어제",
  },
  {
    chatRoomId: 3,
    chatRoomTitle: "피어나 모여!",
    chatRoomThumbnail: "image.com", // 이미지 S3 주소
    chatRoomRule: "string", // 채팅방 규칙
    participationCount: 45, // 현재 인원수
    lastChatMessage: "또 사셨어요? ㅋㅋㅋ.",
    unreadChatCount: 0,
    updatedAt: "어제",
  },
];

function ChatRoomList(props) {
  const navigate = useNavigate();

  if (chatRoomList.length === 0) {
    return (
      <div>
        <div>
          <div>가입한 채팅방이 없어요.</div>
          <div>우측 하단 버튼을 눌러 채팅방을 둘러보세요.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col pl-4 tracking-tight h-full">
      <div className="text-[22px] font-sans font-bold py-2 text-[#3C19B0]">
        나의 채팅 그룹
      </div>
      <div className="flex flex-col gap-3 py-2 overflow-y-auto h-full pr-2">
        {chatRoomList.map((chatRoom) => (
          <div
            key={chatRoom.chatRoomId}
            onClick={() => navigate(`/chats/${chatRoom.chatRoomId}`)}
            className="
            flex gap-4
            cursor-pointer hover:bg-gray-50
            active:bg-gray-100
            transition
          "
          >
            {/* 썸네일 */}
            <div className="h-[68px] w-[68px] flex-shrink-0 rounded-xl bg-gray-200" />

            {/* 텍스트 영역 */}
            <div className="flex flex-1 flex-col justify-center gap-2">
              <div className="flex justify-between">
                <div>
                  <span className="font-semibold">
                    {chatRoom.chatRoomTitle}
                  </span>
                  <span className="ml-1 text-[#5B3FE7] text-xs">
                    {chatRoom.participationCount}
                  </span>
                </div>
                <div>
                  <span className="text-xs">{chatRoom.updatedAt}</span>
                </div>
              </div>
              <div className="flex flex-row justify-between">
                <div className="text-xs line-clamp-2 w-[220px] text-[#999]">
                  {chatRoom.lastChatMessage}
                </div>
                {chatRoom.unreadChatCount > 0 && (
                  <div className="h-6 px-2 min-w-[24px] text-xs text-white font-semibold border rounded-full bg-[#11B5A4] flex flex-row items-center justify-center mt-1">
                    {chatRoom.unreadChatCount}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ChatRoomList;
