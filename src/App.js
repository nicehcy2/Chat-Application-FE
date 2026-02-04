import { BrowserRouter, Route, Routes } from "react-router-dom";

import logo from './logo.svg';
import './App.css';
import Chat from './pages/Chat';
import ChatRoomList from "./pages/ChatRoomList";
import IphoneLayout from "./layouts/IphoneLayout";
import Home from "./pages/home";
import Login from "./pages/Login";

function App() {
  return (
    <BrowserRouter>
      <IphoneLayout>
        <Routes>
          <Route path="/" element={<Home />}/>
          <Route path="/chats" element={<ChatRoomList />}/>
          <Route path="/chats/:chatRoomId" element={<Chat />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </IphoneLayout>
    </BrowserRouter>
  );
}

export default App;
