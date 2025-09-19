import { Stomp } from "@stomp/stompjs";
import React, { useRef, useState, useEffect } from 'react';
import SockJS from 'sockjs-client'; // sockjs-client import

function ChatApp() {
  const stompClient = useRef(null); // WebSocket 연결 객체
  const [messages, setMessages] = useState([]); // 메시지 저장 상태
  const [inputValue, setInputValue] = useState(''); // 사용자 입력 상태
  const [chatRoomId, setChatRoomId] = useState('1'); // 채팅방 ID
  const [senderId, setSenderId] = useState('1'); // 사용자 ID

  // WebSocket 연결 설정
  const connect = () => {
    //const socket = new WebSocket('wss://dev.yeongkkeul.store/ws'); // 서버의 WebSocket 엔드포인트
    const socket = new WebSocket('ws://localhost:8080/ws');
    stompClient.current = Stomp.over(socket); // Stomp 클라이언트 생성

    stompClient.current.connect({ 'x-user-id': 2 }, () => {
      console.log('Connected to WebSocket server!');
      
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
        console.log('Disconnected from WebSocket server.');
      });
    }
  };

  // 메시지 전송
  const sendMessage = () => {
    if (stompClient.current && inputValue) {
      const message = {
        messageType: 'MESSAGE',
        content: inputValue,
        chatRoomId: chatRoomId,
        senderId: senderId
      };
      stompClient.current.send(`/pub/chat.message.${chatRoomId}`, {}, JSON.stringify(message));
      setInputValue(''); // 입력 필드 초기화
    }
  };

  const sendReadMessage = () => {

    // 예시 메시지 ID 리스트
    const recentMessageId = "680396718903552615"; 
    const lastMessageId =   "680396669926664543";

    // 읽은 메시지 DTO 생성
    const readMessageRequestDto = {
      lastClientMessageId: lastMessageId, 
      recentClientMessageId: recentMessageId
    };

    stompClient.current.send(`/pub/read.message.${chatRoomId}`, {}, JSON.stringify(readMessageRequestDto));
  }

  // 기존 채팅 메시지 가져오기
  const fetchMessages = async () => {
    /*
    try {
      const response = await fetch(`http://localhost:8080/chat/${chatRoomId}/messages/test`);
      if (response.ok) {
        const data = await response.json();
        setMessages(data); // 기존 메시지 설정
      } else {
        console.error("Failed to fetch messages:", response.status);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    }*/
  };

  // React 컴포넌트가 렌더링될 때 WebSocket 연결
  useEffect(() => {
    fetchMessages(); // 기존 메시지 가져오기
    connect();
    return () => disconnect(); // 컴포넌트가 언마운트될 때 연결 해제
  }, [chatRoomId]);

  return (
    <div>
      <h1>React WebSocket Chat</h1>
      <div>
        <label>
          채팅방 ID:
          <input
            type="text"
            value={chatRoomId}
            onChange={(e) => setChatRoomId(e.target.value)}
          />
        </label>
        <label>
          사용자 ID:
          <input
            type="text"
            value={senderId}
            onChange={(e) => setSenderId(e.target.value)}
          />
        </label>
      </div>
      <div>
        <input
          type="text"
          value={inputValue}
          placeholder="메시지를 입력하세요"
          onChange={(e) => setInputValue(e.target.value)}
        />
        <button onClick={sendMessage}>전송</button>
      </div>
      <div>
        {"메시지 읽음 테스트 "}   
        <button onClick={sendReadMessage}>읽음</button>
      </div>
      <ul>
        {messages.map((msg, index) => (
          <li key={index}>
            <strong>{msg.senderId}</strong>: [{msg.id}] {msg.content} {msg.timestamp}
            <button onClick={() => updateTimestamp(msg.id, Date.now())}>
              시간 업데이트
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ChatApp;