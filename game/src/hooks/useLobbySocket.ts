import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import { useOnlineUsers } from "./useOnlineUsers";

const SOCKET_URL = "http://localhost:3001";
let socket = null;
let currentUserId = null;

export const useLobbySocket = (userData) => {
  const { setUsers, addUser, removeUser, updateUserStatus } = useOnlineUsers();
  const [pendingInvite, setPendingInvite] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const isConnecting = useRef(false);

  useEffect(() => {
    // Se não tem userData ou já existe socket para este usuário, não conecta
    if (!userData || (socket && currentUserId === userData?.id)) return;

    // Se existe socket de outro usuário, desconecta primeiro
    if (socket && currentUserId !== userData?.id) {
      socket.disconnect();
      socket = null;
    }

    if (isConnecting.current) return;

    isConnecting.current = true;
    currentUserId = userData?.id;

    // Conectar ao servidor
    socket = io(SOCKET_URL, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      forceNew: true,
    });

    socket.on("connect", () => {
      console.log("Conectado ao servidor lobby");
      setIsConnected(true);
      isConnecting.current = false;

      // Informar servidor que usuário está online
      socket.emit("user-online", userData);
    });

    // Receber lista inicial de usuários
    socket.on("users-list", (users) => {
      console.log("Usuários online:", users);
      setUsers(users);
    });

    // Novo usuário entrou
    socket.on("user-joined", (user) => {
      console.log("Novo usuário:", user);
      addUser(user);
    });

    // Usuário saiu
    socket.on("user-left", (userId) => {
      console.log("Usuário saiu:", userId);
      removeUser(userId);
    });

    // Atualizar status de usuário
    socket.on("user-status-update", ({ id, status }) => {
      console.log(`Status atualizado: ${id} -> ${status}`);
      updateUserStatus(id, status);
    });

    // Receber convite de jogo
    socket.on("game-invite", (invite) => {
      console.log(
        `Convite recebido de ${invite.host} para sala ${invite.roomName}`,
      );
      setPendingInvite(invite);
    });

    // Sala criada com sucesso
    socket.on("game-created", ({ roomId, room }) => {
      console.log("Sala criada:", roomId);
    });

    // Jogador entrou na sala
    socket.on("player-joined-room", ({ player, room }) => {
      console.log(`${player.name} entrou na sala`);
      // Atualizar UI da sala se necessário
    });

    // Jogo iniciando
    socket.on("game-starting", ({ roomId }) => {
      console.log("🎮 Jogo iniciando na sala:", roomId);
      // Guardar roomId antes de navegar
      sessionStorage.setItem("currentRoomId", roomId);
      // Usar navigate do React Router (será feito no componente)
      // NÃO usar window.location.href pois desconecta o socket
      window.dispatchEvent(new CustomEvent("game-starting", { detail: { roomId } }));
    });

    // Sala fechada
    socket.on("room-closed", ({ reason }) => {
      alert(`Sala fechada: ${reason}`);
    });

    // Erros
    socket.on("error", ({ message }) => {
      console.error("Erro:", message);
      alert(message);
    });

    socket.on("disconnect", () => {
      console.log("Desconectado do servidor lobby");
      setIsConnected(false);
    });

    // NÃO desconectar quando componente desmonta
    // A conexão deve persistir entre páginas
    return () => {
      // Apenas limpar listeners, mas manter conexão
      console.log("Componente desmontado, mas mantendo conexão socket");
    };
  }, [userData?.id]); // Reconecta apenas se o ID do usuário mudar

  // Funções para gerenciar convites
  const acceptInvite = (navigate) => {
    if (socket && pendingInvite) {
      console.log("✅ Aceitando convite para sala:", pendingInvite.roomId);
      socket.emit("accept-invite", pendingInvite.roomId);
      setPendingInvite(null);

      // Redirecionar para a sala de espera (sem reload)
      if (navigate) {
        navigate("/lobby");
      }
    }
  };

  const rejectInvite = () => {
    if (socket && pendingInvite) {
      socket.emit("reject-invite", pendingInvite.roomId);
      setPendingInvite(null);
    }
  };

  // Funções para criar jogo
  const createGame = (roomConfig, invitedPlayerIds) => {
    if (socket && socket.connected) {
      socket.emit("create-game", { roomConfig, invitedPlayerIds });
    }
  };

  const startGame = (roomId) => {
    if (socket && socket.connected) {
      socket.emit("start-game", roomId);
    }
  };

  return {
    socket,
    createGame,
    startGame,
    isConnected: socket?.connected || false,
    pendingInvite,
    acceptInvite,
    rejectInvite,
  };
};

// Função helper para obter socket global
export const getLobbySocket = () => socket;

// Hook para usar socket existente sem criar nova conexão
export const useExistingLobbySocket = () => {
  const [pendingInvite, setPendingInvite] = useState(null);
  const [isConnected, setIsConnected] = useState(socket?.connected || false);

  useEffect(() => {
    if (!socket) return;

    const handleConnect = () => {
      console.log("Socket já conectado");
      setIsConnected(true);
    };

    const handleDisconnect = () => {
      console.log("Socket desconectado");
      setIsConnected(false);
    };

    const handleGameInvite = (invite) => {
      console.log(`Convite recebido de ${invite.host}`);
      setPendingInvite(invite);
    };

    if (socket.connected) {
      setIsConnected(true);
    }

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("game-invite", handleGameInvite);

    return () => {
      if (socket) {
        socket.off("connect", handleConnect);
        socket.off("disconnect", handleDisconnect);
        socket.off("game-invite", handleGameInvite);
      }
    };
  }, []);

  const acceptInvite = () => {
    if (socket && pendingInvite) {
      socket.emit("accept-invite", pendingInvite.roomId);
      setPendingInvite(null);
    }
  };

  const rejectInvite = () => {
    if (socket && pendingInvite) {
      socket.emit("reject-invite", pendingInvite.roomId);
      setPendingInvite(null);
    }
  };

  return {
    socket,
    isConnected,
    pendingInvite,
    acceptInvite,
    rejectInvite,
  };
};
