import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { userApi } from "../api/userApi";
import { ApiError } from "../api/client";
import BackButton from "../components/BackButton";

export default function Login() {
  const navigate = useNavigate();
  const { state } = useLocation() as { state: { from?: string } | null };
  const { setAuth } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    if (!email.trim() || !password) return setError("이메일과 비밀번호를 입력해 주세요");

    setSubmitting(true);
    setError("");
    try {
      const session = await userApi.login(email.trim(), password);
      setAuth(session);
      navigate(state?.from ?? "/", { replace: true });
    } catch (err) {
      setError(
        err instanceof ApiError && (err.status === 401 || err.status === 400 || err.status === 404)
          ? "이메일 또는 비밀번호가 올바르지 않아요"
          : "로그인하지 못했어요. 잠시 후 다시 시도해주세요",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="h-12 shrink-0 flex items-center px-3">
        <div className="w-10 h-11 flex items-center justify-center">
          <BackButton />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 flex flex-col gap-7 px-5 pt-6">
        <div className="flex flex-col gap-1.5">
          <p className="text-[26px] font-extrabold text-primary">로그인</p>
          <p className="text-sm text-inkMuted">가입한 이메일로 계속해요</p>
        </div>

        <div className="flex flex-col gap-4">
          <Field label="이메일">
            <input
              type="email"
              value={email}
              autoComplete="email"
              onChange={(e) => {
                setEmail(e.target.value);
                setError("");
              }}
              placeholder="이메일을 입력해주세요"
              className="w-full h-12 rounded-2xl bg-fillInput px-4 text-[15px] text-ink placeholder:text-inkPlaceholder outline-none"
            />
          </Field>
          <Field label="비밀번호">
            <div
              className={`h-12 rounded-2xl flex items-center justify-between px-4 border-[1.5px] ${
                error ? "bg-dangerInputBg border-danger" : "bg-fillInput border-transparent"
              }`}
            >
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                autoComplete="current-password"
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError("");
                }}
                placeholder="비밀번호를 입력해주세요"
                className="flex-1 min-w-0 bg-transparent text-[15px] text-ink placeholder:text-inkPlaceholder outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "비밀번호 숨기기" : "비밀번호 보기"}
                className="w-8 h-8 -mr-2 flex items-center justify-center text-inkMuted"
              >
                <EyeIcon off={showPassword} />
              </button>
            </div>
            {error && <p className="text-xs font-semibold text-danger">{error}</p>}
          </Field>
          {/* TODO: 비밀번호 찾기 화면·API 없음. 링크가 /register로 가던 오류는 제거 */}
          <div className="flex justify-end">
            <span className="py-2 text-[13px] font-semibold text-inkMuted">비밀번호 찾기</span>
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="h-12 rounded-2xl bg-primary text-white text-base font-extrabold disabled:opacity-60"
        >
          {submitting ? "로그인 중…" : "로그인"}
        </button>
      </form>

      <p className="px-5 pt-4 pb-6 text-center text-[13px] text-inkMuted">
        아직 회원이 아니신가요?{" "}
        <Link to="/register" className="text-primary font-extrabold">
          회원가입
        </Link>
      </p>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-[13px] font-semibold text-inkSub">{label}</span>
      {children}
    </div>
  );
}

function EyeIcon({ off }: { off: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
      <circle cx="12" cy="12" r="3" />
      {off && <path d="M3 3l18 18" />}
    </svg>
  );
}
