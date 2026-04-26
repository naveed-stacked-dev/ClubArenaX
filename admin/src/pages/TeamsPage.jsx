import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppContext } from "@/hooks/useAppContext";
import leagueService from "@/services/leagueService";
import teamService from "@/services/teamService";
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
import { Users, Plus, MoreHorizontal, Pencil, Trash2, Loader2, Search, UserPlus, Shield, ChevronRight } from "lucide-react";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

export default function TeamsPage() {
  const { user } = useAppContext();
  const [leagues, setLeagues] = useState([]);
  const [selectedLeague, setSelectedLeague] = useState(null);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [leagueLoading, setLeagueLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Modal
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showRoster, setShowRoster] = useState(false);
  const [selected, setSelected] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: "", logoUrl: "" });
  const [roster, setRoster] = useState([]);
  const [rosterLoading, setRosterLoading] = useState(false);
  const [addPlayerForm, setAddPlayerForm] = useState({ playerId: "" });

  // Fetch leagues for drill-down
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

  // Fetch teams for selected league
  const fetchTeams = useCallback(async () => {
    if (!selectedLeague) return;
    setLoading(true);
    try {
      const res = await teamService.getByLeague(selectedLeague);
      const data = res.data?.data || res.data?.teams || res.data || [];
      setTeams(Array.isArray(data) ? data : []);
    } catch { /* interceptor */ }
    finally { setLoading(false); }
  }, [selectedLeague]);

  useEffect(() => { fetchTeams(); }, [fetchTeams]);

  const fetchRoster = async (team) => {
    setSelected(team);
    setShowRoster(true);
    setRosterLoading(true);
    try {
      const res = await teamService.getPlayers(team._id || team.id);
      setRoster(res.data?.data || res.data?.players || res.data || []);
    } catch { /* interceptor */ }
    finally { setRosterLoading(false); }
  };

  const handleCreate = async () => {
    if (!form.name.trim()) return toast.error("Team name is required");
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("leagueId", selectedLeague);
      if (form.logoUrl instanceof File) {
        formData.append("logo", form.logoUrl);
      } else if (form.logoUrl) {
        formData.append("logo", form.logoUrl);
      }

      await teamService.create(formData);
      toast.success("Team created");
      setShowCreate(false);
      setForm({ name: "", logoUrl: "" });
      fetchTeams();
    } catch { /* interceptor */ } finally { setSubmitting(false); }
  };



  const handleEdit = async () => {
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("name", form.name);
      if (form.logoUrl instanceof File) {
        formData.append("logo", form.logoUrl);
      } else if (form.logoUrl) {
        formData.append("logo", form.logoUrl);
      }

      await teamService.update(selected._id || selected.id, formData);
      toast.success("Team updated");
      setShowEdit(false);
      fetchTeams();
    } catch { /* interceptor */ } finally { setSubmitting(false); }
  };

  const handleDelete = async () => {
    setSubmitting(true);
    try {
      await teamService.remove(selected._id || selected.id);
      toast.success("Team deleted");
      setShowDelete(false);
      fetchTeams();
    } catch { /* interceptor */ } finally { setSubmitting(false); }
  };

  const handleAddPlayer = async () => {
    if (!addPlayerForm.playerId.trim()) return toast.error("Player ID required");
    setSubmitting(true);
    try {
      await teamService.addPlayer(selected._id || selected.id, { playerId: addPlayerForm.playerId });
      toast.success("Player added to roster");
      setAddPlayerForm({ playerId: "" });
      fetchRoster(selected);
    } catch { /* interceptor */ } finally { setSubmitting(false); }
  };

  const openEdit = (team) => { setSelected(team); setForm({ name: team.name || "", logoUrl: team.logoUrl || "" }); setShowEdit(true); };
  const openDelete = (team) => { setSelected(team); setShowDelete(true); };

  const filtered = teams.filter((t) => (t.name || "").toLowerCase().includes(search.toLowerCase()));

  const currentLeagueName = leagues.find((l) => (l._id || l.id) === selectedLeague)?.name || "Select league";

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      {/* Header */}
      <motion.div variants={item} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Users className="w-6 h-6 text-emerald-500" /> Teams
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Manage team rosters within your leagues</p>
        </div>
        <Button onClick={() => { setForm({ name: "", logoUrl: "" }); setShowCreate(true); }} disabled={!selectedLeague} className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:opacity-90">
          <Plus className="w-4 h-4 mr-2" /> Create Team
        </Button>
      </motion.div>

      {/* League Selector + Search */}
      <motion.div variants={item} className="flex flex-col sm:flex-row gap-3">
        {user?.role === "superadmin" && (
          <Select value={selectedLeague || ""} onValueChange={setSelectedLeague}>
            <SelectTrigger className="w-full sm:w-[260px]">
              <SelectValue placeholder="Select a league" />
            </SelectTrigger>
            <SelectContent>
              {leagues.map((l) => (
                <SelectItem key={l._id || l.id} value={l._id || l.id}>{l.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search teams..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
      </motion.div>

      {/* Teams Table */}
      <motion.div variants={item}>
        <Card>
          <CardContent className="p-0">
            {leagueLoading || loading ? (
              <div className="p-6 space-y-3">
                {[1, 2, 3].map((i) => <Skeleton key={i} className="h-12 w-full rounded-lg" />)}
              </div>
            ) : !selectedLeague ? (
              <div className="text-center py-16 text-muted-foreground">
                <Shield className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p className="font-medium">Select a league</p>
                <p className="text-xs mt-1">Choose a league from the dropdown to view its teams</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <Users className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p className="font-medium">No teams found</p>
                <p className="text-xs mt-1">{search ? "Try different search" : "Create the first team for this league"}</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Team</TableHead>
                    <TableHead>Players</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((team) => (
                    <TableRow key={team._id || team.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center">
                            {team.logoUrl ? <img src={team.logoUrl} alt="" className="w-6 h-6 rounded object-cover" /> : <Shield className="w-4 h-4 text-emerald-500" />}
                          </div>
                          <span className="font-medium">{team.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <button onClick={() => fetchRoster(team)} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                          <Users className="w-3.5 h-3.5" />
                          {team.players?.length || team.playerCount || 0} players
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {team.createdAt ? new Date(team.createdAt).toLocaleDateString() : "—"}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="w-4 h-4" /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEdit(team)}><Pencil className="w-4 h-4 mr-2" /> Edit</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => fetchRoster(team)}><Users className="w-4 h-4 mr-2" /> View Roster</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openDelete(team)} className="text-destructive focus:text-destructive"><Trash2 className="w-4 h-4 mr-2" /> Delete</DropdownMenuItem>
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
          <DialogHeader><DialogTitle>Create Team</DialogTitle><DialogDescription>Add a new team to {currentLeagueName}</DialogDescription></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2"><Label>Team Name</Label><Input placeholder="e.g. Thunder Kings" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div className="space-y-2">
              <Label>Team Logo</Label>
              <ImageUpload
                value={form.logoUrl}
                onChange={(fileOrUrl) => setForm({ ...form, logoUrl: fileOrUrl })}
                label={null}
                aspectHint="1:1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={submitting} className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white">{submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit */}
      <Dialog open={showEdit} onOpenChange={setShowEdit}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Team</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2"><Label>Team Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div className="space-y-2">
              <Label>Team Logo</Label>
              <ImageUpload
                value={form.logoUrl}
                onChange={(fileOrUrl) => setForm({ ...form, logoUrl: fileOrUrl })}
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
          <DialogHeader><DialogTitle>Delete Team</DialogTitle><DialogDescription>Are you sure you want to delete <strong>{selected?.name}</strong>?</DialogDescription></DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDelete(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={submitting}>{submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Roster Drawer */}
      <Dialog open={showRoster} onOpenChange={setShowRoster}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Users className="w-5 h-5 text-emerald-500" /> {selected?.name} — Roster</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {rosterLoading ? (
              <div className="space-y-2">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-10 w-full" />)}</div>
            ) : roster.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No players in this roster yet</p>
            ) : (
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {roster.map((p) => (
                  <div key={p._id || p.id} className="flex items-center justify-between p-2.5 rounded-lg bg-secondary/30">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center text-xs font-bold text-emerald-600">
                        {(p.name || "?")[0]}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{p.name}</p>
                        <p className="text-xs text-muted-foreground capitalize">{p.role || "Player"}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">#{p.jerseyNumber || "—"}</Badge>
                  </div>
                ))}
              </div>
            )}
            {/* Add player */}
            <div className="flex gap-2 pt-2 border-t border-border">
              <Input placeholder="Player ID" value={addPlayerForm.playerId} onChange={(e) => setAddPlayerForm({ playerId: e.target.value })} className="flex-1" />
              <Button size="sm" onClick={handleAddPlayer} disabled={submitting}>
                <UserPlus className="w-4 h-4 mr-1" /> Add
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
