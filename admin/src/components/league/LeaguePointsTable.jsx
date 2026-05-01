import React, { useMemo } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Trophy, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { motion } from "framer-motion";

export default function LeaguePointsTable({ matches, teams }) {
  // Calculate points table from raw matches
  const pointsTable = useMemo(() => {
    if (!teams || teams.length === 0) return [];

    // Initialize stats for each team
    const statsMap = {};
    teams.forEach(team => {
      statsMap[String(team._id || team.id)] = {
        team,
        played: 0,
        won: 0,
        lost: 0,
        tied: 0,
        points: 0,
        nrr: 0, // Mock NRR for now, as real NRR needs ball-by-ball or inning score data
        form: [] // Array of 'W', 'L', 'T'
      };
    });

    // Process completed matches
    const completedMatches = matches.filter(m => m.status === 'completed' && m.result);
    
    // Sort matches chronologically to calculate accurate recent form
    completedMatches.sort((a, b) => new Date(a.endTime || a.startTime).getTime() - new Date(b.endTime || b.startTime).getTime());

    completedMatches.forEach(match => {
      const teamAId = String(match.teamA?._id || match.teamA);
      const teamBId = String(match.teamB?._id || match.teamB);
      const winnerId = match.result?.winner ? String(match.result.winner._id || match.result.winner) : null;

      if (!statsMap[teamAId] || !statsMap[teamBId]) return;

      statsMap[teamAId].played += 1;
      statsMap[teamBId].played += 1;

      if (winnerId) {
        if (String(winnerId) === String(teamAId)) {
          statsMap[teamAId].won += 1;
          statsMap[teamAId].points += 2;
          statsMap[teamAId].form.push('W');

          statsMap[teamBId].lost += 1;
          statsMap[teamBId].form.push('L');
        } else if (String(winnerId) === String(teamBId)) {
          statsMap[teamBId].won += 1;
          statsMap[teamBId].points += 2;
          statsMap[teamBId].form.push('W');

          statsMap[teamAId].lost += 1;
          statsMap[teamAId].form.push('L');
        }
      } else {
        // Tied or no result
        statsMap[teamAId].tied += 1;
        statsMap[teamAId].points += 1;
        statsMap[teamAId].form.push('T');

        statsMap[teamBId].tied += 1;
        statsMap[teamBId].points += 1;
        statsMap[teamBId].form.push('T');
      }
    });

    // Convert to array and sort
    return Object.values(statsMap).sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.nrr !== a.nrr) return b.nrr - a.nrr;
      return b.won - a.won;
    });
  }, [matches, teams]);

  if (pointsTable.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <Trophy className="w-12 h-12 mx-auto mb-3 opacity-20" />
        <p className="font-medium">No teams or matches available to generate points table.</p>
      </div>
    );
  }

  const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
  const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="rounded-md border border-border bg-card overflow-hidden">
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow>
            <TableHead className="w-12 text-center">Pos</TableHead>
            <TableHead>Team</TableHead>
            <TableHead className="text-center">P</TableHead>
            <TableHead className="text-center">W</TableHead>
            <TableHead className="text-center">L</TableHead>
            <TableHead className="text-center">T</TableHead>
            <TableHead className="text-center">NRR</TableHead>
            <TableHead className="text-center font-bold text-foreground">Pts</TableHead>
            <TableHead className="text-center w-32">Form</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pointsTable.map((row, idx) => (
            <motion.tr variants={item} key={row.team._id || row.team.id} className="group hover:bg-muted/50 transition-colors">
              <TableCell className="text-center font-mono font-medium text-muted-foreground">
                {idx + 1}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-[10px] text-white shadow-sm ring-1 ring-white/10"
                    style={{ backgroundColor: row.team.color || "oklch(0.3 0.02 260)" }}>
                    {row.team.shortName || row.team.name.substring(0, 3).toUpperCase()}
                  </div>
                  <span className="font-bold text-foreground">{row.team.name}</span>
                </div>
              </TableCell>
              <TableCell className="text-center">{row.played}</TableCell>
              <TableCell className="text-center text-emerald-400 font-medium">{row.won}</TableCell>
              <TableCell className="text-center text-red-400 font-medium">{row.lost}</TableCell>
              <TableCell className="text-center text-muted-foreground">{row.tied}</TableCell>
              <TableCell className="text-center font-mono text-xs">{row.nrr > 0 ? `+${row.nrr.toFixed(3)}` : row.nrr.toFixed(3)}</TableCell>
              <TableCell className="text-center font-bold text-lg text-indigo-400 bg-indigo-500/5">{row.points}</TableCell>
              <TableCell>
                <div className="flex items-center justify-center gap-1">
                  {row.form.length === 0 ? (
                    <span className="text-xs text-muted-foreground">—</span>
                  ) : (
                    row.form.slice(-5).map((result, i) => (
                      <Badge 
                        key={i} 
                        className={`w-5 h-5 p-0 flex items-center justify-center text-[10px] font-bold ${
                          result === 'W' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 
                          result === 'L' ? 'bg-red-500/20 text-red-400 border-red-500/30' : 
                          'bg-gray-500/20 text-gray-400 border-gray-500/30'
                        }`}
                      >
                        {result}
                      </Badge>
                    ))
                  )}
                </div>
              </TableCell>
            </motion.tr>
          ))}
        </TableBody>
      </Table>
    </motion.div>
  );
}
