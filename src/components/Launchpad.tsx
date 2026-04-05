import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X } from "lucide-react";
import { useSystem } from "@/contexts/SystemContext";
import { cn } from "@/lib/utils";
import AppIcon from "./ui/AppIcon";

interface LaunchpadProps {
  isOpen: boolean;
  onClose: () => void;
}

const Launchpad: React.FC<LaunchpadProps> = ({ isOpen, onClose }) => {
  const { dockApps, openWindow } = useSystem();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredApps = dockApps.filter(app => 
    app.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleLaunch = (app: any) => {
    openWindow(app.id, app.name, <app.icon className="h-4 w-4" />, app.component);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 1.1 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.1 }}
      transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
      className="fixed inset-0 z-[150] bg-black/40 backdrop-blur-[50px] flex flex-col items-center pt-[10vh] overflow-hidden select-none"
      onClick={onClose}
    >
      {/* Search Bar */}
      <div className="w-full max-w-sm px-6 mb-20 relative group" onClick={e => e.stopPropagation()}>
         <Search className="absolute left-10 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30 group-hover:text-primary transition-colors" />
         <input 
           autoFocus
           value={searchQuery}
           onChange={e => setSearchQuery(e.target.value)}
           placeholder="Search Apps..."
           className="w-full bg-white/10 border border-white/5 rounded-xl py-3 pl-12 pr-4 text-sm font-black text-white focus:outline-none focus:ring-1 focus:ring-primary/40 placeholder:text-white/20 transition-all uppercase tracking-widest bg-zinc-900/40 backdrop-blur-3xl shadow-2xl"
         />
      </div>

      {/* App Grid */}
      <div className="w-full max-w-5xl px-12 grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-12" onClick={e => e.stopPropagation()}>
         <AnimatePresence mode="popLayout">
            {filteredApps.map((app, i) => (
              <motion.button
                key={app.id}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{ delay: i * 0.02, type: "spring", stiffness: 300, damping: 30 }}
                onClick={() => handleLaunch(app)}
                className="flex flex-col items-center gap-4 group outline-none"
              >
                 <div className="relative group-hover:scale-110 transition-transform duration-500 pointer-events-none">
                    <AppIcon icon={app.icon} category={app.category} size="xl" />
                    {/* App Badge Simulation */}
                    <div className="absolute -top-3 -right-3 w-8 h-8 bg-rose-500 rounded-full border-4 border-black/80 text-[11px] font-black flex items-center justify-center text-white scale-0 group-hover:scale-100 transition-transform shadow-2xl z-20">3</div>
                 </div>
                 <span className="text-[12px] font-black uppercase tracking-widest text-white/50 group-hover:text-white group-hover:drop-shadow-lg transition-all">{app.name}</span>
              </motion.button>
            ))}
         </AnimatePresence>
      </div>

      {/* Pagination Dots (Visual Only) */}
      <div className="absolute bottom-20 flex gap-2">
         <div className="w-2 h-2 rounded-full bg-white/80 shadow-[0_0_8px_white]" />
         <div className="w-2 h-2 rounded-full bg-white/20" />
      </div>
    </motion.div>
  );
};

export default Launchpad;
