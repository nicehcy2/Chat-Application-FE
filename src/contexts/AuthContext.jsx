import { createContext, useContext, useState } from 'react'

const AuthContext = createContext(); // 전역으로 공유할 수 있는 파이프를 만드는 함수

export const AuthProvider = ({ children }) => {
    
    const [auth, setAuth] = useState({ accessToken: null, sessionId: null });
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