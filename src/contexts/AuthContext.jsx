import { createContext, useContext, useEffect, useState } from 'react'

const AuthContext = createContext(); // 전역으로 공유할 수 있는 파이프를 만드는 함수

export const AuthProvider = ({ children }) => {
    
    const [auth, setAuth] = useState({ accessToken: null, sessionId: null });
    const [loading, setLoading] = useState(true); // loading으로 refresh가 호출되기 전에 auth로 넘어가는 것을 막음.
    const GATEWAY_SERVER_URL = "http://localhost:8072";
    const REFRESH_URL = "/user-service/refresh";
    
    useEffect(() => {
        fetch(`${GATEWAY_SERVER_URL}${REFRESH_URL}`, {
            method: "POST",
            credentials: "include",
        })
        .then(res => res.json())
        // TODO: 추후에 sessionId 추가
        .then(({ accessToken }) => setAuth({ accessToken }))
        .catch(() => {})
        .finally(() => setLoading(false));
    }, []);

    if (loading) return null;

    return (
        <AuthContext.Provider value={{ auth, setAuth }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {

    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within AuthProvider");
    return ctx;
}