/* eslint-env serviceworker */
importScripts('https://www.gstatic.com/firebasejs/12.12.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/12.12.1/firebase-messaging-compat.js');

// URL 파라미터로 전달받은 env 값으로 초기화 (process.env 사용 불가)
/* eslint-disable no-restricted-globals */
const params = new URL(self.location.href).searchParams;

firebase.initializeApp({
  apiKey: params.get('apiKey'),
  authDomain: params.get('authDomain'),
  projectId: params.get('projectId'),
  storageBucket: params.get('storageBucket'),
  messagingSenderId: params.get('messagingSenderId'),
  appId: params.get('appId'),
});

const messaging = firebase.messaging();

// 백그라운드(앱 꺼져 있을 때) 알림 수신
// 서버가 notification 페이로드를 보내므로 알림 표시는 SDK가 자동으로 처리한다.
// 여기서 showNotification()을 호출하면 같은 알림이 두 번 뜬다.
// 알림을 직접 그리려면 서버를 data-only 메시지로 바꿔야 한다.
messaging.onBackgroundMessage((payload) => {
  console.log('[SW] 백그라운드 메시지 수신:', payload);
});
