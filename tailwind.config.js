/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
    theme: {
        extend: {
            // 디자인 핸드오프 Design Tokens와 1:1. 화면 코드에서는 hex를 직접 쓰지 않는다.
            colors: {
                primary: "#583FE7",        // 주 액션, 활성 탭, 강조
                primaryDeep: "#3C19B0",    // 보라 배경 위의 글자
                primaryTintBg: "#EFEDFB",  // 연한 보라 배경
                primaryTintBg2: "#FAF9FF", // 선택된 라디오 배경
                primaryChart: "#8C7BF2",   // 차트 2번째 계열
                primaryBarSoft: "#DFDBF9", // 목표 이내 바, 썸네일 플레이스홀더
                mint: "#11B5A4",           // 달성/성공/포인트
                mintDeep: "#0B8C7F",       // 민트 배경 위 글자
                mintTintBg: "#E4F6F4",     // 민트 배경 배지
                mintSoft: "#CFEFEB",       // 썸네일 플레이스홀더
                danger: "#E5484D",         // 치명 이슈, 초과 표시
                dangerBar: "#F2A0A0",      // 목표 초과 바
                warn: "#F5A524",
                ink: "#17161C",            // 본문 최고 대비
                inkMid: "#4B4854",         // 칩·부제
                inkSub: "#6B6875",         // 설명문
                inkMuted: "#8A8794",       // 캡션·라벨
                inkPlaceholder: "#9B98A5",
                inkDisabled: "#A8A5B0",
                lineStrong: "#C9C6D2",     // 대시 보더, 비활성 인디케이터
                lineMid: "#E1E0E6",        // 비활성 버튼 보더
                line: "#E9E9ED",           // 카드 보더, 탭바 상단선
                fill: "#F0F0F3",           // 스켈레톤, 미달성 원
                fillInput: "#F2F2F5",      // 입력·칩 배경, 리스트 구분선
                bgApp: "#F4F4F7",          // 카드형 화면 배경
            },
            transitionDuration: {
                DEFAULT: "180ms",
            },
        },
    },
    plugins: [],
};
