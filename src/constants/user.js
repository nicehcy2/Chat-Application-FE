// 서버 enum(user-service)과 화면 라벨의 대응. value는 서버로 그대로 전송된다.
export const UNDECIDED = "UNDECIDED";

export const GENDER_OPTIONS = [
  { label: "여자", value: "W" },
  { label: "남자", value: "M" },
];

export const AGE_GROUP_OPTIONS = [
  { label: "14~19세", value: "TEENAGER" },
  { label: "20대", value: "TWENTIES" },
  { label: "30대", value: "THIRTIES" },
  { label: "40대", value: "FORTIES" },
  { label: "50대", value: "FIFTIES" },
  { label: "60대 이상", value: "SIXTIES_AND_ABOVE" },
];

export const JOB_GROUP_OPTIONS = [
  { label: "학생", value: "STUDENT" },
  { label: "직장인", value: "EMPLOYEE" },
  { label: "주부", value: "HOMEMAKER" },
  { label: "자영업자", value: "SELF_EMPLOYED" },
];

export const NICKNAME_MAX_LEN = 20;
export const EMAIL_MAX_LEN = 100;
export const PASSWORD_MAX_LEN = 20;

export function labelOf(options, value) {
  return options.find((option) => option.value === value)?.label ?? "미선택";
}
