import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, 
  Monitor, 
  LayoutGrid, 
  X, 
  ArrowRight, 
  Maximize2, 
  BrainCircuit,
  Activity,
  Zap
} from "lucide-react";
import { useSystem } from "@/contexts/SystemContext";
import { cn } from "@/lib/utils";
import AppIcon from "./ui/AppIcon";

interface MissionControlProps {
  isOpen: boolean;
  onClose: () => void;
}

const MissionControl: React.FC<MissionControlProps> = ({ isOpen, onClose }) => {
  const { activeWindows, focusWindow, dockApps, metrics } = useSystem();
  
  // Only show non-minimized windows in Mission Control
  const visibleWindows = activeWindows.filter(win => !win.isMinimized);

  const handleSelectWindow = (id: string) => {
    focusWindow(id);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[140] bg-zinc-950/20 backdrop-blur-[60px] flex flex-col items-center select-none overflow-hidden"
      onClick={onClose}
    >
      {/* Cinematic Neural Fog Overlay */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-40">
         <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-primary/20 blur-[150px] rounded-full animate-pulse" />
         <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] bg-emerald-500/10 blur-[150px] rounded-full animate-pulse delay-700" />
      </div>

      {/* Executive Summary Bar (Prime Feature) */}
      <div className="absolute top-0 left-0 right-0 h-28 bg-gradient-to-b from-black/80 to-transparent flex items-center justify-between px-16 z-20 pointer-events-auto" onClick={e => e.stopPropagation()}>
         <div className="flex items-center gap-8">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/20 border border-primary/20 flex items-center justify-center text-primary shadow-2xl">
                    <BrainCircuit className="h-6 w-6 animate-pulse" />
                </div>
                <div>
                    <h3 className="text-xl font-black text-white italic uppercase tracking-tighter leading-none">Spatial Orchestration</h3>
                    <div className="flex items-center gap-2 mt-1.5">
                        <div className="h-1 w-1 rounded-full bg-emerald-500 shadow-[0_0_5px_emerald]" />
                        <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Unified Core Workspace active</span>
                    </div>
                </div>
            </div>
            
            <div className="h-10 w-px bg-white/5" />
            
            <div className="flex items-center gap-10">
                <div className="flex flex-col">
                    <span className="text-[8px] font-black text-zinc-500 uppercase tracking-[0.3em] mb-1">Open Modules</span>
                    <span className="text-sm font-black text-white">{visibleWindows.length} Active Nodes</span>
                </div>
                <div className="flex flex-col">
                    <span className="text-[8px] font-black text-zinc-500 uppercase tracking-[0.3em] mb-1">System Health</span>
                    <div className="flex items-center gap-2">
                        <Activity className="h-3 w-3 text-primary animate-pulse" />
                        <span className="text-sm font-black text-white">{metrics.cpu}% Core Load</span>
                    </div>
                </div>
            </div>
         </div>

         <div className="flex gap-4">
            <div className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white/10 border border-white/10 text-white shadow-2xl">
                <Monitor className="h-4 w-4 opacity-40" />
                <span className="text-[11px] font-black uppercase tracking-widest">Main Node</span>
            </div>
            <button className="w-12 h-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center hover:bg-white/10 transition-all active:scale-95 text-white/40 hover:text-white">
                <Plus className="h-5 w-5" />
            </button>
         </div>
      </div>

      {/* Spatial Window Grid */}
      <div className="w-full max-w-7xl px-20 grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-12 pt-48 pb-20 overflow-y-auto no-scrollbar relative z-10 pointer-events-auto">
         <AnimatePresence>
            {visibleWindows.length === 0 ? (
               <div className="col-span-full flex flex-col items-center justify-center py-60 opacity-10">
                  <LayoutGrid className="h-32 w-32 mb-8 stroke-[0.5]" />
                  <span className="text-3xl font-black uppercase tracking-[0.5em] italic">No Active Workspace Nodes</span>
               </div>
            ) : (
               visibleWindows.map((win, index) => {
                  const appConfig = dockApps.find(a => a.id === win.id);
                  return (
                    <motion.div
                      key={win.id}
                      layoutId={`win-${win.id}`}
                      initial={{ opacity: 0, scale: 0.8, y: 40 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.8, y: 40 }}
                      transition={{ delay: index * 0.05, type: "spring", stiffness: 200, damping: 25 }}
                      className="group relative"
                    >
                       {/* High-Fidelity Window Card */}
                       <div 
                         onClick={(e) => { e.stopPropagation(); handleSelectWindow(win.id); }}
                         className="w-full aspect-video bg-zinc-900/60 rounded-[32px] border border-white/10 shadow-5xl overflow-hidden cursor-pointer transition-all duration-500 hover:ring-4 hover:ring-primary/20 relative group-hover:scale-[1.03] group-hover:-translate-y-2 group-active:scale-95 flex flex-col"
                       >
                          {/* Card Header Profile */}
                          <div className="h-10 px-5 flex items-center justify-between border-b border-white/5 bg-white/5 backdrop-blur-xl">
                             <div className="flex items-center gap-3">
                                <div className="flex gap-1.5">
                                   <div className="w-2.5 h-2.5 rounded-full bg-rose-500/20 group-hover:bg-rose-500 transition-colors" />
                                   <div className="w-2.5 h-2.5 rounded-full bg-amber-500/20 group-hover:bg-amber-500 transition-colors" />
                                   <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/20 group-hover:bg-emerald-500 transition-colors" />
                                </div>
                                <div className="h-3 w-px bg-white/10 mx-1" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-white/40 group-hover:text-white transition-colors">{win.title}</span>
                             </div>
                             <Maximize2 className="h-3 w-3 text-white/20 group-hover:text-primary transition-colors" />
                          </div>

                          {/* Snapshot Representation */}
                          <div className="flex-1 relative overflow-hidden flex items-center justify-center">
                             {/* Category-based background gradient */}
                             <div className={cn(
                                "absolute inset-0 opacity-10 blur-3xl",
                                appConfig?.category === 'system' && "bg-blue-500",
                                appConfig?.category === 'productivity' && "bg-amber-500",
                                appConfig?.category === 'media' && "bg-purple-500",
                                appConfig?.category === 'pro' && "bg-emerald-500",
                                appConfig?.category === 'web' && "bg-cyan-500"
                             )} />
                             
                             <div className="relative z-10 flex flex-col items-center gap-6">
                                <AppIcon icon={appConfig?.icon || LayoutGrid} category={appConfig?.category || 'system'} size="xl" glow={false} />
                                <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/5 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0">
                                   <div className="flex items-center gap-2">
                                      <Zap className="h-3 w-3 text-primary animate-pulse" />
                                      <span className="text-[9px] font-black uppercase tracking-widest text-white">Focus Node</span>
                                   </div>
                                </div>
                             </div>
                          </div>

                          {/* Footer Intelligence */}
                          <div className="h-8 px-5 border-t border-white/5 bg-black/40 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                             <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest italic">Process ID: {win.id.toUpperCase()}</span>
                             <div className="flex gap-1">
                                {[1,2,3].map(i => <div key={i} className="w-1 h-1 rounded-full bg-primary/40 animate-pulse" style={{ animationDelay: `${i * 100}ms` }} />)}
                             </div>
                          </div>
                       </div>
                    </motion.div>
                  );
               })
            )}
         </AnimatePresence>
      </div>

      {/* Spatial Legend Bar */}
      <div className="absolute bottom-12 flex gap-6 px-10 py-4 bg-zinc-900/60 backdrop-blur-2xl border border-white/10 rounded-[28px] shadow-4xl text-white/40">
         <div className="flex items-center gap-3">
            <span className="text-[9px] font-black uppercase tracking-widest">Esc: Close</span>
            <span className="text-[9px] font-black uppercase tracking-widest opacity-20">|</span>
            <span className="text-[9px] font-black uppercase tracking-widest">Click: Focus Node</span>
         </div>
      </div>
      
      {/* Decorative Close Trigger (Top Right) */}
      <button onClick={onClose} className="absolute top-10 right-10 w-12 h-12 rounded-full flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all text-white/20 border border-white/5 backdrop-blur-xl group">
         <X className="h-6 w-6 group-hover:rotate-90 transition-transform duration-500" />
      </button>

    </motion.div>
  );
};

export default MissionControl;
