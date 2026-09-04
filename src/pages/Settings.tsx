import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { userApi } from "../api/userApi";
import Toggle from "../components/Toggle";
import ConfirmDialog from "../components/ConfirmDialog";
import BackButtonImage from "../assets/images/back-button.png";

type Dialog = "logout" | "withdraw" | null;

export default function Settings() {
  const navigate = useNavigate();
  const { auth, logout } = useAuth();
  const [email, setEmail] = useState("");
  // TODO(서버): 알림 설정 API 없음. 화면 상태만
  const [push, setPush] = useState(true);
  const [chat, setChat] = useState(true);
  const [remind, setRemind] = useState(false);
  const [dialog, setDialog] = useState<Dialog>(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    if (auth.userId === null) return;
    userApi
      .getUser(auth.userId)
      .then((user) => setEmail(user.email))
      .catch(() => setEmail(""));
  }, [auth.userId]);

  const confirm = async () => {
    if (dialog === "logout") {
      setBusy(true);
      await logout();
      setBusy(false);
      navigate("/auth", { replace: true });
      return;
    }
    // TODO(서버): 탈퇴 API 없음
    setDialog(null);
    setNotice("탈퇴는 아직 준비 중이에요. 고객 지원으로 문의해 주세요.");
  };

  return (
    <div className="relative flex flex-col h-full bg-bgApp">
      <div className="h-12 shrink-0 flex items-center gap-1.5 px-3 bg-white">
        <button type="button" onClick={() => navigate(-1)} aria-label="뒤로" className="w-10 h-11 flex items-center justify-center">
          <img src={BackButtonImage} alt="" className="w-5 h-5" />
        </button>
        <p className="text-[17px] font-extrabold text-ink">설정</p>
      </div>

      <div className="flex-1 overflow-y-auto flex flex-col gap-[18px] px-4 pt-3.5 pb-6">
        <Group label="알림">
          <Row label="푸시 알림" right={<Toggle on={push} onChange={setPush} label="푸시 알림" />} />
          <Row label="채팅 알림" right={<Toggle on={chat} onChange={setChat} label="채팅 알림" />} />
          <Row label="기록 리마인드" sub="매일 저녁 9시" right={<Toggle on={remind} onChange={setRemind} label="기록 리마인드" />} tall last />
        </Group>

        <Group label="계정">
          <Row label="이메일" right={<span className="text-[13px] text-inkMuted truncate max-w-[180px]">{email}</span>} />
          {/* TODO(서버): 비밀번호 변경 API 없음 */}
          <Row label="비밀번호 변경" right={<Chevron />} last />
        </Group>

        <Group label="정보">
          {/* TODO: 약관·개인정보 처리방침 문서 */}
          <Row label="서비스 이용 약관" right={<Chevron />} />
          <Row label="개인정보 처리방침" right={<Chevron />} />
          <Row label="버전" right={<span className="text-[13px] text-inkMuted">1.0.0</span>} last />
        </Group>

        <button type="button" onClick={() => setDialog("logout")} className="bg-white rounded-[18px] h-14 text-[15px] font-bold text-ink">
          로그아웃
        </button>

        {notice && <p className="text-center text-[13px] text-inkMuted">{notice}</p>}

        {/* 탈퇴는 의도적으로 가장 낮은 위계 */}
        <button type="button" onClick={() => setDialog("withdraw")} className="self-center pt-1.5 text-[13px] text-inkDisabled underline">
          탈퇴하기
        </button>
      </div>

      <ConfirmDialog
        open={dialog === "logout"}
        title="로그아웃할까요?"
        description="다시 로그인하면 이어서 쓸 수 있어요."
        confirmLabel="로그아웃"
        busy={busy}
        onConfirm={confirm}
        onCancel={() => setDialog(null)}
      />
      <ConfirmDialog
        open={dialog === "withdraw"}
        title="정말 탈퇴할까요?"
        description="기록과 채팅 내역이 모두 삭제되고 복구할 수 없어요."
        confirmLabel="탈퇴하기"
        busy={busy}
        onConfirm={confirm}
        onCancel={() => setDialog(null)}
      />
    </div>
  );
}

function Group({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <p className="px-1 text-xs font-bold text-inkMuted">{label}</p>
      <div className="bg-white rounded-[18px] px-[18px] flex flex-col">{children}</div>
    </div>
  );
}

function Row({ label, sub, right, tall = false, last = false }: { label: string; sub?: string; right: React.ReactNode; tall?: boolean; last?: boolean }) {
  return (
    <div className={`flex items-center justify-between gap-3 ${tall ? "h-16" : "h-14"} ${last ? "" : "border-b border-fillInput"}`}>
      <div className="flex flex-col min-w-0">
        <span className="text-[15px] text-ink">{label}</span>
        {sub && <span className="text-xs text-inkMuted">{sub}</span>}
      </div>
      {right}
    </div>
  );
}

function Chevron() {
  return <span className="text-lg text-lineStrong">›</span>;
}
