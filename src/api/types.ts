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

export type MembershipStatus = "NONE" | "JOINED" | "LEFT" | "BANNED";

export interface ExploreRoomHost {
  userId: number;
  nickname: string;
  imageUrl: string | null;
  ageGroup: AgeGroup;
  jobGroup: JobGroup;
}

// 둘러보기 목록과 방 상세가 공유하는 부분
export interface ExploreRoomBase {
  chatRoomId: number;
  title: string;
  description: string;
  participationCount: number;
  maxParticipants: number;
  dailyLimit: number;
  isPrivate: boolean;
  imageUrl: string | null;
  /** 비어 있으면 전체 대상 */
  ageGroups: AgeGroup[];
  /** 비어 있으면 전체 대상 */
  jobGroups: JobGroup[];
  createdAt: string;
  /** 방장이 나가면 null. 위임은 서버 예정 */
  host: ExploreRoomHost | null;
}

// GET /api/chats/explore 항목. 내 멤버십 여부는 오지 않는다(강퇴만 isBanned)
export interface ExploreRoom extends ExploreRoomBase {
  isBanned: boolean;
}

// GET /api/chats/{id}/detail. 멤버가 아니어도 조회된다
export interface ChatRoomDetail extends ExploreRoomBase {
  membershipStatus: MembershipStatus;
}

export interface ExploreQuery {
  /** 제목·소개 부분일치. 50자 이하 */
  q?: string;
  ageGroup?: AgeGroup;
  jobGroup?: JobGroup;
  /** 이 chatRoomId보다 작은(오래된) 방만. 최신순이라 마지막 항목의 id를 넘긴다 */
  before?: number;
  /** 기본 20, 최대 50 */
  limit?: number;
}

// 서버 CreateChatRoomRequestDto와 1:1. title ≤18, password는 isPrivate일 때 숫자 4자리
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
