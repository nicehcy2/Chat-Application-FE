// TODO(서버): 알림 API가 생기면 교체한다. 읽음 상태는 세션 동안만 유지.
export type NotificationType = "MENTION" | "LIMIT" | "ACHIEVE" | "ROOM";

export interface NotificationTextPart {
  text: string;
  bold?: boolean;
}

export interface AppNotification {
  id: number;
  type: NotificationType;
  parts: NotificationTextPart[];
  timeLabel: string;
  isToday: boolean;
  read: boolean;
  /** 탭하면 이동할 경로 */
  to?: string;
  /** ROOM 타입의 썸네일 폴백 색 결정용 */
  roomId?: number;
}

let notifications: AppNotification[] = [
  {
    id: 1,
    type: "MENTION",
    parts: [{ text: "무지출이 대세다", bold: true }, { text: "에서 민수님이 회원님을 언급했어요" }],
    timeLabel: "10분 전",
    isToday: true,
    read: false,
    to: "/chats/1",
  },
  {
    id: 2,
    type: "LIMIT",
    parts: [{ text: "오늘 한도의 " }, { text: "80%", bold: true }, { text: "를 사용했어요. 남은 금액 3,000원" }],
    timeLabel: "2시간 전",
    isToday: true,
    read: false,
    to: "/expenses",
  },
  {
    id: 3,
    type: "ACHIEVE",
    parts: [{ text: "3일 연속 달성!", bold: true }, { text: " 80P가 적립됐어요" }],
    timeLabel: "어제",
    isToday: false,
    read: true,
  },
  {
    id: 4,
    type: "ROOM",
    parts: [{ text: "같은 실수 반복 금지", bold: true }, { text: " 참여가 승인됐어요" }],
    timeLabel: "어제",
    isToday: false,
    read: true,
    to: "/chats/2",
    roomId: 2,
  },
  {
    id: 5,
    type: "MENTION",
    parts: [{ text: "지난주 " }, { text: "무지출이 대세다", bold: true }, { text: " 랭킹 2위를 기록했어요" }],
    timeLabel: "3일 전",
    isToday: false,
    read: true,
    to: "/chats/1/rank",
  },
  {
    id: 6,
    type: "ROOM",
    parts: [{ text: "배달 끊기 30일", bold: true }, { text: "에 하늘님 외 3명이 참여했어요" }],
    timeLabel: "9월 1일",
    isToday: false,
    read: true,
    roomId: 3,
  },
];

const delay = <T,>(value: T, ms = 200): Promise<T> => new Promise((resolve) => setTimeout(() => resolve(value), ms));

export const hasUnreadNotifications = (): boolean => notifications.some((n) => !n.read);

export function fetchNotifications(): Promise<AppNotification[]> {
  return delay([...notifications]);
}

export function markAllNotificationsRead(): Promise<void> {
  notifications = notifications.map((n) => ({ ...n, read: true }));
  return delay(undefined, 100);
}

export function markNotificationRead(id: number): void {
  notifications = notifications.map((n) => (n.id === id ? { ...n, read: true } : n));
}
