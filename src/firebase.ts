// Firebase 앱 초기화 및 FCM(Firebase Cloud Messaging) 관련 유틸 함수 모음
// FCM 흐름: 앱 초기화 → 알림 권한 요청 → 토큰 발급 → 백엔드 전달 → 푸시 수신
import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage, type MessagePayload } from "firebase/messaging";

// Firebase Console > 프로젝트 설정 > 내 앱에서 확인 가능한 앱 식별 정보
// 실제 값은 .env 파일에 저장 (보안상 소스코드에 직접 입력 금지)
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

/**
 * 브라우저 알림 권한을 요청하고 FCM 토큰을 발급받는다.
 * 사용자가 알림 권한을 거부하면 null.
 */
export const requestFcmToken = async (): Promise<string | null> => {
  try {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") return null;

    // 서비스 워커는 process.env를 읽을 수 없어 URL 파라미터로 설정을 넘긴다.
    const swUrl = new URL("/firebase-messaging-sw.js", window.location.origin);
    Object.entries(firebaseConfig).forEach(([key, value]) => {
      if (value) swUrl.searchParams.set(key, value);
    });

    await navigator.serviceWorker.register(swUrl.toString());
    // register()는 등록 "시작"만 보장한다. 워커가 활성화되기 전에 푸시 구독을 시도하면
    // "no active Service Worker" 에러가 나므로 활성화 완료까지 대기한다.
    const registration = await navigator.serviceWorker.ready;

    // VAPID 키: Firebase Console > 클라우드 메시징 > 웹 푸시 인증서
    const token = await getToken(messaging, {
      vapidKey: process.env.REACT_APP_FIREBASE_VAPID_KEY,
      serviceWorkerRegistration: registration,
    });
    return token;
  } catch (error) {
    console.error("FCM 토큰 발급 실패:", error);
    return null;
  }
};

/**
 * 앱이 포그라운드일 때 푸시 메시지를 수신하는 리스너를 등록한다.
 * 백그라운드 수신은 public/firebase-messaging-sw.js에서 처리한다.
 * @returns 리스너 해제 함수
 */
export const onForegroundMessage = (callback: (payload: MessagePayload) => void): (() => void) =>
  onMessage(messaging, callback);
