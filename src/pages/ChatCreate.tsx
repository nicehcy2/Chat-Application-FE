import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import BackButton from "../components/BackButton";
import CompleteButton from "../components/CompleteButton";
import { chatApi } from "../api/chatApi";
import { ApiError } from "../api/client";
import type { AgeGroup, JobGroup } from "../api/types";
import { JOB_GROUP_OPTIONS } from "../constants/user";

const TITLE_MIN = 2;
const TITLE_MAX = 20;
const INTRO_MAX = 100;
const MEMBER_PRESETS = [10, 30, 50, 100];
const LIMIT_MIN = 5_000;
const LIMIT_MAX = 50_000;
const LIMIT_STEP = 1_000;
const PASSWORD_LEN = 4;

// 탐색 필터와 같은 축. "50대+"는 서버 enum 두 개를 묶는다.
const AGE_CHIPS: { label: string; values: AgeGroup[] }[] = [
  { label: "20대", values: ["TWENTIES"] },
  { label: "30대", values: ["THIRTIES"] },
  { label: "40대", values: ["FORTIES"] },
  { label: "50대+", values: ["FIFTIES", "SIXTIES_AND_ABOVE"] },
];

const won = (n: number) => n.toLocaleString("ko-KR");

interface FieldErrors {
  title?: string;
  password?: string;
}

export default function ChatCreate() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [intro, setIntro] = useState("");
  const [maxMembers, setMaxMembers] = useState(30);
  const [isPrivate, setIsPrivate] = useState(false);
  const [password, setPassword] = useState("");
  const [ageGroups, setAgeGroups] = useState<AgeGroup[]>([]);
  const [jobGroups, setJobGroups] = useState<JobGroup[]>([]);
  const [dailyLimit, setDailyLimit] = useState(15_000);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const titleRef = useRef<HTMLDivElement>(null);
  const passwordRef = useRef<HTMLDivElement>(null);

  const toggleAge = (values: AgeGroup[]) =>
    setAgeGroups((prev) => {
      const has = values.every((v) => prev.includes(v));
      return has ? prev.filter((v) => !values.includes(v)) : [...prev, ...values.filter((v) => !prev.includes(v))];
    });

  const toggleJob = (value: JobGroup) =>
    setJobGroups((prev) => (prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]));

  const validate = (): FieldErrors => {
    const next: FieldErrors = {};
    const t = title.trim();
    if (t.length === 0) next.title = "제목을 입력해 주세요";
    else if (t.length < TITLE_MIN || t.length > TITLE_MAX) next.title = `${TITLE_MIN}~${TITLE_MAX}자로 입력해 주세요`;
    if (isPrivate && !/^\d{4}$/.test(password)) next.password = "4자리 숫자를 입력해 주세요";
    return next;
  };

  const submit = async () => {
    if (submitting) return;
    const next = validate();
    setErrors(next);
    if (next.title) return titleRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    if (next.password) return passwordRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });

    setSubmitting(true);
    setSubmitError("");
    try {
      const newId = await chatApi.createRoom({
        title: title.trim(),
        description: intro.trim(),
        maxParticipants: maxMembers,
        isPrivate,
        password: isPrivate ? password : undefined,
        ageGroups,
        jobGroups,
        dailyLimit,
      });
      navigate(`/chats/${newId}`, { replace: true, state: { title: title.trim(), participationCount: 1 } });
    } catch (e) {
      // TODO(서버): 400 응답의 field명을 받아 해당 블록 인라인 에러로 매핑
      setSubmitError(e instanceof ApiError ? e.message : "방을 만들지 못했어요. 잠시 후 다시 시도해주세요.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="h-12 shrink-0 flex items-center gap-1 px-3">
        <div className="w-10 h-11 flex items-center justify-center">
          <BackButton />
        </div>
        <p className="text-[17px] font-extrabold text-ink">방 만들기</p>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="flex flex-col gap-[18px] px-5 pt-1.5 pb-5">
          <div className="flex flex-col gap-[22px]">
          {/* TODO(3순위): 이미지 업로드(S3) */}
          <div className="flex flex-col items-center gap-2">
            <button
              type="button"
              aria-label="대표 이미지 선택"
              className="w-[88px] h-[88px] rounded-[26px] bg-fillInput border-[1.5px] border-dashed border-lineStrong text-inkDisabled text-2xl leading-none"
            >
              ＋
            </button>
            <span className="text-xs text-inkMuted">대표 이미지 (선택)</span>
          </div>

          <Section ref={titleRef} label="방 제목" error={errors.title}>
            <div className="relative">
              <input
                type="text"
                value={title}
                maxLength={TITLE_MAX}
                placeholder={`${TITLE_MIN}~${TITLE_MAX}자로 입력`}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (errors.title) setErrors((prev) => ({ ...prev, title: undefined }));
                }}
                className={`w-full h-[46px] rounded-[14px] px-4 pr-14 text-sm text-ink placeholder:text-inkPlaceholder outline-none border-[1.4px] ${
                  errors.title ? "bg-dangerTintBg border-danger" : "bg-fillInput border-transparent"
                }`}
              />
              <Counter value={title.length} max={TITLE_MAX} className="right-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </Section>

          <Section label="소개">
            <div className="relative">
              <textarea
                value={intro}
                maxLength={INTRO_MAX}
                onChange={(e) => setIntro(e.target.value)}
                placeholder="어떤 사람들과, 어떤 규칙으로 아낄 건가요?"
                className="w-full min-h-[74px] rounded-[14px] bg-fillInput border-[1.4px] border-transparent px-4 py-3 pb-7 text-sm leading-[1.5] text-ink placeholder:text-inkPlaceholder outline-none resize-none"
              />
              <Counter value={intro.length} max={INTRO_MAX} className="right-3.5 bottom-2.5" />
            </div>
          </Section>

          <Section label="인원">
            <div className="flex gap-[7px]">
              {MEMBER_PRESETS.map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setMaxMembers(n)}
                  className={`flex-1 h-11 rounded-xl text-sm transition-colors ease-out ${
                    maxMembers === n ? "bg-primary text-white font-bold" : "bg-fillInput text-inkMid font-semibold"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </Section>
          </div>

          <div ref={passwordRef} className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[15px] font-extrabold text-primary">비공개 방</p>
                <p className="text-xs text-inkMuted mt-0.5">탐색에 노출되지 않고 비밀번호로만 입장</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={isPrivate}
                onClick={() => {
                  setIsPrivate((v) => !v);
                  setErrors((prev) => ({ ...prev, password: undefined }));
                }}
                className={`w-[50px] h-[30px] rounded-full p-[3px] flex items-center shrink-0 transition-colors ease-out ${
                  isPrivate ? "bg-primary justify-end" : "bg-lineMid justify-start"
                }`}
              >
                <span className="w-6 h-6 rounded-full bg-white" />
              </button>
            </div>
            {isPrivate && (
              <div className="flex flex-col gap-1.5">
                <div
                  className={`h-[46px] rounded-[14px] flex items-center justify-between px-4 border-[1.4px] ${
                    errors.password ? "bg-dangerTintBg border-danger" : "bg-fillInput border-transparent"
                  }`}
                >
                  <input
                    type="password"
                    inputMode="numeric"
                    pattern="\d*"
                    maxLength={PASSWORD_LEN}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value.replace(/\D/g, "").slice(0, PASSWORD_LEN));
                      if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
                    }}
                    placeholder="••••"
                    className="flex-1 min-w-0 bg-transparent text-base tracking-[0.3em] text-ink placeholder:text-inkPlaceholder outline-none"
                  />
                  <span className="text-xs text-inkDisabled shrink-0">4자리 숫자</span>
                </div>
                <span className={`text-xs ${errors.password ? "text-danger font-semibold" : "text-inkMuted"}`}>
                  {errors.password ?? "입장할 사람에게 직접 공유해 주세요"}
                </span>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2.5">
            <div>
              <p className="text-[15px] font-extrabold text-primary">방 속성</p>
              <p className="text-xs text-inkMuted mt-0.5">탐색 필터와 같은 축 — 비슷한 사람에게 노출됩니다</p>
            </div>

            <ChipGroup label="나이대">
              <Chip selected={ageGroups.length === 0} onClick={() => setAgeGroups([])}>전체</Chip>
              {AGE_CHIPS.map((chip) => (
                <Chip key={chip.label} selected={chip.values.every((v) => ageGroups.includes(v))} onClick={() => toggleAge(chip.values)}>
                  {chip.label}
                </Chip>
              ))}
            </ChipGroup>

            <ChipGroup label="직업">
              {JOB_GROUP_OPTIONS.map((option) => (
                <Chip key={option.value} selected={jobGroups.includes(option.value)} onClick={() => toggleJob(option.value)}>
                  {option.label}
                </Chip>
              ))}
            </ChipGroup>

            <div className="flex flex-col gap-[7px]">
              <div className="flex justify-between items-baseline">
                <span className="text-xs font-bold text-inkMid">하루 목표 금액</span>
                <span className="text-[13px] font-extrabold text-ink">{won(dailyLimit)}원</span>
              </div>
              <LimitSlider value={dailyLimit} onChange={setDailyLimit} />
              <div className="flex justify-between text-[11px] text-inkDisabled">
                <span>{won(LIMIT_MIN)}</span>
                <span>{won(LIMIT_MAX)}</span>
              </div>
            </div>
          </div>

          {submitError && <p className="text-sm text-danger">{submitError}</p>}
        </div>
      </div>

      <div className="shrink-0 px-5 pt-3 pb-3.5 bg-white border-t border-fillInput">
        <CompleteButton label={submitting ? "만드는 중…" : "만들기"} onChange={submit} disabled={submitting} />
      </div>
    </div>
  );
}

function Section({
  ref,
  label,
  error,
  children,
}: {
  ref?: React.Ref<HTMLDivElement>;
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <section ref={ref} className="flex flex-col gap-2">
      <div className="flex items-baseline gap-1.5">
        <span className="text-[15px] font-extrabold text-primary">{label}</span>
        {error && <span className="text-xs font-semibold text-danger">{error}</span>}
      </div>
      {children}
    </section>
  );
}

function Counter({ value, max, className }: { value: number; max: number; className: string }) {
  return (
    <span className={`absolute text-xs text-inkDisabled pointer-events-none ${className}`}>
      {value}/{max}
    </span>
  );
}

function ChipGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs font-bold text-inkMid">{label}</span>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}

function Chip({ selected, onClick, children }: { selected: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-[7px] rounded-full text-xs transition-colors ease-out ${
        selected ? "bg-primary text-white font-bold" : "bg-fillInput text-inkMid font-semibold"
      }`}
    >
      {children}
    </button>
  );
}

// 시각은 직접 그리고, 조작은 투명한 네이티브 range가 받는다.
function LimitSlider({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const ratio = ((value - LIMIT_MIN) / (LIMIT_MAX - LIMIT_MIN)) * 100;
  return (
    <div className="relative h-[22px] flex items-center">
      <div className="w-full h-1.5 rounded-full bg-fill">
        <div className="h-full rounded-full bg-primary" style={{ width: `${ratio}%` }} />
      </div>
      <div
        className="absolute w-[22px] h-[22px] rounded-full bg-white border-2 border-primary shadow-[0_2px_6px_rgba(23,22,28,0.18)] -translate-x-1/2 pointer-events-none"
        style={{ left: `${ratio}%` }}
      />
      <input
        type="range"
        min={LIMIT_MIN}
        max={LIMIT_MAX}
        step={LIMIT_STEP}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label="하루 목표 금액"
        className="absolute inset-0 w-full opacity-0 cursor-pointer"
      />
    </div>
  );
}
