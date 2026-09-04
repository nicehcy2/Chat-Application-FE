// TODO(서버): 연속 달성·주간 달성·포인트 API가 생기면 교체한다.
import { getTodayUsed } from "./expenses";

export interface HomeSummary {
  usedToday: number;
  streakDays: number;
  /** 이번 주 월~일 달성 여부. 오늘 이후는 false */
  weekAchieved: boolean[];
  points: number;
  weeklyPoints: number;
}

export const weekAchievedRate = (weekAchieved: boolean[]): number =>
  Math.round((weekAchieved.filter(Boolean).length / 7) * 100);

export function fetchHomeSummary(): Promise<HomeSummary> {
  const todayIndex = (new Date().getDay() + 6) % 7; // 월=0
  const weekAchieved = Array.from({ length: 7 }, (_, i) => i < todayIndex && i !== 3);
  const data: HomeSummary = {
    usedToday: getTodayUsed(),
    streakDays: 3,
    weekAchieved,
    points: 1_240,
    weeklyPoints: 80,
  };
  return new Promise((resolve) => setTimeout(() => resolve(data), 200));
}
