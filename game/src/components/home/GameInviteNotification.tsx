import { useState, useEffect } from "react";

interface GameInvite {
  roomId: string;
  roomName: string;
  host: string;
  hostId: string;
}

interface GameInviteNotificationProps {
  invite: GameInvite | null;
  onAccept: () => void;
  onReject: () => void;
}

const GameInviteNotification = ({
  invite,
  onAccept,
  onReject,
}: GameInviteNotificationProps) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (invite) {
      setShow(true);
    } else {
      setShow(false);
    }
  }, [invite]);

  if (!show || !invite) return null;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-top duration-300">
      <div className="bg-slate-800 border-2 border-cyan-500/50 rounded-2xl shadow-2xl p-6 min-w-[400px] backdrop-blur-lg">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-emerald-500 flex items-center justify-center">
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5"
              />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-white font-bold text-lg">Convite de Jogo!</h3>
            <p className="text-cyan-400 text-sm">
              {invite.host} te convidou para jogar
            </p>
          </div>
        </div>

        {/* Room Info */}
        <div className="bg-slate-700/50 rounded-lg p-3 mb-4">
          <div className="flex items-center gap-2 text-slate-300">
            <svg
              className="w-5 h-5 text-cyan-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
            <span className="font-medium">{invite.roomName}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={() => {
              onReject();
              setShow(false);
            }}
            className="flex-1 py-2.5 px-4 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors"
          >
            Recusar
          </button>
          <button
            onClick={() => {
              onAccept();
              setShow(false);
            }}
            className="flex-1 py-2.5 px-4 bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-white rounded-lg font-semibold transition-all shadow-lg shadow-cyan-500/25"
          >
            Aceitar
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameInviteNotification;
