import ReactDOM from "react-dom/client";
import "./styles/index.css";
import App from "./App";
import { AuthProvider } from "./contexts/AuthContext";
import { StompProvider } from "./contexts/StompContext";

// StrictMode는 effect를 두 번 실행해 소켓 연결/구독이 중복되므로 켜지 않는다.
ReactDOM.createRoot(document.getElementById("root")!).render(
  <AuthProvider>
    <StompProvider>
      <App />
    </StompProvider>
  </AuthProvider>,
);
