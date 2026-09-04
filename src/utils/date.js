// 서버 LocalDateTime은 마이크로초(6자리)까지 오는데 Safari는 밀리초(3자리)까지만 파싱한다.
export function parseServerDate(value) {
  if (value instanceof Date) return value;
  return new Date(String(value).replace(/(\.\d{3})\d+/, "$1"));
}

const DAY_MS = 24 * 60 * 60 * 1000;

const startOfDay = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

export const isSameDay = (a, b) =>
  startOfDay(parseServerDate(a)).getTime() === startOfDay(parseServerDate(b)).getTime();

// 메시지 옆 시각. 예) 22:31
export const formatTime = (value) =>
  parseServerDate(value).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit", hour12: false });

// 날짜 구분선. 예) 2026년 9월 4일 목요일
export const formatDate = (value) =>
  parseServerDate(value).toLocaleDateString("ko-KR", {
    year: "numeric", month: "long", day: "numeric", weekday: "long",
  });

// 채팅방 목록의 마지막 메시지 시각. 오늘이면 시각, 어제, 일주일 안이면 요일, 그 뒤는 날짜.
export function formatListTime(value) {
  if (!value) return "";
  const date = parseServerDate(value);
  const now = new Date();
  const diffDays = Math.round((startOfDay(now) - startOfDay(date)) / DAY_MS);

  if (diffDays <= 0) return date.toLocaleTimeString("ko-KR", { hour: "numeric", minute: "2-digit" });
  if (diffDays === 1) return "어제";
  if (diffDays < 7) return date.toLocaleDateString("ko-KR", { weekday: "long" });
  if (date.getFullYear() === now.getFullYear()) {
    return date.toLocaleDateString("ko-KR", { month: "long", day: "numeric" });
  }
  return date.toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" });
}
