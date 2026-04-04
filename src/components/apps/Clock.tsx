import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Clock as ClockIcon, AlarmClock, Timer, History, Plus, BellRing } from "lucide-react";
import { cn } from "@/lib/utils";

const Clock = () => {
    const [time, setTime] = useState(new Date());
    const [activeTab, setActiveTab] = useState("world");
    const [timer, setTimer] = useState(0);
    const [timerRunning, setTimerRunning] = useState(false);

    useEffect(() => {
        const t = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(t);
    }, []);

    useEffect(() => {
        let interval: any;
        if (timerRunning && timer > 0) {
            interval = setInterval(() => setTimer(prev => prev - 1), 1000);
        } else if (timer === 0) {
            setTimerRunning(false);
            clearInterval(interval);
        }
        return () => clearInterval(interval);
    }, [timerRunning, timer]);

    const formatTime = (t: number) => {
        const m = Math.floor(t / 60);
        const s = t % 60;
        return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    };

    const tabs = [
        { id: "world", label: "World Clock", icon: ClockIcon },
        { id: "alarm", label: "Alarms", icon: AlarmClock },
        { id: "timer", label: "Timer", icon: Timer },
    ];

    return (
        <div className="h-full flex flex-col bg-[#1C1C1E] text-white font-sans select-none overflow-hidden">
            {/* Header / Tabs */}
            <div className="flex bg-[#2C2C2E]/50 border-b border-white/5 px-4 pt-4 gap-4">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={cn(
                            "flex flex-col items-center gap-1.5 pb-2 transition-all group relative px-2",
                            activeTab === tab.id ? "text-orange-500" : "text-zinc-500 hover:text-zinc-300"
                        )}
                    >
                        <tab.icon className="h-5 w-5" />
                        <span className="text-[10px] font-black uppercase tracking-widest">{tab.label}</span>
                        {activeTab === tab.id && <motion.div layoutId="clock-tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500 rounded-full" />}
                    </button>
                ))}
            </div>

            <div className="flex-1 p-8 overflow-y-auto custom-scrollbar">
                {activeTab === "world" && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-500">
                        <div className="flex flex-col items-center justify-center p-12 bg-white/5 rounded-[40px] border border-white/5 shadow-2xl relative overflow-hidden group">
                           <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-orange-500/10 to-transparent pointer-events-none" />
                           <h1 className="text-7xl font-black tracking-tighter mb-2 tabular-nums">{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}</h1>
                           <span className="text-zinc-500 font-black uppercase text-sm tracking-widest leading-loose">Local Time Index</span>
                           <div className="flex items-center gap-2 mt-2 px-3 py-1 bg-white/5 rounded-full border border-white/5 text-[10px] font-black uppercase tracking-widest opacity-60">
                              <History className="h-3.5 w-3.5" /> Synchronized with Node Timebase
                           </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {[
                                { city: "New York", time: new Date(new Date().setHours(new Date().getHours() - 9.5)), diff: "-9h 30m" },
                                { city: "London", time: new Date(new Date().setHours(new Date().getHours() - 4.5)), diff: "-4h 30m" },
                                { city: "Tokyo", time: new Date(new Date().setHours(new Date().getHours() + 3.5)), diff: "+3h 30m" },
                                { city: "Sydney", time: new Date(new Date().setHours(new Date().getHours() + 5.5)), diff: "+5h 30m" },
                            ].map(loc => (
                                <div key={loc.city} className="p-5 rounded-3xl bg-white/5 border border-white/5 flex items-center justify-between group hover:bg-white/10 transition-all">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{loc.city}</span>
                                        <span className="text-xl font-bold tracking-tight">{loc.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}</span>
                                    </div>
                                    <span className="text-[9px] font-black text-orange-500 opacity-60 group-hover:opacity-100">{loc.diff}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === "alarm" && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-5 duration-500">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-zinc-500">Scheduled Alarms</h3>
                            <button className="h-8 w-8 rounded-full bg-orange-500 hover:bg-orange-600 flex items-center justify-center transition-all active:scale-90"><Plus className="h-4 w-4" /></button>
                        </div>
                        {[
                            { time: "07:30", active: true, label: "Wake Up", days: "Mon-Fri" },
                            { time: "09:00", active: false, label: "Stand Up", days: "Daily" },
                            { time: "18:00", active: true, label: "Kernel Sync", days: "Mon, Wed, Fri" }
                        ].map(alarm => (
                            <div key={alarm.time} className="p-6 rounded-[32px] bg-white/5 border border-white/5 flex items-center justify-between group hover:bg-white/10 transition-all">
                                <div className="flex items-center gap-6">
                                    <div className="flex flex-col">
                                        <span className={cn("text-4xl font-black tracking-tighter opacity-100", !alarm.active && "opacity-20")}>{alarm.time}</span>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{alarm.label}</span>
                                            <span className="text-[9px] font-bold text-primary opacity-40 italic">{alarm.days}</span>
                                        </div>
                                    </div>
                                </div>
                                <button className={cn(
                                    "w-12 h-6 rounded-full p-1 transition-all duration-300 relative",
                                    alarm.active ? "bg-orange-500 shadow-lg shadow-orange-500/20" : "bg-zinc-800"
                                )}>
                                    <div className={cn("w-4 h-4 bg-white rounded-full transition-all", alarm.active ? "translate-x-6" : "translate-x-0")} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === "timer" && (
                    <div className="flex flex-col items-center justify-center h-full animate-in zoom-in-95 duration-500">
                        <div className="w-56 h-56 rounded-full border-4 border-orange-500/20 flex flex-col items-center justify-center relative mb-12 shadow-2xl">
                           <div className="absolute inset-2 border border-white/5 rounded-full shadow-inner" />
                           <motion.div 
                              animate={timerRunning ? { rotate: 360 } : {}}
                              transition={{ repeat: Infinity, duration: 60, ease: "linear" }}
                              className="absolute inset-[2px] border-t-4 border-orange-500 rounded-full" 
                           />
                           <h2 className="text-5xl font-black tracking-tighter tabular-nums mb-1">{formatTime(timer || 1200)}</h2>
                           <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Remaining</span>
                        </div>

                        <div className="flex gap-4 w-full max-w-xs">
                           <button 
                              onClick={() => { setTimer(0); setTimerRunning(false); }}
                              className="flex-1 py-4 rounded-2xl bg-white/5 border border-white/5 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all active:scale-95"
                           >
                              Reset
                           </button>
                           <button 
                              onClick={() => { if (timer === 0) setTimer(1200); setTimerRunning(!timerRunning); }}
                              className={cn(
                                 "flex-1 py-4 rounded-2xl border text-[10px] font-black uppercase tracking-widest transition-all active:scale-95",
                                 timerRunning ? "bg-rose-500/20 text-rose-500 border-rose-500/30" : "bg-orange-500 text-white border-orange-500/30 shadow-lg shadow-orange-500/20"
                              )}
                           >
                              {timerRunning ? "Pause" : "Start"}
                           </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Clock;
