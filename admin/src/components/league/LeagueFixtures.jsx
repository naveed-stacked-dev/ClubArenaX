import React from "react";
import { motion } from "framer-motion";
import { Calendar, MapPin, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAppContext } from "@/hooks/useAppContext";

export default function LeagueFixtures({ matches }) {
  const { themeColor } = useAppContext();
  if (!matches || matches.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <Calendar className="w-12 h-12 mx-auto mb-3 opacity-20" />
        <p className="font-medium">No matches available.</p>
      </div>
    );
  }

  const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
  const item = { hidden: { opacity: 0, scale: 0.95 }, show: { opacity: 1, scale: 1 } };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {matches.map((match) => {
        const teamA = match.teamA;
        const teamB = match.teamB;
        
        let statusBadge = <Badge variant="outline" className="text-muted-foreground bg-background">Unscheduled</Badge>;
        if (match.status === 'completed') statusBadge = <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">Completed</Badge>;
        if (match.status === 'live') statusBadge = <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 animate-pulse">Live Now</Badge>;
        if (match.status === 'upcoming') statusBadge = <Badge style={{ backgroundColor: `${themeColor}20`, color: themeColor, borderColor: `${themeColor}30` }}>Upcoming</Badge>;

        return (
          <motion.div variants={item} key={match._id || match.id}>
            <Card className="overflow-hidden border-border bg-card/60 backdrop-blur-sm hover:bg-card/80 transition-colors h-full flex flex-col">
              <CardContent className="p-4 flex flex-col flex-1">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-mono font-bold text-muted-foreground uppercase tracking-wider">
                    {match.matchLabel || `Match ${match.matchNumber || 'TBD'}`}
                  </span>
                  {statusBadge}
                </div>
                
                {/* Teams */}
                <div className="flex flex-col gap-3 flex-1 justify-center py-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-[10px] text-white shadow-sm ring-1 ring-white/10 shrink-0"
                         style={{ backgroundColor: teamA?.color || "oklch(0.3 0.02 260)" }}>
                      {teamA?.shortName || teamA?.name?.substring(0, 3).toUpperCase() || "?"}
                    </div>
                    <span className="font-bold text-foreground line-clamp-1">{teamA?.name || "TBD"}</span>
                  </div>
                  
                  <div className="text-xs font-bold text-muted-foreground pl-11 relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 w-0.5 h-full bg-border/50"></span>
                    <span className="bg-card px-1 relative z-10 text-[10px]">VS</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-[10px] text-white shadow-sm ring-1 ring-white/10 shrink-0"
                         style={{ backgroundColor: teamB?.color || "oklch(0.3 0.02 260)" }}>
                      {teamB?.shortName || teamB?.name?.substring(0, 3).toUpperCase() || "?"}
                    </div>
                    <span className="font-bold text-foreground line-clamp-1">{teamB?.name || "TBD"}</span>
                  </div>
                </div>

                {/* Footer Info */}
                <div className="mt-4 pt-3 border-t border-border/50 flex flex-col gap-1 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{match.startTime ? new Date(match.startTime).toLocaleDateString() : 'Date TBD'}</span>
                    <span className="px-1">•</span>
                    <Clock className="w-3.5 h-3.5" />
                    <span>{match.startTime ? new Date(match.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Time TBD'}</span>
                  </div>
                  {match.venue && (
                    <div className="flex items-center gap-2 mt-1">
                      <MapPin className="w-3.5 h-3.5" />
                      <span className="line-clamp-1">{match.venue}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
