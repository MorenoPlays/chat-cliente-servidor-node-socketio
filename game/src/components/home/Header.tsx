import { Plus, LayoutGrid, LogOut, Bell } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const Header = () => {
  const { logout, currentUser } = useAuth();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="flex items-center justify-between border-b border-slate-800 bg-slate-900/50 px-6 py-4 backdrop-blur-sm">
      <nav className="flex items-center h-10 gap-4">
        <span className="  " style={{ fontFamily: "Black Goth, serif" }}>
          <span className="text-[45px] bg-gradient-to-r from-cyan-500 to-emerald-500 bg-clip-text text-transparent">
            AXOLO
          </span>
        </span>
        {currentUser && (
          <span className="text-sm text-slate-400 mt-2">
            Olá,{" "}
            <span className="text-cyan-400 font-medium">
              {currentUser.username}
            </span>
          </span>
        )}
      </nav>

      <div className="flex items-center gap-3">
        <button className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-cyan-500 to-emerald-500 px-4 py-2 text-sm font-semibold text-slate-900 transition-all duration-200 hover:from-cyan-400 hover:to-emerald-400 hover:shadow-lg hover:shadow-cyan-500/25">
          <Plus className="h-4 w-4" />
          Link de Convite
        </button>
        <button
          onClick={() => navigate("/notifications")}
          className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-slate-800 text-slate-400 transition-colors hover:bg-slate-700 hover:text-white"
          title="Notificações"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
        <button className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-800 text-slate-400 transition-colors hover:bg-slate-700 hover:text-white">
          <LayoutGrid className="h-4 w-4" />
        </button>
        <button
          onClick={handleLogout}
          className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-900/30 text-red-400 transition-colors hover:bg-red-900/50 hover:text-red-300"
          title="Sair"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
};

export default Header;
