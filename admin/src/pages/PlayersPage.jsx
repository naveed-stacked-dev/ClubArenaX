import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useAppContext } from "@/hooks/useAppContext";
import leagueService from "@/services/leagueService";
import teamService from "@/services/teamService";
import playerService from "@/services/playerService";
import { toast } from "sonner";
import ImageUpload from "@/components/ImageUpload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { UserCircle, Plus, MoreHorizontal, Pencil, Trash2, Loader2, Search, BarChart3, Shield } from "lucide-react";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

const PLAYER_ROLES = ["batsman", "bowler", "allrounder", "wicketkeeper"];

export default function PlayersPage() {
  const { user } = useAppContext();
  const [leagues, setLeagues] = useState([]);
  const [selectedLeague, setSelectedLeague] = useState(null);
  const [players, setPlayers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [leagueLoading, setLeagueLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [selected, setSelected] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);

  const [form, setForm] = useState({ name: "", role: "batsman", jerseyNumber: "", phone: "", photoUrl: "", team: "" });

  useEffect(() => {
    const fetch = async () => {
      try {
        if (user?.role === "superAdmin") {
          const res = await leagueService.adminGetAll();
          const data = res.data?.data || res.data?.leagues || res.data || [];
          setLeagues(Array.isArray(data) ? data : []);
          if (data.length > 0) setSelectedLeague(data[0]._id || data[0].id);
        } else {
          if (user?.leagueId) setSelectedLeague(user.leagueId);
        }
      } catch { /* interceptor */ }
      finally { setLeagueLoading(false); }
    };
    fetch();
  }, [user]);

  const fetchPlayers = useCallback(async () => {
    if (!selectedLeague) return;
    setLoading(true);
    try {
      const [pRes, tRes] = await Promise.allSettled([
        playerService.getByLeague(selectedLeague),
        teamService.getByLeague(selectedLeague),
      ]);
      const pData = pRes.status === "fulfilled" ? (pRes.value.data?.data || pRes.value.data?.players || pRes.value.data || []) : [];
      const tData = tRes.status === "fulfilled" ? (tRes.value.data?.data || tRes.value.data?.teams || tRes.value.data || []) : [];
      setPlayers(Array.isArray(pData) ? pData : []);
      setTeams(Array.isArray(tData) ? tData : []);
    } catch { /* interceptor */ }
    finally { setLoading(false); }
  }, [selectedLeague]);

  useEffect(() => { fetchPlayers(); }, [fetchPlayers]);

  const handleCreate = async () => {
    if (!form.name.trim()) return toast.error("Player name required");
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("role", form.role);
      formData.append("leagueId", selectedLeague);
      if (form.team) formData.append("teamId", form.team);
      if (form.photoUrl instanceof File) {
        formData.append("avatar", form.photoUrl);
      } else if (form.photoUrl) {
        formData.append("avatar", form.photoUrl);
      }

      await playerService.create(formData);
      toast.success("Player created");
      setShowCreate(false);
      setForm({ name: "", role: "batsman", jerseyNumber: "", phone: "", photoUrl: "", team: "" });
      fetchPlayers();
    } catch { /* interceptor */ } finally { setSubmitting(false); }
  };



  const handleEdit = async () => {
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("role", form.role);
      if (form.team) formData.append("teamId", form.team);
      if (form.photoUrl instanceof File) {
        formData.append("avatar", form.photoUrl);
      } else if (form.photoUrl) {
        formData.append("avatar", form.photoUrl);
      }

      await playerService.update(selected._id || selected.id, formData);
      toast.success("Player updated");
      setShowEdit(false);
      fetchPlayers();
    } catch { /* interceptor */ } finally { setSubmitting(false); }
  };

  const handleDelete = async () => {
    setSubmitting(true);
    try {
      await playerService.remove(selected._id || selected.id);
      toast.success("Player deleted");
      setShowDelete(false);
      fetchPlayers();
    } catch { /* interceptor */ } finally { setSubmitting(false); }
  };

  const openStats = async (player) => {
    setSelected(player);
    setShowStats(true);
    setStatsLoading(true);
    try {
      const res = await playerService.getStats(player._id || player.id);
      setStats(res.data?.data || res.data || null);
    } catch { setStats(null); }
    finally { setStatsLoading(false); }
  };

  const openEdit = (p) => {
    setSelected(p);
    setForm({ name: p.name || "", role: p.role || "batsman", jerseyNumber: p.jerseyNumber || "", phone: p.phone || "", photoUrl: p.photoUrl || "", team: p.team?._id || p.team || "" });
    setShowEdit(true);
  };

  const filtered = players.filter((p) =>
    (p.name || "").toLowerCase().includes(search.toLowerCase()) ||
    (p.role || "").toLowerCase().includes(search.toLowerCase())
  );

  const getRoleBadge = (role) => {
    const colors = { batsman: "text-blue-500 bg-blue-500/10", bowler: "text-red-500 bg-red-500/10", allrounder: "text-violet-500 bg-violet-500/10", wicketkeeper: "text-amber-500 bg-amber-500/10" };
    return colors[role] || "text-muted-foreground bg-muted";
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2"><UserCircle className="w-6 h-6 text-blue-500" /> Players</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage player database and view stats</p>
        </div>
        <Button onClick={() => { setForm({ name: "", role: "batsman", jerseyNumber: "", phone: "", photoUrl: "", team: "" }); setShowCreate(true); }} disabled={!selectedLeague} className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:opacity-90">
          <Plus className="w-4 h-4 mr-2" /> Add Player
        </Button>
      </motion.div>

      <motion.div variants={item} className="flex flex-col sm:flex-row gap-3">
        {user?.role === "superAdmin" && (
          <Select value={selectedLeague || ""} onValueChange={setSelectedLeague}>
            <SelectTrigger className="w-full sm:w-[260px]"><SelectValue placeholder="Select a league" /></SelectTrigger>
            <SelectContent>{leagues.map((l) => <SelectItem key={l._id || l.id} value={l._id || l.id}>{l.name}</SelectItem>)}</SelectContent>
          </Select>
        )}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search players..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
      </motion.div>

      <motion.div variants={item}>
        <Card>
          <CardContent className="p-0">
            {leagueLoading || loading ? (
              <div className="p-6 space-y-3">{[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-12 w-full rounded-lg" />)}</div>
            ) : !selectedLeague ? (
              <div className="text-center py-16 text-muted-foreground"><Shield className="w-12 h-12 mx-auto mb-3 opacity-20" /><p className="font-medium">Select a league</p></div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground"><UserCircle className="w-12 h-12 mx-auto mb-3 opacity-20" /><p className="font-medium">No players found</p></div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Player</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Team</TableHead>
                    <TableHead>Jersey</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((p) => (
                    <TableRow key={p._id || p.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center text-xs font-bold text-blue-600">
                            {p.photoUrl ? <img src={p.photoUrl} alt="" className="w-9 h-9 rounded-full object-cover" /> : (p.name || "?")[0]}
                          </div>
                          <div>
                            <p className="font-medium text-sm">{p.name}</p>
                            {p.phone && <p className="text-xs text-muted-foreground">{p.phone}</p>}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={`capitalize text-xs ${getRoleBadge(p.role)}`}>{p.role || "—"}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{p.team?.name || "Unassigned"}</TableCell>
                      <TableCell><Badge variant="outline" className="font-mono text-xs">#{p.jerseyNumber || "—"}</Badge></TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="w-4 h-4" /></Button></DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openStats(p)}><BarChart3 className="w-4 h-4 mr-2" /> Stats</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openEdit(p)}><Pencil className="w-4 h-4 mr-2" /> Edit</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => { setSelected(p); setShowDelete(true); }} className="text-destructive focus:text-destructive"><Trash2 className="w-4 h-4 mr-2" /> Delete</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Create */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Player</DialogTitle><DialogDescription>Add a new player to the league</DialogDescription></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Name</Label><Input placeholder="Player name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
              <div className="space-y-2">
                <Label>Role</Label>
                <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{PLAYER_ROLES.map((r) => <SelectItem key={r} value={r} className="capitalize">{r}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Jersey #</Label><Input placeholder="10" value={form.jerseyNumber} onChange={(e) => setForm({ ...form, jerseyNumber: e.target.value })} /></div>
              <div className="space-y-2"><Label>Phone</Label><Input placeholder="+91..." value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
            </div>
            <div className="space-y-2">
              <Label>Team (optional)</Label>
              <Select value={form.team} onValueChange={(v) => setForm({ ...form, team: v })}>
                <SelectTrigger><SelectValue placeholder="Select team" /></SelectTrigger>
                <SelectContent>{teams.map((t) => <SelectItem key={t._id || t.id} value={t._id || t.id}>{t.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Player Photo</Label>
              <ImageUpload
                value={form.photoUrl}
                onChange={(fileOrUrl) => setForm({ ...form, photoUrl: fileOrUrl })}
                label={null}
                aspectHint="1:1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={submitting} className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white">{submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Add Player</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit */}
      <Dialog open={showEdit} onOpenChange={setShowEdit}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Player</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
              <div className="space-y-2"><Label>Role</Label><Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{PLAYER_ROLES.map((r) => <SelectItem key={r} value={r} className="capitalize">{r}</SelectItem>)}</SelectContent></Select></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Jersey #</Label><Input value={form.jerseyNumber} onChange={(e) => setForm({ ...form, jerseyNumber: e.target.value })} /></div>
              <div className="space-y-2"><Label>Phone</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
            </div>
            <div className="space-y-2">
              <Label>Player Photo</Label>
              <ImageUpload
                value={form.photoUrl}
                onChange={(fileOrUrl) => setForm({ ...form, photoUrl: fileOrUrl })}
                label={null}
                aspectHint="1:1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEdit(false)}>Cancel</Button>
            <Button onClick={handleEdit} disabled={submitting}>{submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete */}
      <Dialog open={showDelete} onOpenChange={setShowDelete}>
        <DialogContent>
          <DialogHeader><DialogTitle>Delete Player</DialogTitle><DialogDescription>Delete <strong>{selected?.name}</strong>? This cannot be undone.</DialogDescription></DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDelete(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={submitting}>{submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Stats Dialog */}
      <Dialog open={showStats} onOpenChange={setShowStats}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><BarChart3 className="w-5 h-5 text-blue-500" /> {selected?.name} — Stats</DialogTitle></DialogHeader>
          {statsLoading ? (
            <div className="space-y-3 py-4">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-8 w-full" />)}</div>
          ) : !stats ? (
            <p className="text-sm text-muted-foreground text-center py-8">No stats available for this player</p>
          ) : (
            <div className="grid grid-cols-2 gap-4 py-4">
              {[
                { label: "Matches", value: stats.matches || 0 },
                { label: "Runs", value: stats.runs || 0 },
                { label: "Batting Avg", value: stats.battingAverage?.toFixed(2) || "0.00" },
                { label: "Strike Rate", value: stats.strikeRate?.toFixed(2) || "0.00" },
                { label: "Wickets", value: stats.wickets || 0 },
                { label: "Bowl Avg", value: stats.bowlingAverage?.toFixed(2) || "0.00" },
                { label: "50s", value: stats.fifties || 0 },
                { label: "100s", value: stats.hundreds || 0 },
              ].map((s) => (
                <div key={s.label} className="p-3 rounded-lg bg-secondary/30 text-center">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">{s.label}</p>
                  <p className="text-xl font-bold text-foreground mt-1">{s.value}</p>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
