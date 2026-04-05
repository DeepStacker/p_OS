import React, { useState, useEffect, Suspense, lazy } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { 
  AppWindow, 
  LayoutDashboard, 
  FileText, 
  Briefcase, 
  Folder, 
  CreditCard, 
  Settings as SettingsIcon, 
  Wifi, 
  WifiOff,
  Battery, 
  BatteryCharging,
  Moon,
  Clock as ClockIcon,
  Apple,
  HardDrive,
  Network,
  Monitor,
  Volume2,
  Bluetooth,
  Sliders,
  Terminal as TerminalIcon,
  Maximize2,
  Zap,
  Trash2,
  Grid
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSystem } from "@/contexts/SystemContext";
import MacOSWindow from "./MacOSWindow";
import Spotlight from "./Spotlight";
import Launchpad from "./Launchpad";
import MissionControl from "./MissionControl";
import PowerOverlay from "./PowerOverlay";
import Auth from "@/pages/Auth";

const Dashboard = lazy(() => import("@/pages/Dashboard"));
const Proposals = lazy(() => import("@/pages/Proposals"));
const TerminalApp = lazy(() => import("@/components/apps/Terminal"));
const Jobs = lazy(() => import("@/pages/Jobs"));
const Portfolio = lazy(() => import("@/pages/Portfolio"));
const Settings = lazy(() => import("@/pages/Settings"));
const Pricing = lazy(() => import("@/pages/Pricing"));

const Calculator = lazy(() => import("@/components/apps/Calculator"));
const Calendar = lazy(() => import("@/components/apps/Calendar"));
const ClockApp = lazy(() => import("@/components/apps/Clock"));
const Notes = lazy(() => import("@/components/apps/Notes"));
const Finder = lazy(() => import("@/components/apps/Finder"));

const MacOSLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const { 
    showDesktopIcons, 
    isWifiEnabled, 
    setIsWifiEnabled, 
    isBluetoothEnabled, 
    setIsBluetoothEnabled, 
    batteryLevel, 
    isCharging,
    wallpaper,
    activeWindows,
    openWindow,
    addLog,
    dockApps,
    metrics,
    snapWindow,
    powerStatus,
    setPowerStatus,
    triggerPowerAction
  } = useSystem();
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const [currentTime, setCurrentTime] = useState(new Date());
  const [showControlCenter, setShowControlCenter] = useState(false);
  const [showAppleMenu, setShowAppleMenu] = useState(false);
  const [isSpotlightOpen, setIsSpotlightOpen] = useState(false);
  const [isLaunchpadOpen, setIsLaunchpadOpen] = useState(false);
  const [isMissionControlOpen, setIsMissionControlOpen] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsSpotlightOpen(prev => !prev);
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "l") {
        e.preventDefault();
        setPowerStatus("locked");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // --- Mission Control Listener (F3) ---
  useEffect(() => {
    const handleMissionControl = (e: KeyboardEvent) => {
      if (e.key === "F3" || (e.ctrlKey && e.key === "ArrowUp")) {
        e.preventDefault();
        setIsMissionControlOpen(prev => !prev);
      }
    };
    window.addEventListener("keydown", handleMissionControl);
    return () => window.removeEventListener("keydown", handleMissionControl);
  }, []);

  // --- Window Snapping Shortcuts (Option + Arrows) ---
  useEffect(() => {
    const handleSnapKeys = (e: KeyboardEvent) => {
      if (e.altKey) {
        const topWindow = [...activeWindows].sort((a, b) => b.zIndex - a.zIndex)[0];
        if (!topWindow) return;

        if (e.key === "ArrowLeft") {
          e.preventDefault();
          snapWindow(topWindow.id, "left");
        } else if (e.key === "ArrowRight") {
          e.preventDefault();
          snapWindow(topWindow.id, "right");
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          snapWindow(topWindow.id, "full");
        } else if (e.key === "ArrowDown") {
          e.preventDefault();
          snapWindow(topWindow.id, "none");
        }
      }
    };
    window.addEventListener("keydown", handleSnapKeys);
    return () => window.removeEventListener("keydown", handleSnapKeys);
  }, [activeWindows, snapWindow]);

  useEffect(() => {
    const pathMap: Record<string, any> = {
      "/dashboard": { id: "dashboard", name: "Dashboard", icon: <LayoutDashboard className="h-4 w-4" />, component: "dashboard" },
      "/admin": { id: "terminal", name: "Terminal", icon: <TerminalIcon className="h-4 w-4" />, component: "terminal" },
      "/jobs": { id: "search", name: "Jobs", icon: <Briefcase className="h-4 w-4" />, component: "search" },
      "/portfolio": { id: "portfolio", name: "Code", icon: <Folder className="h-4 w-4" />, component: "portfolio" },
      "/settings": { id: "settings", name: "Settings", icon: <SettingsIcon className="h-4 w-4" />, component: "settings" },
      "/pricing": { id: "billing", name: "Billing", icon: <CreditCard className="h-4 w-4" />, component: "billing" },
    };
    const app = pathMap[location.pathname];
    if (app) openWindow(app.id, app.name, app.icon, app.component);
  }, [location.pathname]);

  if (["/auth", "/welcome"].includes(location.pathname) && powerStatus === 'running') return <div className="min-h-screen bg-black relative">{children}</div>;

  const renderAppComponent = (componentId: string) => {
    switch (componentId) {
      case "dashboard": return <Dashboard />;
      case "proposals": return <Proposals />;
      case "terminal": return <TerminalApp />;
      case "search": return <Jobs />;
      case "portfolio": return <Portfolio />;
      case "settings": return <Settings />;
      case "billing": return <Pricing />;
      case "calculator": return <Calculator />;
      case "calendar": return <Calendar />;
      case "clock": return <ClockApp />;
      case "notes": return <Notes />;
      case "finder": return <Finder />;
      default: return <div className="p-20 text-center opacity-20 text-white">Hardware Registry Not Found</div>;
    }
  };

  const desktopIcons = [
    { name: "Macintosh HD", icon: HardDrive, x: "right-6", y: "top-12" },
    { name: "Network Storage", icon: Network, x: "right-6", y: "top-36" },
  ];

  return (
    <div className="fixed inset-0 w-screen h-screen overflow-hidden font-sans select-none text-foreground antialiased bg-black">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 z-0 bg-cover bg-center transition-all duration-1000" style={{ backgroundImage: `url('${wallpaper}')` }} />
      <div className="absolute inset-0 z-0 bg-black/10 backdrop-blur-[0.5px]" />

      <div className="absolute bottom-32 right-12 z-10 pointer-events-none text-right">
         <motion.h2 animate={{ opacity: 0.6 }} className="text-8xl font-black tracking-tighter text-white/40 leading-none filter blur-[0.5px]">
            {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
         </motion.h2>
         <motion.p animate={{ opacity: 0.3 }} className="text-lg font-black text-white/50 uppercase tracking-[0.6em] mt-4">
            {currentTime.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}
         </motion.p>
      </div>

      {showDesktopIcons && (
        <div className="absolute inset-0 z-10 pointer-events-none">
           {desktopIcons.map((icon, i) => (
             <motion.div key={icon.name} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + i * 0.1 }} onDoubleClick={() => openWindow("hd", "Macintosh HD", <HardDrive className="h-4 w-4" />, "storage")} className={cn("absolute flex flex-col items-center gap-1 w-24 pointer-events-auto cursor-default group", icon.x, icon.y)}>
                <div className="p-3 rounded-2xl group-hover:bg-white/10 transition-all duration-300 shadow-lg"><icon.icon className="h-10 w-10 text-white drop-shadow-2xl" /></div>
                <span className="text-[9px] font-black tracking-widest text-white/60 text-center drop-shadow-md bg-black/20 px-2 py-0.5 rounded-sm uppercase">{icon.name}</span>
             </motion.div>
           ))}
        </div>
      )}

      <div className="absolute inset-0 z-30 pointer-events-none overflow-hidden pt-8">
        <AnimatePresence>
          {activeWindows.filter(w => !w.isMinimized).map((win) => (
            <MacOSWindow key={win.id} window={win}>
              <Suspense fallback={<div className="flex items-center justify-center h-full"><Zap className="h-8 w-8 animate-pulse text-primary opacity-20" /></div>}>{renderAppComponent(win.component)}</Suspense>
            </MacOSWindow>
          ))}
        </AnimatePresence>
      </div>

      <header className="absolute top-0 left-0 right-0 h-8 z-50 flex items-center justify-between px-5 bg-black/10 backdrop-blur-3xl border-b border-white/5 text-foreground/90">
        <div className="flex items-center gap-5 h-full">
          <button onClick={() => setShowAppleMenu(!showAppleMenu)} className={cn("px-2 hover:bg-white/10 rounded-md transition-all h-7 group", showAppleMenu && "bg-white/20")}>
            <Apple className="h-4 w-4 fill-white flex-shrink-0" />
          </button>
          <AnimatePresence>
            {showAppleMenu && (
              <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }} className="absolute top-8 left-0 w-56 bg-zinc-900/60 backdrop-blur-3xl border border-white/10 rounded-xl shadow-2xl p-1.5 z-[101]">
                <button className="w-full text-left px-3 py-1.5 text-[11px] font-bold text-white/80 hover:bg-primary/80 hover:text-white rounded-md transition-colors">About This Mac</button>
                <button className="w-full text-left px-3 py-1.5 text-[11px] font-bold text-white/80 hover:bg-primary/80 hover:text-white rounded-md transition-colors">Software Update...</button>
                <button className="w-full text-left px-3 py-1.5 text-[11px] font-bold text-white/80 hover:bg-primary/80 hover:text-white rounded-md transition-colors">System Settings...</button>
                <div className="h-px bg-white/5 my-1" />
                <button onClick={() => { setPowerStatus("sleep"); setShowAppleMenu(false); }} className="w-full text-left px-3 py-1.5 text-[11px] font-bold text-white/80 hover:bg-primary/80 hover:text-white rounded-md transition-colors">Sleep</button>
                <button onClick={() => { triggerPowerAction("restart"); setShowAppleMenu(false); }} className="w-full text-left px-3 py-1.5 text-[11px] font-bold text-white/80 hover:bg-primary/80 hover:text-white rounded-md transition-colors">Restart...</button>
                <button onClick={() => { triggerPowerAction("shutdown"); setShowAppleMenu(false); }} className="w-full text-left px-3 py-1.5 text-[11px] font-bold text-white/80 hover:bg-primary/80 hover:text-white rounded-md transition-colors">Shut Down...</button>
                <div className="h-px bg-white/5 my-1" />
                <button onClick={() => { setPowerStatus("locked"); setShowAppleMenu(false); }} className="w-full text-left px-3 py-1.5 text-[11px] font-bold text-white/80 hover:bg-primary/80 hover:text-white rounded-md transition-colors">Lock Screen</button>
                <button onClick={() => { signOut(); setShowAppleMenu(false); navigate("/auth"); }} className="w-full text-left px-3 py-1.5 text-[11px] font-bold text-white/80 hover:bg-primary/80 hover:text-white rounded-md transition-colors">Log Out node...</button>
              </motion.div>
            )}
          </AnimatePresence>
          <span className="text-[12px] font-black uppercase tracking-[0.2em] px-2 opacity-90 text-white">Node OS</span>
        </div>

        <div className="flex items-center gap-6 h-full p-2">
           {/* System Monitor */}
           <div className="hidden xl:flex items-center gap-6 px-4 py-1 rounded-lg bg-white/5 border border-white/5">
              <div className="flex items-center gap-2">
                 <span className="text-[9px] font-black tracking-widest text-white/40 uppercase">CPU</span>
                 <span className="text-[10px] font-black text-white/80">{metrics.cpu}%</span>
              </div>
              <div className="flex items-center gap-2">
                 <span className="text-[9px] font-black tracking-widest text-white/40 uppercase">RAM</span>
                 <span className="text-[10px] font-black text-white/80">{metrics.ram}GB</span>
              </div>
           </div>

           <div className="flex items-center gap-5 opacity-70 text-white">
             {isWifiEnabled ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />}
             <div className="flex items-center gap-1">
                <span className="text-[9px] font-black">{batteryLevel}%</span>
                {isCharging ? <BatteryCharging className="h-4 w-4 text-[#34C759]" /> : <Battery className="h-4 w-4 rotate-90" />}
             </div>
             <button onClick={() => setShowControlCenter(!showControlCenter)} className={cn("hover:bg-white/10 rounded p-1 transition-colors", showControlCenter && "bg-white/20")}><Sliders className="h-4 w-4" /></button>
           </div>
           <span className="text-[11px] font-black uppercase tracking-widest min-w-[140px] text-right opacity-80 text-white">
              {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', weekday: 'short', month: 'short', day: 'numeric' })}
           </span>
        </div>
      </header>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[100] pointer-events-auto">
        <motion.div className="h-16 px-4 bg-zinc-900/40 backdrop-blur-3xl border border-white/10 rounded-[30px] flex items-center gap-4 shadow-2xl">
          <button onClick={() => setIsLaunchpadOpen(!isLaunchpadOpen)} className="p-3 bg-white/5 rounded-2xl hover:bg-white/10 hover:-translate-y-2 transition-all duration-300 border border-white/10 group">
             <Grid className={cn("h-7 w-7 text-primary/80 group-hover:text-primary transition-all", isLaunchpadOpen && "scale-110 text-primary")} />
          </button>
          <div className="w-px h-8 bg-white/10 mx-1" />
          {dockApps.map((app) => (
            <button key={app.id} onClick={() => openWindow(app.id, app.name, <app.icon className="h-4 w-4" />, app.component)} className="relative group">
              <div className="p-3 bg-white/5 rounded-2xl hover:bg-white/10 hover:-translate-y-2 transition-all duration-300 border border-white/10">
                 <app.icon className="h-7 w-7 text-white/80 group-hover:text-white" />
              </div>
              {activeWindows.find(w => w.id === app.id) && <motion.div layoutId={`indicator-${app.id}`} className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-white rounded-full shadow-[0_0_5px_white]" />}
            </button>
          ))}
          <div className="w-px h-8 bg-white/10 mx-1" />
          <button onClick={() => openWindow("finder", "Trash", <Trash2 className="h-4 w-4" />, "finder")} className="p-3 bg-white/5 rounded-2xl hover:bg-white/10 hover:-translate-y-2 transition-all duration-300 border border-white/10 group">
              <Trash2 className="h-7 w-7 text-white/20 group-hover:text-white transition-all" />
          </button>
        </motion.div>
      </div>

      <AnimatePresence>
        {showControlCenter && (
          <motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }} className="absolute top-10 right-4 w-80 bg-zinc-900/60 backdrop-blur-3xl border border-white/10 rounded-[28px] shadow-2xl p-5 z-[101] space-y-5 text-white">
             <div className="grid grid-cols-2 gap-3">
                <button onClick={() => setIsWifiEnabled(!isWifiEnabled)} className={cn("p-3 rounded-2xl flex items-center gap-3 transition-colors", isWifiEnabled ? "bg-white/20" : "bg-white/5 opacity-50")}>
                   <div className={cn("w-8 h-8 rounded-full flex items-center justify-center transition-colors", isWifiEnabled ? "bg-blue-500" : "bg-zinc-700")}><Wifi className="h-4 w-4" /></div>
                   <div className="flex flex-col items-start"><span className="text-[11px] font-black uppercase">Wi-Fi</span><span className="text-[9px] opacity-40 uppercase font-bold">{isWifiEnabled ? "Home-OS" : "Off"}</span></div>
                </button>
                <button onClick={() => setIsBluetoothEnabled(!isBluetoothEnabled)} className={cn("p-3 rounded-2xl flex items-center gap-3 transition-colors", isBluetoothEnabled ? "bg-white/20" : "bg-white/5 opacity-50")}>
                   <div className={cn("w-8 h-8 rounded-full flex items-center justify-center transition-colors", isBluetoothEnabled ? "bg-blue-500" : "bg-zinc-700")}><Bluetooth className="h-4 w-4" /></div>
                   <div className="flex flex-col items-start"><span className="text-[11px] font-black uppercase">Bluetooth</span><span className="text-[9px] opacity-40 uppercase font-bold">{isBluetoothEnabled ? "On" : "Off"}</span></div>
                </button>
             </div>
             <div className="space-y-4 bg-white/5 p-5 rounded-2xl border border-white/5">
                <div className="flex items-center gap-4 group"><Monitor className="h-4 w-4 opacity-40 group-hover:opacity-100" /><div className="h-1.5 flex-1 bg-white/10 rounded-full overflow-hidden p-0.5"><div className="h-full bg-white/60 rounded-full w-[85%]" /></div></div>
                <div className="flex items-center gap-4 group"><Volume2 className="h-4 w-4 opacity-40 group-hover:opacity-100" /><div className="h-1.5 flex-1 bg-white/10 rounded-full overflow-hidden p-0.5"><div className="h-full bg-white/60 rounded-full w-[55%]" /></div></div>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>{isLaunchpadOpen && <Launchpad isOpen={isLaunchpadOpen} onClose={() => setIsLaunchpadOpen(false)} />}</AnimatePresence>
      <AnimatePresence>{isSpotlightOpen && <Spotlight isOpen={isSpotlightOpen} onClose={() => setIsSpotlightOpen(false)} />}</AnimatePresence>
      <AnimatePresence>
        {isMissionControlOpen && (
          <MissionControl 
            isOpen={isMissionControlOpen} 
            onClose={() => setIsMissionControlOpen(false)} 
          />
        )}
      </AnimatePresence>

      {/* Power & Auth Layers */}
      <PowerOverlay />
      <AnimatePresence>
        {powerStatus === "locked" && (
           <motion.div
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             exit={{ opacity: 0 }}
             className="absolute inset-0 z-[2000] bg-black/60 backdrop-blur-2xl"
           >
              <Auth />
              {/* Specialized Auth variant could be here, but current Auth works as a standalone lock screen */}
           </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MacOSLayout;
