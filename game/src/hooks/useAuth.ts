import { useState, useEffect } from "react";

const USERS_KEY = "app_users";
const CURRENT_USER_KEY = "current_user";

interface User {
  id: string;
  username: string;
  password: string;
  createdAt: string;
}

interface UserData {
  id: string;
  username: string;
  createdAt: string;
}

interface AuthResult {
  success: boolean;
  message: string;
  user?: UserData;
}

export const useAuth = () => {
  const [currentUser, setCurrentUser] = useState<UserData | null>(null);
  const [users, setUsers] = useState<User[]>([]);

  // Carregar dados do localStorage ao iniciar
  useEffect(() => {
    const storedUsers = localStorage.getItem(USERS_KEY);
    const storedCurrentUser = localStorage.getItem(CURRENT_USER_KEY);

    if (storedUsers) {
      setUsers(JSON.parse(storedUsers));
    }

    if (storedCurrentUser) {
      setCurrentUser(JSON.parse(storedCurrentUser));
    }
  }, []);

  // Criar nova conta
  const register = (username: string, password: string): AuthResult => {
    // Recarregar usuários do localStorage
    const storedUsers = localStorage.getItem(USERS_KEY);
    const usersList: User[] = storedUsers ? JSON.parse(storedUsers) : [];

    // Verificar se o usuário já existe
    const existingUser = usersList.find((u) => u.username === username);
    if (existingUser) {
      return { success: false, message: "Usuário já existe!" };
    }

    if (username.length < 3) {
      return {
        success: false,
        message: "Username deve ter no mínimo 3 caracteres!",
      };
    }

    if (password.length < 4) {
      return {
        success: false,
        message: "Senha deve ter no mínimo 4 caracteres!",
      };
    }

    // Criar novo usuário
    const newUser: User = {
      id: Date.now().toString(),
      username,
      password, // Em produção, usar hash!
      createdAt: new Date().toISOString(),
    };

    const updatedUsers = [...usersList, newUser];
    setUsers(updatedUsers);
    localStorage.setItem(USERS_KEY, JSON.stringify(updatedUsers));

    console.log("Usuário registrado:", newUser.username);

    return { success: true, message: "Conta criada com sucesso!" };
  };

  // Fazer login
  const login = (username: string, password: string): AuthResult => {
    // Recarregar usuários do localStorage na hora do login
    const storedUsers = localStorage.getItem(USERS_KEY);
    const usersList: User[] = storedUsers ? JSON.parse(storedUsers) : [];

    const user = usersList.find(
      (u) => u.username === username && u.password === password
    );

    if (!user) {
      return { success: false, message: "Usuário ou senha incorretos!" };
    }

    // Guardar usuário atual (sem a senha)
    const userData: UserData = {
      id: user.id,
      username: user.username,
      createdAt: user.createdAt,
    };

    setCurrentUser(userData);
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userData));

    console.log("Login bem-sucedido:", userData);

    return {
      success: true,
      message: "Login realizado com sucesso!",
      user: userData,
    };
  };

  // Fazer logout
  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem(CURRENT_USER_KEY);
  };

  // Verificar se está autenticado
  const isAuthenticated = (): boolean => {
    return currentUser !== null;
  };

  // Obter usuário atual
  const getCurrentUser = (): UserData | null => {
    return currentUser;
  };

  return {
    register,
    login,
    logout,
    isAuthenticated,
    getCurrentUser,
    currentUser,
  };
};