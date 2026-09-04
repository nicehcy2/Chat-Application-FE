import { request } from "./client";

export const chatApi = {
  getRooms: (userId) =>
    request("chat", "/api/chats", { query: { userId } }),

  // TODO: 커서 동기화 API(/messages?before&limit)로 교체
  getMessages: (roomId) =>
    request("chat", `/api/chats/${roomId}/messages/test`),

  getParticipants: (roomId) =>
    request("chat", `/api/chats/${roomId}/participants`),
};
