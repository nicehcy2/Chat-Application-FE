// Firebase 앱 초기화 및 FCM(Firebase Cloud Messaging) 관련 유틸 함수 모음
// FCM 흐름: 앱 초기화 → 알림 권한 요청 → 토큰 발급 → 백엔드 전달 → 푸시 수신
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

// Firebase Console > 프로젝트 설정 > 내 앱에서 확인 가능한 앱 식별 정보
// 실제 값은 .env 파일에 저장 (보안상 소스코드에 직접 입력 금지)
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,                         // Firebase 프로젝트 API 키
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,                 // 인증 도메인 (프로젝트ID.firebaseapp.com)
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,                   // Firebase 프로젝트 ID
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,           // Cloud Storage 버킷 주소
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,  // FCM 발신자 ID
  appId: process.env.REACT_APP_FIREBASE_APP_ID,                           // Firebase 앱 ID
};

// Firebase 앱 초기화 - 이후 모든 Firebase 서비스(FCM 등)가 이 app 인스턴스를 공유
const app = initializeApp(firebaseConfig);

// FCM 서비스 인스턴스 - 토큰 발급 및 메시지 수신에 사용
const messaging = getMessaging(app);

/**
 * 브라우저 알림 권한을 요청하고 FCM 토큰을 발급받는 함수
 * - 발급된 토큰은 백엔드에 저장해야 푸시 발송이 가능
 * - 사용자가 알림 권한을 거부하면 null 반환
 * @returns {Promise<string|null>} FCM 토큰 또는 null
 */
export const requestFcmToken = async () => {
  try {
    // 브라우저 알림 권한 요청 ('granted' | 'denied' | 'default')
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') return null;

    // VAPID 키: Firebase Console > 클라우드 메시징 > 웹 푸시 인증서에서 발급
    // FCM 서버가 이 키로 해당 앱에서 발급한 토큰임을 검증
    const token = await getToken(messaging, {
      vapidKey: process.env.REACT_APP_FIREBASE_VAPID_KEY,
    });
    return token;
  } catch (error) {
    console.error('FCM 토큰 발급 실패:', error);
    return null;
  }
};

/**
 * 앱이 포그라운드(브라우저 탭이 열려 있는 상태)일 때 푸시 메시지를 수신하는 리스너 등록
 * - 백그라운드 수신은 public/firebase-messaging-sw.js(서비스 워커)에서 처리
 * @param {Function} callback - 메시지 수신 시 실행할 콜백 (payload 객체를 인자로 받음)
 * @returns {Function} 리스너 해제 함수 (컴포넌트 언마운트 시 호출 권장)
 */
export const onForegroundMessage = (callback) => {
  return onMessage(messaging, callback);
};
