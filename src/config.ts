// 서버 주소 단일 출처.
// .env.local의 REACT_APP_* 값이 있으면 그 값을, 없으면 기본값(운영 구조: nginx/게이트웨이)을 사용한다.
// 값 변경 후에는 dev 서버(npm start)를 재시작해야 반영된다.
export const WEBSOCKET_URL: string = process.env.REACT_APP_WS_URL ?? "ws://localhost:80/ws";
export const GATEWAY_SERVER_URL: string = process.env.REACT_APP_GATEWAY_URL ?? "http://localhost:8072";
