import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import publicService from "@/services/publicService";
import { UserCircle, Loader2, TrendingUp, Target, Award } from "lucide-react";

export default function PlayerProfilePage() {
  const { id } = useParams();
  const [player, setPlayer] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [pRes, sRes] = await Promise.allSettled([
          publicService.getPlayer(id),
          publicService.getPlayerStats(id),
        ]);
        if (pRes.status === "fulfilled") setPlayer(pRes.value.data?.data || pRes.value.data);
        if (sRes.status === "fulfilled") setStats(sRes.value.data?.data || sRes.value.data);
      } catch { /* handled */ }
      finally { setLoading(false); }
    };
    fetch();
  }, [id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-emerald-500" /></div>;

  if (!player) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-gray-500">
        <UserCircle className="w-16 h-16 mb-4 opacity-20" />
        <p className="text-lg">Player not found</p>
      </div>
    );
  }

  const getRoleColor = (role) => {
    const colors = { batsman: "from-blue-500 to-cyan-500", bowler: "from-red-500 to-orange-500", allrounder: "from-violet-500 to-indigo-500", wicketkeeper: "from-amber-500 to-yellow-500" };
    return colors[role] || "from-emerald-500 to-teal-500";
  };

  const statCards = [
    { label: "Matches", value: stats?.matches || 0, icon: Target },
    { label: "Runs", value: stats?.runs || 0, icon: TrendingUp },
    { label: "Avg", value: stats?.battingAverage?.toFixed(1) || "0.0", icon: Award },
    { label: "SR", value: stats?.strikeRate?.toFixed(1) || "0.0", icon: TrendingUp },
    { label: "Wickets", value: stats?.wickets || 0, icon: Target },
    { label: "Bowl Avg", value: stats?.bowlingAverage?.toFixed(1) || "0.0", icon: Award },
    { label: "50s", value: stats?.fifties || 0, icon: Award },
    { label: "100s", value: stats?.hundreds || 0, icon: Award },
  ];

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 sm:px-6 max-w-4xl mx-auto">
      {/* Profile Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
        <div className={`inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-gradient-to-br ${getRoleColor(player.role)} shadow-lg mb-4 overflow-hidden`}>
          {player.photoUrl ? (
            <img src={player.photoUrl} alt={player.name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-4xl font-black text-white">{(player.name || "?")[0]}</span>
          )}
        </div>
        <h1 className="text-3xl font-black text-white">{player.name}</h1>
        <div className="flex items-center justify-center gap-3 mt-2">
          <span className={`text-xs px-3 py-1 rounded-full bg-gradient-to-r ${getRoleColor(player.role)} text-white font-medium capitalize`}>
            {player.role || "Player"}
          </span>
          {player.jerseyNumber && (
            <span className="text-xs px-3 py-1 rounded-full bg-white/5 border border-white/10 text-gray-400 font-mono">
              #{player.jerseyNumber}
            </span>
          )}
        </div>
        {player.team?.name && (
          <p className="text-sm text-gray-400 mt-3">{player.team.name}</p>
        )}
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-12"
      >
        {statCards.map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.label}
              className="border border-white/5 rounded-xl bg-white/[0.02] p-4 text-center hover:border-emerald-500/20 transition-colors group"
            >
              <Icon className="w-4 h-4 text-gray-600 mx-auto mb-2 group-hover:text-emerald-400 transition-colors" />
              <p className="text-2xl font-black text-white">{s.value}</p>
              <p className="text-xs text-gray-500 mt-1 uppercase tracking-wider">{s.label}</p>
            </div>
          );
        })}
      </motion.div>

      {/* No stats fallback */}
      {!stats && (
        <div className="text-center py-12 border border-white/5 rounded-2xl bg-white/[0.02]">
          <TrendingUp className="w-12 h-12 mx-auto mb-3 text-gray-600" />
          <p className="text-gray-500 text-sm">No stats available for this player yet</p>
        </div>
      )}
    </div>
  );
}
