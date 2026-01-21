import { useEffect, useState } from "react";
import { Bullet } from "./Bullet";
import { BulletHit } from "./BulletHit";
import { CharacterController } from "./CharacterController";
import { Map as MapComponent } from "./Map";
import { useSocket } from "../hooks/useSocket";

export const Experience = ({ downgradedPerformance = false, playerConfig, onStatsUpdate, onGameOver }) => {
  // O roomId vem do sessionStorage (setado pelo GameLobby antes de navegar)
  const roomId = sessionStorage.getItem("currentRoomId");
  const [bullets, setBullets] = useState([]);
  const [hits, setHits] = useState([]);
  const [remotePlayers, setRemotePlayers] = useState(new Map());

  // 🔥 FIX: Ler playerConfig direto da sessionStorage em vez de depender da prop!
  // Porque a prop pode chegar vazia se Game.tsx executar antes de GameLobby guardar
  const [localPlayerConfig, setLocalPlayerConfig] = useState(null);
  
  useEffect(() => {
    const savedConfig = sessionStorage.getItem("gamePlayerConfig") || localStorage.getItem("current_user");
    let config = playerConfig; // Fallback para a prop
    
    if (savedConfig) {
      try {
        config = JSON.parse(savedConfig);
        console.log("✅ PlayerConfig carregado da sessionStorage:", config);
      } catch (e) {
        console.warn("⚠️ Erro ao parsear playerConfig:", e);
      }
    } else if (playerConfig) {
      console.log("✅ PlayerConfig carregado da prop:", playerConfig);
    } else {
      console.warn("⚠️ PlayerConfig não encontrado em sessionStorage nem prop!");
    }
    
    setLocalPlayerConfig(config || {
      name: "Player",
      color: "#59bf82",
      avatar: "🎮",
    });
  }, [playerConfig]); // Re-executar se a prop mudar

  // Inicializar socket
  const { connected, players, latency, emitMove, emitShoot, emitHit, leaveRoom, myId } = 
    useSocket(roomId, localPlayerConfig);

  // O estado do jogador usa o ID real do socket!
  const [playerState, setPlayerState] = useState({
    id: null, // Será atualizado quando socket conectar
    health: 100,
    deaths: 0,
    kills: 0,
    dead: false,
    name: localPlayerConfig?.name || "Player",
    color: localPlayerConfig?.color || "#59bf82",
    avatar: localPlayerConfig?.avatar || "🎮",
  });

  // Atualizar playerState quando localPlayerConfig mudar
  useEffect(() => {
    if (localPlayerConfig) {
      setPlayerState((prev) => ({
        ...prev,
        name: localPlayerConfig.name || "Player",
        color: localPlayerConfig.color || "#59bf82",
        avatar: localPlayerConfig.avatar || "🎮",
      }));
    }
  }, [localPlayerConfig]);

  // Atualizar ID quando socket conectar
  useEffect(() => {
    if (myId && playerState.id !== myId) {
      console.log("🔐 ID do jogador local definido:", {
        myId,
        playerName: localPlayerConfig?.name,
        playerState_id_anterior: playerState.id,
      });
      setPlayerState((prev) => ({ ...prev, id: myId }));
    }
  }, [myId, localPlayerConfig]);

  // Atualizar lista de jogadores remotos
  useEffect(() => {
    if (players && myId) {
      
      
      // ✅ IMPORTANTE: Atualizar playerState local com dados do servidor
      const myPlayerData = players.get(myId);
      if (myPlayerData) {
        console.log("📍 Atualizando playerState local com dados do servidor:", {
          id: myId,
          health: myPlayerData.health,
          position: myPlayerData.position
        });
        
        setPlayerState((prev) => ({
          ...prev,
          health: myPlayerData.health ?? prev.health,
          kills: myPlayerData.kills ?? prev.kills,
          deaths: myPlayerData.deaths ?? prev.deaths,
          dead: !myPlayerData.isAlive,
          // Nome e cores vêm do playerConfig, não do servidor
        }));
      }
      
      // 🔥 FILTRO IMPORTANTE: Não incluir o próprio jogador na lista de remotos
      const filteredPlayers = new Map(players);
      filteredPlayers.delete(myId);
      
      // 🏆 VERIFICAR VITÓRIA: Se há apenas 1 jogador restante (eu), eu sou o vencedor
      if (filteredPlayers.size === 0 && playerState.dead === false) {
        console.log("🏆 VOCÊ É O VENCEDOR! Último jogador vivo");
        if (onGameOver) {
          onGameOver(
            { id: myId, name: playerState.name },
            { id: myId, name: playerState.name }
          );
        }
      }
      
      setRemotePlayers(filteredPlayers);
      
      // Atualizar stats do jogo
      if (onStatsUpdate) {
        onStatsUpdate({
          players: (players?.size || 0) + 1,
          latency,
          kills: playerState.kills,
          deaths: playerState.deaths,
          health: playerState.health,
          connected,
        });
      }
    }
  }, [players, latency, playerState.kills, playerState.deaths, playerState.health, connected, onStatsUpdate, myId]);

  // Escutar eventos de tiro e morte
  useEffect(() => {
    const handlePlayerShot = (event) => {
      const bulletData = event.detail;
      console.log("🎯 Jogador remoto atirou:", {
        shooterId: bulletData.playerId,
        myId,
        isMe: bulletData.playerId === myId,
        bulletId: bulletData.id
      });
      
      // ⚠️ IMPORTANTE: Ignorar tiros do jogador local
      // O jogador local já renderiza seus tiros via onFire callback
      // Isto evita duplicação e garante que cada player vê só os tiros dos OUTROS
      if (bulletData.playerId === myId) {
        console.log("❌ Ignorando - é meu próprio tiro (já renderizado localmente)");
        return;
      }
      
      // Tiro de um jogador remoto - poderia renderizar aqui se necessário
      // Por enquanto, apenas escutamos para log
    };

    const handleBulletHitConfirmed = (event) => {
      const { bulletId, shooterId, targetId, targetName, position, damage } = event.detail;
      
      console.log("🎯 HIT CONFIRMADO NO SERVIDOR:", {
        bulletId,
        shooter: shooterId,
        target: targetName,
        targetId,
        position,
        damage,
      });
      
      // Remover a bala do estado
      setBullets((bullets) => bullets.filter((bullet) => bullet.id !== bulletId));
      
      // Adicionar efeito de impacto
      setHits((hits) => [...hits, { id: bulletId, position }]);
      
      // Se o hit foi no jogador local, aplicar dano
      if (targetId === myId && connected && emitHit) {
        console.log("💥 Você foi atingido! Dano:", damage);
        // Calcular nova vida
        const newHealth = Math.max(0, playerState.health - damage);
        setPlayerState((prev) => ({
          ...prev,
          health: newHealth,
        }));
        // Emitir hit para o servidor
        emitHit(targetId, damage, playerState.name, playerState.health);
      }
    };

    const handlePlayerKilled = (event) => {
      const { victimId, killerId, victimName, killerName } = event.detail;
      console.log(`💀 ${victimName} foi morto por ${killerName}`);
      
      // Se o jogador local foi morto
      if (victimId === myId) {
        setPlayerState((prev) => ({
          ...prev,
          deaths: prev.deaths + 1,
          dead: true,
        }));
        
        // Chamar callback para mostrar GameOverScreen (fora da árvore R3F)
        if (onGameOver) {
          onGameOver(
            { id: killerId, name: killerName },
            { id: myId, name: playerState.name }
          );
        }
      } else {
        // Se foi outra morte, apenas registrar
        console.log(`Morte: ${victimName} por ${killerName}`);
      }
      
      // Se o jogador local foi quem matou, incrementar kills
      if (killerId === myId) {
        setPlayerState((prev) => ({
          ...prev,
          kills: prev.kills + 1,
        }));
      }
    };

    window.addEventListener("player-shot", handlePlayerShot);
    window.addEventListener("bullet-hit-confirmed", handleBulletHitConfirmed);
    window.addEventListener("player-killed", handlePlayerKilled);

    return () => {
      window.removeEventListener("player-shot", handlePlayerShot);
      window.removeEventListener("bullet-hit-confirmed", handleBulletHitConfirmed);
      window.removeEventListener("player-killed", handlePlayerKilled);
    };
  }, [myId, connected, emitHit]);

  const onFire = (bullet) => {
    console.log("🔥 onFire chamado:", {
      bulletId: bullet.id,
      bulletPlayer: bullet.player,
      myId,
      isLocalPlayer: bullet.player === myId,
      position: bullet.position,
    });
    
    setBullets((bullets) => [...bullets, bullet]);
    // Enviar tiro pelo socket
    if (connected && emitShoot) {
      console.log("📡 Enviando tiro pro socket:", {
        bulletId: bullet.id,
        myId,
      });
      emitShoot({
        id: bullet.id,
        position: bullet.position,
        direction: bullet.direction,
      });
    }
  };

  const onHit = (bulletId, position) => {
    setBullets((bullets) => bullets.filter((bullet) => bullet.id !== bulletId));
    setHits((hits) => [...hits, { id: bulletId, position }]);
  };

  const onHitEnded = (hitId) => {
    setHits((hits) => hits.filter((h) => h.id !== hitId));
  };

  const onKilled = (_victim, _killer) => {
    // Será tratado pelo evento player-killed do socket
  };

  // Simular objeto state do playroomkit
  const stateWrapper = {
    id: playerState.id,
    state: playerState,
    setState: (key, value) => {
      setPlayerState((prev) => ({ ...prev, [key]: value }));
    },
    getState: (key) => playerState[key],
  };

  // 🔍 DEBUG: Verificar qual playerState está sendo usado
  

  if (!roomId) {
    return (
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        color: '#fff',
        fontSize: '20px',
        background: 'rgba(0,0,0,0.8)',
        padding: '20px',
        borderRadius: '10px',
        zIndex: 1000,
      }}>
        ❌ Erro: Room ID não encontrado. Volte para o lobby.
      </div>
    );
  }

  return (
    <>
      <MapComponent />
      {/* Jogador local */}
      <CharacterController
        state={stateWrapper}
        userPlayer={true}
        joystick={null}
        onKilled={onKilled}
        onFire={onFire}
        downgradedPerformance={downgradedPerformance}
        socket={{
          emitMove,
          emitHit,
          connected,
          myId,
        }}
      />
      
      {/* Jogadores remotos */}
      {Array.from(remotePlayers.values()).map((remotePlayer) => {
        
        return (
          <CharacterController
            key={remotePlayer.id}
            state={{
              id: remotePlayer.id,
              state: {
                ...remotePlayer,
              },
              setState: () => {}, // Remote players são read-only
              getState: (key) => remotePlayer[key],
            }}
            userPlayer={false}
            joystick={null}
            onKilled={onKilled}
            onFire={() => {}}
            downgradedPerformance={downgradedPerformance}
            remotePlayer={remotePlayer}
          />
        );
      })}

      {/* Balas do jogador local */}
      {bullets.map((bullet) => (
        <Bullet
          key={bullet.id}
          {...bullet}
          onHit={(position) => onHit(bullet.id, position)}
          emitBulletPosition={(bulletData) => {
            if (connected && emitShoot) {
              emitShoot({
                type: "bullet-position",
                roomId: roomId,
                ...bulletData,
              });
            }
          }}
        />
      ))}
      
      {/* Impactos */}
      {hits.map((hit) => (
        <BulletHit key={hit.id} {...hit} onEnded={() => onHitEnded(hit.id)} />
      ))}
    </>
  );
};
