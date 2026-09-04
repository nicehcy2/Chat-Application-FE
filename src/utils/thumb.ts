// 썸네일 이미지가 없을 때 id로 고정되는 플레이스홀더 배경 클래스
const FALLBACKS = ["bg-primaryBarSoft", "bg-mintSoft", "bg-thumbPeach", "bg-thumbSky"];

export const thumbFallbackClass = (id: number): string => FALLBACKS[Math.abs(id) % FALLBACKS.length];
