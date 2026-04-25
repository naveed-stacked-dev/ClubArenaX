import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { io } from "socket.io-client";
import scoringService from "@/services/scoringService";
import matchService from "@/services/matchService";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlayCircle, RotateCcw, AlertTriangle, UserMinus, SkipForward, Ban, Loader2 } from "lucide-react";

export default function LiveScoringPage() {
  const { matchId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [socket, setSocket] = useState(null);

  // Modals
  const [showStart, setShowStart] = useState(false);
  const [showWicket, setShowWicket] = useState(false);
  const [showEnd, setShowEnd] = useState(false);
  const [showPlayers, setShowPlayers] = useState(false);

  // Forms
  const [tossWinner, setTossWinner] = useState("");
  const [tossDecision, setTossDecision] = useState("bat");
  const [activeStriker, setActiveStriker] = useState("");
  const [activeNonStriker, setActiveNonStriker] = useState("");
  const [activeBowler, setActiveBowler] = useState("");
  const [wicketForm, setWicketForm] = useState({ batsman: "", type: "bowled", fielder: "" });

  // 1. Setup Socket
  useEffect(() => {
    if (!matchId) return;
    const s = io(import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:5000", {
      withCredentials: true,
    });
    setSocket(s);

    s.emit("join_match", { matchId });

    s.on("score_update", () => {
      // Invalidate queries to fetch fresh data
      queryClient.invalidateQueries(["scorecard", matchId]);
      queryClient.invalidateQueries(["summary", matchId]);
    });

    return () => {
      s.emit("leave_match", { matchId });
      s.disconnect();
    };
  }, [matchId, queryClient]);

  // 2. Fetch Data
  const { data: matchRaw, isLoading: matchLoading } = useQuery({
    queryKey: ["match", matchId],
    queryFn: () => matchService.getById(matchId),
    enabled: !!matchId,
  });
  const match = matchRaw?.data?.data || matchRaw?.data;

  const { data: scorecardRaw, isLoading: scoreLoading } = useQuery({
    queryKey: ["scorecard", matchId],
    queryFn: () => scoringService.getScorecard(matchId),
    enabled: !!matchId && match?.status !== "scheduled",
  });
  const scorecard = scorecardRaw?.data?.data || scorecardRaw?.data;

  // 3. Mutations
  const startMatchMut = useMutation({
    mutationFn: (data) => scoringService.startMatch(matchId, data),
    onSuccess: () => {
      toast.success("Match Started!");
      setShowStart(false);
      queryClient.invalidateQueries(["match", matchId]);
      queryClient.invalidateQueries(["scorecard", matchId]);
    },
    onError: () => toast.error("Failed to start match"),
  });

  const scoreMut = useMutation({
    mutationFn: (data) => scoringService.addScore(matchId, data),
    onSuccess: (_res, variables) => toast.success(`${variables.runs} runs added`),
  });

  const extraMut = useMutation({
    mutationFn: (data) => scoringService.addExtra(matchId, data),
    onSuccess: () => toast.success(`Extra added`),
  });

  const wicketMut = useMutation({
    mutationFn: (data) => scoringService.addWicket(matchId, data),
    onSuccess: () => {
      toast.success("Wicket!");
      setShowWicket(false);
      setShowPlayers(true); // Need new batsman
    },
  });

  const setPlayersMut = useMutation({
    mutationFn: (data) => scoringService.setActivePlayers(matchId, data),
    onSuccess: () => {
      toast.success("Active players updated");
      setShowPlayers(false);
    },
  });

  const undoMut = useMutation({
    mutationFn: () => scoringService.undoLastEvent(matchId),
    onSuccess: () => toast.success("Undid last action"),
  });

  const switchInningsMut = useMutation({
    mutationFn: () => scoringService.switchInnings(matchId),
    onSuccess: () => {
      toast.success("Innings Switched");
      setShowPlayers(true);
    },
  });

  const endMatchMut = useMutation({
    mutationFn: () => scoringService.endMatch(matchId, {}),
    onSuccess: () => {
      toast.success("Match Ended");
      setShowEnd(false);
      queryClient.invalidateQueries(["match", matchId]);
    },
  });


  if (!matchId) return <div className="p-8 text-center">No match selected</div>;
  if (matchLoading) return <div className="p-8 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div>;
  if (!match) return <div className="p-8 text-center">Match not found</div>;

  // Render Start Screen if scheduled
  if (match.status === "scheduled") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
        <div className="text-center space-y-2">
          <Badge variant="secondary" className="mb-4">Scheduled</Badge>
          <h1 className="text-3xl font-bold">{match.teamA?.name} <span className="text-muted-foreground mx-2">vs</span> {match.teamB?.name}</h1>
          <p className="text-muted-foreground">{match.overs} Overs Match • {match.venue || "TBD"}</p>
        </div>
        
        <Button size="lg" onClick={() => setShowStart(true)} className="bg-red-500 hover:bg-red-600 text-white rounded-full px-8 py-6 text-lg shadow-lg shadow-red-500/25">
          <PlayCircle className="w-6 h-6 mr-2" /> Start Match Now
        </Button>

        <Dialog open={showStart} onOpenChange={setShowStart}>
          <DialogContent>
            <DialogHeader><DialogTitle>Match Toss</DialogTitle></DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Toss Won By</Label>
                <Select value={tossWinner} onValueChange={setTossWinner}>
                  <SelectTrigger><SelectValue placeholder="Select Team" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value={match.teamA?._id || match.teamA?.id}>{match.teamA?.name}</SelectItem>
                    <SelectItem value={match.teamB?._id || match.teamB?.id}>{match.teamB?.name}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Decision</Label>
                <Select value={tossDecision} onValueChange={setTossDecision}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bat">Bat First</SelectItem>
                    <SelectItem value="bowl">Bowl First</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowStart(false)}>Cancel</Button>
              <Button onClick={() => startMatchMut.mutate({ tossWinner, tossDecision })} disabled={startMatchMut.isPending || !tossWinner}>
                {startMatchMut.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Start Match
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // Live Dashboard
  const currentInnings = scorecard?.innings?.[scorecard.currentInnings - 1] || {};
  const battingTeam = match.teamA?._id === currentInnings.battingTeam ? match.teamA : match.teamB;
  const bowlingTeam = match.teamA?._id === currentInnings.bowlingTeam ? match.teamA : match.teamB;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <Card className="border-red-500/20 shadow-lg shadow-red-500/5">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <Badge variant="destructive" className="animate-pulse mb-2">LIVE SCORE</Badge>
              <h2 className="text-2xl font-bold">{battingTeam?.name}</h2>
              <div className="text-5xl font-black tracking-tighter mt-1 text-foreground">
                {currentInnings.score || 0} <span className="text-2xl text-muted-foreground font-medium">/ {currentInnings.wickets || 0}</span>
              </div>
              <p className="text-lg text-muted-foreground font-medium mt-1">Overs: {currentInnings.overs?.toFixed(1) || "0.0"} <span className="text-sm">/ {match.overs}</span></p>
            </div>
            
            <div className="flex flex-col items-center md:items-end gap-3">
              <div className="text-sm font-medium text-muted-foreground">vs {bowlingTeam?.name}</div>
              <div className="flex flex-wrap gap-2 justify-center md:justify-end">
                <Button variant="outline" size="sm" onClick={() => setShowPlayers(true)}><UserMinus className="w-4 h-4 mr-2" /> Active Players</Button>
                <Button variant="outline" size="sm" onClick={() => switchInningsMut.mutate()} disabled={switchInningsMut.isPending}><SkipForward className="w-4 h-4 mr-2" /> Switch Innings</Button>
                <Button variant="destructive" size="sm" onClick={() => setShowEnd(true)}><Ban className="w-4 h-4 mr-2" /> End Match</Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Quick Actions */}
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Scoring</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {[0, 1, 2, 3, 4, 6].map(runs => (
                <Button key={runs} variant={runs === 4 || runs === 6 ? "default" : "secondary"} className={`h-16 text-xl font-bold ${runs === 4 ? "bg-blue-600 hover:bg-blue-700 text-white" : runs === 6 ? "bg-violet-600 hover:bg-violet-700 text-white" : ""}`}
                  onClick={() => scoreMut.mutate({ runs })} disabled={scoreMut.isPending}>
                  {runs}
                </Button>
              ))}
              <Button variant="outline" className="h-16 border-amber-500/50 text-amber-500 hover:bg-amber-500/10" onClick={() => extraMut.mutate({ type: "wide", runs: 1 })} disabled={extraMut.isPending}>WD</Button>
              <Button variant="outline" className="h-16 border-amber-500/50 text-amber-500 hover:bg-amber-500/10" onClick={() => extraMut.mutate({ type: "no_ball", runs: 1 })} disabled={extraMut.isPending}>NB</Button>
              <Button variant="outline" className="h-16 border-amber-500/50 text-amber-500 hover:bg-amber-500/10" onClick={() => extraMut.mutate({ type: "bye", runs: 1 })} disabled={extraMut.isPending}>B</Button>
              <Button variant="outline" className="h-16 border-amber-500/50 text-amber-500 hover:bg-amber-500/10" onClick={() => extraMut.mutate({ type: "leg_bye", runs: 1 })} disabled={extraMut.isPending}>LB</Button>
              <Button variant="destructive" className="h-16 text-lg sm:col-span-2" onClick={() => setShowWicket(true)}>WICKET</Button>
            </div>

            <div className="mt-6 flex justify-end">
              <Button variant="ghost" className="text-muted-foreground" onClick={() => undoMut.mutate()} disabled={undoMut.isPending}>
                <RotateCcw className="w-4 h-4 mr-2" /> Undo Last
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Right: Active Status */}
        <Card>
          <CardHeader><CardTitle>At the Crease</CardTitle></CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="flex justify-between text-sm mb-2"><span className="text-muted-foreground">Batsmen</span><span className="font-medium">R (B)</span></div>
              <div className="space-y-2">
                <div className="flex justify-between items-center p-2 rounded bg-secondary/50 border border-primary/20">
                  <span className="font-medium flex items-center gap-2">Striker <span className="w-1.5 h-1.5 rounded-full bg-primary" /></span>
                  <span className="font-mono">-- (--)</span>
                </div>
                <div className="flex justify-between items-center p-2 rounded hover:bg-secondary/30">
                  <span className="text-muted-foreground">Non-Striker</span>
                  <span className="font-mono text-muted-foreground">-- (--)</span>
                </div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2"><span className="text-muted-foreground">Bowler</span><span className="font-medium">O-M-R-W</span></div>
              <div className="flex justify-between items-center p-2 rounded bg-secondary/30">
                <span className="font-medium">Current Bowler</span>
                <span className="font-mono">--</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Wicket Modal */}
      <Dialog open={showWicket} onOpenChange={setShowWicket}>
        <DialogContent>
          <DialogHeader><DialogTitle className="text-destructive flex items-center gap-2"><AlertTriangle className="w-5 h-5" /> Fall of Wicket</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Batsman Out</Label>
              <Select value={wicketForm.batsman} onValueChange={(v) => setWicketForm({ ...wicketForm, batsman: v })}>
                <SelectTrigger><SelectValue placeholder="Select Batsman" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="striker">Striker Name</SelectItem>
                  <SelectItem value="non_striker">Non-Striker Name</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Dismissal Type</Label>
              <Select value={wicketForm.type} onValueChange={(v) => setWicketForm({ ...wicketForm, type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="bowled">Bowled</SelectItem>
                  <SelectItem value="caught">Caught</SelectItem>
                  <SelectItem value="lbw">LBW</SelectItem>
                  <SelectItem value="run_out">Run Out</SelectItem>
                  <SelectItem value="stumped">Stumped</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowWicket(false)}>Cancel</Button>
            <Button variant="destructive" onClick={() => wicketMut.mutate(wicketForm)} disabled={wicketMut.isPending || !wicketForm.batsman}>
              {wicketMut.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Confirm Wicket
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Set Players Modal */}
      <Dialog open={showPlayers} onOpenChange={setShowPlayers}>
        <DialogContent>
          <DialogHeader><DialogTitle>Set Active Players</DialogTitle><DialogDescription>Select who is at the crease and bowling.</DialogDescription></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Striker</Label>
              <Select value={activeStriker} onValueChange={setActiveStriker}><SelectTrigger><SelectValue placeholder="Select Batsman" /></SelectTrigger><SelectContent><SelectItem value="p1">Player 1</SelectItem></SelectContent></Select>
            </div>
            <div className="space-y-2">
              <Label>Non-Striker</Label>
              <Select value={activeNonStriker} onValueChange={setActiveNonStriker}><SelectTrigger><SelectValue placeholder="Select Batsman" /></SelectTrigger><SelectContent><SelectItem value="p2">Player 2</SelectItem></SelectContent></Select>
            </div>
            <div className="space-y-2">
              <Label>Bowler</Label>
              <Select value={activeBowler} onValueChange={setActiveBowler}><SelectTrigger><SelectValue placeholder="Select Bowler" /></SelectTrigger><SelectContent><SelectItem value="p3">Player 3</SelectItem></SelectContent></Select>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setPlayersMut.mutate({ striker: activeStriker, nonStriker: activeNonStriker, bowler: activeBowler })}>Update Players</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* End Match */}
      <Dialog open={showEnd} onOpenChange={setShowEnd}>
        <DialogContent>
          <DialogHeader><DialogTitle>End Match?</DialogTitle><DialogDescription>Are you sure you want to end this match? This cannot be undone.</DialogDescription></DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEnd(false)}>Cancel</Button>
            <Button variant="destructive" onClick={() => endMatchMut.mutate()} disabled={endMatchMut.isPending}>End Match</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
