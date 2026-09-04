// TODO(서버): Expense 도메인 API가 생기면 이 파일을 api/expenseApi.ts로 교체한다.
// 화면(Expenses.tsx, Home.tsx, ExpenseRecordSheet)은 이 모듈의 반환 타입만 의존한다.

export type ExpenseCategory = "FOOD" | "TRANSPORT" | "CAFE" | "SHOPPING" | "ETC";

export const EXPENSE_CATEGORIES: { value: ExpenseCategory; label: string; short: string }[] = [
  { value: "FOOD", label: "식비", short: "식" },
  { value: "TRANSPORT", label: "교통", short: "교" },
  { value: "CAFE", label: "카페", short: "카" },
  { value: "SHOPPING", label: "쇼핑", short: "쇼" },
  { value: "ETC", label: "기타", short: "기" },
];

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

export interface NewExpenseRecord {
  amount: number;
  category: ExpenseCategory;
  memo: string;
}

const isoDate = (d: Date) => d.toISOString().slice(0, 10);
const delay = <T,>(value: T, ms = 250): Promise<T> => new Promise((resolve) => setTimeout(() => resolve(value), ms));

// 세션 동안 유지되는 오늘 기록. 새로고침하면 초기값으로 돌아간다.
let todayRecords: ExpenseRecord[] = [
  { id: 1, category: "FOOD", title: "점심 · 회사 근처", time: "12:30", amount: 9_000 },
  { id: 2, category: "TRANSPORT", title: "지하철", time: "08:12", amount: 1_400 },
];

export const getTodayUsed = (): number => todayRecords.reduce((sum, r) => sum + r.amount, 0);

function recentSevenDays(): DailyExpense[] {
  const amounts = [7_600, 4_000, 16_500, 9_800, 20_000, 6_200];
  const today = new Date();
  const days = amounts.map((amount, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (6 - i));
    return { date: isoDate(d), amount };
  });
  return [...days, { date: isoDate(today), amount: getTodayUsed() }];
}

export function fetchMonthlyExpense(year: number, month: number, dailyGoal: number): Promise<MonthlyExpense> {
  const data: MonthlyExpense = {
    year,
    month,
    total: 428_600 + getTodayUsed() - 10_400,
    prevMonthDeltaPercent: -12,
    goalUsagePercent: 86,
    dailyGoal,
    categories: [
      { category: "FOOD", amount: 163_000 },
      { category: "TRANSPORT", amount: 98_600 },
      { category: "SHOPPING", amount: 81_400 },
      { category: "ETC", amount: 85_600 },
    ],
    dailySeries: recentSevenDays(),
    todayRecords: [...todayRecords].sort((a, b) => (a.time < b.time ? 1 : -1)),
  };
  return delay(data);
}

export function addExpenseRecord(record: NewExpenseRecord): Promise<ExpenseRecord> {
  const now = new Date();
  const created: ExpenseRecord = {
    id: Date.now(),
    category: record.category,
    title: record.memo || EXPENSE_CATEGORIES.find((c) => c.value === record.category)?.label || "지출",
    time: `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`,
    amount: record.amount,
  };
  todayRecords = [...todayRecords, created];
  return delay(created, 300);
}
