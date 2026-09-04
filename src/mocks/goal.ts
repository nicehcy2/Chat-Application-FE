// TODO(서버): 하루 목표 지출액 저장 API가 없다(UserInfoRequestDto에 dayTargetExpenditure 없음).
// 생기기 전까지 브라우저에 보관한다. 서버 값(user.dayTargetExpenditure)이 0보다 크면 그쪽이 우선.

const GOAL_KEY = "dailyGoal";
const SKIPPED_KEY = "dailyGoalSkipped";

const read = (key: string): string | null => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};

const write = (key: string, value: string) => {
  try {
    localStorage.setItem(key, value);
  } catch {
    // 저장 불가 환경이면 이번 세션만 유지된다
  }
};

export function getLocalDailyGoal(): number {
  return Number(read(GOAL_KEY)) || 0;
}

export function saveDailyGoal(amount: number): Promise<void> {
  write(GOAL_KEY, String(amount));
  return Promise.resolve();
}

export function isGoalSkipped(): boolean {
  return read(SKIPPED_KEY) === "1";
}

export function skipGoal(): void {
  write(SKIPPED_KEY, "1");
}
