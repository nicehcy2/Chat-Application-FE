import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import BackButton from "../components/BackButton";
import LabeledInput from "../components/LabeledInput";
import ChipSelect from "../components/ChipSelect";
import { useAuth } from "../contexts/AuthContext";
import { userApi } from "../api/userApi";
import { ApiError } from "../api/client";
import type { AgeGroup, JobGroup } from "../api/types";
import { AGE_GROUP_OPTIONS, GENDER_OPTIONS, JOB_GROUP_OPTIONS, NICKNAME_MAX_LEN } from "../constants/user";
import { thumbFallbackClass } from "../utils/thumb";

interface ProfileForm {
  nickname: string;
  gender: string;
  ageGroup: AgeGroup | "";
  jobGroup: JobGroup | "";
}

const EMPTY: ProfileForm = { nickname: "", gender: "", ageGroup: "", jobGroup: "" };
const isSame = (a: ProfileForm, b: ProfileForm) =>
  a.nickname === b.nickname && a.gender === b.gender && a.ageGroup === b.ageGroup && a.jobGroup === b.jobGroup;

export default function EditProfile() {
  const navigate = useNavigate();
  const { auth } = useAuth();
  const userId = auth.userId;
  const [initial, setInitial] = useState<ProfileForm | null>(null);
  const [form, setForm] = useState<ProfileForm>(EMPTY);
  const [email, setEmail] = useState("");
  const [loadError, setLoadError] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    if (userId === null) return;
    let cancelled = false;
    userApi
      .getUser(userId)
      .then((user) => {
        if (cancelled) return;
        // TODO(서버): MyPageUserInfoResponseDto에 gender가 없어 비어 있는 채로 시작한다
        const loaded: ProfileForm = { nickname: user.nickname ?? "", gender: "", ageGroup: user.ageGroup ?? "", jobGroup: user.jobGroup ?? "" };
        setInitial(loaded);
        setForm(loaded);
        setEmail(user.email);
      })
      .catch(() => {
        if (!cancelled) setLoadError(true);
      });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const dirty = initial !== null && !isSame(form, initial) && form.nickname.trim().length > 0;
  const update = <K extends keyof ProfileForm>(key: K, value: ProfileForm[K]) => setForm((prev) => ({ ...prev, [key]: value }));

  const save = async () => {
    if (!dirty || saving || userId === null) return;
    setSaving(true);
    setSaveError("");
    try {
      await userApi.editProfile(userId, {
        nickname: form.nickname.trim(),
        gender: form.gender || undefined,
        ageGroup: form.ageGroup || undefined,
        jobGroup: form.jobGroup || undefined,
      });
      navigate("/mypage", { replace: true });
    } catch (e) {
      setSaveError(e instanceof ApiError ? e.message : "저장하지 못했어요. 잠시 후 다시 시도해주세요");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="h-12 shrink-0 flex items-center justify-between px-3">
        <div className="flex items-center gap-1.5">
          <div className="w-10 h-11 flex items-center justify-center">
            <BackButton />
          </div>
          <p className="text-[17px] font-extrabold text-ink">프로필 수정</p>
        </div>
        <button
          type="button"
          onClick={save}
          disabled={!dirty || saving}
          className={`h-11 px-2 text-[15px] font-extrabold ${dirty ? "text-primary" : "text-lineStrong"}`}
        >
          {saving ? "저장 중…" : "저장"}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="flex flex-col gap-7 px-5 pt-4 pb-6">
          <div className="flex flex-col items-center gap-2.5">
            <div className="relative w-[104px] h-[104px]">
              <div className={`w-[104px] h-[104px] rounded-full ${userId !== null ? thumbFallbackClass(userId) : "bg-fill"}`} />
              {/* TODO(3순위): 이미지 업로드 */}
              <button
                type="button"
                aria-label="사진 변경"
                className="absolute -right-0.5 -bottom-0.5 w-[34px] h-[34px] rounded-full bg-primary border-[3px] border-white flex items-center justify-center text-white"
              >
                <CameraIcon />
              </button>
            </div>
            <span className="text-[13px] font-bold text-primary">사진 변경</span>
          </div>

          {loadError ? (
            <p className="text-sm text-danger">프로필을 불러오지 못했어요. 저장하면 빈 값으로 덮어써질 수 있어 저장을 막았어요.</p>
          ) : (
            <>
              <LabeledInput label="1. 닉네임" value={form.nickname} onChange={(v: string) => update("nickname", v)} maxLength={NICKNAME_MAX_LEN} />
              <Section label="2. 성별">
                <ChipSelect options={GENDER_OPTIONS} value={form.gender} onChange={(v) => update("gender", v)} size="lg" />
              </Section>
              <Section label="3. 연령대">
                <ChipSelect options={AGE_GROUP_OPTIONS} value={form.ageGroup} onChange={(v) => update("ageGroup", v)} size="wrap" />
              </Section>
              <Section label="4. 현재 하는 일">
                <ChipSelect options={JOB_GROUP_OPTIONS} value={form.jobGroup} onChange={(v) => update("jobGroup", v)} size="grid" />
              </Section>
              <div className="flex flex-col gap-2">
                <span className="text-[13px] font-semibold text-inkMuted">이메일</span>
                <div className="h-11 rounded-2xl bg-fillSoft px-4 flex items-center justify-between text-sm text-inkDisabled">
                  <span className="truncate">{email}</span>
                  <span className="text-xs shrink-0">변경 불가</span>
                </div>
              </div>
            </>
          )}

          {saveError && <p className="text-sm text-danger">{saveError}</p>}
        </div>
      </div>
    </div>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-2.5">
      <p className="text-[17px] font-extrabold text-primary">{label}</p>
      {children}
    </section>
  );
}

function CameraIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  );
}
