import {
  Home,
  Users,
  Settings,
  Trophy,
  Gamepad2,
  LogOut,
  Bell,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const Sidebar = () => {
  const navigator = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  const navItems = [
    { icon: Home, path: "/home", label: "Dashboard" },
    { icon: Bell, path: "/notifications", label: "Notificações" },
    { icon: Users, path: "/users", label: "Usuários" },
    { icon: Trophy, path: "/leaderboard", label: "Ranking" },
    { icon: Gamepad2, path: "/game", label: "Jogar" },
    { icon: Settings, path: "/settings", label: "Configurações" },
  ];

  const handleLogout = () => {
    logout();
    navigator("/");
  };

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-16 flex-col items-center bg-slate-950 py-6">
      <div
        onClick={() => navigator("/home")}
        className="mb-8 flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-400 to-emerald-400 font-bold text-slate-900 cursor-pointer hover:scale-110 transition-transform"
      >
        AX
      </div>

      <nav className="flex flex-1 flex-col items-center gap-2">
        {navItems.map((item, index) => (
          <button
            key={index}
            onClick={() => navigator(item.path)}
            title={item.label}
            className={`flex h-10 w-10 items-center justify-center rounded-lg transition-all duration-200 ${
              location.pathname === item.path
                ? "bg-cyan-500/20 text-cyan-400"
                : "text-slate-500 hover:bg-slate-800 hover:text-slate-300"
            }`}
          >
            <item.icon className="h-5 w-5" />
          </button>
        ))}
      </nav>

      <div className="mt-auto text-xs text-slate-600">v1.0</div>
      {/* logout */}
      <button
        onClick={handleLogout}
        className="mt-4 flex h-10 w-10 items-center justify-center rounded-lg bg-slate-800 text-slate-400 transition-colors hover:bg-slate-700 hover:text-white"
        title="Terminar sessão"
      >
        <LogOut className="h-5 w-5" />
      </button>
    </aside>
  );
};

export default Sidebar;
