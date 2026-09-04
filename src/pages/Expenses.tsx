import { useEffect, useState } from "react";
import { fetchMonthlyExpense, type ExpenseCategory, type MonthlyExpense } from "../mocks/expenses";
import { getLocalDailyGoal } from "../mocks/goal";
import { parseServerDate } from "../utils/date";
import StateView from "../components/StateView";

type Status = "loading" | "success" | "error";

const CATEGORY_META: Record<ExpenseCategory, { label: string; short: string; color: string; tile: string }> = {
  FOOD: { label: "식비", short: "식", color: "#583FE7", tile: "bg-primaryTintBg text-primary" },
  TRANSPORT: { label: "교통", short: "교", color: "#8C7BF2", tile: "bg-mintTintBg text-mintDeep" },
  CAFE: { label: "카페", short: "카", color: "#F5A524", tile: "bg-warnTintBg text-warnDeep" },
  SHOPPING: { label: "쇼핑", short: "쇼", color: "#11B5A4", tile: "bg-mintTintBg text-mintDeep" },
  ETC: { label: "기타", short: "기", color: "#E7E5F3", tile: "bg-fillInput text-inkMid" },
};

const WEEKDAY = ["일", "월", "화", "수", "목", "금", "토"];
const BAR_MAX_PX = 90;
const BAR_LABEL_PX = 22;

const won = (n: number) => n.toLocaleString("ko-KR");

// 카테고리 비율을 conic-gradient stop 문자열로. 순서는 categories 배열 순서.
function buildConicStops(categories: MonthlyExpense["categories"]): string {
  const total = categories.reduce((sum, c) => sum + c.amount, 0);
  let cursor = 0;
  return categories
    .map((c) => {
      const from = cursor;
      cursor += (c.amount / total) * 100;
      return `${CATEGORY_META[c.category].color} ${from}% ${cursor}%`;
    })
    .join(", ");
}

export default function Expenses() {
  const now = new Date();
  const [yearMonth, setYearMonth] = useState({ year: now.getFullYear(), month: now.getMonth() + 1 });
  const [data, setData] = useState<MonthlyExpense | null>(null);
  const [status, setStatus] = useState<Status>("loading");
  const [reloadKey, setReloadKey] = useState(0);

  const isCurrentMonth = yearMonth.year === now.getFullYear() && yearMonth.month === now.getMonth() + 1;

  useEffect(() => {
    let cancelled = false;
    fetchMonthlyExpense(yearMonth.year, yearMonth.month, getLocalDailyGoal() || 20_000)
      .then((d) => {
        if (cancelled) return;
        setData(d);
        setStatus("success");
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, [yearMonth, reloadKey]);

  const shiftMonth = (delta: number) => {
    const d = new Date(yearMonth.year, yearMonth.month - 1 + delta, 1);
    setStatus("loading");
    setYearMonth({ year: d.getFullYear(), month: d.getMonth() + 1 });
  };

  const retry = () => {
    setStatus("loading");
    setReloadKey((k) => k + 1);
  };

  return (
    <div className="flex flex-col gap-3.5 px-4 pt-3.5 pb-6 bg-bgApp min-h-full">
      <div className="flex items-center justify-between bg-white rounded-[14px] px-3 py-2">
        <button type="button" onClick={() => shiftMonth(-1)} className="w-8 h-8 flex items-center justify-center text-inkMuted text-base">
          ‹
        </button>
        <span className="text-[15px] font-bold text-ink">
          {yearMonth.year}년 {yearMonth.month}월
        </span>
        <button
          type="button"
          onClick={() => shiftMonth(1)}
          disabled={isCurrentMonth}
          className="w-8 h-8 flex items-center justify-center text-inkMuted text-base disabled:opacity-30"
        >
          ›
        </button>
      </div>

      {status === "loading" && <Skeleton />}
      {status === "error" && (
        <StateView
          icon={<span className="text-[32px] font-extrabold text-danger">!</span>}
          iconBg="bg-dangerSoftBg"
          title="지출 내역을 불러오지 못했어요"
          outlineAction={{ label: "다시 시도", onClick: retry }}
        />
      )}
      {status === "success" && data && (
        <>
          <SummaryCard data={data} />
          <DailyChart data={data} />
          <TodayRecords data={data} />
        </>
      )}
    </div>
  );
}

function SummaryCard({ data }: { data: MonthlyExpense }) {
  const stops = buildConicStops(data.categories);
  const decreased = data.prevMonthDeltaPercent <= 0;

  return (
    <div className="bg-white rounded-[20px] p-[18px] flex flex-col gap-4">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-xs font-semibold text-inkMuted">이번 달 총 지출</p>
          <p className="text-[28px] font-extrabold text-ink mt-0.5">
            {won(data.total)}
            <span className="text-[17px]">원</span>
          </p>
        </div>
        <span
          className={`text-xs font-bold px-2.5 py-1.5 rounded-full ${
            decreased ? "bg-mintTintBg text-mintDeep" : "bg-dangerTintBg text-dangerDeep"
          }`}
        >
          지난달 {decreased ? "−" : "+"}
          {Math.abs(data.prevMonthDeltaPercent)}%
        </span>
      </div>
      <div className="flex items-center gap-[18px]">
        <div
          className="w-[132px] h-[132px] rounded-full flex items-center justify-center shrink-0"
          style={{ background: `conic-gradient(${stops})` }}
        >
          <div className="w-[88px] h-[88px] rounded-full bg-white flex flex-col items-center justify-center">
            <span className="text-[11px] text-inkMuted">목표 대비</span>
            <span className="text-[19px] font-extrabold text-primary">{data.goalUsagePercent}%</span>
          </div>
        </div>
        <div className="flex-1 flex flex-col gap-[9px]">
          {data.categories.map((c) => (
            <div key={c.category} className="flex items-center gap-2 text-[13px]">
              <span className="w-[9px] h-[9px] rounded-[3px]" style={{ background: CATEGORY_META[c.category].color }} />
              <span className="flex-1 text-ink">{CATEGORY_META[c.category].label}</span>
              <span className="font-bold text-ink">{won(c.amount)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function DailyChart({ data }: { data: MonthlyExpense }) {
  const max = Math.max(data.dailyGoal, ...data.dailySeries.map((d) => d.amount));
  const px = (amount: number) => Math.round((amount / max) * BAR_MAX_PX);
  const goalBottom = BAR_LABEL_PX + px(data.dailyGoal);
  const lastIndex = data.dailySeries.length - 1;

  return (
    <div className="bg-white rounded-[20px] p-[18px] flex flex-col gap-3.5">
      <div className="flex justify-between items-baseline">
        <p className="text-[15px] font-bold text-ink">일별 지출</p>
        <div className="flex items-center gap-1.5 text-[11px] text-inkMuted">
          <span className="w-4 border-t-[1.6px] border-dashed border-mint" />
          하루 목표 {won(data.dailyGoal)}원
        </div>
      </div>
      <div className="relative h-[120px] flex items-end justify-between pt-2">
        <div className="absolute left-0 right-0 border-t-[1.6px] border-dashed border-mint" style={{ bottom: goalBottom }} />
        {data.dailySeries.map((d, i) => {
          const isToday = i === lastIndex;
          const over = d.amount > data.dailyGoal;
          const bar = isToday ? "bg-primary" : over ? "bg-dangerBar" : "bg-primaryBarSoft";
          return (
            <div key={d.date} className="flex flex-col items-center gap-1.5 w-[34px]">
              <div className={`w-[22px] rounded-md ${bar}`} style={{ height: px(d.amount) }} />
              <span className={`text-[11px] ${isToday ? "text-primary font-bold" : "text-inkMuted"}`}>
                {isToday ? "오늘" : WEEKDAY[parseServerDate(d.date).getDay()]}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TodayRecords({ data }: { data: MonthlyExpense }) {
  return (
    <div className="bg-white rounded-[20px] p-[18px] flex flex-col gap-3.5">
      <p className="text-[15px] font-bold text-ink">오늘 기록</p>
      {data.todayRecords.length === 0 && <p className="text-[13px] text-inkMuted">아직 기록이 없어요.</p>}
      {data.todayRecords.map((r) => (
        <div key={r.id} className="flex items-center gap-3">
          <div
            className={`w-[38px] h-[38px] rounded-xl flex items-center justify-center text-[15px] font-extrabold ${CATEGORY_META[r.category].tile}`}
          >
            {CATEGORY_META[r.category].short}
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-ink">{r.title}</p>
            <p className="text-xs text-inkMuted">{r.time}</p>
          </div>
          <span className="text-[15px] font-bold text-ink">−{won(r.amount)}</span>
        </div>
      ))}
    </div>
  );
}

function Skeleton() {
  return (
    <div className="flex flex-col gap-3.5 animate-pulse">
      <div className="bg-white rounded-[20px] h-[230px]" />
      <div className="bg-white rounded-[20px] h-[186px]" />
      <div className="bg-white rounded-[20px] h-[150px]" />
    </div>
  );
}
