import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Activity, 
  ShieldCheck, 
  Cpu, 
  Database, 
  Zap, 
  BrainCircuit, 
  Fingerprint,
  ChevronUp,
  ChevronDown
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSystem } from "@/contexts/SystemContext";

const NeuralHUD: React.FC = () => {
  const { metrics, powerStatus } = useSystem();
  const [isMinimized, setIsMinimized] = useState(false);
  
  if (powerStatus === 'locked' || powerStatus === 'sleep') return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className={cn(
        "fixed top-24 right-4 z-[90] bg-zinc-950/40 backdrop-blur-3xl border border-white/10 rounded-[28px] shadow-5xl transition-all duration-500 overflow-hidden",
        isMinimized ? "w-12 h-12" : "w-64"
      )}
    >
      {/* Neural Background Accents */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
         <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-3xl rounded-full animate-pulse" />
      </div>

      <header className="h-12 px-4 flex items-center justify-between border-b border-white/5 relative z-10">
         <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-primary/20 flex items-center justify-center text-primary border border-primary/20">
               <BrainCircuit className="h-3.5 w-3.5" />
            </div>
            {!isMinimized && (
                <div>
                   <h4 className="text-[10px] font-black text-white italic uppercase tracking-tighter">Neural HUD</h4>
                   <span className="text-[7px] font-black text-zinc-600 uppercase tracking-widest leading-none">Prime Prime_01</span>
                </div>
            )}
         </div>
         <button onClick={() => setIsMinimized(!isMinimized)} className="p-1.5 hover:bg-white/5 rounded-lg transition-all text-zinc-600 hover:text-white">
            {isMinimized ? <ChevronDown className="h-3 w-3" /> : <ChevronUp className="h-3 w-3" />}
         </button>
      </header>

      <AnimatePresence>
        {!isMinimized && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="p-5 space-y-6 relative z-10"
          >
            {/* System Health Radials */}
            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-2">
                  <div className="flex items-center justify-between">
                     <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest italic">Core_Process</span>
                     <span className="text-[9px] font-black text-primary">{metrics.cpu}%</span>
                  </div>
                  <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                     <motion.div 
                       initial={{ width: 0 }} 
                       animate={{ width: `${metrics.cpu}%` }} 
                       className="h-full bg-primary shadow-[0_0_8px_rgba(var(--primary),0.5)]" 
                     />
                  </div>
               </div>
               <div className="space-y-2">
                  <div className="flex items-center justify-between">
                     <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest italic">VFS_Memory</span>
                     <span className="text-[9px] font-black text-emerald-500">{Math.floor((metrics.ram/16)*100)}%</span>
                  </div>
                  <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                     <motion.div 
                       initial={{ width: 0 }} 
                       animate={{ width: `${(metrics.ram/16)*100}%` }} 
                       className="h-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" 
                     />
                  </div>
               </div>
            </div>

            {/* Neural State Telemetry */}
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 space-y-4">
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group">
                         <Zap className="h-4 w-4 animate-pulse" />
                      </div>
                      <div className="flex flex-col text-left">
                         <span className="text-[9px] font-black text-white uppercase tracking-tighter italic">Sequoia Intelligence</span>
                         <div className="flex items-center gap-1">
                            <div className="w-1 h-1 rounded-full bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,1)]" />
                            <span className="text-[7px] font-black text-zinc-600 uppercase tracking-widest">Active Synthesis</span>
                         </div>
                      </div>
                   </div>
                   <ShieldCheck className="h-4 w-4 text-emerald-500/40" />
                </div>

                <div className="pt-2 border-t border-white/5">
                   <div className="flex items-center justify-between text-[7px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-2 px-1 italic">
                      <span>Neural Stream Context</span>
                      <span className="text-primary opacity-40">Live: 98%</span>
                   </div>
                   <div className="space-y-1">
                      <div className="h-0.5 w-[90%] bg-primary/40 rounded-full" />
                      <div className="h-0.5 w-[75%] bg-primary/20 rounded-full" />
                      <div className="h-0.5 w-[85%] bg-primary/30 rounded-full" />
                   </div>
                </div>
            </div>

            {/* Security Clearing */}
            <div className="flex items-center justify-between px-2">
               <div className="flex items-center gap-2">
                  <Fingerprint className="h-3 w-3 text-primary opacity-40" />
                  <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest italic">Identity: ROOT_LEVEL</span>
               </div>
               <div className="px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-[7px] font-black text-emerald-500 uppercase tracking-widest">SECURE</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default NeuralHUD;
