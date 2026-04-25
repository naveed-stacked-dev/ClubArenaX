import { useAppContext } from "@/hooks/useAppContext";
import { useLocation } from "react-router-dom";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sun, Moon, LogOut, User, Bell } from "lucide-react";

function getRoleLabel(role) {
  const labels = {
    superadmin: "Super Admin",
    club_manager: "Club Manager",
    clubManager: "Club Manager",
    match_manager: "Match Manager",
    matchManager: "Match Manager",
  };
  return labels[role] || role;
}

function getRoleBadgeVariant(role) {
  if (role === "superadmin") return "default";
  if (role?.includes("club")) return "success";
  return "warning";
}

function getPageTitle(pathname) {
  const map = {
    "/": "Dashboard",
    "/leagues": "Leagues",
    "/tournaments": "Tournaments",
    "/teams": "Teams",
    "/players": "Players",
    "/matches": "Matches",
    "/analytics": "Analytics",
    "/settings": "Settings",
  };
  if (pathname.startsWith("/scoring")) return "Live Scoring";
  return map[pathname] || "Dashboard";
}

export default function Header() {
  const { user, logout, darkMode, toggleDarkMode } = useAppContext();
  const location = useLocation();

  const initials = (user?.name || "U")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <header className="h-16 border-b border-border bg-background/80 backdrop-blur-sm flex items-center justify-between px-6 shrink-0">
      {/* Left: Page breadcrumb */}
      <div className="flex items-center gap-3">
        <h2 className="text-sm font-medium text-foreground">{getPageTitle(location.pathname)}</h2>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        {/* Theme Toggle */}
        <Button variant="ghost" size="icon" onClick={toggleDarkMode} className="text-muted-foreground hover:text-foreground">
          {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>

        {/* Notifications placeholder */}
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground relative">
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
        </Button>

        <Separator orientation="vertical" className="h-6 mx-1" />

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-3 rounded-lg px-2 py-1.5 hover:bg-accent transition-colors cursor-pointer outline-none">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-gradient-to-br from-violet-500 to-indigo-500 text-white text-xs font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="hidden sm:flex flex-col items-start">
                <span className="text-sm font-medium text-foreground leading-none">{user?.name || "User"}</span>
                <Badge variant={getRoleBadgeVariant(user?.role)} className="mt-0.5 text-[10px] px-1.5 py-0">
                  {getRoleLabel(user?.role)}
                </Badge>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col gap-1">
                <p className="text-sm font-medium">{user?.name}</p>
                <p className="text-xs text-muted-foreground">{user?.email || user?.phone}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
