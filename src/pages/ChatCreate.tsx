import { useState } from "react";
import { useNavigate } from "react-router-dom";
import BackButton from "../components/BackButton";
import LabeledInput from "../components/LabeledInput";
import CompleteButton from "../components/CompleteButton";
import { chatApi } from "../api/chatApi";
import { ApiError } from "../api/client";
import type { RoomVisibility } from "../api/types";

const NAME_MAX_LEN = 20;
const LIMIT_STEP = 1_000;
const LIMIT_MIN = 1_000;
const LIMIT_PRESETS = [10_000, 15_000, 20_000];
const MEMBER_PRESETS = [10, 30, 50, 100];
const SECTION_COUNT = 5;

const VISIBILITY_OPTIONS: { value: RoomVisibility; title: string; description: string }[] = [
  { value: "PUBLIC", title: "공개", description: "둘러보기에 노출되고 누구나 바로 참여" },
  { value: "APPROVAL", title: "승인제", description: "참여 신청을 방장이 승인" },
];

const won = (n: number) => n.toLocaleString("ko-KR");

export default function ChatCreate() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [intro, setIntro] = useState("");
  const [dailyLimit, setDailyLimit] = useState(15_000);
  const [maxMembers, setMaxMembers] = useState(30);
  const [visibility, setVisibility] = useState<RoomVisibility>("PUBLIC");
  // 기본값이 있는 섹션은 사용자가 건드렸을 때만 "채워진" 것으로 센다.
  const [touched, setTouched] = useState({ limit: false, members: false, visibility: false });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const filledCount =
    Number(name.trim().length > 0) +
    Number(intro.trim().length > 0) +
    Number(touched.limit) +
    Number(touched.members) +
    Number(touched.visibility);

  const changeLimit = (next: number) => {
    setDailyLimit(Math.max(LIMIT_MIN, next));
    setTouched((t) => ({ ...t, limit: true }));
  };
  const changeMembers = (next: number) => {
    setMaxMembers(next);
    setTouched((t) => ({ ...t, members: true }));
  };
  const changeVisibility = (next: RoomVisibility) => {
    setVisibility(next);
    setTouched((t) => ({ ...t, visibility: true }));
  };

  const submit = async () => {
    if (!name.trim() || submitting) return;
    setSubmitting(true);
    setError("");
    try {
      const newId = await chatApi.createRoom({
        title: name.trim(),
        description: intro.trim(),
        dailyLimit,
        maxParticipants: maxMembers,
        visibility,
      });
      navigate(`/chats/${newId}`, { replace: true, state: { title: name.trim(), participationCount: 1 } });
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "채팅방을 만들지 못했어요. 잠시 후 다시 시도해주세요.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex items-center justify-between px-4 h-12 shrink-0">
        <div className="flex items-center gap-3">
          <BackButton />
          <p className="text-[17px] font-extrabold text-ink">채팅방 만들기</p>
        </div>
        <span className="text-xs text-inkMuted">
          {filledCount} / {SECTION_COUNT}
        </span>
      </div>
      <div className="h-[3px] bg-fill shrink-0">
        <div
          className="h-full bg-primary transition-[width] duration-[220ms] ease-out"
          style={{ width: `${(filledCount / SECTION_COUNT) * 100}%` }}
        />
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="flex flex-col gap-[26px] px-5 pt-[18px] pb-6">
          {/* TODO: 이미지 업로드(S3) 연동 전까지는 자리만 둔다 */}
          <div className="flex flex-col items-center gap-2">
            <button
              type="button"
              className="w-24 h-24 rounded-full bg-fillInput border-[1.5px] border-dashed border-lineStrong text-inkDisabled text-[26px] leading-none"
              aria-label="대표 이미지 선택"
            >
              ＋
            </button>
            <span className="text-xs text-inkMuted">대표 이미지 (선택)</span>
          </div>

          <LabeledInput
            label="1. 방 이름"
            value={name}
            onChange={setName}
            maxLength={NAME_MAX_LEN}
            placeholder="예) 무지출이 대세다"
          />

          <Section title="2. 한 줄 소개">
            <textarea
              value={intro}
              onChange={(e) => setIntro(e.target.value)}
              placeholder="어떤 사람들과, 어떤 규칙으로 아낄 건가요?"
              className="w-full min-h-[72px] rounded-2xl bg-fillInput px-4 py-3 text-sm leading-normal text-ink placeholder:text-inkPlaceholder outline-none resize-none"
            />
          </Section>

          <Section title="3. 하루 목표 지출 한도">
            <div className="h-14 rounded-2xl border-[1.5px] border-primary px-3.5 flex items-center justify-between">
              <StepButton label="−" tone="minus" onClick={() => changeLimit(dailyLimit - LIMIT_STEP)} />
              <div className="text-[22px] font-extrabold text-ink">
                {won(dailyLimit)}
                <span className="text-[15px] font-bold ml-0.5">원</span>
              </div>
              <StepButton label="＋" tone="plus" onClick={() => changeLimit(dailyLimit + LIMIT_STEP)} />
            </div>
            <div className="flex gap-2">
              {LIMIT_PRESETS.map((preset) => (
                <Chip key={preset} selected={dailyLimit === preset} onClick={() => changeLimit(preset)} size="sm">
                  {won(preset)}
                </Chip>
              ))}
              <Chip selected={!LIMIT_PRESETS.includes(dailyLimit)} onClick={() => setTouched((t) => ({ ...t, limit: true }))} size="sm">
                직접
              </Chip>
            </div>
          </Section>

          <Section title="4. 최대 인원">
            <div className="flex gap-2">
              {MEMBER_PRESETS.map((preset) => (
                <Chip key={preset} selected={maxMembers === preset} onClick={() => changeMembers(preset)} size="md">
                  {preset}명
                </Chip>
              ))}
            </div>
          </Section>

          <Section title="5. 공개 설정">
            <div className="flex flex-col gap-2">
              {VISIBILITY_OPTIONS.map((option) => {
                const selected = visibility === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => changeVisibility(option.value)}
                    className={`flex items-center gap-3 p-3.5 rounded-2xl border-[1.5px] text-left transition-colors ease-out ${
                      selected ? "border-primary bg-primaryTintBg2" : "border-line bg-transparent"
                    }`}
                  >
                    <span
                      className={`w-5 h-5 rounded-full shrink-0 ${
                        selected ? "border-[6px] border-primary" : "border-[1.5px] border-lineStrong"
                      }`}
                    />
                    <span className="flex flex-col gap-0.5">
                      <span className="text-sm font-bold text-ink">{option.title}</span>
                      <span className="text-xs text-inkMuted">{option.description}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </Section>

          {error && <p className="text-sm text-danger">{error}</p>}
        </div>
      </div>

      <div className="shrink-0 px-5 pt-3 pb-4 bg-white border-t border-fillInput">
        <CompleteButton
          label={submitting ? "만드는 중…" : "채팅방 만들기"}
          onChange={submit}
          disabled={!name.trim() || submitting}
        />
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <p className="text-[17px] font-extrabold text-primary">{title}</p>
      {children}
    </section>
  );
}

function StepButton({ label, tone, onClick }: { label: string; tone: "minus" | "plus"; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-[34px] h-[34px] rounded-full text-[17px] leading-none ${
        tone === "plus" ? "bg-primaryTintBg text-primary" : "bg-fillInput text-inkMid"
      }`}
    >
      {label}
    </button>
  );
}

function Chip({
  selected,
  onClick,
  size,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  size: "sm" | "md";
  children: React.ReactNode;
}) {
  const sizeClass = size === "sm" ? "h-9 rounded-[10px] text-[13px]" : "h-11 rounded-xl text-sm";
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 transition-colors ease-out ${sizeClass} ${
        selected ? "bg-primary text-white font-bold" : "bg-fillInput text-inkMid font-semibold"
      }`}
    >
      {children}
    </button>
  );
}
