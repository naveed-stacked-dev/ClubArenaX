import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppContext } from "@/hooks/useAppContext";
import leagueService from "@/services/leagueService";
import authService from "@/services/authService";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Trophy,
  Plus,
  MoreHorizontal,
  Pencil,
  Trash2,
  UserPlus,
  Loader2,
  Search,
  Globe,
  KeyRound,
} from "lucide-react";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

export default function LeaguesPage() {
  const { isSuperAdmin } = useAppContext();
  const [leagues, setLeagues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Modal states
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showAssign, setShowAssign] = useState(false);
  const [selected, setSelected] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form
  const [form, setForm] = useState({ name: "", slug: "", sportType: "cricket", logoUrl: "" });
  const [assignForm, setAssignForm] = useState({ email: "", password: "", name: "" });

  const fetchLeagues = useCallback(async () => {
    try {
      const res = await leagueService.adminGetAll();
      const data = res.data?.data || res.data?.leagues || res.data || [];
      setLeagues(Array.isArray(data) ? data : []);
    } catch {
      // handled by interceptor
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchLeagues(); }, [fetchLeagues]);

  const resetForm = () => setForm({ name: "", slug: "", sportType: "cricket", logoUrl: "" });

  const handleCreate = async () => {
    if (!form.name.trim()) return toast.error("League name is required");
    setSubmitting(true);
    try {
      await leagueService.adminCreate(form);
      toast.success("League created successfully");
      setShowCreate(false);
      resetForm();
      fetchLeagues();
    } catch { /* interceptor */ } finally { setSubmitting(false); }
  };

  const handleEdit = async () => {
    setSubmitting(true);
    try {
      await leagueService.update(selected._id || selected.id, form);
      toast.success("League updated");
      setShowEdit(false);
      fetchLeagues();
    } catch { /* interceptor */ } finally { setSubmitting(false); }
  };

  const handleDelete = async () => {
    setSubmitting(true);
    try {
      await leagueService.remove(selected._id || selected.id);
      toast.success("League deleted");
      setShowDelete(false);
      fetchLeagues();
    } catch { /* interceptor */ } finally { setSubmitting(false); }
  };

  const handleAssignManager = async () => {
    if (!assignForm.email.trim()) return toast.error("Manager email is required");
    setSubmitting(true);
    try {
      await leagueService.assignManager(selected._id || selected.id, assignForm);
      toast.success("Manager assigned successfully");
      setShowAssign(false);
      setAssignForm({ email: "", password: "", name: "" });
      fetchLeagues();
    } catch { /* interceptor */ } finally { setSubmitting(false); }
  };

  const openEdit = (league) => {
    setSelected(league);
    setForm({ name: league.name || "", slug: league.slug || "", sportType: league.sportType || "cricket", logoUrl: league.logoUrl || "" });
    setShowEdit(true);
  };

  const openDelete = (league) => { setSelected(league); setShowDelete(true); };
  const openAssign = (league) => { setSelected(league); setAssignForm({ email: "", password: "", name: "" }); setShowAssign(true); };

  const filtered = leagues.filter((l) =>
    (l.name || "").toLowerCase().includes(search.toLowerCase()) ||
    (l.slug || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      {/* Header */}
      <motion.div variants={item} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Trophy className="w-6 h-6 text-violet-500" /> Leagues
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Manage all cricket leagues across the platform</p>
        </div>
        <Button onClick={() => { resetForm(); setShowCreate(true); }} className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:opacity-90">
          <Plus className="w-4 h-4 mr-2" /> Create League
        </Button>
      </motion.div>

      {/* Search */}
      <motion.div variants={item}>
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search leagues..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
      </motion.div>

      {/* Table */}
      <motion.div variants={item}>
        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-6 space-y-3">
                {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-12 w-full rounded-lg" />)}
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <Trophy className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p className="font-medium">No leagues found</p>
                <p className="text-xs mt-1">{search ? "Try a different search term" : "Create your first league to get started"}</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>League</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead>Sport</TableHead>
                    <TableHead>Manager</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence>
                    {filtered.map((league) => (
                      <motion.tr
                        key={league._id || league.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="border-b transition-colors hover:bg-muted/50"
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-violet-500/20 to-indigo-500/20 flex items-center justify-center">
                              {league.logoUrl ? (
                                <img src={league.logoUrl} alt="" className="w-6 h-6 rounded object-cover" />
                              ) : (
                                <Trophy className="w-4 h-4 text-violet-500" />
                              )}
                            </div>
                            <span className="font-medium text-foreground">{league.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="font-mono text-xs">
                            <Globe className="w-3 h-3 mr-1" />{league.slug || "—"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground capitalize">{league.sportType || "cricket"}</TableCell>
                        <TableCell>
                          {league.manager?.name || league.manager?.email ? (
                            <Badge variant="outline" className="text-xs">{league.manager?.name || league.manager?.email}</Badge>
                          ) : (
                            <span className="text-xs text-muted-foreground">Unassigned</span>
                          )}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {league.createdAt ? new Date(league.createdAt).toLocaleDateString() : "—"}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => openEdit(league)}>
                                <Pencil className="w-4 h-4 mr-2" /> Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => openAssign(league)}>
                                <UserPlus className="w-4 h-4 mr-2" /> Assign Manager
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => openDelete(league)} className="text-destructive focus:text-destructive">
                                <Trash2 className="w-4 h-4 mr-2" /> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Create Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create League</DialogTitle>
            <DialogDescription>Add a new cricket league to the platform</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>League Name</Label>
              <Input placeholder="e.g. Premier Cricket League" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Slug</Label>
              <Input placeholder="e.g. premier-cricket-league" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Logo URL (optional)</Label>
              <Input placeholder="https://..." value={form.logoUrl} onChange={(e) => setForm({ ...form, logoUrl: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={submitting} className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white">
              {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={showEdit} onOpenChange={setShowEdit}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit League</DialogTitle>
            <DialogDescription>Update league details</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>League Name</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Slug</Label>
              <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Logo URL</Label>
              <Input value={form.logoUrl} onChange={(e) => setForm({ ...form, logoUrl: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEdit(false)}>Cancel</Button>
            <Button onClick={handleEdit} disabled={submitting}>
              {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <Dialog open={showDelete} onOpenChange={setShowDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete League</DialogTitle>
            <DialogDescription>Are you sure you want to delete <strong>{selected?.name}</strong>? This action cannot be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDelete(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={submitting}>
              {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Manager Dialog */}
      <Dialog open={showAssign} onOpenChange={setShowAssign}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-violet-500" /> Assign Manager
            </DialogTitle>
            <DialogDescription>Assign a Club Manager to <strong>{selected?.name}</strong></DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Manager Name</Label>
              <Input placeholder="Full name" value={assignForm.name} onChange={(e) => setAssignForm({ ...assignForm, name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Manager Email</Label>
              <Input type="email" placeholder="manager@example.com" value={assignForm.email} onChange={(e) => setAssignForm({ ...assignForm, email: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-1"><KeyRound className="w-3 h-3" /> Password</Label>
              <PasswordInput placeholder="Set initial password" value={assignForm.password} onChange={(e) => setAssignForm({ ...assignForm, password: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAssign(false)}>Cancel</Button>
            <Button onClick={handleAssignManager} disabled={submitting} className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white">
              {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Assign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
