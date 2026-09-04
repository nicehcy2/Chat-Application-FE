import { useState } from "react";
import { useNavigate } from "react-router-dom";
import BackButton from "../components/BackButton";
import CompleteButton from "../components/CompleteButton";
import ChipSelect from "../components/ChipSelect";
import { userApi } from "../api/userApi";
import { ApiError } from "../api/client";
import type { AgeGroup, JobGroup } from "../api/types";
import {
  AGE_GROUP_OPTIONS,
  EMAIL_MAX_LEN,
  GENDER_OPTIONS,
  JOB_GROUP_OPTIONS,
  NICKNAME_MAX_LEN,
  PASSWORD_MAX_LEN,
  UNDECIDED,
} from "../constants/user";

const SECTION_COUNT = 7;

interface FieldErrors {
  email?: string;
  password?: string;
  nickname?: string;
  birthDay?: string;
}

export default function Register() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [emailChecked, setEmailChecked] = useState(false);
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [password, setPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const [birthDay, setBirthDay] = useState("");
  const [gender, setGender] = useState<string>("");
  const [ageGroup, setAgeGroup] = useState<AgeGroup | "">("");
  const [jobGroup, setJobGroup] = useState<JobGroup | "">("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const filledCount = [emailChecked, password.length > 0, nickname.trim().length > 0, /^\d{8}$/.test(birthDay), !!gender, !!ageGroup, !!jobGroup].filter(Boolean).length;

  const clearError = (key: keyof FieldErrors) => setErrors((prev) => ({ ...prev, [key]: undefined }));

  const checkEmail = async () => {
    if (!email.trim()) return setErrors((prev) => ({ ...prev, email: "이메일을 입력해주세요" }));
    setCheckingEmail(true);
    try {
      const duplicated = await userApi.checkEmail(email.trim());
      if (duplicated) {
        setEmailChecked(false);
        setErrors((prev) => ({ ...prev, email: "이미 사용 중인 이메일입니다" }));
      } else {
        setEmailChecked(true);
        clearError("email");
      }
    } catch {
      setErrors((prev) => ({ ...prev, email: "이메일 확인 중 오류가 발생했습니다" }));
    } finally {
      setCheckingEmail(false);
    }
  };

  const validate = (): FieldErrors => {
    const next: FieldErrors = {};
    if (!emailChecked) next.email = "이메일 중복 확인을 해주세요";
    if (!password) next.password = "비밀번호를 입력해주세요";
    if (!nickname.trim()) next.nickname = "닉네임을 입력해주세요";
    if (!/^\d{8}$/.test(birthDay)) next.birthDay = "생년월일 8자리를 입력해주세요 (예: 20020330)";
    return next;
  };

  const submit = async () => {
    if (submitting) return;
    const next = validate();
    setErrors(next);
    if (Object.values(next).some(Boolean)) return;

    setSubmitting(true);
    setSubmitError("");
    try {
      await userApi.signup({
        email: email.trim(),
        password,
        nickname: nickname.trim(),
        birthDay,
        gender: gender || UNDECIDED,
        ageGroup: ageGroup || UNDECIDED,
        jobGroup: jobGroup || UNDECIDED,
      });
      navigate("/login", { replace: true });
    } catch (e) {
      setSubmitError(e instanceof ApiError ? e.message : "가입하지 못했어요. 잠시 후 다시 시도해주세요");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="h-12 shrink-0 flex items-center justify-between px-3">
        <div className="flex items-center gap-1.5">
          <div className="w-10 h-11 flex items-center justify-center">
            <BackButton />
          </div>
          <p className="text-[17px] font-extrabold text-ink">회원가입</p>
        </div>
        <span className="text-xs text-inkMuted pr-2">
          {filledCount} / {SECTION_COUNT}
        </span>
      </div>
      <div className="h-[3px] bg-fill shrink-0">
        <div className="h-full bg-primary transition-[width] duration-[220ms] ease-out" style={{ width: `${(filledCount / SECTION_COUNT) * 100}%` }} />
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="flex flex-col gap-3.5 px-5 pt-3.5 pb-3">
          <Section label="1. 이메일">
            <div className="flex gap-2">
              <input
                type="email"
                value={email}
                maxLength={EMAIL_MAX_LEN}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setEmailChecked(false);
                  clearError("email");
                }}
                placeholder="이메일을 입력해주세요"
                className={inputClass(!!errors.email, "flex-1 min-w-0 h-11")}
              />
              <button
                type="button"
                onClick={checkEmail}
                disabled={checkingEmail || emailChecked}
                className={`h-11 px-3.5 rounded-2xl text-[13px] font-extrabold whitespace-nowrap ${
                  emailChecked ? "bg-primaryTintBg text-primary" : "bg-primary text-white"
                } disabled:opacity-90`}
              >
                {emailChecked ? "확인됨" : checkingEmail ? "확인 중" : "중복 확인"}
              </button>
            </div>
            {errors.email ? (
              <FieldError>{errors.email}</FieldError>
            ) : emailChecked ? (
              <p className="text-xs font-semibold text-mintDeep">사용 가능한 이메일입니다</p>
            ) : null}
          </Section>

          <Section label="2. 비밀번호">
            <CountedInput
              type="password"
              value={password}
              maxLength={PASSWORD_MAX_LEN}
              error={!!errors.password}
              onChange={(v) => {
                setPassword(v);
                clearError("password");
              }}
            />
            {errors.password && <FieldError>{errors.password}</FieldError>}
          </Section>

          <Section label="3. 닉네임">
            <CountedInput
              value={nickname}
              maxLength={NICKNAME_MAX_LEN}
              error={!!errors.nickname}
              onChange={(v) => {
                setNickname(v);
                clearError("nickname");
              }}
            />
            {errors.nickname && <FieldError>{errors.nickname}</FieldError>}
          </Section>

          <Section label="4. 생년월일">
            <CountedInput
              value={birthDay}
              maxLength={8}
              inputMode="numeric"
              placeholder="20020330"
              error={!!errors.birthDay}
              onChange={(v) => {
                setBirthDay(v.replace(/\D/g, ""));
                clearError("birthDay");
              }}
            />
            {errors.birthDay && <FieldError>{errors.birthDay}</FieldError>}
          </Section>

          <Section label="5. 성별" gap="gap-2.5">
            <ChipSelect options={GENDER_OPTIONS} value={gender} onChange={setGender} size="lg" />
          </Section>
          <Section label="6. 연령대" gap="gap-2.5">
            <ChipSelect options={AGE_GROUP_OPTIONS} value={ageGroup} onChange={setAgeGroup} size="wrap" />
          </Section>
          <Section label="7. 현재 하시는 일" gap="gap-2.5">
            <ChipSelect options={JOB_GROUP_OPTIONS} value={jobGroup} onChange={setJobGroup} size="grid" />
          </Section>

          {submitError && <p className="text-sm text-danger">{submitError}</p>}
        </div>
      </div>

      <div className="h-6 shrink-0 -mb-6 bg-gradient-to-t from-white to-transparent pointer-events-none relative z-10" />
      <div className="shrink-0 px-5 pt-3 pb-4 border-t border-fillInput bg-white">
        <CompleteButton label={submitting ? "가입 중…" : "완료"} onChange={submit} disabled={submitting} />
      </div>
    </div>
  );
}

const inputClass = (error: boolean, extra = "w-full h-11") =>
  `${extra} rounded-2xl px-4 text-sm text-ink placeholder:text-inkPlaceholder outline-none border-[1.5px] ${
    error ? "bg-dangerInputBg border-danger" : "bg-fillInput border-transparent"
  }`;

function Section({ label, gap = "gap-2", children }: { label: string; gap?: string; children: React.ReactNode }) {
  return (
    <section className={`flex flex-col ${gap}`}>
      <p className="text-[17px] font-extrabold text-primary">{label}</p>
      {children}
    </section>
  );
}

function FieldError({ children }: { children: React.ReactNode }) {
  return <p className="text-xs font-semibold text-danger">{children}</p>;
}

function CountedInput({
  value,
  maxLength,
  onChange,
  error,
  type = "text",
  placeholder,
  inputMode,
}: {
  value: string;
  maxLength: number;
  onChange: (v: string) => void;
  error: boolean;
  type?: string;
  placeholder?: string;
  inputMode?: "numeric" | "text";
}) {
  return (
    <div className="relative">
      <input
        type={type}
        value={value}
        maxLength={maxLength}
        inputMode={inputMode}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={`${inputClass(error)} pr-16`}
      />
      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[13px] text-inkDisabled">
        {value.length}/{maxLength}
      </span>
    </div>
  );
}
