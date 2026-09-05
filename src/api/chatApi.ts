import { request } from "./client";
import type {
  ChatRoomInfoResponseDto,
  ChatRoomParticipantDto,
  CreateRoomRequest,
  MessageDto,
} from "./types";

interface MessagePageQuery {
  /** 이 messageTSID 이전 메시지만. 생략하면 최신부터. */
  before?: string;
  limit?: number;
}

// 요청자 신원은 게이트웨이가 JWT에서 꺼내 X-User-Id 헤더로 주입하므로 userId를 보내지 않는다.
export const chatApi = {
  getRooms: () =>
    request<ChatRoomInfoResponseDto[]>("chat", "/api/chats"),

  // 응답은 시간순(ASC). 다음 페이지 커서 = 첫 요소의 messageTSID, 끝 판정 = size < limit.
  getMessages: (roomId: string | number, { before, limit }: MessagePageQuery = {}) =>
    request<MessageDto[]>("chat", `/api/chats/${roomId}/messages`, { query: { before, limit } }),

  getParticipants: (roomId: string | number) =>
    request<ChatRoomParticipantDto[]>("chat", `/api/chats/${roomId}/participants`),

  // 201 + 생성된 chatRoomId. @Valid 실패는 ApiError.fieldErrors로 온다.
  createRoom: (payload: CreateRoomRequest) =>
    request<number>("chat", "/api/chats", { method: "POST", body: payload }),

  // TODO(서버): 로드맵 ⑤ 입장/퇴장/추방. 구현 전까지는 404가 난다.
  leaveRoom: (roomId: string | number) =>
    request("chat", `/api/chats/${roomId}/leave`, { method: "POST" }),

  kickMember: (roomId: string | number, userId: number) =>
    request("chat", `/api/chats/${roomId}/members/${userId}`, { method: "DELETE" }),
};
