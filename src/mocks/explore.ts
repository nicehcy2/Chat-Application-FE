// TODO(서버): GET /api/chats/explore, /search, /{id}/detail, POST /join, /validate 가 생기면 api/chatApi.ts로 교체한다.
import type { RoomVisibility } from "../api/types";

export interface ExploreRoomHost {
  userId: number;
  nickname: string;
  imageUrl: string | null;
  ageGroupLabel: string;
  jobLabel: string;
  createdDaysAgo: number;
}

export interface ExploreRoom {
  chatRoomId: number;
  title: string;
  description: string;
  participantCount: number;
  maxParticipants: number;
  dailyLimit: number;
  tag: string;
  /** 표시용. 예) "20·30대" */
  ageGroupLabel: string;
  jobLabel: string;
  visibility: RoomVisibility;
  isPrivate: boolean;
  /** 나갔거나 강퇴된 뒤 재입장 제한(soft-ban) */
  rejoinBlocked: boolean;
  thumbnailUrl: string | null;
  host: ExploreRoomHost;
}

export const EXPLORE_FILTERS = ["인기", "무지출", "절약 팁", "20대", "직장인"] as const;
export type ExploreFilter = (typeof EXPLORE_FILTERS)[number];

const MOCK_PASSWORD = "1234";

const host = (userId: number, nickname: string, ageGroupLabel: string, jobLabel: string, createdDaysAgo: number): ExploreRoomHost => ({
  userId,
  nickname,
  imageUrl: null,
  ageGroupLabel,
  jobLabel,
  createdDaysAgo,
});

const ROOMS: ExploreRoom[] = [
  {
    chatRoomId: 101,
    title: "무지출이 대세다",
    description: "하루 15,000원 이하로 살아남기. 인증샷 필수, 하루 1회 이상 기록. 서로 지적 대신 응원만 합니다.",
    participantCount: 35,
    maxParticipants: 50,
    dailyLimit: 15_000,
    tag: "직장인",
    ageGroupLabel: "20·30대",
    jobLabel: "직장인",
    visibility: "PUBLIC",
    isPrivate: true,
    rejoinBlocked: false,
    thumbnailUrl: null,
    host: host(11, "티끌모아태산", "30대", "직장인", 62),
  },
  {
    chatRoomId: 102,
    title: "배달 끊기 30일",
    description: "배달앱 지우고 집밥. 실패하면 벌금 대신 팁 공유하기.",
    participantCount: 50,
    maxParticipants: 50,
    dailyLimit: 10_000,
    tag: "20대",
    ageGroupLabel: "20대",
    jobLabel: "전체",
    visibility: "PUBLIC",
    isPrivate: false,
    rejoinBlocked: false,
    thumbnailUrl: null,
    host: host(12, "돈굳는소리", "20대", "학생", 30),
  },
  {
    chatRoomId: 103,
    title: "같은 실수 반복 금지",
    description: "충동구매 기록하고 서로 말려주는 방. 주간 회고 있음.",
    participantCount: 12,
    maxParticipants: 30,
    dailyLimit: 20_000,
    tag: "절약 팁",
    ageGroupLabel: "전체",
    jobLabel: "전체",
    visibility: "APPROVAL",
    isPrivate: false,
    rejoinBlocked: false,
    thumbnailUrl: null,
    host: host(13, "무지출러", "20대", "학생", 14),
  },
  {
    chatRoomId: 104,
    title: "자영업자 생존방",
    description: "사업비와 생활비 분리하기. 매출 인증 금지.",
    participantCount: 21,
    maxParticipants: 40,
    dailyLimit: 30_000,
    tag: "자영업",
    ageGroupLabel: "30·40대",
    jobLabel: "자영업자",
    visibility: "PUBLIC",
    isPrivate: false,
    rejoinBlocked: true,
    thumbnailUrl: null,
    host: host(14, "한푼두푼", "40대", "자영업자", 120),
  },
];

const delay = <T,>(value: T, ms = 250): Promise<T> => new Promise((resolve) => setTimeout(() => resolve(value), ms));

export function fetchExploreRooms(query: string, filter: ExploreFilter): Promise<ExploreRoom[]> {
  const q = query.trim();
  const result = ROOMS.filter((room) => {
    const matchesQuery = !q || room.title.includes(q) || room.tag.includes(q) || room.description.includes(q);
    const matchesFilter = filter === "인기" || room.tag === filter || room.title.includes(filter);
    return matchesQuery && matchesFilter;
  });
  return delay(result);
}

export function joinRoom(chatRoomId: number): Promise<number> {
  return delay(chatRoomId, 300);
}

export function applyRoom(chatRoomId: number): Promise<number> {
  return delay(chatRoomId, 300);
}

/** 비공개 방 비밀번호 검증. 목에서는 1234만 통과 */
export function validateRoomPassword(chatRoomId: number, password: string): Promise<boolean> {
  return delay(password === MOCK_PASSWORD, 300);
}
