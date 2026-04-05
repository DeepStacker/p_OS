import React from "react";
import BaseWidget from "./BaseWidget";
import { useSystem } from "@/contexts/SystemContext";
import { Activity, Cpu, Database } from "lucide-react";
import { motion } from "framer-motion";

const MetricsWidget: React.FC<{ id: string; x: number; y: number }> = ({ id, x, y }) => {
  const { metrics } = useSystem();
  
  return (
    <BaseWidget id={id} x={x} y={y}>
      <div className="w-48 h-48 rounded-[40px] bg-black/40 backdrop-blur-3xl border border-white/10 p-6 flex flex-col justify-between shadow-2xl group-hover:scale-105 transition-transform duration-500 overflow-hidden relative">
        <header className="flex items-center justify-between">
           <Activity className="h-4 w-4 text-primary" />
           <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600 italic">Neural_Load</span>
        </header>
        
        <div className="space-y-4">
           <div className="space-y-1">
              <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-white/50">
                 <div className="flex items-center gap-2"><Cpu className="h-3 w-3" /> CPU</div>
                 <span>{metrics.cpu}%</span>
              </div>
              <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                 <motion.div animate={{ width: `${metrics.cpu}%` }} className="h-full bg-primary" />
              </div>
           </div>
           
           <div className="space-y-1">
              <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-white/50">
                 <div className="flex items-center gap-2"><Database className="h-3 w-3" /> VFS</div>
                 <span>{Math.floor((metrics.ram/16)*100)}%</span>
              </div>
              <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                 <motion.div animate={{ width: `${(metrics.ram/16)*100}%` }} className="h-full bg-emerald-500" />
              </div>
           </div>
        </div>

        {/* Global Latency Matrix */}
        <div className="flex gap-1 items-end h-8">
           {[4,7,3,9,5,8,4,6].map((h, i) => (
             <motion.div 
               key={i} 
               animate={{ height: [`${h*10}%`, `${(h+2)*10}%`, `${h*10}%`] }}
               transition={{ repeat: Infinity, duration: 2, delay: i * 0.2 }}
               className="flex-1 bg-white/[0.05] rounded-t-sm" 
             />
           ))}
        </div>
      </div>
    </BaseWidget>
  );
};

export default MetricsWidget;
