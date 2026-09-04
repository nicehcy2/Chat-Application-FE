// TODO(서버): 하루 한도·오늘 지출·연속 달성·주간 달성·포인트 API가 생기면 교체한다.

export interface HomeSummary {
  dailyLimit: number;
  usedToday: number;
  streakDays: number;
  /** 이번 주 월~일 달성 여부. 오늘 이후는 false */
  weekAchieved: boolean[];
  points: number;
  weeklyPoints: number;
}

export function fetchHomeSummary(): Promise<HomeSummary> {
  const todayIndex = (new Date().getDay() + 6) % 7; // 월=0
  const weekAchieved = Array.from({ length: 7 }, (_, i) => i < todayIndex && i !== 3);
  const data: HomeSummary = {
    dailyLimit: 20_000,
    usedToday: 7_600,
    streakDays: 3,
    weekAchieved,
    points: 1_240,
    weeklyPoints: 80,
  };
  return new Promise((resolve) => setTimeout(() => resolve(data), 200));
}
