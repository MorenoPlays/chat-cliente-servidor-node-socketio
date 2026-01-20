import { create } from "zustand";

interface User {
  id: string;
  name: string;
  status: string;
  avatar: string;
  color: string;
}

interface OnlineUsersStore {
  users: User[];
  setUsers: (users: User[]) => void;
  addUser: (user: User) => void;
  removeUser: (userId: string) => void;
  updateUserStatus: (userId: string, status: string) => void;
}

// Store global para gerenciar usuários online
export const useOnlineUsers = create<OnlineUsersStore>((set) => ({
  users: [],
  setUsers: (users: User[]) => set({ users }),
  addUser: (user: User) =>
    set((state: OnlineUsersStore) => ({ users: [...state.users, user] })),
  removeUser: (userId: string) =>
    set((state: OnlineUsersStore) => ({
      users: state.users.filter((u: User) => u.id !== userId),
    })),
  updateUserStatus: (userId: string, status: string) =>
    set((state: OnlineUsersStore) => ({
      users: state.users.map((u: User) =>
        u.id === userId ? { ...u, status } : u
      ),
    })),
}));
