import React, { use, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useAuthFetch } from "../hooks/useAuthFetch";

const CHATROOM_LIST_URL = "http://localhost:8072/chat-api-service/api/chats?userId=";

function ChatRoomList(props) {
  const navigate = useNavigate();
  const { auth } = useAuth(); 
  const AuthFetch = useAuthFetch();
  const [chatRoomList, setChatRoomList] = useState([]);
  const [fabOpen, setFabOpen] = useState(false);

  useEffect(() => {

    const fetchChatRooms = async () => {
      try {
        const response = await AuthFetch(`${CHATROOM_LIST_URL}${auth.userId}`);
        if (response.ok) {
          const data = await response.json();
          setChatRoomList(data);
          console.log("fetch chat rooms successed.");
        } else {
          console.error("Failed to fetch chat rooms:", response.status);
        }
      } catch (error) {
        console.error("Error fetching chat rooms:", error);
      }
    };
    fetchChatRooms();
  }, [auth.userId]);

  if (chatRoomList.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center gap-2 h-full">
        <p className="font-bold">가입한 채팅방이 없어요.</p>
        <p className="text-[#583FE7]">우측 하단 버튼을 눌러 채팅방을 둘러보세요.</p>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col pl-4 tracking-tight h-full">
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

      {/* FAB 메뉴 */}
      {fabOpen && (
        <div className="absolute bottom-20 right-4 flex flex-col gap-2 items-end">
          <button
            onClick={() => { setFabOpen(false); navigate("/chats/create"); }}
            className="flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow-md text-sm font-medium"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-[#583FE7]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            채팅방 만들기
          </button>
          <button
            onClick={() => { setFabOpen(false); navigate("/chats/explore"); }}
            className="flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow-md text-sm font-medium"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            채팅방 둘러보기
          </button>
        </div>
      )}

      {/* FAB */}
      <button
        onClick={() => setFabOpen(!fabOpen)}
        className="absolute bottom-4 right-4 w-14 h-14 rounded-full bg-[#583FE7] text-white flex items-center justify-center shadow-lg"
      >
        {fabOpen ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
        )}
      </button>
    </div>
  );
}

export default ChatRoomList;

/*
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
    chatRoomId: 4,
    chatRoomTitle: "피어나 모여!",
    chatRoomThumbnail: "image.com", // 이미지 S3 주소
    chatRoomRule: "string", // 채팅방 규칙
    participationCount: 45, // 현재 인원수
    lastChatMessage: "또 사셨어요? ㅋㅋㅋ.",
    unreadChatCount: 0,
    updatedAt: "어제",
  },
  {
    chatRoomId: 5,
    chatRoomTitle: "피어나 모여!",
    chatRoomThumbnail: "image.com", // 이미지 S3 주소
    chatRoomRule: "string", // 채팅방 규칙
    participationCount: 45, // 현재 인원수
    lastChatMessage: "또 사셨어요? ㅋㅋㅋ.",
    unreadChatCount: 0,
    updatedAt: "어제",
  },
  {
    chatRoomId: 6,
    chatRoomTitle: "피어나 모여!",
    chatRoomThumbnail: "image.com", // 이미지 S3 주소
    chatRoomRule: "string", // 채팅방 규칙
    participationCount: 45, // 현재 인원수
    lastChatMessage: "또 사셨어요? ㅋㅋㅋ.",
    unreadChatCount: 0,
    updatedAt: "어제",
  },
  {
    chatRoomId: 7,
    chatRoomTitle: "피어나 모여!!",
    chatRoomThumbnail: "image.com", // 이미지 S3 주소
    chatRoomRule: "string", // 채팅방 규칙
    participationCount: 45, // 현재 인원수
    lastChatMessage: "또 사셨어요? ㅋㅋㅋ.",
    unreadChatCount: 0,
    updatedAt: "어제",
  },
  {
    chatRoomId: 8,
    chatRoomTitle: "피어나 모여!!!",
    chatRoomThumbnail: "image.com", // 이미지 S3 주소
    chatRoomRule: "string", // 채팅방 규칙
    participationCount: 45, // 현재 인원수
    lastChatMessage: "또 사셨어요? ㅋㅋㅋ.",
    unreadChatCount: 0,
    updatedAt: "어제",
  },
  {
    chatRoomId: 9,
    chatRoomTitle: "피어나 모여!!!!!!",
    chatRoomThumbnail: "image.com", // 이미지 S3 주소
    chatRoomRule: "string", // 채팅방 규칙
    participationCount: 45, // 현재 인원수
    lastChatMessage: "또 사셨어요? ㅋㅋㅋ.",
    unreadChatCount: 0,
    updatedAt: "어제",
  },
  {
    chatRoomId: 10,
    chatRoomTitle: "피어나 모여!",
    chatRoomThumbnail: "image.com", // 이미지 S3 주소
    chatRoomRule: "string", // 채팅방 규칙
    participationCount: 451, // 현재 인원수
    lastChatMessage: "또 사셨어요? ㅋㅋㅋ.",
    unreadChatCount: 0,
    updatedAt: "어제",
  },
  {
    chatRoomId: 11,
    chatRoomTitle: "피어나 모여!",
    chatRoomThumbnail: "image.com", // 이미지 S3 주소
    chatRoomRule: "string", // 채팅방 규칙
    participationCount: 45, // 현재 인원수
    lastChatMessage: "또 사셨어요? ㅋㅋㅋ.",
    unreadChatCount: 0,
    updatedAt: "어제",
  },
  {
    chatRoomId: 12,
    chatRoomTitle: "피어나 모여!",
    chatRoomThumbnail: "image.com", // 이미지 S3 주소
    chatRoomRule: "string", // 채팅방 규칙
    participationCount: 45, // 현재 인원수
    lastChatMessage: "또 사셨어요? ㅋㅋㅋ.",
    unreadChatCount: 0,
    updatedAt: "어제",
  },
];*/