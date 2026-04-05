import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Monitor, LayoutGrid, X } from "lucide-react";
import { useSystem } from "@/contexts/SystemContext";
import { cn } from "@/lib/utils";

interface MissionControlProps {
  isOpen: boolean;
  onClose: () => void;
}

const MissionControl: React.FC<MissionControlProps> = ({ isOpen, onClose }) => {
  const { activeWindows, focusWindow } = useSystem();
  
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
      className="fixed inset-0 z-[140] bg-zinc-950/40 backdrop-blur-3xl flex flex-col items-center pt-24 select-none overflow-hidden"
      onClick={onClose}
    >
      {/* Spaces Bar (Sequoia Style) */}
      <div className="absolute top-0 left-0 right-0 h-20 bg-white/5 border-b border-white/5 flex items-center justify-center gap-4 px-10" onClick={e => e.stopPropagation()}>
         <div className="flex gap-4">
            <div className="px-6 py-2 rounded-xl bg-white/20 border border-white/20 flex items-center gap-3 shadow-lg">
               <Monitor className="h-4 w-4" />
               <span className="text-[11px] font-black uppercase tracking-widest text-white">Desktop 1</span>
            </div>
            <button className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors">
               <Plus className="h-4 w-4 text-white/40" />
            </button>
         </div>
      </div>

      {/* Window Spread Grid */}
      <div className="w-full max-w-7xl px-20 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 pt-10 auto-rows-fr">
         <AnimatePresence>
            {visibleWindows.length === 0 && (
               <div className="col-span-full flex flex-col items-center justify-center py-40 opacity-20">
                  <LayoutGrid className="h-20 w-20 mb-4" />
                  <span className="text-xl font-black uppercase tracking-widest">No Active Windows</span>
               </div>
            )}
            {visibleWindows.map((win, index) => (
               <motion.div
                 key={win.id}
                 layoutId={`win-${win.id}`}
                 initial={{ opacity: 0, scale: 0.8, y: 20 }}
                 animate={{ opacity: 1, scale: 1, y: 0 }}
                 exit={{ opacity: 0, scale: 0.8, y: 20 }}
                 transition={{ delay: index * 0.05, type: "spring", stiffness: 300, damping: 30 }}
                 className="group relative cursor-pointer"
                 onClick={(e) => { e.stopPropagation(); handleSelectWindow(win.id); }}
               >
                  {/* Window Tile Meta */}
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-1 bg-white/10 rounded-lg backdrop-blur-md border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity">
                     <div className="opacity-60">{win.icon}</div>
                     <span className="text-[10px] font-black uppercase tracking-widest whitespace-nowrap">{win.title}</span>
                  </div>

                  {/* Window Representation */}
                  <div className="w-full h-full aspect-video bg-zinc-900/60 rounded-2xl border border-white/10 shadow-2xl overflow-hidden group-hover:ring-2 group-hover:ring-primary transition-all relative">
                     <div className="h-6 w-full bg-white/5 border-b border-white/5 flex items-center px-3 gap-2">
                        <div className="w-2 h-2 rounded-full bg-rose-500/40" />
                        <div className="w-2 h-2 rounded-full bg-amber-500/40" />
                        <div className="w-2 h-2 rounded-full bg-emerald-500/40" />
                     </div>
                     <div className="absolute inset-0 flex items-center justify-center opacity-10 group-hover:opacity-40 transition-opacity">
                        {win.icon && React.cloneElement(win.icon as React.ReactElement, { className: "w-20 h-20" })}
                     </div>
                  </div>
               </motion.div>
            ))}
         </AnimatePresence>
      </div>

      {/* Mini App Shortcuts (Optional Visual Indicator) */}
      <div className="absolute bottom-10 flex gap-2">
         {visibleWindows.map(win => (
            <div key={win.id} className="w-2 h-2 rounded-full bg-white/20 animate-pulse" />
         ))}
      </div>
    </motion.div>
  );
};

export default MissionControl;
