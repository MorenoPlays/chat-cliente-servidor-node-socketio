import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import Header from "@/components/home/Header";
import Sidebar from "@/components/home/Sidebar";
import RightSidebar from "@/components/home/RightSidebar";
import GameInviteNotification from "@/components/home/GameInviteNotification";
import { useLobbySocket } from "@/hooks/useLobbySocket";
import {
  Bell,
  X,
  Check,
  UserPlus,
  Trophy,
  Gamepad2,
  MessageSquare,
} from "lucide-react";

interface Notification {
  id: string;
  type:
    | "game-invite"
    | "friend-request"
    | "achievement"
    | "message"
    | "game-result";
  title: string;
  message: string;
  from?: string;
  timestamp: string;
  read: boolean;
  data?: any;
}

const Notifications = () => {
  const navigate = useNavigate();
  const { currentUser, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Verificar autenticação
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!loading) {
      const authenticated = isAuthenticated();
      if (!authenticated) {
        navigate("/");
      }
    }
  }, [loading, currentUser, navigate, isAuthenticated]);

  // Notificações vazias em modo single player
  useEffect(() => {
    setNotifications([]);
  }, [currentUser]);

  const markAsRead = (id: string) => {
    const updated = notifications.map((n) =>
      n.id === id ? { ...n, read: true } : n,
    );
    setNotifications(updated);
  };

  const markAllAsRead = () => {
    const updated = notifications.map((n) => ({ ...n, read: true }));
    setNotifications(updated);
  };

  const deleteNotification = (id: string) => {
    const updated = notifications.filter((n) => n.id !== id);
    setNotifications(updated);
  };

  const getNotificationIcon = (type: Notification["type"]) => {
    switch (type) {
      case "game-invite":
        return <Gamepad2 className="w-6 h-6" />;
      case "friend-request":
        return <UserPlus className="w-6 h-6" />;
      case "achievement":
        return <Trophy className="w-6 h-6" />;
      case "message":
        return <MessageSquare className="w-6 h-6" />;
      case "game-result":
        return <Trophy className="w-6 h-6" />;
      default:
        return <Bell className="w-6 h-6" />;
    }
  };

  const getNotificationColor = (type: Notification["type"]) => {
    switch (type) {
      case "game-invite":
        return "from-cyan-500 to-blue-500";
      case "friend-request":
        return "from-emerald-500 to-green-500";
      case "achievement":
        return "from-yellow-500 to-orange-500";
      case "message":
        return "from-purple-500 to-pink-500";
      case "game-result":
        return "from-indigo-500 to-purple-500";
      default:
        return "from-slate-500 to-slate-600";
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Agora mesmo";
    if (minutes < 60) return `${minutes}m atrás`;
    if (hours < 24) return `${hours}h atrás`;
    if (days < 7) return `${days}d atrás`;
    return date.toLocaleDateString("pt-BR");
  };

  if (loading || !currentUser) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
        Carregando...
      </div>
    );
  }

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Dados do usuário para conectar ao socket
  const userData = {
    id: currentUser.id,
    name: currentUser.username,
    avatar: currentUser.username.substring(0, 2).toUpperCase(),
    color: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    photo: "https://via.placeholder.com/150",
  };

  return (
    <NotificationsContent
      userData={userData}
      notifications={notifications}
      unreadCount={unreadCount}
      markAsRead={markAsRead}
      markAllAsRead={markAllAsRead}
      deleteNotification={deleteNotification}
      getNotificationIcon={getNotificationIcon}
      getNotificationColor={getNotificationColor}
      formatTimestamp={formatTimestamp}
    />
  );
};

const NotificationsContent = ({
  userData,
  notifications,
  unreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getNotificationIcon,
  getNotificationColor,
  formatTimestamp,
}: any) => {
  const navigate = useNavigate();

  // Usar socket existente sem criar nova conexão
  const { pendingInvite, acceptInvite, rejectInvite } =
    useLobbySocket(userData);

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Notificação de convite em tempo real */}
      <GameInviteNotification
        invite={pendingInvite}
        onAccept={() => acceptInvite(navigate)}
        onReject={rejectInvite}
      />

      <Sidebar />

      <main className="ml-16 mr-64">
        <Header />

        <div className="p-6">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-emerald-500 flex items-center justify-center">
                  <Bell className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">
                    Notificações
                  </h1>
                  {unreadCount > 0 && (
                    <p className="text-cyan-400 text-sm">
                      {unreadCount} não lida{unreadCount > 1 ? "s" : ""}
                    </p>
                  )}
                </div>
              </div>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-400 rounded-lg transition-colors flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                Marcar todas como lidas
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="space-y-3">
            {notifications.length === 0 ? (
              <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-12 text-center">
                <Bell className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400 text-lg">Nenhuma notificação</p>
                <p className="text-slate-500 text-sm mt-2">
                  Você está em dia com tudo!
                </p>
              </div>
            ) : (
              notifications.map((notification: Notification) => (
                <div
                  key={notification.id}
                  className={`bg-slate-800/50 rounded-2xl border transition-all duration-200 hover:border-cyan-500/30 ${
                    notification.read
                      ? "border-slate-700"
                      : "border-cyan-500/50 shadow-lg shadow-cyan-500/10"
                  }`}
                >
                  <div className="p-4 flex items-start gap-4">
                    {/* Icon */}
                    <div
                      className={`w-12 h-12 rounded-full bg-gradient-to-br ${getNotificationColor(
                        notification.type,
                      )} flex items-center justify-center flex-shrink-0 text-white`}
                    >
                      {getNotificationIcon(notification.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3
                            className={`font-semibold mb-1 ${
                              notification.read
                                ? "text-slate-300"
                                : "text-white"
                            }`}
                          >
                            {notification.title}
                          </h3>
                          <p
                            className={`text-sm mb-2 ${
                              notification.read
                                ? "text-slate-400"
                                : "text-slate-300"
                            }`}
                          >
                            {notification.message}
                          </p>
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-slate-500">
                              {formatTimestamp(notification.timestamp)}
                            </span>
                            {notification.from && (
                              <>
                                <span className="text-slate-600">•</span>
                                <span className="text-xs text-slate-500">
                                  De: {notification.from}
                                </span>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          {!notification.read && (
                            <button
                              onClick={() => markAsRead(notification.id)}
                              className="p-2 hover:bg-slate-700 rounded-lg transition-colors text-cyan-400"
                              title="Marcar como lida"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => deleteNotification(notification.id)}
                            className="p-2 hover:bg-slate-700 rounded-lg transition-colors text-red-400"
                            title="Remover"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Action Buttons for specific types */}
                      {!notification.read &&
                        (notification.type === "game-invite" ||
                          notification.type === "friend-request") && (
                          <div className="flex gap-2 mt-3">
                            <button
                              onClick={() =>
                                deleteNotification(notification.id)
                              }
                              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm font-medium transition-colors"
                            >
                              Recusar
                            </button>
                            <button
                              onClick={() => {
                                markAsRead(notification.id);
                                // Aqui você pode adicionar lógica para aceitar convite
                              }}
                              className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-white rounded-lg text-sm font-semibold transition-all"
                            >
                              Aceitar
                            </button>
                          </div>
                        )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>

      <RightSidebar />
    </div>
  );
};

export default Notifications;
