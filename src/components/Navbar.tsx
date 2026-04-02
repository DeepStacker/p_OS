import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";
import { LogOut, FileText, FolderGit2, Sparkles, Search, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const Navbar = () => {
  const { user, signOut } = useAuth();
  const location = useLocation();

  const navItems = [
    { name: "Architect", path: "/proposal", icon: FileText },
    { name: "Curation", path: "/portfolio", icon: FolderGit2 },
    { name: "Radar", path: "/jobs", icon: Search },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex justify-center p-6 pointer-events-none font-sans">
      <div className="flex items-center gap-2 px-6 py-2 rounded-full glass-card pointer-events-auto border-white/10 shadow-[0_0_50px_-12px_rgba(16,185,129,0.25)]">
        <Link to="/" className="flex items-center gap-2 mr-6 group">
          <div className="p-1.5 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
            <Sparkles className="h-4 w-4 text-primary" />
          </div>
          <span className="font-display font-bold text-base tracking-tight hidden sm:block">Proposal Pro</span>
        </Link>

        <div className="h-6 w-[1px] bg-white/10 mr-4 hidden sm:block" />

        <div className="flex items-center gap-1">
          {user && navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link key={item.path} to={item.path}>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "relative gap-2 px-4 h-9 rounded-full transition-all duration-300",
                    isActive 
                      ? "text-primary bg-primary/5 hover:bg-primary/10" 
                      : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                  )}
                >
                  <item.icon className="h-3.5 w-3.5" />
                  <span className="hidden md:block text-xs font-semibold">{item.name}</span>
                  {isActive && (
                    <motion.div
                      layoutId="nav-glow"
                      className="absolute inset-0 rounded-full bg-primary/5 blur-sm"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </Button>
              </Link>
            );
          })}
        </div>

        <div className="h-6 w-[1px] bg-white/10 mx-4" />

        <div className="flex items-center gap-2">
          {user && (
            <Link to="/pricing">
              <Button variant="ghost" size="sm" className={cn(
                "hidden lg:flex gap-2 text-[10px] font-bold h-8 rounded-full px-4 transition-all",
                "text-emerald-400 hover:text-emerald-300 bg-emerald-400/5 border border-emerald-400/20"
              )}>
                <Zap className="h-3 w-3" />
                Vault Pro
              </Button>
            </Link>
          )}
          {user ? (
            <div className="flex items-center gap-3 ml-1">
              <div className="hidden lg:block text-right">
                <p className="text-[10px] font-bold text-foreground leading-none">{user.displayName || 'Freelancer'}</p>
                <Link to="/dashboard" className="text-[10px] text-muted-foreground hover:text-primary transition-colors">Dashboard</Link>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={signOut}
                className="h-8 w-8 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/5 border border-white/5"
              >
                <LogOut className="h-3.5 w-3.5" />
              </Button>
            </div>
          ) : (
            <Link to="/auth">
              <Button size="sm" className="h-9 rounded-full px-6 bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-lg shadow-primary/20 text-xs">
                Log In
              </Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
