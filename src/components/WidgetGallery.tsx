import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, 
  Plus, 
  Clock, 
  Calendar, 
  Activity, 
  FileText,
  CloudLightning,
  Sparkles
} from "lucide-react";
import { useSystem, WidgetType } from "@/contexts/SystemContext";
import { cn } from "@/lib/utils";

interface WidgetGalleryProps {
  isOpen: boolean;
  onClose: () => void;
}

const WidgetGallery: React.FC<WidgetGalleryProps> = ({ isOpen, onClose }) => {
  const { addWidget } = useSystem();

  const widgets: { type: WidgetType; name: string; icon: any; color: string; desc: string }[] = [
    { type: "clock", name: "Prime Clock", icon: Clock, color: "text-primary", desc: "Neural temporal synchronization." },
    { type: "calendar", name: "Schedule Node", icon: Calendar, color: "text-blue-500", desc: "Professional event synthesis." },
    { type: "metrics", name: "Kernel Flux", icon: Activity, color: "text-purple-500", desc: "Real-time system telemetry." },
    { type: "notes", name: "Sticky Note", icon: FileText, color: "text-amber-500", desc: "Rapid information capture." },
  ];

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[1000] bg-black/60 backdrop-blur-3xl flex items-center justify-center p-10 select-none"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="w-full max-w-6xl bg-zinc-900/60 border border-white/10 rounded-[64px] shadow-5xl overflow-hidden flex flex-col p-16 space-y-12 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute inset-0 bg-primary/2 flex items-center justify-center pointer-events-none opacity-20">
           <CloudLightning className="h-[600px] w-[600px] text-primary/10 animate-pulse" />
        </div>

        <header className="flex items-center justify-between relative z-10 border-b border-white/5 pb-12">
          <div className="space-y-4">
             <div className="flex items-center gap-3">
                <Sparkles className="h-5 w-5 text-primary" />
                <h2 className="text-[12px] font-black text-primary uppercase tracking-[0.4em]">Widget Synthesis Hub</h2>
             </div>
             <h1 className="text-5xl font-black text-white italic tracking-tighter uppercase leading-none">Customize <br/> Environment</h1>
          </div>
          <button onClick={onClose} className="h-16 w-16 rounded-[28px] bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-all active:scale-90"><X className="h-8 w-8" /></button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 relative z-10">
          {widgets.map((w, i) => (
            <motion.div
              key={w.type}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="group p-10 rounded-[48px] bg-white/[0.02] border border-white/5 hover:bg-white/5 transition-all cursor-pointer flex flex-col items-center justify-center text-center space-y-6 shadow-2xl relative"
              onClick={() => { addWidget(w.type); onClose(); }}
            >
               <div className={cn("w-20 h-20 rounded-[32px] bg-white/5 flex items-center justify-center border border-white/5 shadow-3xl transition-transform group-hover:scale-110 group-hover:rotate-6", w.color)}>
                  <w.icon className="h-10 w-10" />
               </div>
               <div className="space-y-2">
                  <h3 className="text-xl font-black text-white italic uppercase tracking-tight">{w.name}</h3>
                  <p className="text-[11px] font-bold text-zinc-500 italic uppercase px-4 leading-relaxed group-hover:text-primary transition-colors">"{w.desc}"</p>
               </div>
               <div className="pt-4">
                  <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center border border-primary/20 text-primary opacity-0 group-hover:opacity-100 transition-all group-active:scale-90">
                     <Plus className="h-6 w-6" />
                  </div>
               </div>
            </motion.div>
          ))}
        </div>

        <footer className="pt-10 flex items-center justify-center gap-4 relative z-10 opacity-20 italic">
           <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600 italic">Select node to inject into system desktop</span>
           <div className="h-2 w-2 rounded-full bg-primary animate-ping" />
        </footer>
      </motion.div>
    </motion.div>
  );
};

export default WidgetGallery;
