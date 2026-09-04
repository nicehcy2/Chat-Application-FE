import { BrowserRouter, Route, Routes } from "react-router-dom";

import IphoneLayout from "./layouts/IphoneLayout";
import TabLayout from "./layouts/TabLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import { useFcm } from "./hooks/useFcm";

import AuthPage from "./pages/AuthPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import ChatRoomList from "./pages/ChatRoomList";
import ChatRoomExplore from "./pages/ChatRoomExplore";
import ChatCreate from "./pages/ChatCreate";
import Chat from "./pages/Chat";
import MyPage from "./pages/MyPage";
import EditProfile from "./pages/EditProfile";

function App() {
  useFcm();

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<IphoneLayout />}>
          {/* 상단바 + 하단 탭이 있는 화면 */}
          <Route element={<TabLayout />}>
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<Home />} />
              <Route path="/chats" element={<ChatRoomList />} />
              <Route path="/chats/explore" element={<ChatRoomExplore />} />
              <Route path="/mypage" element={<MyPage />} />
            </Route>
          </Route>

          {/* 전체 화면 */}
          <Route element={<ProtectedRoute />}>
            <Route path="/chats/create" element={<ChatCreate />} />
            <Route path="/chats/:chatRoomId" element={<Chat />} />
            <Route path="/mypage/edit" element={<EditProfile />} />
          </Route>
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
