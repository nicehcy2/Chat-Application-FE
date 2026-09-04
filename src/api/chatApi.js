import { request } from "./client";

// 요청자 신원은 게이트웨이가 JWT에서 꺼내 X-User-Id 헤더로 주입하므로 userId를 보내지 않는다.
export const chatApi = {
  getRooms: () =>
    request("chat", "/api/chats"),

  // before(선택): 이 messageTSID 이전 메시지만. 응답은 시간순(ASC).
  getMessages: (roomId, { before, limit } = {}) =>
    request("chat", `/api/chats/${roomId}/messages`, { query: { before, limit } }),

  getParticipants: (roomId) =>
    request("chat", `/api/chats/${roomId}/participants`),
};
