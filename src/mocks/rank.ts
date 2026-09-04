// TODO(서버): 랭킹 API(나이트리 배치)가 생기면 교체한다. 순위 기준: 달성일 ↓, 동률이면 주간 지출 ↑
export type RankWeek = "this" | "last";

export interface RankEntry {
  userId: number;
  nickname: string;
  imageUrl: string | null;
  achievedDays: number;
  weeklySpent: number;
}

const THIS_WEEK: RankEntry[] = [
  { userId: 21, nickname: "민수", imageUrl: null, achievedDays: 7, weeklySpent: 42_300 },
  { userId: 22, nickname: "하늘", imageUrl: null, achievedDays: 7, weeklySpent: 58_900 },
  { userId: 23, nickname: "준호", imageUrl: null, achievedDays: 6, weeklySpent: 49_100 },
  { userId: 0, nickname: "나", imageUrl: null, achievedDays: 5, weeklySpent: 61_200 },
  { userId: 24, nickname: "수진", imageUrl: null, achievedDays: 4, weeklySpent: 72_000 },
  { userId: 25, nickname: "태현", imageUrl: null, achievedDays: 3, weeklySpent: 88_400 },
];

const LAST_WEEK: RankEntry[] = [
  { userId: 22, nickname: "하늘", imageUrl: null, achievedDays: 7, weeklySpent: 51_200 },
  { userId: 0, nickname: "나", imageUrl: null, achievedDays: 6, weeklySpent: 55_000 },
  { userId: 21, nickname: "민수", imageUrl: null, achievedDays: 6, weeklySpent: 60_100 },
  { userId: 23, nickname: "준호", imageUrl: null, achievedDays: 5, weeklySpent: 47_000 },
  { userId: 24, nickname: "수진", imageUrl: null, achievedDays: 2, weeklySpent: 90_300 },
];

const sortRank = (entries: RankEntry[]) =>
  [...entries].sort((a, b) => b.achievedDays - a.achievedDays || a.weeklySpent - b.weeklySpent);

/** userId 0은 "나"의 자리. 호출부가 실제 내 id로 바꿔 넣는다. */
export function fetchRoomRank(_roomId: string, week: RankWeek, myId: number, myNickname: string): Promise<RankEntry[]> {
  const source = week === "this" ? THIS_WEEK : LAST_WEEK;
  const entries = sortRank(source.map((e) => (e.userId === 0 ? { ...e, userId: myId, nickname: myNickname } : e)));
  return new Promise((resolve) => setTimeout(() => resolve(entries), 250));
}
