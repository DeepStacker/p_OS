import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Command, FileText, Zap, ArrowRight, Folder } from "lucide-react";
import { useSystem, VFSNode, AppCategory } from "@/contexts/SystemContext";
import { cn } from "@/lib/utils";
import AppIcon from "./ui/AppIcon";

interface SpotlightProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SearchResult {
  id: string;
  type: "app" | "file" | "folder";
  name: string;
  icon: any;
  category?: AppCategory;
  path?: string;
  action: () => void;
}

const Spotlight: React.FC<SpotlightProps> = ({ isOpen, onClose }) => {
  const { dockApps, vfs, openWindow, addLog } = useSystem();
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // --- Search Logic ---
  const getResults = (): SearchResult[] => {
    if (!query.trim()) return [];

    const results: SearchResult[] = [];
    const q = query.toLowerCase();

    // 1. Search Apps (Dock Apps)
    dockApps.forEach(app => {
      if (app.name.toLowerCase().includes(q)) {
        results.push({ 
          id: app.id, 
          type: "app", 
          name: app.name, 
          icon: app.icon, 
          category: app.category,
          action: () => { openWindow(app.id, app.name, <app.icon className="h-4 w-4" />, app.component); onClose(); } 
        });
      }
    });

    // 2. Search VFS (Simple recursive search)
    const searchVFS = (node: VFSNode, path: string) => {
      if (node.name.toLowerCase().includes(q) && node.name !== "root") {
        results.push({ 
          id: `file-${node.name}-${node.updatedAt}`, 
          type: node.type === "directory" ? "folder" : "file", 
          name: node.name, 
          icon: node.type === "directory" ? Folder : FileText, 
          path,
          action: () => { 
            if (node.type === "file") openWindow("notes", "Notes", <FileText className="h-4 w-4" />, "notes"); 
            else addLog(`Finder: Navigating to ${path}`, "info");
            onClose(); 
          } 
        });
      }
      if (node.children) {
        Object.values(node.children).forEach(child => searchVFS(child, `${path}/${child.name}`));
      }
    };
    searchVFS(vfs, "");

    return results.slice(0, 8);
  };

  const results = getResults();

  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % results.length);
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + results.length) % results.length);
    }
    if (e.key === "Enter" && results[selectedIndex]) results[selectedIndex].action();
    if (e.key === "Escape") onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-start justify-center pt-[15vh] bg-black/20 backdrop-blur-sm pointer-events-auto" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: -20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -20 }}
        className="w-full max-w-2xl bg-zinc-900/60 backdrop-blur-3xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="h-20 flex items-center px-8 gap-6 border-b border-white/5 bg-white/5">
          <Search className="h-8 w-8 text-primary opacity-60" />
          <input
            ref={inputRef}
            className="flex-1 bg-transparent border-none text-2xl font-black italic focus:outline-none placeholder:text-white/10 text-white uppercase tracking-tighter"
            placeholder="Spotlight System Query..."
            value={query}
            onChange={e => { setQuery(e.target.value); setSelectedIndex(0); }}
            onKeyDown={handleKeyDown}
          />
          <div className="flex items-center gap-1.5 opacity-20">
             <div className="px-2 py-1 rounded-lg bg-white/10 text-[10px] font-black uppercase tracking-widest border border-white/10">Esc</div>
          </div>
        </div>

        <div className="max-h-[500px] overflow-y-auto custom-scrollbar p-3 space-y-1">
           <AnimatePresence mode="popLayout">
              {results.length > 0 ? (
                 results.map((res, i) => (
                   <motion.button
                     key={res.id}
                     initial={{ opacity: 0, x: -10 }}
                     animate={{ opacity: 1, x: 0 }}
                     transition={{ delay: i * 0.05 }}
                     onClick={res.action}
                     onMouseEnter={() => setSelectedIndex(i)}
                     className={cn(
                       "w-full flex items-center justify-between px-6 py-4 rounded-[24px] transition-all group",
                       selectedIndex === i ? "bg-white/10 shadow-2xl scale-[1.01]" : "hover:bg-white/5"
                     )}
                   >
                     <div className="flex items-center gap-6">
                        <AppIcon 
                          icon={res.icon} 
                          category={res.category || "system"} 
                          size="md" 
                          glow={selectedIndex === i}
                          className={cn(res.type !== "app" && "bg-zinc-800 opacity-60")}
                        />
                        <div className="flex flex-col items-start">
                           <span className={cn("text-lg font-black uppercase tracking-tight italic", selectedIndex === i ? "text-primary" : "text-white/80")}>{res.name}</span>
                           <span className="text-[9px] font-black uppercase tracking-[0.2em] opacity-40 italic">
                             {res.type === "app" ? "Application Node" : res.path || "System VFS Reference"}
                           </span>
                        </div>
                     </div>
                     <AnimatePresence>
                       {selectedIndex === i && (
                         <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
                            <ArrowRight className="h-5 w-5 text-primary" />
                         </motion.div>
                       )}
                     </AnimatePresence>
                   </motion.button>
                 ))
              ) : query.length > 0 ? (
                <div className="py-20 text-center opacity-20">
                   <Zap className="h-10 w-10 mx-auto mb-4" />
                   <p className="text-[10px] font-black uppercase tracking-[0.4em]">No Registry Match Found</p>
                </div>
              ) : (
                <div className="py-28 text-center flex flex-col items-center justify-center group">
                   <div className="h-24 w-24 rounded-[40px] bg-white/5 border border-white/5 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform shadow-2xl">
                      <Command className="h-12 w-12 text-primary opacity-20 group-hover:opacity-40 transition-opacity" />
                   </div>
                   <p className="text-[11px] font-black uppercase tracking-[0.5em] text-zinc-600 italic">Universal Node Discovery</p>
                </div>
              )}
           </AnimatePresence>
        </div>

        {results.length > 0 && (
           <div className="h-14 bg-black/40 flex items-center justify-between px-8 border-t border-white/5">
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-700 italic">Spotlight Sequoia Core Prime</span>
              <div className="flex gap-6">
                 <div className="flex items-center gap-2 opacity-30">
                    <div className="px-2 py-1 rounded bg-white/5 text-[10px] font-black">↑↓</div>
                    <span className="text-[9px] font-black uppercase tracking-widest">Navigate</span>
                 </div>
                 <div className="flex items-center gap-2 opacity-30">
                    <div className="px-2 py-1 rounded bg-white/5 text-[10px] font-black">Enter</div>
                    <span className="text-[9px] font-black uppercase tracking-widest">Launch</span>
                 </div>
              </div>
           </div>
        )}
      </motion.div>
    </div>
  );
};

export default Spotlight;
