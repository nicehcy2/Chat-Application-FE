import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const GATEWAY_SERVER_URL = "http://localhost:8072";

export function useAuthFetch() {
    const { auth, setAuth } = useAuth();
    const navigate = useNavigate();

    const authFetch = async (url, options = {}) => {
        const res = await fetch(url, {
            ...options,
            headers: {
                ...options.headers,
                Authorization: `Bearer ${auth.accessToken}`,
            },
            credentials: "include",
        });

        if (res.status !== 401) return res;

        // 401이면 refresh 시도
        const refreshRes = await fetch(`${GATEWAY_SERVER_URL}/user-service/refresh`, {
            method: "POST",
            credentials: "include",
        });

        if (!refreshRes.ok) {
            setAuth({ accessToken: null, sessionId: null, userId: null });
            navigate("/auth", { replace: true });
            return null;
        }

        const { accessToken, sessionId, userId } = await refreshRes.json();
        setAuth({ accessToken, sessionId, userId });

        // 원래 요청 재시도
        return fetch(url, {
            ...options,
            headers: {
                ...options.headers,
                Authorization: `Bearer ${accessToken}`,
            },
            credentials: "include",
        });
    };

    return authFetch;
}
