import { Lock } from "lucide-react";

interface AgentCardProps {
  name: string;
  image: string;
  isSelected?: boolean;
  isLocked?: boolean;
}

const AgentCard = ({
  name,
  image,
  isSelected = false,
  isLocked = false,
}: AgentCardProps) => {
  return (
    <div
      className={`group relative cursor-pointer overflow-hidden rounded-2xl transition-all duration-300 ${
        isSelected
          ? "ring-2 ring-cyan-400 ring-offset-2 ring-offset-slate-900"
          : "hover:scale-105 hover:shadow-xl hover:shadow-cyan-500/10"
      }`}
    >
      <div className="aspect-[3/4] overflow-hidden bg-gradient-to-b from-slate-700 to-slate-900">
        <img
          src={image}
          alt={name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
      </div>

      <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/20 to-transparent" />

      <div className="absolute bottom-0 left-0 right-0 p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold uppercase tracking-wider text-white">
            {name}
          </h3>
          {isLocked && <Lock className="h-4 w-4 text-amber-400" />}
        </div>
      </div>

      {isSelected && (
        <div className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-cyan-400">
          <svg
            className="h-4 w-4 text-slate-900"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={3}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
      )}
    </div>
  );
};

export default AgentCard;
