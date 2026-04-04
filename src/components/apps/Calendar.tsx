import React, { useState } from "react";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const Calendar = () => {
    const [date, setDate] = useState(new Date());
    const daysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate();
    const firstDayOfMonth = (y: number, m: number) => new Date(y, m, 1).getDay();
    
    const year = date.getFullYear();
    const month = date.getMonth();
    const today = new Date();
    
    const days = Array.from({ length: daysInMonth(year, month) }, (_, i) => i + 1);
    const blanks = Array.from({ length: firstDayOfMonth(year, month) }, (_, i) => i);
    
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    return (
        <div className="h-full flex flex-col bg-zinc-950 p-6 text-white font-sans select-none">
            <div className="flex items-center justify-between mb-8">
                <div className="flex flex-col">
                    <h2 className="text-2xl font-black tracking-tight">{monthNames[month]}</h2>
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary opacity-60">{year}</span>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => setDate(new Date(year, month - 1))} className="p-2 hover:bg-white/5 rounded-full border border-white/5 transition-all active:scale-95"><ChevronLeft className="h-5 w-5" /></button>
                    <button onClick={() => setDate(new Date())} className="px-3 py-1 text-[9px] font-black uppercase tracking-widest hover:bg-primary/20 rounded-lg transition-all border border-primary/20">Today</button>
                    <button onClick={() => setDate(new Date(year, month + 1))} className="p-2 hover:bg-white/5 rounded-full border border-white/5 transition-all active:scale-95"><ChevronRight className="h-5 w-5" /></button>
                </div>
            </div>

            <div className="grid grid-cols-7 gap-y-6 flex-1">
                {["S", "M", "T", "W", "T", "F", "S"].map(d => (
                    <div key={d} className="text-center text-[9px] font-black text-zinc-600 uppercase tracking-widest">{d}</div>
                ))}
                {blanks.map(b => (
                    <div key={`blank-${b}`} className="h-10" />
                ))}
                {days.map(d => {
                    const isToday = today.getDate() === d && today.getMonth() === month && today.getFullYear() === year;
                    return (
                        <div key={d} className="flex items-center justify-center h-10">
                            <div className={cn(
                                "w-10 h-10 rounded-full flex items-center justify-center text-[13px] font-bold transition-all relative group",
                                isToday ? "bg-primary text-white shadow-xl shadow-primary/30" : "hover:bg-white/5"
                            )}>
                                {d}
                                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full opacity-0 group-hover:opacity-40" />
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="mt-8 p-4 bg-white/5 rounded-2xl border border-white/5 flex items-center gap-4">
                <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary shadow-inner">
                   <CalendarIcon className="h-5 w-5" />
                </div>
                <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">System Agenda</span>
                    <span className="text-xs font-bold text-white/80 uppercase">No Kernel Events Scheduled</span>
                </div>
            </div>
        </div>
    );
};

export default Calendar;
