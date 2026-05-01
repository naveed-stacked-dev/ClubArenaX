import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAppContext } from "@/hooks/useAppContext";
import clubService from "@/services/clubService";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Settings, Loader2, Paintbrush } from "lucide-react";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

export default function SettingsPage() {
  const { user } = useAppContext();
  const [clubs, setClubs] = useState([]);
  const [selectedClub, setSelectedClub] = useState(null);
  
  const [submitting, setSubmitting] = useState(false);
  const [theme, setTheme] = useState({ primaryColor: "#4f46e5", secondaryColor: "#10b981", bannerUrl: "" });

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await clubService.adminGetAll();
        const data = res.data?.data || res.data?.clubs || res.data || [];
        setClubs(Array.isArray(data) ? data : []);
        if (data.length > 0) {
          const l = data[0];
          setSelectedClub(l._id || l.id);
          if (l.theme) {
            setTheme({
              primaryColor: l.theme.primaryColor || "#4f46e5",
              secondaryColor: l.theme.secondaryColor || "#10b981",
              bannerUrl: l.theme.bannerUrl || ""
            });
          }
        }
      } catch { /* interceptor */ }
    };
    if (user?.role === "superadmin") {
      fetch();
    }
  }, [user]);

  const handleClubChange = (id) => {
    setSelectedClub(id);
    const l = clubs.find((lg) => (lg._id || lg.id) === id);
    if (l && l.theme) {
      setTheme({
        primaryColor: l.theme.primaryColor || "#4f46e5",
        secondaryColor: l.theme.secondaryColor || "#10b981",
        bannerUrl: l.theme.bannerUrl || ""
      });
    } else {
      setTheme({ primaryColor: "#4f46e5", secondaryColor: "#10b981", bannerUrl: "" });
    }
  };

  const handleSave = async () => {
    if (!selectedClub) return;
    setSubmitting(true);
    try {
      await clubService.updateTheme(selectedClub, { theme });
      toast.success("Club theme settings updated");
    } catch { /* interceptor */ }
    finally { setSubmitting(false); }
  };

  if (user?.role !== "superadmin") {
    return <div className="p-8 text-center text-muted-foreground">Access denied. SuperAdmin only.</div>;
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6 max-w-2xl mx-auto">
      <motion.div variants={item}>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2"><Settings className="w-6 h-6 text-slate-500" /> Platform Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Configure global platform settings and club themes</p>
      </motion.div>

      <motion.div variants={item}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Paintbrush className="w-4 h-4 text-primary" /> Club Theming</CardTitle>
            <CardDescription>Customize the public frontend appearance for a specific club.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Target Club</Label>
              <Select value={selectedClub || ""} onValueChange={handleClubChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a club to customize" />
                </SelectTrigger>
                <SelectContent>
                  {clubs.map((l) => <SelectItem key={l._id || l.id} value={l._id || l.id}>{l.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4 border-t border-border pt-4">
              <div className="space-y-2">
                <Label>Primary Brand Color</Label>
                <div className="flex gap-2">
                  <Input type="color" value={theme.primaryColor} onChange={(e) => setTheme({ ...theme, primaryColor: e.target.value })} className="w-12 h-10 p-1 cursor-pointer" />
                  <Input type="text" value={theme.primaryColor} onChange={(e) => setTheme({ ...theme, primaryColor: e.target.value })} className="flex-1 font-mono uppercase" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Secondary Accent Color</Label>
                <div className="flex gap-2">
                  <Input type="color" value={theme.secondaryColor} onChange={(e) => setTheme({ ...theme, secondaryColor: e.target.value })} className="w-12 h-10 p-1 cursor-pointer" />
                  <Input type="text" value={theme.secondaryColor} onChange={(e) => setTheme({ ...theme, secondaryColor: e.target.value })} className="flex-1 font-mono uppercase" />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Public Banner Image URL</Label>
              <Input placeholder="https://example.com/banner.jpg" value={theme.bannerUrl} onChange={(e) => setTheme({ ...theme, bannerUrl: e.target.value })} />
              <p className="text-xs text-muted-foreground mt-1">This image will appear at the top of the public club hub page.</p>
            </div>

            <div className="flex justify-end pt-4 border-t border-border">
              <Button onClick={handleSave} disabled={submitting || !selectedClub}>
                {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Save Theme Settings
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
