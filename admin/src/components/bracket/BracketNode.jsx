import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const STATUS_STYLES = {
  completed: "border-emerald-500/40 shadow-emerald-500/10",
  live: "border-amber-500/60 shadow-amber-500/20 animate-pulse",
  upcoming: "border-indigo-500/30 shadow-indigo-500/10",
  unscheduled: "border-border/50",
};

function TeamCircle({ team, isWinner, isBye }) {
  const fallbackColor = "#6366f1";
  const bgColor = team?.color || fallbackColor;

  return (
    <div className="flex flex-col items-center gap-1.5 min-w-[70px]">
      <div
        className={cn(
          "relative w-12 h-12 rounded-full border-2 flex items-center justify-center overflow-hidden transition-all duration-300",
          isWinner && "ring-2 ring-emerald-400 ring-offset-2 ring-offset-background scale-110",
          isBye && "opacity-40",
          !team && "border-dashed border-muted-foreground/30"
        )}
        style={{
          borderColor: team ? `${bgColor}80` : undefined,
          background: team
            ? `linear-gradient(135deg, ${bgColor}15, ${bgColor}30)`
            : undefined,
        }}
      >
        {team?.logo ? (
          <img src={team.logo} alt={team.name} className="w-8 h-8 rounded-full object-cover" />
        ) : team ? (
          <span className="text-xs font-bold text-foreground/80">
            {team.shortName || team.name?.slice(0, 2)?.toUpperCase()}
          </span>
        ) : (
          <span className="text-[10px] text-muted-foreground">TBD</span>
        )}
        {isWinner && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center"
          >
            <span className="text-[8px] text-white">✓</span>
          </motion.div>
        )}
      </div>
      <span className={cn(
        "text-[10px] font-medium text-center leading-tight max-w-[80px] truncate",
        isWinner ? "text-emerald-400" : "text-muted-foreground"
      )}>
        {team?.name || "TBD"}
      </span>
    </div>
  );
}

export default function BracketNode({ match, onClickMatch }) {
  if (!match) return null;

  const winnerId = match.result?.winner?._id || match.result?.winner;
  const teamAId = match.teamA?._id || match.teamA;
  const teamBId = match.teamB?._id || match.teamB;
  const isTeamAWinner = winnerId && winnerId.toString() === teamAId?.toString();
  const isTeamBWinner = winnerId && winnerId.toString() === teamBId?.toString();
  const statusKey = match.status || "unscheduled";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.04, zIndex: 10 }}
      transition={{ duration: 0.25 }}
      onClick={() => onClickMatch?.(match)}
      className={cn(
        "relative flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer",
        "bg-card/60 backdrop-blur-md hover:bg-card/80 transition-all duration-300",
        "shadow-lg hover:shadow-xl",
        STATUS_STYLES[statusKey]
      )}
      style={{ minWidth: 200 }}
    >
      {/* Match label */}
      <div className="absolute -top-2.5 left-3 px-2 py-0.5 rounded-full bg-background border border-border text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">
        {match.matchLabel || `M${match.matchNumber}`}
      </div>

      {/* Teams */}
      <TeamCircle team={match.teamA} isWinner={isTeamAWinner} isBye={match.isBye} />

      <div className="flex flex-col items-center gap-0.5">
        <span className="text-[10px] font-bold text-muted-foreground/60 uppercase">vs</span>
        {match.isBye && (
          <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-medium">
            BYE
          </span>
        )}
      </div>

      <TeamCircle team={match.teamB} isWinner={isTeamBWinner} isBye={match.isBye} />

      {/* Status indicator */}
      {statusKey === "live" && (
        <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-red-500 animate-ping" />
      )}
    </motion.div>
  );
}
