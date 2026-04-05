import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Palette, 
  Monitor, 
  Shield, 
  Database, 
  Wifi, 
  Bluetooth, 
  Info,
  Check,
  Eye,
  EyeOff,
  Battery,
  Volume2,
  HardDrive,
  Cpu,
  Lock,
  ChevronRight,
  Settings as SettingsIcon,
  WifiOff,
  BatteryCharging,
  Image as ImageIcon,
  User,
  Globe,
  Zap
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSystem } from "@/contexts/SystemContext";

const Settings = () => {
  const { 
    accentColor, 
    setAccentColor, 
    showDesktopIcons, 
    setShowDesktopIcons,
    isWifiEnabled,
    setIsWifiEnabled,
    isBluetoothEnabled,
    setIsBluetoothEnabled,
    batteryLevel,
    isCharging,
    setIsCharging,
    metrics,
    addLog,
    wallpaper,
    setWallpaper,
    hostname,
    setHostname,
    localPasscode,
    setLocalPasscode
  } = useSystem();

  const [activeTab, setActiveTab] = useState("appearance");

  const accentColors = [
    { id: "blue", color: "bg-[#007AFF]", label: "Blue" },
    { id: "purple", color: "bg-[#AF52DE]", label: "Purple" },
    { id: "pink", color: "bg-[#FF2D55]", label: "Pink" },
    { id: "red", color: "bg-[#FF3B30]", label: "Red" },
    { id: "orange", color: "bg-[#FF9500]", label: "Orange" },
    { id: "yellow", color: "bg-[#FFCC00]", label: "Yellow" },
    { id: "green", color: "bg-[#34C759]", label: "Green" },
    { id: "gray", color: "bg-[#8E8E93]", label: "Graphite" },
  ];

  const wallpapers = [
    { name: "Sequoia Aurora", url: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?q=80&w=3474&auto=format&fit=crop" },
    { name: "Ventura Abstract", url: "https://images.unsplash.com/photo-1635776062127-d379bfcba9f8?q=80&w=3474&auto=format&fit=crop" },
    { name: "Sonoma Hills", url: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=3540&auto=format&fit=crop" },
    { name: "Deep Space", url: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=3544&auto=format&fit=crop" },
    { name: "Minimal Dawn", url: "https://images.unsplash.com/photo-1470252649358-96957c053e9a?q=80&w=3540&auto=format&fit=crop" },
    { name: "Dark Nebula", url: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=3122&auto=format&fit=crop" },
  ];

  const sidebarItems = [
    { id: "appearance", label: "Appearance", icon: Palette },
    { id: "desktop", label: "Wallpaper", icon: ImageIcon },
    { id: "network", label: "Network", icon: Wifi },
    { id: "identity", label: "System Identity", icon: User },
    { id: "battery", label: "Battery", icon: Battery },
    { id: "storage", label: "Storage", icon: Database },
    { id: "security", label: "Security", icon: Shield },
    { id: "about", label: "About", icon: Info },
  ];

  return (
    <div className="h-full flex bg-zinc-950/20 backdrop-blur-3xl overflow-hidden font-sans">
        {/* Sidebar (Sequoia Style) */}
        <aside className="w-64 bg-zinc-900/30 border-r border-white/5 p-5 flex flex-col gap-1.5 overflow-y-auto custom-scrollbar">
          <div className="mb-6 px-3 flex items-center gap-3">
             <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center border border-primary/20">
                <SettingsIcon className="h-5 w-5 text-primary" />
             </div>
             <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-widest text-white/90">System Settings</span>
                <span className="text-[8px] font-black uppercase tracking-widest text-zinc-500">Root Authorized</span>
             </div>
          </div>
          
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "flex items-center gap-3 px-4 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all",
                activeTab === item.id 
                  ? "bg-primary/20 text-white border border-primary/20 shadow-lg shadow-primary/5" 
                  : "text-zinc-500 hover:bg-white/5 hover:text-white/60 border border-transparent"
              )}
            >
              <item.icon className={cn("h-4 w-4", activeTab === item.id ? "text-primary" : "opacity-40")} />
              {item.label}
            </button>
          ))}
        </aside>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto custom-scrollbar p-12 bg-white/[0.01]">
           <AnimatePresence mode="wait">
             <motion.div
               key={activeTab}
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: -10 }}
               transition={{ duration: 0.3 }}
             >
                {activeTab === "appearance" && (
                  <div className="max-w-2xl space-y-12">
                     <h2 className="text-3xl font-black text-white/90 tracking-tighter">Appearance</h2>
                     <div className="space-y-6">
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 ml-1">Accent Color Configuration</p>
                        <div className="grid grid-cols-4 gap-4">
                           {accentColors.map((color) => (
                             <button
                               key={color.id}
                               onClick={() => { setAccentColor(color.id as any); addLog(`Accent color: ${color.label}`); }}
                               className={cn(
                                 "flex flex-col items-center gap-3 p-5 rounded-[24px] border transition-all duration-300 hover:bg-white/5 group",
                                 accentColor === color.id ? "bg-white/10 border-white/20 shadow-2xl" : "bg-transparent border-transparent"
                               )}
                             >
                               <div className={cn("h-12 w-12 rounded-full shadow-2xl flex items-center justify-center transition-transform group-active:scale-90", color.color)}>
                                  {accentColor === color.id && <Check className="h-5 w-5 text-white" />}
                               </div>
                               <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500">{color.label}</span>
                             </button>
                           ))}
                        </div>
                     </div>

                     <div className="p-8 rounded-[32px] bg-white/5 border border-white/10 flex items-center justify-between shadow-2xl">
                        <div className="flex items-center gap-6">
                           <div className="h-14 w-14 rounded-[20px] bg-white/5 flex items-center justify-center text-zinc-400">
                              {showDesktopIcons ? <Eye className="h-6 w-6" /> : <EyeOff className="h-6 w-6" />}
                           </div>
                           <div className="flex flex-col">
                              <span className="text-sm font-black text-white/90 uppercase tracking-tight">Desktop Icons</span>
                              <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Show Macintosh HD & Network Volumes</span>
                           </div>
                        </div>
                        <button onClick={() => setShowDesktopIcons(!showDesktopIcons)} className={cn("w-12 h-6 rounded-full p-1 transition-all duration-300 relative", showDesktopIcons ? "bg-primary shadow-[0_0_15px_rgba(var(--primary),0.3)]" : "bg-zinc-800")}>
                           <div className={cn("w-4 h-4 bg-white rounded-full transition-all", showDesktopIcons ? "translate-x-6" : "translate-x-0")} />
                        </button>
                     </div>
                  </div>
                )}

                {activeTab === "desktop" && (
                   <div className="max-w-2xl space-y-12">
                      <h2 className="text-3xl font-black text-white/90 tracking-tighter">Desktop Wallpaper</h2>
                      <div className="grid grid-cols-2 gap-6">
                         {wallpapers.map(wp => (
                            <button 
                               key={wp.name} 
                               onClick={() => { setWallpaper(wp.url); addLog(`Wallpaper updated: ${wp.name}`); }}
                               className={cn(
                                  "group relative aspect-video rounded-[24px] overflow-hidden border-2 transition-all hover:scale-[1.02] active:scale-[0.98]",
                                  wallpaper === wp.url ? "border-primary shadow-[0_0_30px_rgba(var(--primary),0.2)]" : "border-white/5"
                               )}
                            >
                               <img src={wp.url} alt={wp.name} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                               <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                                  <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/80">{wp.name}</span>
                               </div>
                               {wallpaper === wp.url && <div className="absolute top-3 right-3 h-6 w-6 rounded-full bg-primary flex items-center justify-center shadow-lg"><Check className="h-3 w-3 text-white" /></div>}
                            </button>
                         ))}
                      </div>
                   </div>
                )}

                {activeTab === "identity" && (
                   <div className="max-w-2xl space-y-12">
                      <h2 className="text-3xl font-black text-white/90 tracking-tighter">System Identity</h2>
                      <div className="space-y-6">
                         <div className="p-8 rounded-[32px] bg-white/5 border border-white/10 space-y-8 shadow-2xl">
                            <div className="space-y-3">
                               <label className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 ml-1">Universal Hostname</label>
                               <div className="flex items-center gap-4 bg-black/20 p-4 rounded-2xl border border-white/5">
                                  <Globe className="h-5 w-5 text-primary opacity-40 shrink-0" />
                                  <input 
                                     value={hostname} 
                                     onChange={(e) => setHostname(e.target.value)}
                                     className="bg-transparent border-none w-full text-sm font-black text-white tracking-widest focus:outline-none placeholder:opacity-20"
                                     placeholder="SYSTEM_HOST_NAME"
                                  />
                               </div>
                            </div>
                            <div className="space-y-3">
                               <label className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 ml-1">Entity Primary Name</label>
                               <div className="flex items-center gap-4 bg-black/20 p-4 rounded-2xl border border-white/5">
                                  <User className="h-5 w-5 text-primary opacity-40 shrink-0" />
                                  <span className="text-sm font-black text-white tracking-widest">node://authorized_instance</span>
                               </div>
                            </div>
                         </div>
                      </div>
                   </div>
                )}

                {activeTab === "network" && (
                   <div className="max-w-2xl space-y-12">
                      <h2 className="text-3xl font-black text-white/90 tracking-tighter">Network Adapter</h2>
                      <div className="p-8 rounded-[32px] bg-white/5 border border-white/10 flex items-center justify-between shadow-2xl">
                         <div className="flex items-center gap-6">
                            <div className={cn("h-14 w-14 rounded-[20px] flex items-center justify-center transition-colors shadow-inner", isWifiEnabled ? "bg-blue-500/10 text-blue-500" : "bg-zinc-800 text-zinc-600")}>
                               {isWifiEnabled ? <Wifi className="h-6 w-6" /> : <WifiOff className="h-6 w-6" />}
                            </div>
                            <div className="flex flex-col">
                               <span className="text-sm font-black text-white/90 uppercase tracking-tight">Wireless Interface</span>
                               <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">{isWifiEnabled ? "Connected: 802.11 ax (Wi-Fi 6)" : "Hardware Radio Disabled"}</span>
                            </div>
                         </div>
                         <button onClick={() => setIsWifiEnabled(!isWifiEnabled)} className={cn("w-12 h-6 rounded-full p-1 transition-all duration-300 relative", isWifiEnabled ? "bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.3)]" : "bg-zinc-800")}>
                            <div className={cn("w-4 h-4 bg-white rounded-full transition-all", isWifiEnabled ? "translate-x-6" : "translate-x-0")} />
                         </button>
                      </div>
                   </div>
                )}

                {activeTab === "battery" && (
                   <div className="max-w-2xl space-y-12">
                      <h2 className="text-3xl font-black text-white/90 tracking-tighter">Energy Source</h2>
                      <div className="bg-zinc-900/40 p-12 rounded-[40px] border border-white/10 flex flex-col items-center gap-10 shadow-3xl text-center">
                         <div className="relative w-56 h-24 border-4 border-white/10 rounded-3xl p-2 shadow-2xl">
                            <motion.div initial={false} animate={{ width: `${batteryLevel}%` }} className={cn("h-full rounded-2xl shadow-2xl", batteryLevel < 20 ? "bg-rose-500" : "bg-emerald-500")} />
                            <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-3 h-10 bg-white/10 rounded-r-xl" />
                         </div>
                         <div className="space-y-4">
                            <span className="text-6xl font-black text-white tracking-tighter uppercase">{batteryLevel}% Capacity</span>
                            <div className="flex items-center justify-center gap-4">
                               <button 
                                  onClick={() => setIsCharging(!isCharging)}
                                  className={cn(
                                     "px-10 py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all border shadow-lg shadow-black/40",
                                     isCharging ? "bg-emerald-500 text-white border-emerald-500/40" : "bg-white/5 text-zinc-500 border-white/5 hover:bg-white/10"
                                  )}
                               >
                                  {isCharging ? "Charging Active" : "Connect Source"}
                               </button>
                            </div>
                         </div>
                      </div>
                   </div>
                )}

                {activeTab === "security" && (
                  <div className="max-w-2xl space-y-12">
                     <h2 className="text-3xl font-black text-white/90 tracking-tighter">Security & Privacy</h2>
                     <div className="p-10 rounded-[40px] bg-white/5 border border-white/10 space-y-10 shadow-3xl">
                        <div className="flex flex-col items-center gap-6 text-center">
                           <div className="w-20 h-20 rounded-[28px] bg-primary/10 flex items-center justify-center border border-primary/20 shadow-2xl">
                              <Lock className="h-10 w-10 text-primary" />
                           </div>
                           <div className="space-y-2">
                              <h3 className="text-xl font-black text-white uppercase tracking-tight">System Passcode</h3>
                              <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest max-w-xs">Set a local passcode for rapid unlocking from sleep or lock state without requiring Google sign-in.</p>
                           </div>
                        </div>

                        <div className="space-y-4">
                           <div className="flex items-center gap-4 bg-black/40 p-5 rounded-2xl border border-white/10 transition-all focus-within:border-primary/40 group">
                              <Shield className="h-5 w-5 text-zinc-500 group-focus-within:text-primary transition-colors" />
                              <input 
                                 type="password"
                                 placeholder="ENTER NEW PASSCODE"
                                 className="bg-transparent border-none w-full text-sm font-black text-white tracking-[0.5em] focus:outline-none placeholder:tracking-widest placeholder:opacity-20"
                                 value={localPasscode || ""}
                                 onChange={(e) => setLocalPasscode(e.target.value)}
                              />
                           </div>
                           {localPasscode && (
                              <button 
                                 onClick={() => setLocalPasscode(null)}
                                 className="w-full py-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 text-[9px] font-black uppercase tracking-[0.2em] transition-all"
                              >
                                 Clear System Passcode
                              </button>
                           )}
                        </div>

                        <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                           <div className="flex flex-col">
                              <span className="text-[11px] font-black text-white uppercase">Fast User Switching</span>
                              <span className="text-[9px] font-bold text-zinc-500 uppercase">Enable rapid passcode entry on wake</span>
                           </div>
                           <div className={cn("w-12 h-6 rounded-full p-1 bg-primary/20 relative shadow-inner cursor-pointer")}>
                              <div className="w-4 h-4 bg-primary rounded-full translate-x-6" />
                           </div>
                        </div>
                     </div>
                  </div>
                )}

                {activeTab === "about" && (
                   <div className="max-w-2xl text-center space-y-12 py-10">
                      <div className="relative mx-auto w-32 h-32 bg-zinc-900 border border-white/10 rounded-[40px] flex items-center justify-center shadow-3xl group overflow-hidden">
                         <div className="absolute inset-0 bg-primary/20 blur-2xl group-hover:blur-3xl transition-all" />
                         <Zap className="relative h-16 w-16 text-primary filter drop-shadow-2xl" />
                      </div>
                      <div className="space-y-4">
                         <h2 className="text-4xl font-black text-white tracking-tighter uppercase">Node OS Sequoia</h2>
                         <p className="text-[11px] font-black text-zinc-500 uppercase tracking-[0.5em] leading-relaxed italic">Quantum Environment Implementation<br/>PRO EDITION | v1.0.8.2-STABLE</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-left">
                         {[
                            { l: "Runtime", v: "Node JS v16.14.2" },
                            { l: "Security", v: "AES-256 Encrypted" },
                            { l: "VFS Volume", v: "Macintosh HD (Pro)" },
                            { l: "Identity", v: hostname || "Universal" }
                         ].map(item => (
                            <div key={item.l} className="p-6 bg-white/5 border border-white/5 rounded-3xl group hover:bg-white/10 transition-all">
                               <span className="text-[9px] font-black uppercase tracking-widest text-zinc-600 block mb-1">{item.l}</span>
                               <span className="text-xs font-black text-white/80 uppercase tracking-tight">{item.v}</span>
                            </div>
                         ))}
                      </div>
                   </div>
                )}
             </motion.div>
           </AnimatePresence>
        </main>
      </div>
  );
};

export default Settings;
