import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import publicService from "@/services/publicService";
import { Trophy, ArrowRight, Loader2 } from "lucide-react";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
const item = { hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0 } };

export default function LeaguesPage() {
  const [leagues, setLeagues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await publicService.getLeagues();
        const data = res.data?.data || res.data?.leagues || res.data || [];
        setLeagues(Array.isArray(data) ? data : []);
      } catch { /* handled */ }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  return (
    <div className="min-h-screen pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium mb-4">
          <Trophy className="w-3.5 h-3.5" /> Active Leagues
        </span>
        <h1 className="text-4xl sm:text-5xl font-black tracking-tight">
          Explore <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-400">Leagues</span>
        </h1>
        <p className="text-gray-400 mt-3 max-w-lg mx-auto">
          Discover cricket leagues, follow live matches, and track your favorite teams
        </p>
      </motion.div>

      {/* Grid */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
        </div>
      ) : leagues.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <Trophy className="w-16 h-16 mx-auto mb-4 opacity-20" />
          <p className="text-lg font-medium">No leagues available yet</p>
          <p className="text-sm mt-1">Check back soon for exciting cricket leagues</p>
        </div>
      ) : (
        <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {leagues.map((league) => (
            <motion.div key={league._id || league.id} variants={item}>
              <Link
                to={`/leagues/${league.slug || league._id || league.id}`}
                className="group block relative overflow-hidden rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-sm hover:border-emerald-500/30 transition-all duration-500"
              >
                {/* Banner */}
                <div className="h-40 bg-gradient-to-br from-emerald-900/40 to-teal-900/40 relative overflow-hidden">
                  {league.logoUrl || league.theme?.bannerUrl ? (
                    <img
                      src={league.theme?.bannerUrl || league.logoUrl}
                      alt={league.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Trophy className="w-16 h-16 text-emerald-500/20" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0c] via-transparent to-transparent" />
                </div>

                {/* Content */}
                <div className="p-5 relative">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors">
                        {league.name}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1 capitalize">{league.sportType || "Cricket"}</p>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors">
                      <ArrowRight className="w-4 h-4 text-emerald-400 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>

                  {league.activeTournaments > 0 && (
                    <div className="mt-3 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-xs text-emerald-400">{league.activeTournaments} active tournament{league.activeTournaments > 1 ? "s" : ""}</span>
                    </div>
                  )}
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
