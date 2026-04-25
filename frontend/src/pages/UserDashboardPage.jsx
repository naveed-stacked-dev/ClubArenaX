import { useState } from "react";
import { motion } from "framer-motion";
import { useAppContext } from "@/hooks/useAppContext";
import authService from "@/services/authService";
import { toast } from "sonner";
import { User, Settings, Lock, Loader2, LogOut } from "lucide-react";
import PasswordInput from "@/components/PasswordInput";

export default function UserDashboardPage() {
  const { user, logout } = useAppContext();
  const [tab, setTab] = useState("profile");
  const [passwords, setPasswords] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [submitting, setSubmitting] = useState(false);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) return toast.error("Passwords don't match");
    if (passwords.newPassword.length < 6) return toast.error("Password must be at least 6 characters");
    setSubmitting(true);
    try {
      await authService.changePassword({
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      });
      toast.success("Password changed successfully");
      setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch { /* handled */ }
    finally { setSubmitting(false); }
  };

  return (
    <div className="min-h-screen pt-28 pb-20 px-4 sm:px-6 max-w-3xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-2xl font-black text-white shadow-lg shadow-emerald-500/25">
            {(user?.name || "U")[0]}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">{user?.name || "User"}</h1>
            <p className="text-sm text-gray-400">{user?.email}</p>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-1 mb-8 bg-white/5 rounded-xl p-1 max-w-xs">
        {[
          { key: "profile", label: "Profile", icon: User },
          { key: "security", label: "Security", icon: Lock },
        ].map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                tab === t.key ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/25" : "text-gray-400 hover:text-white"
              }`}
            >
              <Icon className="w-4 h-4" /> {t.label}
            </button>
          );
        })}
      </div>

      {/* Profile Tab */}
      {tab === "profile" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <div className="border border-white/5 rounded-2xl bg-white/[0.02] p-6 space-y-4">
            <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">Account Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">Full Name</p>
                <p className="text-white font-medium">{user?.name || "—"}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Email</p>
                <p className="text-white font-medium">{user?.email || "—"}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Phone</p>
                <p className="text-white font-medium">{user?.phone || "Not provided"}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Account Type</p>
                <p className="text-white font-medium capitalize">{user?.role || "User"}</p>
              </div>
            </div>
          </div>

          <button
            onClick={logout}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-colors text-sm font-medium cursor-pointer"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </motion.div>
      )}

      {/* Security Tab */}
      {tab === "security" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="border border-white/5 rounded-2xl bg-white/[0.02] p-6">
            <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-6">Change Password</h3>
            <form onSubmit={handleChangePassword} className="space-y-4 max-w-sm">
              <div>
                <label className="block text-sm text-gray-300 mb-1">Current Password</label>
                <PasswordInput
                  value={passwords.currentPassword}
                  onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">New Password</label>
                <PasswordInput
                  value={passwords.newPassword}
                  onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Confirm New Password</label>
                <PasswordInput
                  value={passwords.confirmPassword}
                  onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold rounded-xl px-6 py-3 transition-all flex items-center shadow-lg shadow-emerald-500/20 mt-2"
              >
                {submitting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                Update Password
              </button>
            </form>
          </div>
        </motion.div>
      )}
    </div>
  );
}
