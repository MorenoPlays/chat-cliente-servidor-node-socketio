import { useOnlineUsers } from "@/hooks/useOnlineUsers";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { getLobbySocket } from "@/hooks/useLobbySocket";

const getStatusColor = (status: string) => {
  switch (status) {
    case "Online":
      return "bg-emerald-500";
    case "Jogando":
      return "bg-cyan-500";
    case "Ausente":
      return "bg-yellow-500";
    default:
      return "bg-gray-500";
  }
};

const RightSidebar = () => {
  const { users: onlineUsers } = useOnlineUsers();
  const navigate = useNavigate();
  const socket = getLobbySocket();
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);
  const [showGameModal, setShowGameModal] = useState(false);

  const handleCreateGame = (playerId: string) => {
    setSelectedPlayer(playerId);
    setShowGameModal(true);
  };

  const confirmCreateGame = () => {
    if (!socket || !selectedPlayer) return;

    const roomConfig = {
      roomName: `battle-${Date.now()}`,
      maxPlayers: 2,
    };

    socket.emit("create-game", {
      roomConfig,
      invitedPlayerIds: [selectedPlayer],
    });

    setShowGameModal(false);
    setSelectedPlayer(null);
    navigate("/lobby");
  };
  return (
    <aside className="fixed right-0 top-0 h-screen w-64 bg-slate-800/50 backdrop-blur-sm border-l border-slate-700/50 p-4 flex flex-col">
      <div className="mb-6">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
          Online Users
          <span className="text-sm font-normal text-slate-400">
            ({onlineUsers.length})
          </span>
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2">
        {onlineUsers.map((user) => (
          <div
            key={user.id}
            className="flex items-center gap-3 p-3 rounded-lg bg-slate-700/30 hover:bg-slate-700/50 transition-all duration-200 cursor-pointer group"
          >
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-emerald-500 flex items-center justify-center text-white text-sm font-bold">
                {user.avatar}
              </div>
              <span
                className={`absolute bottom-0 right-0 w-3 h-3 ${getStatusColor(
                  user.status
                )} rounded-full border-2 border-slate-800`}
              ></span>
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-white font-medium truncate group-hover:text-cyan-400 transition-colors">
                {user.name}
              </p>
              <p className="text-xs text-slate-400">{user.status}</p>
            </div>

            <button 
              onClick={() => handleCreateGame(user.id)}
              className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-slate-600/50 rounded-lg"
            >
              <svg
                className="w-4 h-4 text-cyan-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </button>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-slate-700/50">
        <button className="w-full py-2 px-4 bg-gradient-to-r from-cyan-500/20 to-emerald-500/20 hover:from-cyan-500/30 hover:to-emerald-500/30 border border-cyan-500/30 rounded-lg text-cyan-400 font-medium transition-all duration-200">
          + Add Friend
        </button>
      </div>

      {/* Modal de Confirmação */}
      {showGameModal && selectedPlayer && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700 max-w-sm w-full mx-4">
            <h3 className="text-lg font-bold text-white mb-4">
              Criar Jogo
            </h3>
            <p className="text-slate-300 mb-6">
              Deseja criar uma partida com{" "}
              <span className="font-semibold text-cyan-400">
                {onlineUsers.find((u) => u.id === selectedPlayer)?.name}
              </span>
              ?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowGameModal(false);
                  setSelectedPlayer(null);
                }}
                className="flex-1 py-2 px-4 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmCreateGame}
                className="flex-1 py-2 px-4 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg font-medium transition-colors"
              >
                Criar Partida
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};

export default RightSidebar;
