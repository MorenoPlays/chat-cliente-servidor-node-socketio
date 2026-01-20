import { Environment } from "@react-three/drei";
import { useEffect, useState } from "react";
import { Bullet } from "./Bullet";
import { BulletHit } from "./BulletHit";
import { CharacterController } from "./CharacterController";
import { Map as MapComponent } from "./Map";
import { useSocket } from "../hooks/useSocket";

export const Experience = ({ downgradedPerformance = false, playerConfig, onStatsUpdate }) => {
  // O roomId vem do sessionStorage (setado pelo GameLobby antes de navegar)
  const roomId = sessionStorage.getItem("currentRoomId");
  
  const [playerState, setPlayerState] = useState({
    id: "player-122",
    health: 100,
    deaths: 0,
    kills: 0,
    dead: false,
    name: playerConfig?.name || "Player",
    color: playerConfig?.color || "#59bf82",
    avatar: playerConfig?.avatar || "🎮",
  });

  const [bullets, setBullets] = useState([]);
  const [hits, setHits] = useState([]);
  const [remotePlayers, setRemotePlayers] = useState(new Map());

  // Inicializar socket
  const { connected, players, latency, emitMove, emitShoot, emitHit, myId } = 
    useSocket(roomId, playerConfig);

  // Atualizar lista de jogadores remotos
  useEffect(() => {
    if (players) {
      setRemotePlayers(new Map(players));
      
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
  }, [players, latency, playerState.kills, playerState.deaths, playerState.health, connected, onStatsUpdate]);

  // Escutar eventos de tiro e morte
  useEffect(() => {
    const handlePlayerShot = (event) => {
      const bulletData = event.detail;
      console.log("🎯 Jogador remoto atirou:", bulletData);
      // As balas remotas serão criadas aqui se necessário
      // Por enquanto, apenas escutamos para evitar que o jogador remoto dispare
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
        // Esperar pelo respawn
        setTimeout(() => {
          setPlayerState((prev) => ({
            ...prev,
            dead: false,
            health: 100,
          }));
        }, 3000);
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
    window.addEventListener("player-killed", handlePlayerKilled);

    return () => {
      window.removeEventListener("player-shot", handlePlayerShot);
      window.removeEventListener("player-killed", handlePlayerKilled);
    };
  }, [myId]);

  const onFire = (bullet) => {
    setBullets((bullets) => [...bullets, bullet]);
    // Enviar tiro pelo socket
    if (connected && emitShoot) {
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
        if (remotePlayer.id === myId) return null; // Não renderizar a si mesmo
        
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
        />
      ))}
      
      {/* Impactos */}
      {hits.map((hit) => (
        <BulletHit key={hit.id} {...hit} onEnded={() => onHitEnded(hit.id)} />
      ))}
      
      <Environment preset="sunset" />
    </>
  );
};
