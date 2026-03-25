# Chat Application FE

React 기반의 채팅 애플리케이션 프론트엔드입니다.  
모바일 앱처럼 보이는 iPhone 레이아웃 위에서 회원가입, 로그인, 채팅방 목록 조회, 실시간 채팅, 마이페이지/프로필 수정 흐름을 구현하고 있습니다.

## 프로젝트 개요

- `React` + `React Router` 기반 SPA
- `Tailwind CSS`를 사용한 UI 스타일링
- `@stomp/stompjs`를 이용한 WebSocket/STOMP 실시간 채팅
- `AuthContext`와 `useAuthFetch`를 통한 인증 상태 관리 및 토큰 재발급 처리

현재 코드 기준으로 다음 기능이 확인됩니다.

- 회원가입
- 로그인
- 리프레시 토큰 기반 인증 복구
- 보호 라우트 처리
- 내 채팅방 목록 조회
- 채팅방 입장 및 메시지 조회
- WebSocket 기반 메시지 송수신
- 마이페이지 조회
- 프로필 수정

## 기술 스택

- React 19
- React Router DOM 7
- Tailwind CSS 3
- STOMP.js
- Create React App

## 실행 방법

### 1. 사전 준비

아래 서비스가 먼저 실행 중이어야 합니다.

- Node.js / npm
- API Gateway: `http://localhost:8072`
- WebSocket 프록시(Nginx 등): `ws://localhost:80/ws`

이 프로젝트는 서버 주소를 `.env`가 아니라 코드에 직접 하드코딩하고 있습니다.  
주요 주소는 다음 파일들에 들어 있습니다.

- `src/contexts/AuthContext.jsx`
- `src/hooks/useAuthFetch.js`
- `src/pages/Login.jsx`
- `src/pages/Register.jsx`
- `src/pages/Chat.jsx`
- `src/pages/ChatRoomList.jsx`
- `src/pages/MyPage.jsx`
- `src/pages/EditProfile.jsx`

### 2. 패키지 설치

```bash
npm install
```

PowerShell에서 실행 정책 오류가 나면 아래처럼 실행하면 됩니다.

```bash
npm.cmd install
```

### 3. 개발 서버 실행

```bash
npm start
```

PowerShell에서는 필요 시 아래 명령을 사용하세요.

```bash
npm.cmd start
```

기본 실행 주소:

- [http://localhost:3000](http://localhost:3000)

## 주요 화면 / 라우트

| 경로 | 설명 | 인증 필요 |
| --- | --- | --- |
| `/auth` | 인증 시작 화면 | 아니오 |
| `/login` | 로그인 | 아니오 |
| `/register` | 회원가입 | 아니오 |
| `/` | 홈 화면 | 예 |
| `/chats` | 채팅방 목록 | 예 |
| `/chats/:chatRoomId` | 채팅방 상세 | 예 |
| `/chats/explore` | 채팅방 탐색 화면 | 예 |
| `/mypage` | 마이페이지 | 예 |
| `/mypage/edit` | 프로필 수정 | 예 |

## 인증 / 통신 구조

### 인증 흐름

- 앱 시작 시 `POST /user-service/refresh` 호출
- refresh 성공 시 `accessToken`, `sessionId`, `userId`를 `AuthContext`에 저장
- 인증이 필요한 화면은 `ProtectedRoute`로 감쌈
- API 호출 중 `401`이 발생하면 `useAuthFetch`가 refresh 후 원래 요청을 재시도

### 실시간 채팅 흐름

- WebSocket 연결 주소: `ws://localhost:80/ws`
- STOMP publish 예시: `/pub/chat.message.{chatRoomId}`
- STOMP subscribe 예시: `/sub/chatroom{chatRoomId}`

## 폴더 구조

```text
src
├─ assets
│  └─ images
├─ components
├─ contexts
├─ hooks
├─ layouts
├─ pages
└─ styles
```

간단한 역할은 아래와 같습니다.

- `components`: 버튼, 입력 폼, 보호 라우트, 네비게이션 등 공통 UI
- `contexts`: 전역 인증 상태와 WebSocket 연결 관리
- `hooks`: 인증 포함 API 호출 로직
- `layouts`: iPhone 프레임 형태의 공통 레이아웃
- `pages`: 로그인, 회원가입, 채팅방, 마이페이지 등 화면 단위 컴포넌트
- `styles`: 전역 Tailwind 스타일 진입점

## 현재 상태 메모

현재 저장소 기준으로 아래 사항을 참고하면 좋습니다.

- `README` 작성 시점에 `node_modules`가 없어 바로 빌드되지는 않았습니다.
- 이 환경에서는 PowerShell 실행 정책 때문에 `npm` 대신 `npm.cmd` 사용이 필요했습니다.
- 일부 화면은 아직 플레이스홀더 상태입니다.
  - `Home`
  - `ChatRoomExplore`
  - `ChatCreate`는 파일만 있고 내용이 비어 있습니다.
- 채팅방 목록 화면에서 `/chats/create`로 이동하는 버튼이 있지만 `App.js`에는 해당 라우트가 아직 등록되어 있지 않습니다.
- API / WebSocket 주소가 코드에 고정되어 있어 배포 또는 환경 분리 시 정리가 필요합니다.

## 개선해보면 좋은 점

- API 주소를 `.env`로 분리
- 공통 API 클라이언트 추출
- 페이지/컴포넌트 한글 문자열 인코딩 점검
- 미완성 라우트(`Home`, `ChatRoomExplore`, `ChatCreate`) 연결
- 에러 처리 및 사용자 피드백 강화
- 테스트 코드 보강

## 스크립트

```bash
npm start
npm test
npm run build
```

PowerShell 환경에서는 필요 시 `npm.cmd`로 바꿔 실행하면 됩니다.
