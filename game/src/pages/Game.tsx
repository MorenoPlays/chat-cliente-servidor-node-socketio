import { Loader, PerformanceMonitor, SoftShadows } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import { Physics } from "@react-three/rapier";
import { Suspense, useState, useEffect } from "react";
import { Experience } from "../components/Experience";
import { GameOverScreen } from "../components/GameOverScreen";
import { Leaderboard } from "../components/Leaderboard";
import { getLobbySocket } from "@/hooks/useLobbySocket";


function Game() {
  const [downgradedPerformance, setDowngradedPerformance] = useState(false);
  const [playerConfig, setPlayerConfig] = useState<{
    name: string;
    color: string;
    avatar: string;
  } | null>(null);
  const [gameStats, setGameStats] = useState({ 
    players: 1, 
    latency: 0, 
    kills: 0, 
    deaths: 0, 
    health: 100,
    connected: false 
  });
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState<{ id: string; name: string } | null>(null);
  const [currentPlayer, setCurrentPlayer] = useState<{ id: string; name: string } | null>(null);
  const socket = getLobbySocket();

  useEffect(() => {
    //console.log("socket: ", socket);
    
    // ✅ CORRIGIDO: Obter playerConfig de sessionStorage (por aba) em vez de localStorage
    const savedConfig = sessionStorage.getItem("gamePlayerConfig") || localStorage.getItem("current_user");
    let playerCfg;
    
    if (savedConfig) {
      try {
        playerCfg = JSON.parse(savedConfig);
      } catch {
        playerCfg = {
          name: "Player",
          color: "#59bf82",
          avatar: "🎮",
        };
      }
    } else {
      playerCfg = {
        name: "Player",
        color: "#59bf82",
        avatar: "🎮",
      };
    }
    
    setPlayerConfig(playerCfg);
    //console.log("✅ Jogador configurado:", playerCfg);
  }, [socket]);

  return (
    <>
      {/* GameOverScreen fora da árvore R3F */}
      {gameOver && winner && currentPlayer && (
        <GameOverScreen 
          winner={winner} 
          currentPlayer={currentPlayer} 
          leaveRoom={() => {
            // Reset game state
            setGameOver(false);
            setWinner(null);
            setCurrentPlayer(null);
          }}
        />
      )}

      <Loader />
      <Leaderboard PlayerConfig={playerConfig} />
      
      {/* Debug info overlay */}
      {gameStats.connected && (
        <div style={{
          position: 'fixed',
          top: '10px',
          right: '10px',
          background: 'rgba(0,0,0,0.7)',
          color: '#0f0',
          padding: '10px',
          fontSize: '12px',
          fontFamily: 'monospace',
          zIndex: 999,
          borderRadius: '4px',
          border: '1px solid #0f0',
        }}>
          <div>Players: {gameStats.players}</div>
          <div>Ping: {gameStats.latency}ms</div>
          <div>Kills: {gameStats.kills}</div>
          <div>Deaths: {gameStats.deaths}</div>
          <div>Health: {gameStats.health}/100</div>
        </div>
      )}
      
      <Canvas
        shadows
        camera={{ position: [0, 30, 0], fov: 30, near: 2 }}
        dpr={[1, 1.5]}
      >
        <color attach="background" args={["#242424"]} />
        <SoftShadows size={42} />

        <PerformanceMonitor
          onDecline={() => {
            setDowngradedPerformance(true);
          }}
        />
        <Suspense>
          <Physics>
            <Experience
              downgradedPerformance={downgradedPerformance}
              playerConfig={playerConfig}
              onStatsUpdate={setGameStats}
              onGameOver={(winner: any, currentPlayer: any) => {
                setWinner(winner);
                setCurrentPlayer(currentPlayer);
                setGameOver(true);
              }}
            />
          </Physics>
        </Suspense>
        {!downgradedPerformance && (
          <EffectComposer disableNormalPass>
            <Bloom luminanceThreshold={1} intensity={1.5} mipmapBlur />
          </EffectComposer>
        )}
      </Canvas>
    </>
  );
}

export default Game;
