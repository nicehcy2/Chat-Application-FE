import { BrowserRouter, Route, Routes } from "react-router-dom";

import './App.css';
import Chat from './pages/Chat';
import ChatRoomList from "./pages/ChatRoomList";
import IphoneLayout from "./layouts/IphoneLayout";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ProtectedRoute from "./components/ProtectedRoute";
import AuthPage from "./pages/AuthPage";

function App() {
  return (
    <BrowserRouter>
      <IphoneLayout>
        <Routes>
          <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/auth" element={<AuthPage />}/>
          <Route path="/chats" element={<ProtectedRoute><ChatRoomList /></ProtectedRoute>}/>
          <Route path="/chats/:chatRoomId" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </IphoneLayout>
    </BrowserRouter>
  );
}

export default App;
