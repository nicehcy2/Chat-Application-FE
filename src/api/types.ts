// 서버 DTO와 1:1로 대응한다. 서버 record가 바뀌면 여기를 같이 고친다.

// ===== user-service =====

export interface AuthSession {
  accessToken: string;
  sessionId: string;
  userId: number;
}

export type AgeGroup =
  | "UNDECIDED"
  | "TEENAGER"
  | "TWENTIES"
  | "THIRTIES"
  | "FORTIES"
  | "FIFTIES"
  | "SIXTIES_AND_ABOVE";

export type JobGroup = "UNDECIDED" | "STUDENT" | "EMPLOYEE" | "HOMEMAKER" | "SELF_EMPLOYED";

// 서버는 gender를 String으로 받는다. 화면에서는 "W" | "M" | "UNDECIDED"를 쓴다.
export type Gender = string;

export interface SignupRequest {
  email: string;
  password: string;
  nickname: string;
  birthDay: string;
  gender: Gender;
  ageGroup: AgeGroup;
  jobGroup: JobGroup;
  imageUrl?: string;
}

// 모든 필드 선택. 서버는 null인 필드를 건너뛴다(patch).
export interface EditProfileRequest {
  nickname?: string;
  gender?: Gender;
  ageGroup?: AgeGroup | "";
  jobGroup?: JobGroup | "";
  imageUrl?: string;
}

export interface MyPageUser {
  userId: number;
  nickname: string;
  userRole: string;
  ageGroup: AgeGroup;
  jobGroup: JobGroup;
  email: string;
  reward: number;
  dayTargetExpenditure: number;
}

export interface FcmTokenRequest {
  fcmToken: string;
  deviceType: string;
  userId: number;
}

// ===== chat-api-service =====

export type MessageType = "TEXT" | "IMAGE" | "RECEIPT";

export interface MessageDto {
  // TSID는 2^53을 넘어 JSON에서 문자열로 온다. 크기 비교는 BigInt로.
  messageTSID: string;
  chatRoomId: number;
  senderId: number;
  messageType: MessageType;
  content: string;
  timestamp: string;
  senderImageUrl: string | null;
  nickname: string;
}

export interface ChatRoomParticipantDto {
  userId: number;
  nickname: string;
  imageUrl: string | null;
  isHost: boolean;
  lastReadMessageId: string | null;
}

export interface ChatRoomInfoResponseDto {
  chatRoomId: number;
  chatRoomTitle: string;
  chatRoomMaxUserCount: number;
  chatRoomRule: string;
  chatRoomThumbnail: string | null;
  participationCount: number;
  lastChatMessage: string | null;
  unreadChatCount: number;
  updatedAt: string | null;
}

export type RoomVisibility = "PUBLIC" | "APPROVAL";

// TODO(서버): POST /api/chats 구현 시 실제 요청 필드명에 맞춰 조정 (핸드오프 2d 기준)
export interface CreateRoomRequest {
  title: string;
  description: string;
  maxParticipants: number;
  isPrivate: boolean;
  /** isPrivate일 때만. 4자리 숫자 */
  password?: string;
  /** 비어 있으면 전체 */
  ageGroups: AgeGroup[];
  /** 비어 있으면 전체 */
  jobGroups: JobGroup[];
  dailyLimit: number;
  imageUrl?: string;
}

// ===== chat-service (STOMP) =====

export interface ReadReceiptEvent {
  chatRoomId: number;
  userId: number;
  lastReadMessageId: string;
}

export interface MessageSendRequest {
  chatRoomId: number;
  correlationId: string;
  messageType: MessageType;
  content: string;
}

export interface ReadReceiptRequest {
  lastReadMessageId: string;
}
