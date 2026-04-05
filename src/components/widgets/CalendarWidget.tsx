import React from "react";
import BaseWidget from "./BaseWidget";
import { Calendar as CalendarIcon } from "lucide-react";

const CalendarWidget: React.FC<{ id: string; x: number; y: number }> = ({ id, x, y }) => {
  const date = new Date();
  
  return (
    <BaseWidget id={id} x={x} y={y}>
      <div className="w-48 h-48 rounded-[40px] bg-black/40 backdrop-blur-3xl border border-white/10 p-6 flex flex-col items-center justify-center space-y-4 shadow-2xl group-hover:scale-105 transition-transform duration-500 overflow-hidden relative">
        <div className="absolute top-0 inset-x-0 h-1 bg-primary/20" />
        
        <div className="text-primary font-black uppercase tracking-[0.4em] text-[10px] italic">
          {date.toLocaleString('default', { month: 'long' })}
        </div>
        
        <div className="text-6xl font-black text-white italic tracking-tighter tabular-nums leading-none">
          {date.getDate()}
        </div>
        
        <div className="flex items-center gap-2">
           <CalendarIcon className="h-3 w-3 text-zinc-700" />
           <span className="text-[9px] font-black uppercase tracking-widest text-zinc-600">Sync_Schedule</span>
        </div>

        {/* Neural Grid Overlay */}
        <div className="absolute inset-0 grid grid-cols-7 grid-rows-5 gap-1 p-8 opacity-[0.03] pointer-events-none">
           {Array.from({ length: 35 }).map((_, i) => (
             <div key={i} className="bg-white rounded-sm" />
           ))}
        </div>
      </div>
    </BaseWidget>
  );
};

export default CalendarWidget;
