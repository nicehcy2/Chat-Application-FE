import { Stomp } from "@stomp/stompjs";
import React, { useRef, useState, useEffect } from "react";

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
        senderId: 1 //senderId
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
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  return (
    <div className="flex flex-col h-full">
      <div>{/* Text */}</div>
      {/* 메시지 영역 */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-3 space-y-4">
          {messages.map((msg, index) => (
            <div className="flex items-start gap-2">
              {/* Profile Image */}
              <div className="w-14 h-14 border rounded-full bg-gray-400"></div>
              <div className="flex flex-col gap-1">
                {/* User Name */}
                <div key={index}>
                  <strong>{msg.senderId}</strong>
                </div>
                {/* Message Content */}
                <div className="px-3 py-2 border rounded-xl bg-gray-200 max-w-[300px] text-[15px]">
                  {msg.content}
                </div>
              </div>
            </div>
          ))}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* 입력 영역 */}
      <div className="border p-3 flex gap-2">
        <input
          type="text"
          value={inputValue}
          className="flex-1 border rounded-4xl px-3 py-2"
          placeholder="메시지를 입력하세요"
          onChange={(e) => setInputValue(e.target.value)}
        />
        <button className="px-2 border rounded-xl" onClick={sendMessage}>
          전송
        </button>
      </div>
    </div>
  );
}
