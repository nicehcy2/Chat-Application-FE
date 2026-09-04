// TODO(서버): Expense 도메인 API가 생기면 이 파일을 api/expenseApi.ts로 교체한다.
// 화면(Expenses.tsx)은 이 모듈의 반환 타입만 의존하므로 교체 시 화면 코드는 바뀌지 않는다.

export type ExpenseCategory = "FOOD" | "TRANSPORT" | "SHOPPING" | "ETC";

export interface CategorySummary {
  category: ExpenseCategory;
  amount: number;
}

export interface DailyExpense {
  /** YYYY-MM-DD */
  date: string;
  amount: number;
}

export interface ExpenseRecord {
  id: number;
  category: ExpenseCategory;
  title: string;
  /** HH:mm */
  time: string;
  amount: number;
}

export interface MonthlyExpense {
  year: number;
  month: number;
  total: number;
  /** 전월 대비 증감률(%). 음수면 감소 */
  prevMonthDeltaPercent: number;
  /** 월 목표 대비 사용률(%) */
  goalUsagePercent: number;
  dailyGoal: number;
  categories: CategorySummary[];
  /** 오늘을 마지막으로 하는 최근 7일 */
  dailySeries: DailyExpense[];
  todayRecords: ExpenseRecord[];
}

const isoDate = (d: Date) => d.toISOString().slice(0, 10);

function recentSevenDays(): DailyExpense[] {
  const amounts = [7_600, 4_000, 16_500, 9_800, 20_000, 6_200, 12_400];
  const today = new Date();
  return amounts.map((amount, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (6 - i));
    return { date: isoDate(d), amount };
  });
}

export function fetchMonthlyExpense(year: number, month: number): Promise<MonthlyExpense> {
  const data: MonthlyExpense = {
    year,
    month,
    total: 428_600,
    prevMonthDeltaPercent: -12,
    goalUsagePercent: 86,
    dailyGoal: 20_000,
    categories: [
      { category: "FOOD", amount: 163_000 },
      { category: "TRANSPORT", amount: 98_600 },
      { category: "SHOPPING", amount: 81_400 },
      { category: "ETC", amount: 85_600 },
    ],
    dailySeries: recentSevenDays(),
    todayRecords: [
      { id: 1, category: "FOOD", title: "점심 · 회사 근처", time: "12:30", amount: 9_000 },
      { id: 2, category: "TRANSPORT", title: "지하철", time: "08:12", amount: 1_400 },
    ],
  };
  return new Promise((resolve) => setTimeout(() => resolve(data), 250));
}
