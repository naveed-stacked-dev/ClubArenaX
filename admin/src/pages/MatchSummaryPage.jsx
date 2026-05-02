import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAppContext } from "@/hooks/useAppContext";
import matchService from "@/services/matchService";
import scoringService from "@/services/scoringService";
import { decodeId } from "@/utils/crypto";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Loader2, Shield, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

export default function MatchSummaryPage() {
  const params = useParams();
  const matchId = decodeId(params.matchId);
  const navigate = useNavigate();
  const { themeColor } = useAppContext();
  const [match, setMatch] = useState(null);
  const [summaryData, setSummaryData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMatchAndSummary = async () => {
      setLoading(true);
      try {
        const [matchRes, summaryRes] = await Promise.allSettled([
          matchService.getById(matchId),
          scoringService.getScorecard(matchId),
        ]);
        
        if (matchRes.status === "fulfilled") {
          setMatch(matchRes.value.data?.data || matchRes.value.data);
        }
        
        if (summaryRes.status === "fulfilled") {
          setSummaryData(summaryRes.value.data?.data || summaryRes.value.data);
        }
      } catch (error) {
        console.error("Error fetching match summary", error);
      } finally {
        setLoading(false);
      }
    };
    
    if (matchId) {
      fetchMatchAndSummary();
    }
  }, [matchId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-muted-foreground">
        <Loader2 className="w-10 h-10 animate-spin mb-4" style={{ color: themeColor }} />
        <p>Loading Match Summary...</p>
      </div>
    );
  }

  if (!match) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <Calendar className="w-12 h-12 mx-auto mb-3 opacity-20" />
        <p className="font-medium text-lg">Match Not Found</p>
        <Button 
          variant="outline" 
          className="mt-4" 
          onClick={() => navigate(-1)}
          style={{ borderColor: themeColor, color: themeColor }}
        >
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6 max-w-5xl mx-auto pb-12">
      <motion.div variants={item} className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
            {match.teamA?.name} <span className="text-xl opacity-40 font-medium" style={{ color: themeColor }}>vs</span> {match.teamB?.name}
          </h1>
          <p className="text-muted-foreground mt-1">
            {match.status === "completed" ? (
              <span className="font-bold text-lg" style={{ color: themeColor }}>{match.result?.summary || "Match Completed"}</span>
            ) : (
              <span className="capitalize">{match.status} Match • {match.overs} Overs</span>
            )}
          </p>
        </div>
      </motion.div>

      <motion.div variants={item}>
        {!summaryData ? (
          <div className="text-center py-16 bg-secondary/10 rounded-2xl border border-border/50 text-muted-foreground">
            <Shield className="w-12 h-12 mx-auto mb-4 opacity-20" style={{ color: themeColor }} />
            <p className="text-xl font-medium">No Scorecard Available</p>
            <p className="text-sm mt-1">This match has not started or the data is missing.</p>
          </div>
        ) : (
          <div className="space-y-10">
            {/* 1st Innings */}
            {summaryData.innings?.first && (
              <div className="space-y-4">
                <div 
                  className="flex items-center justify-between p-5 rounded-2xl border shadow-sm transition-all"
                  style={{ 
                    background: `linear-gradient(90deg, ${themeColor}15, transparent)`,
                    borderColor: `${themeColor}30`
                  }}
                >
                  <h3 className="text-xl font-bold" style={{ color: themeColor }}>1st Innings — {summaryData.innings.first.battingTeamId?.name || "Team A"}</h3>
                  <Badge 
                    variant="outline" 
                    className="text-xl font-black bg-background/80 backdrop-blur-sm px-4 py-1.5 shadow-sm"
                    style={{ borderColor: themeColor, color: themeColor }}
                  >
                    {summaryData.innings.first.score || 0}/{summaryData.innings.first.wickets || 0} <span className="text-base opacity-60 font-medium ml-2">({summaryData.innings.first.overs?.toFixed?.(1) || "0.0"} ov)</span>
                  </Badge>
                </div>
                
                <div className="border border-border/50 rounded-2xl overflow-hidden shadow-sm bg-card">
                  <Table>
                    <TableHeader style={{ backgroundColor: `${themeColor}10` }}>
                      <TableRow className="hover:bg-transparent border-b border-border/50">
                        <TableHead className="font-bold" style={{ color: themeColor }}>Batsman</TableHead>
                        <TableHead className="text-center w-12 font-bold" style={{ color: themeColor }}>R</TableHead>
                        <TableHead className="text-center w-12 font-bold" style={{ color: themeColor }}>B</TableHead>
                        <TableHead className="text-center w-12 font-bold" style={{ color: themeColor }}>4s</TableHead>
                        <TableHead className="text-center w-12 font-bold" style={{ color: themeColor }}>6s</TableHead>
                        <TableHead className="text-center w-16 font-bold" style={{ color: themeColor }}>SR</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(summaryData.innings.first.battingOrder || []).length === 0 ? (
                        <TableRow><TableCell colSpan={6} className="text-center py-6 text-muted-foreground">No batting data</TableCell></TableRow>
                      ) : summaryData.innings.first.battingOrder.map((bat, i) => (
                        <TableRow key={i} className={bat.isOut ? "opacity-75 bg-muted/10 hover:bg-muted/20" : "hover:bg-secondary/10"}>
                          <TableCell className="font-medium text-base">
                            <span style={{ color: bat.isOut ? 'inherit' : themeColor }}>{bat.playerId?.name || "Unknown"}</span>
                            {bat.isOut ? (
                              <span className="text-sm text-red-500 ml-3 font-normal tracking-tight">({bat.dismissalType})</span>
                            ) : bat.balls > 0 ? (
                              <span className="text-xs ml-3 font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border" style={{ color: themeColor, borderColor: `${themeColor}40`, backgroundColor: `${themeColor}10` }}>not out</span>
                            ) : null}
                          </TableCell>
                          <TableCell className="text-center font-bold text-base">{bat.runs}</TableCell>
                          <TableCell className="text-center text-muted-foreground">{bat.balls}</TableCell>
                          <TableCell className="text-center font-medium">{bat.fours}</TableCell>
                          <TableCell className="text-center font-medium">{bat.sixes}</TableCell>
                          <TableCell className="text-center text-muted-foreground text-sm font-mono">
                            {bat.balls > 0 ? ((bat.runs / bat.balls) * 100).toFixed(1) : "0.0"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <div className="px-6 py-4 border-t border-border/50 text-sm text-muted-foreground flex items-center gap-4 flex-wrap" style={{ backgroundColor: `${themeColor}05` }}>
                    <span className="font-bold text-base" style={{ color: themeColor }}>Extras: {summaryData.innings.first.extras?.total || 0}</span>
                    <span className="opacity-80">(WD {summaryData.innings.first.extras?.wides || 0}, NB {summaryData.innings.first.extras?.noBalls || 0}, B {summaryData.innings.first.extras?.byes || 0}, LB {summaryData.innings.first.extras?.legByes || 0})</span>
                  </div>
                </div>

                <div className="border border-border/50 rounded-2xl overflow-hidden mt-6 shadow-sm bg-card">
                  <Table>
                    <TableHeader style={{ backgroundColor: `${themeColor}10` }}>
                      <TableRow className="hover:bg-transparent border-b border-border/50">
                        <TableHead className="font-bold" style={{ color: themeColor }}>Bowler</TableHead>
                        <TableHead className="text-center w-12 font-bold" style={{ color: themeColor }}>O</TableHead>
                        <TableHead className="text-center w-12 font-bold" style={{ color: themeColor }}>M</TableHead>
                        <TableHead className="text-center w-12 font-bold" style={{ color: themeColor }}>R</TableHead>
                        <TableHead className="text-center w-12 font-bold" style={{ color: themeColor }}>W</TableHead>
                        <TableHead className="text-center w-16 font-bold" style={{ color: themeColor }}>Econ</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(summaryData.innings.first.bowlingFigures || []).length === 0 ? (
                        <TableRow><TableCell colSpan={6} className="text-center py-6 text-muted-foreground">No bowling data</TableCell></TableRow>
                      ) : summaryData.innings.first.bowlingFigures.map((bowl, i) => {
                        const totalOvers = bowl.overs + (bowl.balls / 6);
                        return (
                          <TableRow key={i} className="hover:bg-secondary/10">
                            <TableCell className="font-medium text-base">{bowl.playerId?.name || "Unknown"}</TableCell>
                            <TableCell className="text-center font-medium">{bowl.overs}.{bowl.balls}</TableCell>
                            <TableCell className="text-center text-muted-foreground">{bowl.maidens}</TableCell>
                            <TableCell className="text-center font-medium">{bowl.runs}</TableCell>
                            <TableCell className="text-center font-bold text-red-500 text-base">{bowl.wickets}</TableCell>
                            <TableCell className="text-center text-muted-foreground text-sm font-mono">
                              {totalOvers > 0 ? (bowl.runs / totalOvers).toFixed(1) : "0.0"}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}

            {/* 2nd Innings */}
            {summaryData.innings?.second && summaryData.innings.second.battingTeamId && (
              <div className="space-y-4 pt-8 border-t-2 border-border/30">
                <div 
                  className="flex items-center justify-between p-5 rounded-2xl border shadow-sm transition-all"
                  style={{ 
                    background: `linear-gradient(90deg, ${themeColor}15, transparent)`,
                    borderColor: `${themeColor}30`
                  }}
                >
                  <h3 className="text-xl font-bold" style={{ color: themeColor }}>2nd Innings — {summaryData.innings.second.battingTeamId?.name || "Team B"}</h3>
                  <Badge 
                    variant="outline" 
                    className="text-xl font-black bg-background/80 backdrop-blur-sm px-4 py-1.5 shadow-sm"
                    style={{ borderColor: themeColor, color: themeColor }}
                  >
                    {summaryData.innings.second.score || 0}/{summaryData.innings.second.wickets || 0} <span className="text-base opacity-60 font-medium ml-2">({summaryData.innings.second.overs?.toFixed?.(1) || "0.0"} ov)</span>
                  </Badge>
                </div>
                
                <div className="border border-border/50 rounded-2xl overflow-hidden shadow-sm bg-card">
                  <Table>
                    <TableHeader style={{ backgroundColor: `${themeColor}10` }}>
                      <TableRow className="hover:bg-transparent border-b border-border/50">
                        <TableHead className="font-bold" style={{ color: themeColor }}>Batsman</TableHead>
                        <TableHead className="text-center w-12 font-bold" style={{ color: themeColor }}>R</TableHead>
                        <TableHead className="text-center w-12 font-bold" style={{ color: themeColor }}>B</TableHead>
                        <TableHead className="text-center w-12 font-bold" style={{ color: themeColor }}>4s</TableHead>
                        <TableHead className="text-center w-12 font-bold" style={{ color: themeColor }}>6s</TableHead>
                        <TableHead className="text-center w-16 font-bold" style={{ color: themeColor }}>SR</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(summaryData.innings.second.battingOrder || []).length === 0 ? (
                        <TableRow><TableCell colSpan={6} className="text-center py-6 text-muted-foreground">No batting data</TableCell></TableRow>
                      ) : summaryData.innings.second.battingOrder.map((bat, i) => (
                        <TableRow key={i} className={bat.isOut ? "opacity-75 bg-muted/10 hover:bg-muted/20" : "hover:bg-secondary/10"}>
                          <TableCell className="font-medium text-base">
                            <span style={{ color: bat.isOut ? 'inherit' : themeColor }}>{bat.playerId?.name || "Unknown"}</span>
                            {bat.isOut ? (
                              <span className="text-sm text-red-500 ml-3 font-normal tracking-tight">({bat.dismissalType})</span>
                            ) : bat.balls > 0 ? (
                              <span className="text-xs ml-3 font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border" style={{ color: themeColor, borderColor: `${themeColor}40`, backgroundColor: `${themeColor}10` }}>not out</span>
                            ) : null}
                          </TableCell>
                          <TableCell className="text-center font-bold text-base">{bat.runs}</TableCell>
                          <TableCell className="text-center text-muted-foreground">{bat.balls}</TableCell>
                          <TableCell className="text-center font-medium">{bat.fours}</TableCell>
                          <TableCell className="text-center font-medium">{bat.sixes}</TableCell>
                          <TableCell className="text-center text-muted-foreground text-sm font-mono">
                            {bat.balls > 0 ? ((bat.runs / bat.balls) * 100).toFixed(1) : "0.0"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <div className="px-6 py-4 border-t border-border/50 text-sm text-muted-foreground flex items-center gap-4 flex-wrap" style={{ backgroundColor: `${themeColor}05` }}>
                    <span className="font-bold text-base" style={{ color: themeColor }}>Extras: {summaryData.innings.second.extras?.total || 0}</span>
                    <span className="opacity-80">(WD {summaryData.innings.second.extras?.wides || 0}, NB {summaryData.innings.second.extras?.noBalls || 0}, B {summaryData.innings.second.extras?.byes || 0}, LB {summaryData.innings.second.extras?.legByes || 0})</span>
                  </div>
                </div>

                <div className="border border-border/50 rounded-2xl overflow-hidden mt-6 shadow-sm bg-card">
                  <Table>
                    <TableHeader style={{ backgroundColor: `${themeColor}10` }}>
                      <TableRow className="hover:bg-transparent border-b border-border/50">
                        <TableHead className="font-bold" style={{ color: themeColor }}>Bowler</TableHead>
                        <TableHead className="text-center w-12 font-bold" style={{ color: themeColor }}>O</TableHead>
                        <TableHead className="text-center w-12 font-bold" style={{ color: themeColor }}>M</TableHead>
                        <TableHead className="text-center w-12 font-bold" style={{ color: themeColor }}>R</TableHead>
                        <TableHead className="text-center w-12 font-bold" style={{ color: themeColor }}>W</TableHead>
                        <TableHead className="text-center w-16 font-bold" style={{ color: themeColor }}>Econ</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(summaryData.innings.second.bowlingFigures || []).length === 0 ? (
                        <TableRow><TableCell colSpan={6} className="text-center py-6 text-muted-foreground">No bowling data</TableCell></TableRow>
                      ) : summaryData.innings.second.bowlingFigures.map((bowl, i) => {
                        const totalOvers = bowl.overs + (bowl.balls / 6);
                        return (
                          <TableRow key={i} className="hover:bg-secondary/10">
                            <TableCell className="font-medium text-base">{bowl.playerId?.name || "Unknown"}</TableCell>
                            <TableCell className="text-center font-medium">{bowl.overs}.{bowl.balls}</TableCell>
                            <TableCell className="text-center text-muted-foreground">{bowl.maidens}</TableCell>
                            <TableCell className="text-center font-medium">{bowl.runs}</TableCell>
                            <TableCell className="text-center font-bold text-red-500 text-base">{bowl.wickets}</TableCell>
                            <TableCell className="text-center text-muted-foreground text-sm font-mono">
                              {totalOvers > 0 ? (bowl.runs / totalOvers).toFixed(1) : "0.0"}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
