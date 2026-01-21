import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { getLobbySocket } from "@/hooks/useLobbySocket";
import Header from "@/components/home/Header";
import Sidebar from "@/components/home/Sidebar";
import { Users, Crown, Clock } from "lucide-react";

const GameLobby = () => {
  const navigate = useNavigate();
  const { currentUser, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [waitingRoom, setWaitingRoom] = useState<any>(null);
  const [playersInRoom, setPlayersInRoom] = useState<any[]>([]);

  // Verificar autenticação
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!loading) {
      const authenticated = isAuthenticated();
      if (!authenticated) {
        navigate("/");
      }
    }
  }, [loading, currentUser, navigate, isAuthenticated]);

  // Escutar eventos do socket
  useEffect(() => {
    const socket = getLobbySocket();
    //console.log("socket: ", socket);
    if (!socket) {
      //console.log("Socket não disponível, redirecionando...");
      navigate("/home");
      return;
    }

    //console.log("GameLobby: Conectado ao socket existente");

    // Escutar quando sala é criada
    const handleGameCreated = ({ roomId, room }: any) => {
      //console.log("GameLobby: Sala criada, entrando em modo de espera:", room);
      setWaitingRoom({ roomId, ...room });
      setPlayersInRoom([room.host]); // Host já está na sala
    };

    // Escutar quando jogador entra em uma sala (para quem aceitou convite)
    const handleRoomJoined = ({ roomId, room }: any) => {
      //console.log("GameLobby: Você entrou na sala:", room);
      setWaitingRoom({ roomId, ...room });
      setPlayersInRoom(room.players || []);
    };

    // Escutar quando jogador entra na sala
    const handlePlayerJoined = ({ player, room }: any) => {
      //console.log("GameLobby: Jogador entrou na sala:", player);
      setPlayersInRoom(room.players || []);
      setWaitingRoom((prev: any) => (prev ? { ...prev, ...room } : null));
    };

    // Escutar quando jogo inicia
    const handleGameStarting = ({ roomId }: any) => {
      //console.log(" GameLobby: Jogo iniciando na sala:", roomId);
      // Guardar roomId no sessionStorage para o jogo acessar
      sessionStorage.setItem("currentRoomId", roomId);
      
      // ✅ IMPORTANTE: Guardar playerConfig em sessionStorage também (por aba!)
      // Pega do socket.data.user que foi definido na conexão
      if (socket && socket.data && socket.data.user) {
        sessionStorage.setItem("gamePlayerConfig", JSON.stringify({
          name: socket.data.user.name,
          color: socket.data.user.color || "#59bf82",
          avatar: socket.data.user.avatar || "🎮",
        }));
        //console.log("✅ PlayerConfig salvo em sessionStorage:", socket.data.user.name);
      }
      
      navigate("/game");
    };

    // Listener para evento customizado do socket
    const handleGameStartingEvent = (event: any) => {
      //console.log("GameLobby: Recebeu evento game-starting customizado:", event.detail);
      sessionStorage.setItem("currentRoomId", event.detail.roomId);
      
      // ✅ IMPORTANTE: Guardar playerConfig em sessionStorage também
      if (socket && socket.data && socket.data.user) {
        sessionStorage.setItem("gamePlayerConfig", JSON.stringify({
          name: socket.data.user.name,
          color: socket.data.user.color || "#59bf82",
          avatar: socket.data.user.avatar || "🎮",
        }));
        //console.log("✅ PlayerConfig salvo em sessionStorage:", socket.data.user.name);
      }
      
      navigate("/game");
    };

    socket.on("game-created", handleGameCreated);
    socket.on("room-joined", handleRoomJoined);
    socket.on("player-joined-room", handlePlayerJoined);
    socket.on("game-starting", handleGameStarting);
    
    // Ouvir evento customizado
    window.addEventListener("game-starting", handleGameStartingEvent);

    return () => {
      // Apenas remover listeners, não desconectar
      //console.log("GameLobby: Removendo listeners (mantendo conexão)");
      socket.off("game-created", handleGameCreated);
      socket.off("room-joined", handleRoomJoined);
      socket.off("player-joined-room", handlePlayerJoined);
      socket.off("game-starting", handleGameStarting);
      window.removeEventListener("game-starting", handleGameStartingEvent);
    };
  }, [navigate]);

  const handleStartMatch = () => {
    if (!waitingRoom) return;

    const socket = getLobbySocket();
   // console.log("socket1:", socket);
    if (!socket) return;

    //console.log("Iniciando partida na sala:", waitingRoom.roomId);
    socket.emit("start-game", waitingRoom.roomId);
  };

  const handleCancelLobby = () => {
    // TODO: Implementar cancelamento da sala no servidor
    navigate("/home");
  };

  if (loading || !currentUser) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
        Carregando...
      </div>
    );
  }

  if (!waitingRoom) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
        <div className="text-center">
          <Clock className="w-16 h-16 mx-auto mb-4 animate-spin text-cyan-400" />
          <p className="text-xl">Aguardando criação da sala...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <Sidebar />

      <main className="ml-16">
        <Header />

        <div className="p-6 max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Users className="w-12 h-12 text-cyan-400" />
              <h1 className="text-4xl font-bold text-white">Sala de Espera</h1>
            </div>
            <p className="text-slate-400">
              Aguardando jogadores aceitarem o convite...
            </p>
          </div>

          {/* Info da Sala */}
          <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  {waitingRoom.name}
                </h2>
                <p className="text-slate-400">
                  Modo: {waitingRoom.maxPlayers} jogadores
                </p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-cyan-400">
                  {playersInRoom.length}/{waitingRoom.maxPlayers}
                </p>
                <p className="text-sm text-slate-400">Jogadores</p>
              </div>
            </div>

            {/* Barra de Progresso */}
            <div className="w-full bg-slate-700 rounded-full h-3 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-emerald-500 transition-all duration-500"
                style={{
                  width: `${
                    (playersInRoom.length / waitingRoom.maxPlayers) * 100
                  }%`,
                }}
              ></div>
            </div>
          </div>

          {/* Lista de Jogadores */}
          <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6 mb-8">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <Users className="w-5 h-5" />
              Jogadores na Sala
            </h3>

            <div className="space-y-3">
              {playersInRoom
                .filter((player: any) => player !== null && player !== undefined)
                .map((player: any, index: number) => (
                <div
                  key={player.id || index}
                  className="flex items-center gap-4 p-4 rounded-lg bg-emerald-500/10 border-2 border-emerald-500/50"
                >
                  <div className="relative">
                    <div
                      className="w-14 h-14 rounded-full flex items-center justify-center text-white text-lg font-bold"
                      style={{
                        background:
                          player.color ||
                          "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      }}
                    >
                      {player.avatar ||
                        player.name?.substring(0, 2).toUpperCase()}
                    </div>
                    <span className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 rounded-full border-2 border-slate-800"></span>
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-white font-semibold text-lg">
                        {player.name}
                      </p>
                      {index === 0 && (
                        <div className="flex items-center gap-1 px-2 py-1 bg-yellow-500/20 border border-yellow-500/50 rounded-full">
                          <Crown className="w-3 h-3 text-yellow-400" />
                          <span className="text-xs text-yellow-400 font-medium">
                            Host
                          </span>
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-emerald-400">
                      {index === 0 ? "Criador da sala" : "Pronto para jogar"}
                    </p>
                  </div>

                  <svg
                    className="w-6 h-6 text-emerald-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              ))}

              {/* Slots Vazios */}
              {Array.from({
                length: waitingRoom.maxPlayers - playersInRoom.length,
              }).map((_, i) => (
                <div
                  key={`empty-${i}`}
                  className="flex items-center gap-4 p-4 rounded-lg bg-slate-700/30 border-2 border-slate-600/50 border-dashed"
                >
                  <div className="w-14 h-14 rounded-full bg-slate-700 animate-pulse"></div>
                  <div className="flex-1">
                    <p className="text-slate-500 font-medium">
                      Aguardando jogador...
                    </p>
                    <p className="text-xs text-slate-600">Convite enviado</p>
                  </div>
                  <Clock className="w-5 h-5 text-slate-600 animate-spin" />
                </div>
              ))}
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="flex gap-4">
            <button
              onClick={handleCancelLobby}
              className="flex-1 py-4 px-6 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-semibold transition-colors text-lg"
            >
              Cancelar Partida
            </button>
            <button
              onClick={handleStartMatch}
              disabled={playersInRoom.length < 2}
              className="flex-1 py-4 px-6 bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 disabled:from-slate-600 disabled:to-slate-600 disabled:cursor-not-allowed text-white rounded-xl font-bold transition-all shadow-lg disabled:shadow-none text-lg"
            >
              {playersInRoom.length < 2
                ? "Aguardando Jogadores..."
                : "🎮 Começar Partida"}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default GameLobby;
