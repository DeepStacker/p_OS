import React, { useState, useEffect } from "react";
import { 
  Clock as ClockIcon, 
  Plus, 
  Trash2, 
  Globe, 
  Timer, 
  Hourglass, 
  MapPin, 
  ChevronRight,
  Sun,
  Moon,
  Zap,
  RotateCcw,
  Play,
  Pause
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const Clock = () => {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [activeTab, setActiveTab] = useState<"world" | "stopwatch" | "timer">("world");
    const [stopwatchTime, setStopwatchTime] = useState(0);
    const [isStopwatchRunning, setIsStopwatchRunning] = useState(false);

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        let interval: any;
        if (isStopwatchRunning) {
            interval = setInterval(() => setStopwatchTime(prev => prev + 10), 10);
        }
        return () => clearInterval(interval);
    }, [isStopwatchRunning]);

    const formatStopwatch = (ms: number) => {
        const m = Math.floor(ms / 60000);
        const s = Math.floor((ms % 60000) / 1000);
        const cent = Math.floor((ms % 1000) / 10);
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${cent.toString().padStart(2, '0')}`;
    };

    const worldClocks = [
        { city: "Cupertino", tz: "America/Los_Angeles", label: "US-WEST", lat: "37.3° N" },
        { city: "New York", tz: "America/New_York", label: "US-EAST", lat: "40.7° N" },
        { city: "London", tz: "Europe/London", label: "UK", lat: "51.5° N" },
        { city: "Tokyo", tz: "Asia/Tokyo", label: "JPN", lat: "35.6° N" },
        { city: "Dubai", tz: "Asia/Dubai", label: "UAE", lat: "25.2° N" },
    ];

    return (
        <div className="h-full flex flex-col bg-[#1C1C1E] text-white font-sans overflow-hidden">
            {/* Pro Sidebar Navigation */}
            <div className="flex-1 flex overflow-hidden">
                <aside className="w-20 bg-black/20 border-r border-white/5 flex flex-col items-center py-8 gap-10">
                    <button 
                        onClick={() => setActiveTab("world")} 
                        className={cn("p-3 rounded-2xl transition-all group", activeTab === "world" ? "bg-primary text-black shadow-[0_0_20px_rgba(var(--primary),0.3)]" : "text-zinc-600 hover:bg-white/5")}
                    >
                        <Globe className="h-6 w-6" />
                    </button>
                    <button 
                        onClick={() => setActiveTab("stopwatch")} 
                        className={cn("p-3 rounded-2xl transition-all group", activeTab === "stopwatch" ? "bg-primary text-black shadow-[0_0_20px_rgba(var(--primary),0.3)]" : "text-zinc-600 hover:bg-white/5")}
                    >
                        <Timer className="h-6 w-6" />
                    </button>
                    <button 
                        onClick={() => setActiveTab("timer")} 
                        className={cn("p-3 rounded-2xl transition-all group", activeTab === "timer" ? "bg-primary text-black shadow-[0_0_20px_rgba(var(--primary),0.3)]" : "text-zinc-600 hover:bg-white/5")}
                    >
                        <Hourglass className="h-6 w-6" />
                    </button>
                </aside>

                {/* Content Area */}
                <main className="flex-1 overflow-y-auto no-scrollbar p-10 bg-white/[0.01]">
                    <AnimatePresence mode="wait">
                        {activeTab === "world" && (
                            <motion.div 
                                key="world"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="space-y-12"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex flex-col">
                                        <h2 className="text-4xl font-black text-white/90 tracking-tighter">World Clock</h2>
                                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600 italic">Temporal Displacement Monitor</span>
                                    </div>
                                    <button className="w-12 h-12 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-all active:scale-95 text-primary"><Plus className="h-6 w-6" /></button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {worldClocks.map((clock, i) => {
                                        const time = new Date(new Date().toLocaleString("en-US", { timeZone: clock.tz }));
                                        const hour = time.getHours();
                                        const isDay = hour >= 6 && hour < 18;
                                        
                                        return (
                                            <motion.div 
                                                key={clock.city}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: i * 0.1 }}
                                                className="p-8 rounded-[40px] bg-zinc-900/40 border border-white/5 flex flex-col justify-between h-56 group hover:bg-zinc-900/60 transition-all shadow-3xl"
                                            >
                                                <div className="flex justify-between items-start">
                                                    <div className="flex flex-col">
                                                        <span className="text-xl font-black text-white group-hover:text-primary transition-colors">{clock.city}</span>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <MapPin className="h-3 w-3 text-zinc-600" />
                                                            <span className="text-[9px] font-black uppercase tracking-widest text-zinc-600">{clock.label} • {clock.lat}</span>
                                                        </div>
                                                    </div>
                                                    <div className={cn("px-4 py-2 rounded-xl border flex items-center gap-2", isDay ? "bg-amber-500/10 border-amber-500/20 text-amber-500" : "bg-blue-500/10 border-blue-500/20 text-blue-500")}>
                                                        {isDay ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
                                                        <span className="text-[9px] font-black uppercase tracking-widest">{isDay ? "Solar High" : "Lunar Cycle"}</span>
                                                    </div>
                                                </div>
                                                <div className="text-5xl font-black text-white/90 tracking-tighter tabular-nums flex items-end gap-2">
                                                    {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                                                    <span className="text-sm text-zinc-500 mb-1.5 uppercase font-bold tracking-widest">GMT {time.getTimezoneOffset() / -60 > 0 ? `+${time.getTimezoneOffset() / -60}` : time.getTimezoneOffset() / -60}</span>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            </motion.div>
                        )}

                        {activeTab === "stopwatch" && (
                            <motion.div 
                                key="stopwatch"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="flex flex-col items-center justify-center min-h-[400px] text-center"
                            >
                                <div className="relative mb-16">
                                    <div className="w-80 h-80 rounded-full border-8 border-white/5 flex items-center justify-center relative shadow-3xl overflow-hidden group">
                                        <div className="absolute inset-0 bg-primary/5 blur-3xl group-hover:blur-[100px] transition-all" />
                                        <svg className="absolute inset-0 w-full h-full -rotate-90">
                                            <motion.circle 
                                                cx="160" cy="160" r="148"
                                                fill="transparent"
                                                stroke="currentColor"
                                                strokeWidth="12"
                                                className="text-primary opacity-20"
                                                initial={{ pathLength: 0 }}
                                                animate={{ pathLength: (stopwatchTime % 60000) / 60000 }}
                                                transition={{ duration: 0.1 }}
                                            />
                                        </svg>
                                        <div className="flex flex-col items-center z-10">
                                            <span className="text-6xl font-black text-white tracking-tighter tabular-nums">{formatStopwatch(stopwatchTime)}</span>
                                            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-600 mt-4 italic">Precise Chrono-Pulse</span>
                                        </div>
                                    </div>
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-6 py-2 rounded-full bg-primary/20 text-primary border border-primary/20 text-[9px] font-black uppercase tracking-widest backdrop-blur-xl">Stopwatch Active</div>
                                </div>

                                <div className="flex items-center gap-8">
                                    <button 
                                        onClick={() => { setStopwatchTime(0); setIsStopwatchRunning(false); }}
                                        className="w-20 h-20 rounded-[32px] bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-all text-rose-500 group"
                                    >
                                        <RotateCcw className="h-6 w-6 transition-transform group-hover:rotate-180 duration-500" />
                                    </button>
                                    <button 
                                        onClick={() => setIsStopwatchRunning(!isStopwatchRunning)}
                                        className={cn(
                                            "w-32 h-32 rounded-[48px] border-8 flex items-center justify-center transition-all shadow-4xl group",
                                            isStopwatchRunning ? "bg-rose-500/20 border-rose-500/20 text-rose-500" : "bg-primary border-primary/20 text-black shadow-primary/20"
                                        )}
                                    >
                                        {isStopwatchRunning ? <Pause className="h-10 w-10 fill-current" /> : <Play className="h-10 w-10 fill-current" />}
                                    </button>
                                    <button className="w-20 h-20 rounded-[32px] bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-all text-emerald-500"><Zap className="h-6 w-6" /></button>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === "timer" && (
                            <motion.div 
                                key="timer"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="flex flex-col items-center justify-center min-h-[400px] text-center"
                            >
                                <div className="w-32 h-32 bg-amber-500/20 rounded-[40px] flex items-center justify-center border border-amber-500/20 text-amber-500 mb-10 shadow-3xl">
                                    <Hourglass className="h-14 w-14" />
                                </div>
                                <h1 className="text-4xl font-black text-white/90 tracking-tighter uppercase mb-2 italic">Temporal Lockdown</h1>
                                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.4em] max-w-sm leading-relaxed mb-12">Initialize duration buffer for critical session isolation.</p>
                                
                                <div className="grid grid-cols-3 gap-6 w-full max-w-lg">
                                    {[15, 30, 60].map(m => (
                                        <button key={m} className="p-10 rounded-[40px] bg-white/5 hover:bg-white/10 border border-white/10 transition-all group active:scale-95">
                                            <span className="text-4xl font-black text-white/80 block mb-2">{m}</span>
                                            <span className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.2em] group-hover:text-primary transition-colors">Minutes</span>
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </main>
            </div>

            {/* Global Timeline Footer */}
            <footer className="h-8 border-t border-white/5 bg-black/20 flex items-center justify-between px-6 shrink-0 relative z-10">
                <div className="flex items-center gap-6">
                    <span className="text-[9px] font-black uppercase tracking-widest text-zinc-600 italic">Universal Coordinate Reference</span>
                    <span className="text-[9px] font-black tracking-widest text-zinc-600">{currentTime.toLocaleDateString("en-US", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                       <div className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(var(--primary),0.5)]" />
                       <span className="text-[9px] font-black uppercase tracking-widest text-zinc-600">NTP Synchronization Active</span>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Clock;
