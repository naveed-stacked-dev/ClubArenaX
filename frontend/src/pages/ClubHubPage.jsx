import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import publicService from "@/services/publicService";
import { Trophy, Swords, ArrowRight, Loader2, Users } from "lucide-react";

export default function LeagueHubPage() {
  const { slug } = useParams();
  const [league, setLeague] = useState(null);
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await publicService.getLeague(slug);
        const data = res.data?.data || res.data;
        setLeague(data);

        if (data?._id || data?.id) {
          const tRes = await publicService.getTournaments(data._id || data.id);
          setTournaments(tRes.data?.data || tRes.data?.tournaments || tRes.data || []);
        }
      } catch { /* handled */ }
      finally { setLoading(false); }
    };
    fetch();
  }, [slug]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-emerald-500" /></div>;
  }

  if (!league) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-gray-500">
        <Trophy className="w-16 h-16 mb-4 opacity-20" />
        <p className="text-lg font-medium">League not found</p>
        <Link to="/leagues" className="text-emerald-400 mt-4 text-sm hover:underline">← Back to leagues</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Banner */}
      <div className="relative h-[300px] sm:h-[360px] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/60 to-teal-900/60">
          {(league.theme?.bannerUrl || league.logoUrl) && (
            <img src={league.theme?.bannerUrl || league.logoUrl} alt="" className="w-full h-full object-cover opacity-30" />
          )}
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0c] via-[#0a0a0c]/60 to-transparent" />
        <div className="relative z-10 h-full flex flex-col items-center justify-end pb-10 px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 shadow-lg shadow-emerald-500/25 mb-4">
              <Trophy className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-black">{league.name}</h1>
            <p className="text-gray-400 mt-2 capitalize">{league.sportType || "Cricket"}</p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 space-y-12">
        {/* Tournaments */}
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <h2 className="text-xl font-bold flex items-center gap-2 mb-6">
            <Swords className="w-5 h-5 text-amber-400" /> Tournaments
          </h2>

          {tournaments.length === 0 ? (
            <div className="text-center py-12 border border-white/5 rounded-2xl bg-white/[0.02]">
              <Swords className="w-12 h-12 mx-auto mb-3 text-gray-600" />
              <p className="text-gray-500 text-sm">No tournaments in this league yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {tournaments.map((t) => (
                <Link
                  key={t._id || t.id}
                  to={`/tournaments/${t._id || t.id}`}
                  className="group border border-white/5 rounded-xl bg-white/[0.02] p-5 hover:border-amber-500/30 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-white group-hover:text-amber-400 transition-colors">{t.name}</h3>
                      <p className="text-xs text-gray-500 mt-1 capitalize">{t.format?.replace("-", " ") || "Round Robin"}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      t.status === "ongoing" ? "bg-red-500/10 text-red-400" :
                      t.status === "completed" ? "bg-gray-500/10 text-gray-400" :
                      "bg-emerald-500/10 text-emerald-400"
                    }`}>
                      {t.status || "upcoming"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <span className="text-xs text-gray-500">
                      {t.startDate ? new Date(t.startDate).toLocaleDateString() : "TBD"}
                    </span>
                    <ArrowRight className="w-4 h-4 text-gray-600 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </motion.section>
      </div>
    </div>
  );
}
