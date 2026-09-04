import { useEffect } from "react";
import { requestFcmToken } from "../firebase";
import { userApi } from "../api/userApi";
import { useAuth } from "../contexts/AuthContext";

export function useFcm() {
  const { auth } = useAuth();

  useEffect(() => {
    if (!auth.userId) return;
    requestFcmToken().then((token) => {
      if (!token) return;
      userApi
        .registerFcmToken({ fcmToken: token, deviceType: "DESKTOP", userId: auth.userId })
        .catch(() => {});
    });
  }, [auth.userId]);
}
