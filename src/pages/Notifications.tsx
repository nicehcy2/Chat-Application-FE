import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  fetchNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  type AppNotification,
} from "../mocks/notifications";
import { thumbFallbackClass } from "../utils/thumb";
import StateView from "../components/StateView";
import BackButtonImage from "../assets/images/back-button.png";
import AlarmImage from "../assets/images/alarm.png";
import MessageSquareImage from "../assets/images/message-square.png";

type Status = "loading" | "success" | "empty" | "error";

export default function Notifications() {
  const navigate = useNavigate();
  const [items, setItems] = useState<AppNotification[]>([]);
  const [status, setStatus] = useState<Status>("loading");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    fetchNotifications()
      .then((list) => {
        if (cancelled) return;
        setItems(list);
        setStatus(list.length === 0 ? "empty" : "success");
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const readAll = async () => {
    await markAllNotificationsRead();
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const open = (n: AppNotification) => {
    markNotificationRead(n.id);
    setItems((prev) => prev.map((x) => (x.id === n.id ? { ...x, read: true } : x)));
    if (n.to) navigate(n.to);
  };

  const today = items.filter((n) => n.isToday);
  const earlier = items.filter((n) => !n.isToday);
  const hasUnread = items.some((n) => !n.read);

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="h-12 shrink-0 flex items-center justify-between px-3">
        <div className="flex items-center gap-1.5">
          <button type="button" onClick={() => navigate(-1)} aria-label="뒤로" className="w-10 h-11 flex items-center justify-center">
            <img src={BackButtonImage} alt="" className="w-5 h-5" />
          </button>
          <p className="text-[17px] font-extrabold text-ink">알림</p>
        </div>
        <button type="button" onClick={readAll} disabled={!hasUnread} className="px-2 text-[13px] font-bold text-primary disabled:text-inkDisabled">
          모두 읽음
        </button>
      </div>

      <div className="flex-1 overflow-y-auto flex flex-col">
        {status === "loading" && (
          <div className="flex flex-col animate-pulse">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="flex gap-3 px-4 py-3">
                <div className="w-10 h-10 rounded-xl bg-fill shrink-0" />
                <div className="flex-1 flex flex-col gap-2 pt-1">
                  <div className="h-3.5 w-4/5 rounded bg-fill" />
                  <div className="h-3 w-16 rounded bg-fill" />
                </div>
              </div>
            ))}
          </div>
        )}

        {status === "empty" && (
          <StateView
            icon={<img src={AlarmImage} alt="" className="w-8 h-8 opacity-70" />}
            title="아직 알림이 없어요"
            description="채팅방 소식과 달성 알림이 여기에 모여요"
          />
        )}

        {status === "error" && (
          <StateView
            icon={<span className="text-[32px] font-extrabold text-danger">!</span>}
            iconBg="bg-dangerSoftBg"
            title="알림을 불러오지 못했어요"
            outlineAction={{ label: "다시 시도", onClick: () => { setStatus("loading"); setReloadKey((k) => k + 1); } }}
          />
        )}

        {status === "success" && (
          <>
            {today.length > 0 && <SectionLabel first>오늘</SectionLabel>}
            {today.map((n) => <Item key={n.id} item={n} onOpen={() => open(n)} />)}
            {earlier.length > 0 && <SectionLabel first={today.length === 0}>이전</SectionLabel>}
            {earlier.map((n) => <Item key={n.id} item={n} onOpen={() => open(n)} />)}
          </>
        )}
      </div>
    </div>
  );
}

function SectionLabel({ children, first }: { children: React.ReactNode; first: boolean }) {
  return <p className={`px-4 ${first ? "pt-2.5" : "pt-3.5"} pb-1 text-xs font-bold text-inkMuted`}>{children}</p>;
}

function Item({ item, onOpen }: { item: AppNotification; onOpen: () => void }) {
  return (
    <div onClick={onOpen} className={`flex items-start gap-3 px-4 py-3 ${item.to ? "cursor-pointer" : ""} ${item.read ? "" : "bg-primaryTintBg2"}`}>
      <TypeIcon item={item} />
      <div className="flex-1 min-w-0 flex flex-col gap-[3px]">
        <p className="text-sm leading-[1.4] text-ink">
          {item.parts.map((part, i) => (part.bold ? <b key={i}>{part.text}</b> : <span key={i}>{part.text}</span>))}
        </p>
        <span className="text-xs text-inkDisabled">{item.timeLabel}</span>
      </div>
      {!item.read && <span className="w-[7px] h-[7px] rounded-full bg-primary mt-1.5 shrink-0" />}
    </div>
  );
}

// 유형 4종 — 채팅 언급(보라) · 한도 경고(주황) · 달성/적립(민트) · 방 이벤트(썸네일)
function TypeIcon({ item }: { item: AppNotification }) {
  const base = "w-10 h-10 rounded-xl shrink-0 flex items-center justify-center";
  switch (item.type) {
    case "MENTION":
      return (
        <div className={`${base} bg-primaryTintBg`}>
          <img src={MessageSquareImage} alt="" className="w-5 h-5" />
        </div>
      );
    case "LIMIT":
      return <div className={`${base} bg-warnTintBg text-warnDeep text-lg font-extrabold`}>!</div>;
    case "ACHIEVE":
      return <div className={`${base} bg-mintTintBg text-mintDeep text-base font-extrabold`}>✓</div>;
    default:
      return <div className={`${base} ${thumbFallbackClass(item.roomId ?? item.id)}`} />;
  }
}
