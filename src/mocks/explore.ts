// TODO(서버): GET /api/chats/explore, /search, POST /join 이 생기면 api/chatApi.ts로 교체한다.
import type { RoomVisibility } from "../api/types";

export interface ExploreRoom {
  chatRoomId: number;
  title: string;
  description: string;
  participantCount: number;
  maxParticipants: number;
  dailyLimit: number;
  tag: string;
  visibility: RoomVisibility;
  thumbnailUrl: string | null;
}

export const EXPLORE_FILTERS = ["인기", "무지출", "절약 팁", "20대", "직장인"] as const;
export type ExploreFilter = (typeof EXPLORE_FILTERS)[number];

const ROOMS: ExploreRoom[] = [
  {
    chatRoomId: 101,
    title: "무지출이 대세다",
    description: "하루 15,000원 이하로 살아남기. 인증샷 필수, 하루 1회 이상 기록.",
    participantCount: 35,
    maxParticipants: 50,
    dailyLimit: 15_000,
    tag: "직장인",
    visibility: "PUBLIC",
    thumbnailUrl: null,
  },
  {
    chatRoomId: 102,
    title: "배달 끊기 30일",
    description: "배달앱 지우고 집밥. 실패하면 벌금 대신 팁 공유하기.",
    participantCount: 50,
    maxParticipants: 50,
    dailyLimit: 10_000,
    tag: "20대",
    visibility: "PUBLIC",
    thumbnailUrl: null,
  },
  {
    chatRoomId: 103,
    title: "같은 실수 반복 금지",
    description: "충동구매 기록하고 서로 말려주는 방. 주간 회고 있음.",
    participantCount: 12,
    maxParticipants: 30,
    dailyLimit: 20_000,
    tag: "절약 팁",
    visibility: "APPROVAL",
    thumbnailUrl: null,
  },
  {
    chatRoomId: 104,
    title: "자영업자 생존방",
    description: "사업비와 생활비 분리하기. 매출 인증 금지.",
    participantCount: 21,
    maxParticipants: 40,
    dailyLimit: 30_000,
    tag: "자영업",
    visibility: "PUBLIC",
    thumbnailUrl: null,
  },
];

export function fetchExploreRooms(query: string, filter: ExploreFilter): Promise<ExploreRoom[]> {
  const q = query.trim();
  const result = ROOMS.filter((room) => {
    const matchesQuery = !q || room.title.includes(q) || room.tag.includes(q) || room.description.includes(q);
    const matchesFilter = filter === "인기" || room.tag === filter || room.title.includes(filter);
    return matchesQuery && matchesFilter;
  });
  return new Promise((resolve) => setTimeout(() => resolve(result), 250));
}

export function joinRoom(chatRoomId: number): Promise<number> {
  return new Promise((resolve) => setTimeout(() => resolve(chatRoomId), 300));
}

export function applyRoom(chatRoomId: number): Promise<number> {
  return new Promise((resolve) => setTimeout(() => resolve(chatRoomId), 300));
}
