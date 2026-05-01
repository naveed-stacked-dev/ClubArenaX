import { useMemo, useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";
import BracketNode from "./BracketNode";

/**
 * Full tournament bracket tree with SVG connector lines.
 * Renders rounds left-to-right: Round 1 → ... → Final
 */
export default function BracketTree({ matches, totalRounds, onClickMatch }) {
  const containerRef = useRef(null);
  const [nodePositions, setNodePositions] = useState({});

  // Organize matches by round
  const roundsData = useMemo(() => {
    const rounds = {};
    for (let r = 1; r <= totalRounds; r++) {
      rounds[r] = (matches || [])
        .filter((m) => m.round === r)
        .sort((a, b) => (a.matchOrder ?? 0) - (b.matchOrder ?? 0));
    }
    return rounds;
  }, [matches, totalRounds]);

  // Collect node positions after render for SVG lines
  useEffect(() => {
    if (!containerRef.current) return;
    const timer = setTimeout(() => {
      const positions = {};
      const containerRect = containerRef.current.getBoundingClientRect();
      const nodes = containerRef.current.querySelectorAll("[data-match-id]");
      nodes.forEach((node) => {
        const id = node.getAttribute("data-match-id");
        const rect = node.getBoundingClientRect();
        positions[id] = {
          x: rect.left - containerRect.left + rect.width,
          y: rect.top - containerRect.top + rect.height / 2,
          left: rect.left - containerRect.left,
          width: rect.width,
        };
      });
      setNodePositions(positions);
    }, 400);
    return () => clearTimeout(timer);
  }, [matches, totalRounds]);

  // Build SVG connector lines
  const lines = useMemo(() => {
    const result = [];
    for (const match of (matches || [])) {
      const nextId = match.tournamentMeta?.nextMatchId?._id || match.tournamentMeta?.nextMatchId;
      if (!nextId) continue;
      const matchId = match._id || match.id;
      const from = nodePositions[matchId];
      const to = nodePositions[nextId?.toString()];
      if (!from || !to) continue;

      const isCompleted = match.status === "completed";
      result.push({
        key: `${matchId}-${nextId}`,
        x1: from.x,
        y1: from.y,
        x2: to.left,
        y2: to.y,
        completed: isCompleted,
        live: match.status === "live",
      });
    }
    return result;
  }, [matches, nodePositions]);

  // Round labels
  function getRoundLabel(round) {
    const fromFinal = totalRounds - round + 1;
    switch (fromFinal) {
      case 1: return "🏆 Final";
      case 2: return "Semifinals";
      case 3: return "Quarterfinals";
      default: return `Round ${round}`;
    }
  }

  const ROUND_GAP = 80;
  const NODE_V_GAP = 20;

  return (
    <div className="relative w-full overflow-x-auto overflow-y-auto">
      <div ref={containerRef} className="relative flex items-start gap-0 py-8 px-4" style={{ minWidth: totalRounds * 300 }}>
        {/* SVG overlay for lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
          <defs>
            <linearGradient id="lineGradientActive" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0.8" />
            </linearGradient>
            <linearGradient id="lineGradientLive" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#ef4444" stopOpacity="0.9" />
            </linearGradient>
          </defs>
          {lines.map((line) => {
            const midX = (line.x1 + line.x2) / 2;
            const pathD = `M ${line.x1} ${line.y1} C ${midX} ${line.y1}, ${midX} ${line.y2}, ${line.x2} ${line.y2}`;
            return (
              <motion.path
                key={line.key}
                d={pathD}
                fill="none"
                stroke={
                  line.live
                    ? "url(#lineGradientLive)"
                    : line.completed
                    ? "url(#lineGradientActive)"
                    : "oklch(0.5 0 0 / 0.2)"
                }
                strokeWidth={line.completed || line.live ? 2.5 : 1.5}
                strokeDasharray={!line.completed && !line.live ? "6 4" : "none"}
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            );
          })}
        </svg>

        {/* Render each round */}
        {Array.from({ length: totalRounds }, (_, i) => i + 1).map((round) => {
          const roundMatches = roundsData[round] || [];
          return (
            <div
              key={round}
              className="flex flex-col items-center shrink-0"
              style={{ marginRight: ROUND_GAP, zIndex: 1 }}
            >
              {/* Round header */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: round * 0.1 }}
                className="mb-6 px-4 py-1.5 rounded-full bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-500/20"
              >
                <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">
                  {getRoundLabel(round)}
                </span>
              </motion.div>

              {/* Match nodes */}
              <div
                className="flex flex-col justify-around flex-1"
                style={{
                  gap: NODE_V_GAP + (round - 1) * 40,
                  minHeight: roundMatches.length * 100,
                }}
              >
                {roundMatches.map((match) => (
                  <div
                    key={match._id || match.id}
                    data-match-id={match._id || match.id}
                  >
                    <BracketNode match={match} onClickMatch={onClickMatch} />
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
