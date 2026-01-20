import { Socket } from "socket.io-client";

interface GameInvite {
  roomId: string;
  roomName: string;
  host: string;
  hostId: string;
}

interface UserData {
  name: string;
  avatar: string;
  color: string;
  photo?: string;
}

interface LobbySocketReturn {
  socket: Socket | null;
  createGame: (
    roomConfig: { roomName: string; maxPlayers: number },
    invitedPlayerIds: string[]
  ) => void;
  startGame: (roomId: string) => void;
  isConnected: boolean;
  pendingInvite: GameInvite | null;
  acceptInvite: (navigate?: any) => void;
  rejectInvite: () => void;
}

export function useLobbySocket(userData: UserData): LobbySocketReturn;
export function getLobbySocket(): Socket | null;
