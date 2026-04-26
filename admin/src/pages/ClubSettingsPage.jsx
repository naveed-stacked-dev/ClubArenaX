import { useState } from "react";
import { motion } from "framer-motion";
import { useAppContext } from "@/hooks/useAppContext";
import leagueService from "@/services/leagueService";
import ImageUpload from "@/components/ImageUpload";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Settings, Palette, ImageIcon, Loader2, CheckCircle2, Trophy } from "lucide-react";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

const PRESET_COLORS = [
  "#7c3aed", "#6366f1", "#3b82f6", "#06b6d4", "#14b8a6",
  "#10b981", "#22c55e", "#eab308", "#f59e0b", "#ef4444",
  "#ec4899", "#f43f5e", "#8b5cf6", "#0ea5e9", "#64748b",
];

export default function ClubSettingsPage() {
  const {
    leagueId, themeColor, updateThemeColor,
    clubName, clubLogo, clubBanner, loadClubData,
  } = useAppContext();

  const [color, setColor] = useState(themeColor || "#7c3aed");
  const [logo, setLogo] = useState(clubLogo);
  const [banner, setBanner] = useState(clubBanner);
  const [savingTheme, setSavingTheme] = useState(false);
  const [savingLogo, setSavingLogo] = useState(false);
  const [savingBanner, setSavingBanner] = useState(false);

  // Live preview as user picks colors
  const handleColorChange = (newColor) => {
    setColor(newColor);
    updateThemeColor(newColor); // Live preview via CSS custom property
  };

  const handleSaveAll = async () => {
    if (!leagueId) return;
    setSavingTheme(true);
    try {
      const formData = new FormData();
      formData.append("themeColor", color);
      if (logo instanceof File) formData.append("logo", logo);
      else if (logo === null) formData.append("logo", ""); // empty string for removal
      else if (logo) formData.append("logo", logo);

      if (banner instanceof File) formData.append("bannerUrl", banner);
      else if (banner === null) formData.append("bannerUrl", "");
      else if (banner) formData.append("bannerUrl", banner);

      await leagueService.update(leagueId, formData);
      toast.success("Settings saved successfully!");
      loadClubData(leagueId);
    } catch {
      toast.error("Failed to save settings");
    } finally {
      setSavingTheme(false);
    }
  };

  const handleLogoRemove = () => setLogo(null);
  const handleBannerRemove = () => setBanner(null);

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6 max-w-3xl">
      {/* Header */}
      <motion.div variants={item}>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Settings className="w-6 h-6 text-violet-500" /> Club Settings
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Customize your club's branding, logo, and theme color
        </p>
      </motion.div>

      {/* Live Preview */}
      <motion.div variants={item}>
        <Card className="overflow-hidden">
          <div
            className="h-24 relative"
            style={{
              background: `linear-gradient(135deg, ${color}dd, ${color}88)`,
            }}
          >
            <div className="absolute inset-0 bg-black/10" />
            <div className="relative flex items-center h-full px-6 gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                {logo ? (
                  <img src={logo} alt="" className="w-8 h-8 rounded-lg object-cover" />
                ) : (
                  <Trophy className="w-6 h-6 text-white" />
                )}
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">{clubName || "Your Club"}</h3>
                <p className="text-white/60 text-xs">Live preview of your branding</p>
              </div>
              <Badge className="ml-auto bg-white/20 text-white backdrop-blur-sm text-xs">Preview</Badge>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Theme Color */}
      <motion.div variants={item}>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Palette className="w-4 h-4 text-violet-500" /> Theme Color
            </CardTitle>
            <CardDescription>Choose your club's primary accent color</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Color Picker + Hex Input */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <input
                  type="color"
                  value={color}
                  onChange={(e) => handleColorChange(e.target.value)}
                  className="w-14 h-14 rounded-xl border-2 border-border cursor-pointer appearance-none bg-transparent [&::-webkit-color-swatch-wrapper]:p-1 [&::-webkit-color-swatch]:rounded-lg [&::-webkit-color-swatch]:border-0"
                />
              </div>
              <div className="flex-1 space-y-1">
                <Label className="text-xs text-muted-foreground">Hex Value</Label>
                <Input
                  value={color}
                  onChange={(e) => handleColorChange(e.target.value)}
                  maxLength={7}
                  className="font-mono text-sm uppercase"
                />
              </div>
            </div>

            {/* Preset Colors */}
            <div>
              <Label className="text-xs text-muted-foreground mb-2 block">Quick Presets</Label>
              <div className="flex flex-wrap gap-2">
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => handleColorChange(c)}
                    className="w-8 h-8 rounded-lg border-2 transition-all hover:scale-110 cursor-pointer"
                    style={{
                      backgroundColor: c,
                      borderColor: c === color ? "hsl(var(--foreground))" : "transparent",
                    }}
                  />
                ))}
              </div>
            </div>


          </CardContent>
        </Card>
      </motion.div>

      {/* Club Logo */}
      <motion.div variants={item}>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-violet-500" /> Club Logo
            </CardTitle>
            <CardDescription>Upload your club's logo (recommended: square, 512×512px)</CardDescription>
          </CardHeader>
          <CardContent>
            <ImageUpload
              value={logo}
              onChange={(fileOrUrl) => {
                if (fileOrUrl === null) handleLogoRemove();
                else setLogo(fileOrUrl);
              }}
              label={null}
              aspectHint="1:1"
              maxSizeMB={5}
            />
          </CardContent>
        </Card>
      </motion.div>

      {/* Club Banner */}
      <motion.div variants={item}>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-violet-500" /> Club Banner
            </CardTitle>
            <CardDescription>Upload a cover banner for your club (recommended: 1200×400px)</CardDescription>
          </CardHeader>
          <CardContent>
            <ImageUpload
              value={banner}
              onChange={(fileOrUrl) => {
                if (fileOrUrl === null) handleBannerRemove();
                else setBanner(fileOrUrl);
              }}
              label={null}
              aspectHint="3:1"
              maxSizeMB={5}
            />
          </CardContent>
        </Card>
      </motion.div>
      {/* Save Button */}
      <motion.div variants={item} className="flex justify-end pt-4">
        <Button onClick={handleSaveAll} disabled={savingTheme} size="lg" className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white">
          {savingTheme ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <CheckCircle2 className="w-5 h-5 mr-2" />}
          Save All Settings
        </Button>
      </motion.div>
    </motion.div>
  );
}
