import React, { useState, useEffect } from "react";
import BaseWidget from "./BaseWidget";
import { Clock } from "lucide-react";

const ClockWidget: React.FC<{ id: string; x: number; y: number }> = ({ id, x, y }) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <BaseWidget id={id} x={x} y={y}>
      <div className="w-48 h-48 rounded-[40px] bg-black/40 backdrop-blur-3xl border border-white/10 p-6 flex flex-col items-center justify-center space-y-2 shadow-2xl group-hover:scale-105 transition-transform duration-500 overflow-hidden relative">
        {/* Analog Circle Background */}
        <div className="absolute inset-4 rounded-full border border-white/5 opacity-20" />
        
        <Clock className="h-6 w-6 text-primary absolute top-6" />
        
        <div className="text-4xl font-black text-white/90 tracking-tighter tabular-nums pt-6">
          {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
        </div>
        
        <div className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600 italic">
          {time.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
        </div>

        {/* Pulse Heartbeat */}
        <div className="absolute bottom-6 h-1 w-12 bg-primary/20 rounded-full overflow-hidden">
           <div className="h-full bg-primary/60 rounded-full w-1/3 animate-pulse" />
        </div>
      </div>
    </BaseWidget>
  );
};

export default ClockWidget;
