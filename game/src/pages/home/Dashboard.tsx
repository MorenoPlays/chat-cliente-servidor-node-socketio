import agent1 from "@/assets/agent-1.png";
import agent2 from "@/assets/agent-2.png";
import agent3 from "@/assets/agent-3.png";
import agent4 from "@/assets/agent-4.png";
import agent5 from "@/assets/agent-5.png";
import AgentCard from "@/components/home/AgentCard";
import AgentMeta from "@/components/home/AgentMeta";
import Header from "@/components/home/Header";
import RightSidebar from "@/components/home/RightSidebar";
import Sidebar from "@/components/home/Sidebar";
import GameInviteNotification from "@/components/home/GameInviteNotification";
import { useLobbySocket } from "@/hooks/useLobbySocket";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const agents = [
  { name: "Kyra", image: agent1 },
  { name: "Blaze", image: agent2 },
  { name: "Titan", image: agent3 },
  { name: "Shadow", image: agent4, isSelected: true, isLocked: true },
  { name: "Recon", image: agent5 },
];
const Index = () => {
  const navigate = useNavigate();
  const { currentUser, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);

  // Verificar autenticação
  useEffect(() => {
    // Dar tempo para o estado atualizar
    const timer = setTimeout(() => {
      setLoading(false);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!loading) {
      const authenticated = isAuthenticated();
      console.log("Is authenticated:", authenticated);
      if (!authenticated) {
        console.log("Não autenticado, redirecionando...");
        navigate("/");
      }
    }
  }, [loading, currentUser, navigate, isAuthenticated]);

  // Se não estiver autenticado, não renderiza nada
  if (loading || !currentUser) {
    console.log("Sem currentUser");
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
        Carregando...
      </div>
    );
  }

  console.log("Current User:", currentUser);

  // Dados do usuário
  const userData = {
    id: currentUser.id,
    name: currentUser.username,
    avatar: currentUser.username.substring(0, 2).toUpperCase(),
    color: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    photo: "https://via.placeholder.com/150",
  };

  return <DashboardContent userData={userData} />;
};

const DashboardContent = ({ userData }: any) => {
  const navigate = useNavigate();

  // Conectar ao socket do lobby
  const { isConnected, pendingInvite, acceptInvite, rejectInvite } =
    useLobbySocket(userData);

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Notificação de convite */}
      <GameInviteNotification
        invite={pendingInvite}
        onAccept={() => acceptInvite(navigate)}
        onReject={rejectInvite}
      />

      <Sidebar />

      {/* Indicador de conexão */}
      <div className="fixed top-4 left-20 z-50">
        <div
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${
            isConnected
              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
              : "bg-red-500/20 text-red-400 border border-red-500/30"
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full ${
              isConnected ? "bg-emerald-500 animate-pulse" : "bg-red-500"
            }`}
          ></span>
          {isConnected ? "Conectado" : "Desconectado"}
        </div>
      </div>

      <main className="ml-16 mr-64">
        <Header />

        <div className="p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-white">Agents</h1>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {agents.map((agent, index) => (
              <AgentCard
                key={index}
                name={agent.name}
                image={agent.image}
                isSelected={agent.isSelected}
                isLocked={agent.isLocked}
              />
            ))}
          </div>

          <AgentMeta />
        </div>
      </main>

      <RightSidebar />
    </div>
  );
};

export default Index;
