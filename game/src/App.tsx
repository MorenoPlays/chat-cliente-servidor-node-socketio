import { Routes, Route } from "react-router-dom";
import Login from "./pages/auth/login/Login";
import Create from "./pages/auth/create/Create";
import Dashboard from "./pages/home/Dashboard";
import Game from "./pages/Game";
import GameLobby from "./pages/home/GameLobby";
import Notifications from "./pages/home/Notifications";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/create" element={<Create />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/game" element={<Game />} />
      <Route path="/lobby" element={<GameLobby />} />
      <Route path="/notifications" element={<Notifications />} />
    </Routes>
  );
}

export default App;
