import { useNavigate } from "react-router-dom";
import { useState } from "react";

export const Leaderboard = ({ PlayerConfig }) => {
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Dados do jogador em single player
 // console.log("🎮 PlayerConfig recebida:", PlayerConfig);
  const playerData = {
    name: PlayerConfig?.username || "Player2222",
    color: PlayerConfig?.color || "#59bf82",
    avatar: PlayerConfig?.avatar || "🎮",
    kills: 0,
    deaths: 0,
  };

  const handleExitGame = () => {
    // Limpar pointer lock se estiver ativo
    if (document.pointerLockElement) {
      document.exitPointerLock();
    }
    // Sair de fullscreen se estiver ativo
    if (document.fullscreenElement) {
      document.exitFullscreen();
    }
    window.location.href = "/dashboard";
  };

  const toggleSound = () => {
    setSoundEnabled(!soundEnabled);
    // Implementar lógica de som aqui
  };

  const toggleFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      document.documentElement.requestFullscreen();
    }
  };

  return (
    <>
      <div className="fixed top-0 left-0 right-0 p-4 flex z-10 gap-4">
        {/* Informações do jogador single player */}
        <div className="bg-white bg-opacity-60 backdrop-blur-sm flex items-center rounded-lg gap-2 p-2 min-w-[140px]">
          <div
            className="w-10 h-10 border-2 rounded-full flex items-center justify-center font-bold text-white"
            style={{
              borderColor: playerData.color,
              background: playerData.color,
            }}
          >
            {playerData.avatar}
          </div>
          <div className="flex-grow">
            <h2 className="font-bold text-sm">{playerData.name}</h2>
            <div className="flex text-sm items-center gap-4">
              <p>Pts: {playerData.kills}</p>
              <p>Morte: {playerData.deaths}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Botão Menu */}
      <button
        className="fixed top-4 right-4 z-20 bg-slate-800/80 hover:bg-slate-700 text-white p-3 rounded-lg backdrop-blur-sm transition-colors"
        onClick={() => setShowMenu(!showMenu)}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className="w-6 h-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
          />
        </svg>
      </button>

      {/* Modal Menu */}
      {showMenu && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30"
            onClick={() => setShowMenu(false)}
          />

          {/* Menu Card */}
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-40 bg-slate-800 rounded-2xl shadow-2xl p-6 min-w-[320px]">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Menu</h2>
              <button
                onClick={() => setShowMenu(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="space-y-3">
              {/* Opção Som */}
              <button
                onClick={toggleSound}
                className="w-full flex items-center justify-between p-4 bg-slate-700/50 hover:bg-slate-700 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-6 h-6 text-white"
                  >
                    {soundEnabled ? (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z"
                      />
                    ) : (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M17.25 9.75L19.5 12m0 0l2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-6l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z"
                      />
                    )}
                  </svg>
                  <span className="text-white font-semibold">Som</span>
                </div>
                <span
                  className={`text-sm font-medium ${
                    soundEnabled ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {soundEnabled ? "Ligado" : "Desligado"}
                </span>
              </button>

              {/* Opção Tela Cheia */}
              <button
                onClick={toggleFullscreen}
                className="w-full flex items-center justify-between p-4 bg-slate-700/50 hover:bg-slate-700 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-6 h-6 text-white"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15"
                    />
                  </svg>
                  <span className="text-white font-semibold">Tela Cheia</span>
                </div>
              </button>

              {/* Opção Sair */}
              <button
                onClick={handleExitGame}
                className="w-full flex items-center justify-between p-4 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-6 h-6 text-red-400"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"
                    />
                  </svg>
                  <span className="text-red-400 font-semibold">
                    Sair do Jogo
                  </span>
                </div>
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
};
