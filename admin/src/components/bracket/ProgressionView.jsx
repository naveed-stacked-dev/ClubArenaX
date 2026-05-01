import { useMemo } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const STATUS_CONFIG = {
  completed: { icon: "✔", color: "emerald", wire: "solid", glow: true },
  live: { icon: "🔄", color: "amber", wire: "flow", glow: true },
  upcoming: { icon: "⏳", color: "indigo", wire: "dashed", glow: false },
  unscheduled: { icon: "—", color: "gray", wire: "dashed", glow: false },
};

function ProgressionTeamNode({ team, status, isEliminated }) {
  const fallback = "#6366f1";
  const bg = team?.color || fallback;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        "flex flex-col items-center gap-1",
        isEliminated && "opacity-30 grayscale"
      )}
    >
      <div
        className={cn(
          "w-14 h-14 rounded-full border-2 flex items-center justify-center overflow-hidden transition-all duration-500",
          status === "completed" && !isEliminated && "ring-2 ring-emerald-400/50 ring-offset-1 ring-offset-background",
          status === "live" && "ring-2 ring-amber-400/60 ring-offset-1 ring-offset-background animate-pulse"
        )}
        style={{
          borderColor: `${bg}60`,
          background: `linear-gradient(135deg, ${bg}10, ${bg}25)`,
        }}
      >
        {team?.logo ? (
          <img src={team.logo} alt={team.name} className="w-10 h-10 rounded-full object-cover" />
        ) : team ? (
          <span className="text-sm font-bold text-foreground/70">
            {team.shortName || team.name?.slice(0, 2)?.toUpperCase()}
          </span>
        ) : (
          <span className="text-xs text-muted-foreground/40">?</span>
        )}
      </div>
      <span className={cn(
        "text-[10px] font-medium text-center max-w-[70px] truncate",
        isEliminated ? "text-muted-foreground/40 line-through" : "text-muted-foreground"
      )}>
        {team?.name || "TBD"}
      </span>
    </motion.div>
  );
}

function WireConnection({ status, isByeWire }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.unscheduled;
  return (
    <div className="flex items-center mx-1" style={{ width: 50, height: 2 }}>
      <svg width="50" height="6" className="overflow-visible">
        {cfg.wire === "flow" ? (
          <>
            <line x1="0" y1="3" x2="50" y2="3" stroke="oklch(0.8 0.15 85)" strokeWidth="2" strokeDasharray="6 4">
              <animate attributeName="stroke-dashoffset" from="0" to="-20" dur="0.8s" repeatCount="indefinite" />
            </line>
          </>
        ) : cfg.wire === "solid" ? (
          <motion.line
            x1="0" y1="3" x2="50" y2="3"
            stroke={isByeWire ? "oklch(0.6 0.1 85)" : "oklch(0.7 0.17 160)"}
            strokeWidth="2.5"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.5 }}
          />
        ) : (
          <line x1="0" y1="3" x2="50" y2="3" stroke="oklch(0.4 0 0)" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.3" />
        )}
      </svg>
    </div>
  );
}

function MatchFlowCard({ match }) {
  const winnerId = match.result?.winner?._id || match.result?.winner;
  const teamAId = match.teamA?._id || match.teamA;
  const teamBId = match.teamB?._id || match.teamB;
  const isAWinner = winnerId && String(winnerId) === String(teamAId);
  const isBWinner = winnerId && String(winnerId) === String(teamBId);
  const cfg = STATUS_CONFIG[match.status] || STATUS_CONFIG.unscheduled;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "relative flex items-center gap-2 px-3 py-2.5 rounded-xl border",
        "bg-card/40 backdrop-blur-sm",
        cfg.glow && `shadow-${cfg.color}-500/10 shadow-lg`
      )}
      style={{
        borderColor: `var(--color-${cfg.color === "gray" ? "border" : cfg.color + "-500"}, oklch(0.5 0 0 / 0.2))`,
      }}
    >
      {/* Status badge */}
      <div className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-background border border-border">
        <span className="text-[9px] font-medium text-muted-foreground">
          {match.matchLabel || `M${match.matchNumber}`} {cfg.icon}
        </span>
      </div>

      <ProgressionTeamNode
        team={match.teamA}
        status={match.status}
        isEliminated={isBWinner}
      />

      <WireConnection status={match.status} isByeWire={match.isBye} />

      <ProgressionTeamNode
        team={match.teamB}
        status={match.status}
        isEliminated={isAWinner}
      />
    </motion.div>
  );
}

export default function ProgressionView({ matches, totalRounds }) {
  const roundsData = useMemo(() => {
    const rounds = {};
    for (let r = 1; r <= totalRounds; r++) {
      rounds[r] = (matches || [])
        .filter((m) => m.round === r)
        .sort((a, b) => (a.matchOrder ?? 0) - (b.matchOrder ?? 0));
    }
    return rounds;
  }, [matches, totalRounds]);

  function getRoundLabel(round) {
    const fromFinal = totalRounds - round + 1;
    switch (fromFinal) {
      case 1: return "🏆 Final";
      case 2: return "Semifinals";
      case 3: return "Quarterfinals";
      default: return `Round ${round}`;
    }
  }

  return (
    <div className="w-full overflow-x-auto overflow-y-auto pb-4">
      <div className="flex items-start gap-0 px-4 py-6" style={{ minWidth: totalRounds * 260 }}>
        {Array.from({ length: totalRounds }, (_, i) => i + 1).map((round, ri) => {
          const roundMatches = roundsData[round] || [];
          return (
            <div key={round} className="flex items-center">
              <div className="flex flex-col items-center shrink-0" style={{ minWidth: 200 }}>
                {/* Round label */}
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: ri * 0.1 }}
                  className="mb-5 px-3 py-1 rounded-full border border-purple-500/20 bg-gradient-to-r from-purple-500/10 to-pink-500/10"
                >
                  <span className="text-[11px] font-semibold text-purple-400 uppercase tracking-wider">
                    {getRoundLabel(round)}
                  </span>
                </motion.div>

                {/* Match flow cards */}
                <div
                  className="flex flex-col justify-around flex-1"
                  style={{ gap: 24 + (round - 1) * 30, minHeight: roundMatches.length * 90 }}
                >
                  {roundMatches.map((match, mi) => (
                    <motion.div
                      key={match._id || match.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: ri * 0.15 + mi * 0.05 }}
                    >
                      <MatchFlowCard match={match} />
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Inter-round connector */}
              {round < totalRounds && (
                <div className="flex flex-col justify-around shrink-0 mx-2" style={{ minHeight: roundMatches.length * 90 }}>
                  {roundMatches.map((_, idx) => {
                    if (idx % 2 !== 0) return null;
                    return (
                      <svg key={idx} width="40" height="60" className="shrink-0 my-4">
                        <path d="M 0 10 C 20 10, 20 30, 40 30" fill="none" stroke="oklch(0.4 0.1 270 / 0.3)" strokeWidth="1.5" strokeDasharray="4 3" />
                        <path d="M 0 50 C 20 50, 20 30, 40 30" fill="none" stroke="oklch(0.4 0.1 270 / 0.3)" strokeWidth="1.5" strokeDasharray="4 3" />
                      </svg>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
