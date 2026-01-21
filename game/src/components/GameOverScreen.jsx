import { useEffect, useState } from "react";

export const GameOverScreen = ({ winner, currentPlayer, leaveRoom }) => {
  const [countdown, setCountdown] = useState(5);
  const isWinner = winner?.id === currentPlayer?.id;

  useEffect(() => {
    // Sair da sala imediatamente via socket
    if (leaveRoom) {
      leaveRoom();
    }

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          window.location.href = "/dasboard";
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [leaveRoom]);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="text-center space-y-6 p-8 bg-slate-800/90 rounded-2xl border-2 border-slate-600 max-w-md w-full mx-4">
        {isWinner ? (
          <>
            <div className="text-6xl animate-bounce">🏆</div>
            <h1 className="text-5xl font-bold text-yellow-400 animate-pulse">
              VITÓRIA!
            </h1>
            <p className="text-2xl text-white">
              Parabéns, <span className="text-yellow-400">{winner.name}</span>!
            </p>
          </>
        ) : (
          <>
            <div className="text-6xl">💀</div>
            <h1 className="text-5xl font-bold text-red-400">DERROTA</h1>
            <p className="text-2xl text-white">
              <span className="text-yellow-400">{winner.name}</span> venceu!
            </p>
          </>
        )}

        <div className="mt-8 space-y-2">
          <p className="text-slate-300">
            Retornando ao lobby em {countdown}s...
          </p>
          <div className="w-full bg-slate-700 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-1000"
              style={{ width: `${(countdown / 5) * 100}%` }}
            ></div>
          </div>
        </div>

        <button
          onClick={() => (window.location.href = "/home")}
          className="mt-4 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
        >
          Voltar Agora
        </button>
      </div>
    </div>
  );
};
