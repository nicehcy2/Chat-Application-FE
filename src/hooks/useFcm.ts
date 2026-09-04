import { useEffect } from "react";
import { requestFcmToken } from "../firebase";
import { userApi } from "../api/userApi";
import { useAuth } from "../contexts/AuthContext";

export function useFcm(): void {
  const { auth } = useAuth();
  const userId = auth.userId;

  useEffect(() => {
    if (userId === null) return;
    requestFcmToken().then((token) => {
      if (!token) return;
      userApi
        .registerFcmToken({ fcmToken: token, deviceType: "DESKTOP", userId })
        .catch(() => {});
    });
  }, [userId]);
}
