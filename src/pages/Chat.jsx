import { Stomp } from "@stomp/stompjs";
import React, { useRef, useState, useEffect } from "react";

import SendButtonImage from "../assets/images/chat-send-button.png";

export default function Chat() {
  const stompClient = useRef(null); // WebSocket 연결 객체
  const bottomRef = useRef(null);

  const [messages, setMessages] = useState([]); // 메시지 저장 상태
  const [inputValue, setInputValue] = useState(""); // 사용자 입력 상태
  const [chatRoomId, setChatRoomId] = useState("1"); // 채팅방 ID
  const [senderId, setSenderId] = useState("1"); // 사용자 ID

  // WebSocket 연결 설정
  const connect = () => {
    const socket = new WebSocket("ws://localhost:8080/ws");
    stompClient.current = Stomp.over(socket); // Stomp 클라이언트 생성

    stompClient.current.connect({ "x-user-id": 2 }, () => {
      console.log("Connected to WebSocket server!");

      // 구독: 서버에서 전송하는 메시지를 수신
      stompClient.current.subscribe(`/sub/chatroom${chatRoomId}`, (message) => {
        const newMessage = JSON.parse(message.body);
        setMessages((prevMessages) => [...prevMessages, newMessage]);
      });

      /*
      stompClient.current.subscribe(`/topic/read.room.${chatRoomId}`, (message) => {
        const newMessage = JSON.parse(message.body);
        console.log("Received Read Message:", newMessage);
      });

      stompClient.current.subscribe(`/topic/setting.room.${chatRoomId}`, (message) => {
        const newMessage = JSON.parse(message.body);
        console.log("Received Setting Message:", newMessage);
      });
      */
    });
  };

  const updateTimestamp = (messageId, newTimestamp) => {
    setMessages((prevMessages) =>
      prevMessages.map((msg) =>
        msg.id === messageId ? { ...msg, timestamp: newTimestamp } : msg
      )
    );
  };

  // WebSocket 연결 해제
  const disconnect = () => {
    if (stompClient.current) {
      stompClient.current.disconnect(() => {
        console.log("Disconnected from WebSocket server.");
      });
    }
  };

  // 메시지 전송
  const sendMessage = () => {
    if (stompClient.current && inputValue) {
      const message = {
        messageType: "MESSAGE",
        content: inputValue,
        chatRoomId: 1, //chatRoomId,
        senderId: 2, //senderId
      };
      stompClient.current.send(
        `/pub/chat.message.${chatRoomId}`,
        {},
        JSON.stringify(message)
      );
      setInputValue(""); // 입력 필드 초기화
    }
  };

  const sendReadMessage = () => {
    // 예시 메시지 ID 리스트
    const recentMessageId = "680396718903552615";
    const lastMessageId = "680396669926664543";

    // 읽은 메시지 DTO 생성
    const readMessageRequestDto = {
      lastClientMessageId: lastMessageId,
      recentClientMessageId: recentMessageId,
    };

    stompClient.current.send(
      `/pub/read.message.${chatRoomId}`,
      {},
      JSON.stringify(readMessageRequestDto)
    );
  };

  // 기존 채팅 메시지 가져오기
  const fetchMessages = async () => {
    try {
      const response = await fetch(
        `http://localhost:8180/api/chats/${chatRoomId}/messages/test`
      );
      if (response.ok) {
        const data = await response.json();
        setMessages(data); // 기존 메시지 설정
        console.log("fetch successed.");
      } else {
        console.error("Failed to fetch messages:", response.status);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  // React 컴포넌트가 렌더링될 때 WebSocket 연결
  useEffect(() => {
    fetchMessages(); // 기존 메시지 가져오기
    connect();
    return () => disconnect(); // 컴포넌트가 언마운트될 때 연결 해제
  }, [chatRoomId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView();
  }, [messages.length]);

  return (
    <div className="flex flex-col h-full">
      <div>{/* Text */}</div>
      {/* 메시지 영역 */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-3">
          {messages.map((msg, index) => {
            const showProfile =
              index == 0 || messages[index - 1].senderId !== msg.senderId;

            return (
              <div
                className={`flex gap-2 ${
                  showProfile && index !== 0 ? "mt-3" : "mt-0"
                }`}
              >
                {/* Profile Image */}
                {showProfile ? (
                  <div className="w-12 h-12 border rounded-full bg-red-400"></div>
                ) : (
                  <div className="w-12"></div>
                )}

                <div className="flex flex-col gap-1 text-sm">
                  {/* User Name */}
                  {showProfile ? (
                    <div key={index}>
                      <strong>{msg.senderId}</strong>
                    </div>
                  ) : (
                    <div key={index}></div>
                  )}

                  <div className="flex flex-row gap-2">
                    {/* Message Content */}
                    <div className="px-3 py-2 border rounded-xl bg-gray-50 max-w-[300px] text-[16px]">
                      {msg.content}
                    </div>
                    <div className="flex flex-col justify-end">
                      {/* unread count */}
                      <div className="text-[#5B3FE7] text-[9px] leading-none">
                        {msg.unreadCount}
                      </div>
                      {/* timestamp */}
                      <div className="text-[9px]">
                        {new Date(msg.timestamp).toLocaleTimeString("ko-KR", {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: false,
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div ref={bottomRef} />
      </div>

      {/* 입력 영역 */}
      <div className="flex flex-row justify-end py-2 px-4 gap-1">
        <input
          type="text"
          value={inputValue}
          className="w-[264px] h-[32px] border rounded-full px-3 py-4"
          placeholder="메시지를 입력하세요"
          onChange={(e) => setInputValue(e.target.value)}
        />
        <button onClick={sendMessage}>
          <img src={SendButtonImage} alt="전송"></img>
        </button>
      </div>
    </div>
  );
}
