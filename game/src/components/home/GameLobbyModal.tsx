import { useState } from "react";
import { getLobbySocket } from "@/hooks/useLobbySocket";
import { useNavigate } from "react-router-dom";

interface User {
  id: string;
  name: string;
  status: string;
  avatar: string;
  color: string;
}

interface GameLobbyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onlineUsers: User[];
  currentUserId: string;
}

const GameLobbyModal = ({
  isOpen,
  onClose,
  onlineUsers,
  currentUserId,
}: GameLobbyModalProps) => {
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);
  const [roomName, setRoomName] = useState("Sala de Jogo");
  const [maxPlayers, setMaxPlayers] = useState(4);
  const navigate = useNavigate();

  // Filtrar para não mostrar o próprio usuário
  const availableUsers = onlineUsers.filter((user) => {
    // Verificar tanto socket.id quanto userId para garantir que não é você
    const userIdToCheck = (user as any).userId || user.id;
    return userIdToCheck !== currentUserId && user.id !== currentUserId;
  });

  if (!isOpen) return null;

  const togglePlayer = (userId: string) => {
    setSelectedPlayers((prev) => {
      if (prev.includes(userId)) {
        return prev.filter((id) => id !== userId);
      } else {
        if (prev.length < maxPlayers - 1) {
          return [...prev, userId];
        }
        return prev;
      }
    });
  };

  const handleStartGame = () => {
    if (selectedPlayers.length === 0) {
      alert("Selecione pelo menos um jogador!");
      return;
    }

    const socket = getLobbySocket();

    if (!socket || !socket.connected) {
      alert("Não conectado ao servidor!");
      return;
    }

    console.log("=== ENVIANDO CONVITES ===");
    console.log("Jogadores selecionados:", selectedPlayers);
    console.log("Configuração da sala:", { roomName, maxPlayers });

    const roomConfig = {
      roomName,
      maxPlayers,
    };

    socket.emit("create-game", {
      roomConfig,
      invitedPlayerIds: selectedPlayers,
    });

    console.log("Evento 'create-game' enviado ao servidor");

    // Navegar para a página de espera
    navigate("/lobby");
    onClose();
  };

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center"
        onClick={onClose}
      >
        {/* Modal */}
        <div
          className="bg-slate-800 rounded-2xl shadow-2xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Criar Partida</h2>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Configurações da Sala */}
          <div className="mb-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Nome da Sala
              </label>
              <input
                type="text"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                className="w-full bg-slate-700 text-white px-4 py-2 rounded-lg border border-slate-600 focus:border-cyan-500 focus:outline-none"
                placeholder="Digite o nome da sala..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Máximo de Jogadores
              </label>
              <select
                value={maxPlayers}
                onChange={(e) => setMaxPlayers(Number(e.target.value))}
                className="w-full bg-slate-700 text-white px-4 py-2 rounded-lg border border-slate-600 focus:border-cyan-500 focus:outline-none"
              >
                <option value={2}>2 Jogadores</option>
                <option value={4}>4 Jogadores</option>
                <option value={6}>6 Jogadores</option>
                <option value={8}>8 Jogadores</option>
              </select>
            </div>
          </div>

          {/* Lista de Usuários Online */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                Jogadores Online
                <span className="text-sm font-normal text-slate-400">
                  ({selectedPlayers.length}/{maxPlayers - 1} selecionados)
                </span>
              </h3>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto">
              {availableUsers.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <svg
                    className="w-12 h-12 mx-auto mb-2 opacity-50"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                  <p>Nenhum jogador online no momento</p>
                </div>
              ) : (
                availableUsers.map((user) => {
                  // Usar userId se disponível, senão usar socket.id
                  const userIdToSend = (user as any).userId || user.id;
                  const isSelected = selectedPlayers.includes(userIdToSend);
                  const canSelect =
                    selectedPlayers.length < maxPlayers - 1 || isSelected;

                  return (
                    <div
                      key={user.id}
                      onClick={() => canSelect && togglePlayer(userIdToSend)}
                      className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-200 cursor-pointer ${
                        isSelected
                          ? "bg-cyan-500/20 border-2 border-cyan-500"
                          : canSelect
                          ? "bg-slate-700/30 hover:bg-slate-700/50 border-2 border-transparent"
                          : "bg-slate-700/10 opacity-50 cursor-not-allowed border-2 border-transparent"
                      }`}
                    >
                      <div className="relative">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold"
                          style={{ background: user.color }}
                        >
                          {user.avatar}
                        </div>
                        <span
                          className={`absolute bottom-0 right-0 w-3 h-3 ${
                            user.status === "Online"
                              ? "bg-emerald-500"
                              : "bg-cyan-500"
                          } rounded-full border-2 border-slate-800`}
                        ></span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium truncate">
                          {user.name}
                        </p>
                        <p className="text-xs text-slate-400">{user.status}</p>
                      </div>

                      {isSelected && (
                        <svg
                          className="w-5 h-5 text-cyan-400"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 px-4 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-semibold transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleStartGame}
              disabled={selectedPlayers.length === 0}
              className="flex-1 py-3 px-4 bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 disabled:from-slate-600 disabled:to-slate-600 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-all shadow-lg disabled:shadow-none"
            >
              Enviar Convites ({selectedPlayers.length + 1}/{maxPlayers})
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default GameLobbyModal;
