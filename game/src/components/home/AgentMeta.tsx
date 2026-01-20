import agent1 from "@/assets/agent-1.png";
import agent2 from "@/assets/agent-2.png";
import agent4 from "@/assets/agent-4.png";
import agent5 from "@/assets/agent-5.png";
import { useNavigate } from "react-router-dom";

interface MetaAgent {
  name: string;
  role: string;
  pickRate: string;
  image: string;
  color: string;
}

const metaAgents: MetaAgent[] = [
  {
    name: "Kyra",
    role: "Sentinela",
    pickRate: "20.1%",
    image: agent1,
    color: "from-cyan-500/20 to-cyan-600/10",
  },
  {
    name: "Blaze",
    role: "Duelista",
    pickRate: "17.6%",
    image: agent2,
    color: "from-orange-500/20 to-orange-600/10",
  },
  {
    name: "Shadow",
    role: "Controladora",
    pickRate: "15.2%",
    image: agent4,
    color: "from-purple-500/20 to-purple-600/10",
  },
  {
    name: "Recon",
    role: "Iniciadora",
    pickRate: "13.5%",
    image: agent5,
    color: "from-green-500/20 to-green-600/10",
  },
];

const AgentMeta = () => {
  const navigate = useNavigate();

  const handleStartGame = () => {
    // Iniciar diretamente em modo single player
    navigate("/game");
  };

  return (
    <section className="mt-8">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl bg-slate-800/50 p-6 backdrop-blur-sm">
          <h2 className="mb-2 text-xl font-bold text-white">Agent Meta</h2>
          <p className="mb-4 text-sm text-slate-400">
            Comece sua jornada dominando os agentes mais populares do momento.
          </p>
          <button
            onClick={handleStartGame}
            className="rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 px-4 py-2 text-sm font-semibold text-white transition-all hover:from-indigo-400 hover:to-purple-400 hover:shadow-lg hover:shadow-purple-500/25"
          >
            Jogar Single Player
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {metaAgents.map((agent, index) => (
            <div
              key={index}
              className={`flex items-center gap-3 rounded-xl bg-gradient-to-r ${agent.color} border border-slate-700/50 p-3 backdrop-blur-sm transition-all duration-200 hover:border-slate-600`}
            >
              <img
                src={agent.image}
                alt={agent.name}
                className="h-12 w-12 rounded-lg object-cover"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-white">{agent.name}</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-slate-400">
                  <span>⚡</span>
                  <span>{agent.role}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-slate-500">Rank</div>
                <div className="text-lg font-bold text-white">
                  {agent.pickRate}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AgentMeta;
