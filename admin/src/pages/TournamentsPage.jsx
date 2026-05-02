import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppContext } from "@/hooks/useAppContext";
import clubService from "@/services/clubService";
import tournamentService from "@/services/tournamentService";
import teamService from "@/services/teamService";
import { toast } from "sonner";
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
import { Swords, Plus, MoreHorizontal, Pencil, CalendarDays, Loader2, Search, Shield, ListOrdered } from "lucide-react";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

const FORMATS = ["league", "knockout"];
const STATUSES = ["draft", "upcoming", "ongoing", "completed", "cancelled"];

export default function TournamentsPage() {
  const { user, clubId: contextClubId, themeColor } = useAppContext();
  const [clubs, setClubs] = useState([]);
  const [selectedClub, setSelectedClub] = useState(null);
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [clubLoading, setClubLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showPointsTable, setShowPointsTable] = useState(false);
  const [selected, setSelected] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [pointsTable, setPointsTable] = useState([]);
  const [pointsLoading, setPointsLoading] = useState(false);
  const [clubTeams, setClubTeams] = useState([]);

  const [form, setForm] = useState({ name: "", type: "league", startDate: "", endDate: "", settings: { oversPerInning: 20 }, teams: [] });

  useEffect(() => {
    const fetch = async () => {
      try {
        if (user?.role === "superAdmin" || user?.role === "superadmin") {
          const res = await clubService.adminGetAll();
          const data = res.data?.data || res.data?.clubs || res.data || [];
          setClubs(Array.isArray(data) ? data : []);
          setSelectedClub("all");
        } else {
          if (contextClubId) setSelectedClub(contextClubId);
        }
      } catch { /* interceptor */ }
      finally { setClubLoading(false); }
    };
    fetch();
  }, [user, contextClubId]);

  const fetchTournaments = useCallback(async () => {
    if (!selectedClub) return;
    setLoading(true);
    try {
      let res;
      if (selectedClub === "all") {
        res = await tournamentService.getAll();
      } else {
        res = await tournamentService.getByClub(selectedClub);
      }
      const data = res.data?.data || res.data?.tournaments || res.data || [];
      setTournaments(Array.isArray(data) ? data : []);
    } catch { /* interceptor */ }
    finally { setLoading(false); }
  }, [selectedClub]);

  useEffect(() => { fetchTournaments(); }, [fetchTournaments]);

  const fetchTeams = useCallback(async () => {
    if (!selectedClub || selectedClub === "all") return;
    try {
      const res = await teamService.getByClub(selectedClub);
      const data = res.data?.data || res.data || [];
      setClubTeams(Array.isArray(data) ? data : []);
    } catch { /* interceptor */ }
  }, [selectedClub]);

  useEffect(() => { fetchTeams(); }, [fetchTeams]);

  const handleCreate = async () => {
    if (!form.name.trim()) return toast.error("Tournament name required");
    setSubmitting(true);
    try {
      await tournamentService.create({ ...form, clubId: selectedClub });
      toast.success("Tournament created");
      setShowCreate(false);
      setForm({ name: "", type: "league", startDate: "", endDate: "", settings: { oversPerInning: 20 }, teams: [] });
      fetchTournaments();
    } catch { /* interceptor */ } finally { setSubmitting(false); }
  };

  const handleEdit = async () => {
    setSubmitting(true);
    try {
      await tournamentService.update(selected._id || selected.id, form);
      toast.success("Tournament updated");
      setShowEdit(false);
      fetchTournaments();
    } catch { /* interceptor */ } finally { setSubmitting(false); }
  };

  const handleGenerateFixtures = async (tournament) => {
    try {
      await tournamentService.generateFixtures(tournament._id || tournament.id, {});
      toast.success("Fixtures generated successfully");
      fetchTournaments();
    } catch { /* interceptor */ }
  };

  const openPointsTable = async (tournament) => {
    setSelected(tournament);
    setShowPointsTable(true);
    setPointsLoading(true);
    try {
      const res = await tournamentService.getPointsTable(tournament._id || tournament.id);
      setPointsTable(res.data?.data || res.data || []);
    } catch { setPointsTable([]); }
    finally { setPointsLoading(false); }
  };

  const openEdit = (t) => {
    setSelected(t);
    setForm({
      name: t.name || "",
      type: t.type || "league",
      startDate: t.startDate ? new Date(t.startDate).toISOString().split('T')[0] : "",
      endDate: t.endDate ? new Date(t.endDate).toISOString().split('T')[0] : "",
      settings: { oversPerInning: t.settings?.oversPerInning || 20 },
      teams: t.teams ? t.teams.map(tm => tm._id || tm) : []
    });
    setShowEdit(true);
  };

  const filtered = tournaments.filter((t) => (t.name || "").toLowerCase().includes(search.toLowerCase()));

  const getStatusBadge = (status) => {
    if (status === "ongoing") return <Badge variant="destructive" className="animate-pulse">Ongoing</Badge>;
    if (status === "completed") return <Badge variant="success" className="bg-green-500 hover:bg-green-600 text-white">Completed</Badge>;
    if (status === "cancelled") return <Badge variant="secondary" className="bg-gray-500 text-white">Cancelled</Badge>;
    if (status === "draft") return <Badge variant="outline">Draft</Badge>;
    return <Badge variant="secondary" className="bg-blue-500 hover:bg-blue-600 text-white">Upcoming</Badge>;
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2"><Swords className="w-6 h-6" style={{ color: themeColor }} /> Tournaments</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage tournaments, formats, and fixtures</p>
        </div>
        <Button onClick={() => { setForm({ name: "", type: "league", startDate: "", endDate: "", settings: { oversPerInning: 20 }, teams: [] }); setShowCreate(true); }} disabled={!selectedClub || selectedClub === "all"} style={{ backgroundColor: themeColor, color: '#fff' }}>
          <Plus className="w-4 h-4 mr-2" /> Create Tournament
        </Button>
      </motion.div>

      <motion.div variants={item} className="flex flex-col sm:flex-row gap-3">
        {(user?.role === "superAdmin" || user?.role === "superadmin") && (
          <Select value={selectedClub || ""} onValueChange={setSelectedClub}>
            <SelectTrigger className="w-full sm:w-[260px]"><SelectValue placeholder="Select a club" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Clubs</SelectItem>
              {clubs.map((l) => <SelectItem key={l._id || l.id} value={l._id || l.id}>{l.name}</SelectItem>)}
            </SelectContent>
          </Select>
        )}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search tournaments..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
      </motion.div>

      <motion.div variants={item}>
        <Card>
          <CardContent className="p-0">
            {clubLoading || loading ? (
              <div className="p-6 space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-12 w-full rounded-lg" />)}</div>
            ) : !selectedClub ? (
              <div className="text-center py-16 text-muted-foreground"><Shield className="w-12 h-12 mx-auto mb-3 opacity-20" /><p className="font-medium">Select a club</p></div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground"><Swords className="w-12 h-12 mx-auto mb-3 opacity-20" /><p className="font-medium">No tournaments found</p></div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tournament</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Dates</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((t) => (
                    <TableRow key={t._id || t.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${themeColor}20` }}>
                            <Swords className="w-4 h-4" style={{ color: themeColor }} />
                          </div>
                          <span className="font-medium text-sm">{t.name}</span>
                        </div>
                      </TableCell>
                      <TableCell><Badge variant="outline" className="capitalize text-xs">{t.type}</Badge></TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {t.startDate ? new Date(t.startDate).toLocaleDateString() : "?"} - {t.endDate ? new Date(t.endDate).toLocaleDateString() : "?"}
                      </TableCell>
                      <TableCell>{getStatusBadge(t.status || "upcoming")}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="w-4 h-4" /></Button></DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openPointsTable(t)}><ListOrdered className="w-4 h-4 mr-2" /> Points Table</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleGenerateFixtures(t)}><CalendarDays className="w-4 h-4 mr-2" /> Auto-Generate Fixtures</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openEdit(t)}><Pencil className="w-4 h-4 mr-2" /> Edit</DropdownMenuItem>
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
          <DialogHeader><DialogTitle>Create Tournament</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2"><Label>Name</Label><Input placeholder="Tournament Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{FORMATS.map((f) => <SelectItem key={f} value={f} className="capitalize">{f}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Start Date</Label><Input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} /></div>
              <div className="space-y-2"><Label>End Date</Label><Input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} /></div>
            </div>
            <div className="space-y-2">
              <Label>Overs per Inning</Label>
              <Input type="number" min="1" value={form.settings?.oversPerInning || 20} onChange={(e) => setForm({ ...form, settings: { ...form.settings, oversPerInning: parseInt(e.target.value) || 20 } })} />
            </div>
            {clubTeams.length > 0 && (
              <div className="space-y-2">
                <Label>Participating Teams</Label>
                <div className="border rounded-md p-3 max-h-[150px] overflow-y-auto grid grid-cols-2 gap-2">
                  {clubTeams.map(t => (
                    <label key={t._id || t.id} className="flex items-center space-x-2 text-sm">
                      <input
                        type="checkbox"
                        checked={form.teams.includes(t._id || t.id)}
                        onChange={(e) => {
                          const id = t._id || t.id;
                          if (e.target.checked) setForm({ ...form, teams: [...form.teams, id] });
                          else setForm({ ...form, teams: form.teams.filter(x => x !== id) });
                        }}
                        className="rounded border-gray-300 text-amber-500 focus:ring-amber-500"
                      />
                      <span>{t.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={submitting} style={{ backgroundColor: themeColor, color: '#fff' }}>{submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit */}
      <Dialog open={showEdit} onOpenChange={setShowEdit}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Tournament</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2"><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{FORMATS.map((f) => <SelectItem key={f} value={f} className="capitalize">{f}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Start Date</Label><Input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} /></div>
              <div className="space-y-2"><Label>End Date</Label><Input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} /></div>
            </div>
            <div className="space-y-2">
              <Label>Overs per Inning</Label>
              <Input type="number" min="1" value={form.settings?.oversPerInning || 20} onChange={(e) => setForm({ ...form, settings: { ...form.settings, oversPerInning: parseInt(e.target.value) || 20 } })} />
            </div>
            {clubTeams.length > 0 && (
              <div className="space-y-2">
                <Label>Participating Teams</Label>
                <div className="border rounded-md p-3 max-h-[150px] overflow-y-auto grid grid-cols-2 gap-2">
                  {clubTeams.map(t => (
                    <label key={t._id || t.id} className="flex items-center space-x-2 text-sm">
                      <input
                        type="checkbox"
                        checked={form.teams.includes(t._id || t.id)}
                        onChange={(e) => {
                          const id = t._id || t.id;
                          if (e.target.checked) setForm({ ...form, teams: [...form.teams, id] });
                          else setForm({ ...form, teams: form.teams.filter(x => x !== id) });
                        }}
                        className="rounded border-gray-300 text-amber-500 focus:ring-amber-500"
                      />
                      <span>{t.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEdit(false)}>Cancel</Button>
            <Button onClick={handleEdit} disabled={submitting}>{submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Points Table Dialog */}
      <Dialog open={showPointsTable} onOpenChange={setShowPointsTable}>
        <DialogContent className="max-w-3xl">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><ListOrdered className="w-5 h-5" style={{ color: themeColor }} /> {selected?.name} — Points Table</DialogTitle></DialogHeader>
          {pointsLoading ? (
             <div className="space-y-3 py-4">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-10 w-full" />)}</div>
          ) : pointsTable.length === 0 ? (
             <p className="text-sm text-muted-foreground text-center py-8">No points table data available.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">Pos</TableHead>
                  <TableHead>Team</TableHead>
                  <TableHead className="text-center">P</TableHead>
                  <TableHead className="text-center">W</TableHead>
                  <TableHead className="text-center">L</TableHead>
                  <TableHead className="text-center">NR</TableHead>
                  <TableHead className="text-center">NRR</TableHead>
                  <TableHead className="text-right">Pts</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pointsTable.map((row, idx) => (
                  <TableRow key={row.teamId || idx}>
                    <TableCell className="font-medium">{idx + 1}</TableCell>
                    <TableCell className="font-medium">{row.teamName || 'Unknown Team'}</TableCell>
                    <TableCell className="text-center">{row.played || 0}</TableCell>
                    <TableCell className="text-center text-success">{row.won || 0}</TableCell>
                    <TableCell className="text-center text-destructive">{row.lost || 0}</TableCell>
                    <TableCell className="text-center">{row.noResult || 0}</TableCell>
                    <TableCell className="text-center font-mono text-xs">{row.nrr ? row.nrr.toFixed(3) : "0.000"}</TableCell>
                    <TableCell className="text-right font-bold" style={{ color: themeColor }}>{row.points || 0}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
