import { Loader, PerformanceMonitor, SoftShadows } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import { Physics } from "@react-three/rapier";
import { Suspense, useState, useEffect, useRef } from "react";
import { Experience } from "../components/Experience";
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
  const socket = getLobbySocket();
  const gameStatsRef = useRef(gameStats);

  useEffect(() => {
    console.log("socket: ", socket);
    
    // Obter playerConfig do localStorage ou usar padrão
    const savedConfig = localStorage.getItem("playerConfig");
    let playerCfg;
    
    if (savedConfig) {
      playerCfg = JSON.parse(savedConfig);
    } else {
      playerCfg = {
        name: "Player",
        color: "#59bf82",
        avatar: "🎮",
      };
    }
    
    setPlayerConfig(playerCfg);
    console.log("Jogador configurado:", playerCfg);
  }, [socket]);

  return (
    <>
      <Loader />
      <Leaderboard />
      
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
