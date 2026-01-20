import { useEffect, useRef, useState } from "react";
import { getLobbySocket } from "./useLobbySocket";

export const useSocket = (roomId, playerData) => {
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const [players, setPlayers] = useState(new Map());
  const [latency, setLatency] = useState(0);

  useEffect(() => {
    if (!roomId || !playerData) {
      console.warn("⚠️ useSocket: roomId ou playerData inválidos", { roomId, playerData });
      return;
    }

    // Usar socket existente do lobby em vez de criar novo
    const lobbySocket = getLobbySocket();
    
    if (!lobbySocket) {
      console.warn("⚠️ Socket do lobby não existe ainda");
      return;
    }

    if (!lobbySocket.connected) {
      console.log("⏳ Aguardando conexão do lobby...", { connected: lobbySocket.connected });
      const timeout = setTimeout(() => {}, 500);
      return () => clearTimeout(timeout);
    }

    socketRef.current = lobbySocket;
    console.log("✅ Socket do lobby reutilizado para jogo", {
      roomId,
      socketId: socketRef.current.id,
      connected: socketRef.current.connected
    });
    setConnected(true);

    // Limpar listeners antigos para evitar duplicatas
    socketRef.current.off("update-positions");
    socketRef.current.off("player-joined");
    socketRef.current.off("player-shot");
    socketRef.current.off("player-killed");
    socketRef.current.off("player-health-update");
    socketRef.current.off("player-respawn");
    socketRef.current.off("player-left");

    // Atualização de posições (20 FPS)
    socketRef.current.on("update-positions", (playersData) => {
      console.log("📊 Update-positions recebido:", playersData);
      setPlayers((prev) => {
        const newPlayers = new Map(prev);
        playersData.forEach((pd) => {
          if (pd.id !== socketRef.current?.id) {
            console.log(`  → Atualizando jogador remoto: ${pd.id} (${pd.name})`);
            const existing = newPlayers.get(pd.id);
            if (existing) {
              Object.assign(existing, pd);
            } else {
              newPlayers.set(pd.id, pd);
            }
          }
        });
        return newPlayers;
      });
    });

    // Novo jogador entrou
    socketRef.current.on("player-joined", (player) => {
      console.log("🎮 Novo jogador:", player.name);
      setPlayers((prev) => {
        const newPlayers = new Map(prev);
        newPlayers.set(player.id, { ...player });
        return newPlayers;
      });
    });

    // Novo jogador atirou
    socketRef.current.on("player-shot", (bulletData) => {
      console.log(`💥 ${bulletData.playerName} atirou`);
      window.dispatchEvent(
        new CustomEvent("player-shot", { detail: bulletData })
      );
    });

    // Jogador foi morto
    socketRef.current.on("player-killed", ({ victimId, killerId, victimName, killerName }) => {
      console.log(`💀 ${victimName} foi morto por ${killerName}`);
      window.dispatchEvent(
        new CustomEvent("player-killed", {
          detail: { victimId, killerId, victimName, killerName },
        })
      );
    });

    // Atualização de vida
    socketRef.current.on("player-health-update", ({ id, health }) => {
      console.log(`❤️ ${id} vida: ${health}`);
      setPlayers((prev) => {
        const newPlayers = new Map(prev);
        const player = newPlayers.get(id);
        if (player) {
          player.health = health;
        }
        return newPlayers;
      });
    });

    // Jogador respawn
    socketRef.current.on("player-respawn", ({ id, position, health }) => {
      console.log(`🔄 Jogador ${id} respawnado`);
      setPlayers((prev) => {
        const newPlayers = new Map(prev);
        const player = newPlayers.get(id);
        if (player) {
          player.health = health;
          player.position = position;
          player.isAlive = true;
        }
        return newPlayers;
      });
    });

    // Jogador saiu
    socketRef.current.on("player-left", (playerId) => {
      console.log("👋 Jogador saiu:", playerId);
      setPlayers((prev) => {
        const newPlayers = new Map(prev);
        newPlayers.delete(playerId);
        return newPlayers;
      });
    });

    return () => {
      // Não desconectar pois é socket compartilhado
      // Apenas remover listeners
      if (socketRef.current) {
        socketRef.current.off("update-positions");
        socketRef.current.off("player-joined");
        socketRef.current.off("player-shot");
        socketRef.current.off("player-killed");
        socketRef.current.off("player-health-update");
        socketRef.current.off("player-respawn");
        socketRef.current.off("player-left");
      }
    };
  }, [roomId, playerData]);

  // Medir latência periodicamente
  useEffect(() => {
    if (!socketRef.current || !socketRef.current.connected) return;

    const pingInterval = setInterval(() => {
      const start = Date.now();
      socketRef.current.emit("ping-check");
      socketRef.current.once("pong-check", () => {
        const lat = Date.now() - start;
        setLatency(lat);
        console.log(`🔌 Latência: ${lat}ms`);
      });
    }, 5000);

    return () => clearInterval(pingInterval);
  }, []);

  // Funções helper para emitir eventos
  const emitMove = (data) => {
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit("player-move", { roomId, ...data });
    }
  };

  const emitShoot = (bulletData) => {
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit("player-shot", { roomId, ...bulletData });
    }
  };

  const emitHit = (targetId, damage) => {
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit("player-hit", {
        roomId,
        targetId,
        damage,
        shooterId: socketRef.current.id,
      });
    }
  };

  return {
    socket: socketRef.current,
    connected,
    players,
    latency,
    emitMove,
    emitShoot,
    emitHit,
    myId: socketRef.current?.id,
  };
};
