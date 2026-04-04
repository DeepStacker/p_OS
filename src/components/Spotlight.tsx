import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Command, AppWindow, FileText, Zap, ArrowRight, Folder } from "lucide-react";
import { useSystem, VFSNode } from "@/contexts/SystemContext";
import { cn } from "@/lib/utils";

interface SpotlightProps {
  isOpen: boolean;
  onClose: () => void;
}

const Spotlight: React.FC<SpotlightProps> = ({ isOpen, onClose }) => {
  const { dockApps, vfs, openWindow, addLog } = useSystem();
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // --- Search Logic ---
  const getResults = () => {
    if (!query.trim()) return [];

    const results: any[] = [];
    const q = query.toLowerCase();

    // 1. Search Apps (Dock Apps)
    dockApps.forEach(app => {
      if (app.name.toLowerCase().includes(q)) {
        results.push({ id: app.id, type: "app", name: app.name, icon: app.icon, action: () => { openWindow(app.id, app.name, <app.icon className="h-4 w-4" />, app.component); onClose(); } });
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
    if (e.key === "ArrowDown") setSelectedIndex(prev => (prev + 1) % results.length);
    if (e.key === "ArrowUp") setSelectedIndex(prev => (prev - 1 + results.length) % results.length);
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
        className="w-full max-w-2xl bg-zinc-900/60 backdrop-blur-3xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="h-16 flex items-center px-6 gap-4 border-b border-white/5 bg-white/5">
          <Search className="h-6 w-6 text-primary opacity-60" />
          <input
            ref={inputRef}
            className="flex-1 bg-transparent border-none text-xl font-medium focus:outline-none placeholder:text-white/10 text-white"
            placeholder="Spotlight System Search..."
            value={query}
            onChange={e => { setQuery(e.target.value); setSelectedIndex(0); }}
            onKeyDown={handleKeyDown}
          />
          <div className="flex items-center gap-1.5 opacity-20">
             <div className="px-1.5 py-0.5 rounded bg-white/10 text-[10px] font-black uppercase">Esc</div>
          </div>
        </div>

        <div className="max-h-[400px] overflow-y-auto custom-scrollbar p-2">
           <AnimatePresence mode="popLayout">
             {results.length > 0 ? (
                results.map((res, i) => (
                  <motion.button
                    key={res.id}
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={res.action}
                    onMouseEnter={() => setSelectedIndex(i)}
                    className={cn(
                      "w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all group",
                      selectedIndex === i ? "bg-primary shadow-lg shadow-primary/20 scale-[1.02]" : "hover:bg-white/5"
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "h-10 w-10 rounded-xl flex items-center justify-center border transition-colors",
                        selectedIndex === i ? "bg-white/20 border-white/20" : "bg-white/5 border-white/5"
                      )}>
                         {res.type === "app" ? <res.icon className="h-5 w-5 text-white" /> : <res.icon className="h-5 w-5 text-white/60" />}
                      </div>
                      <div className="flex flex-col items-start">
                         <span className={cn("text-sm font-black uppercase tracking-tight", selectedIndex === i ? "text-white" : "text-white/80")}>{res.name}</span>
                         {res.path && <span className={cn("text-[9px] font-bold uppercase opacity-40", selectedIndex === i ? "text-white" : "text-zinc-500")}>{res.path}</span>}
                      </div>
                    </div>
                    {selectedIndex === i && <ArrowRight className="h-4 w-4 text-white animate-in slide-in-from-left-2 duration-300" />}
                  </motion.button>
                ))
             ) : query.length > 0 ? (
               <div className="py-20 text-center opacity-20">
                  <Zap className="h-10 w-10 mx-auto mb-4" />
                  <p className="text-xs font-black uppercase tracking-[0.3em]">No System Registry Matches</p>
               </div>
             ) : (
                <div className="py-20 text-center flex flex-col items-center justify-center group">
                   <div className="h-20 w-20 rounded-[30px] bg-white/5 border border-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                      <Command className="h-10 w-10 text-primary opacity-20" />
                   </div>
                   <p className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-500 italic">Enter System Query</p>
                </div>
             )}
           </AnimatePresence>
        </div>

        {results.length > 0 && (
           <div className="h-10 bg-white/5 flex items-center justify-between px-6 border-t border-white/5">
              <span className="text-[9px] font-black uppercase tracking-widest text-zinc-600">Spotlight Sequoia Core</span>
              <div className="flex gap-4">
                 <div className="flex items-center gap-1.5 opacity-40">
                    <div className="px-1 py-0.5 rounded bg-white/5 text-[9px] font-mono">↑↓</div>
                    <span className="text-[8px] font-bold uppercase">Navigate</span>
                 </div>
                 <div className="flex items-center gap-1.5 opacity-40">
                    <div className="px-1 py-0.5 rounded bg-white/5 text-[9px] font-mono">Enter</div>
                    <span className="text-[8px] font-bold uppercase">Open</span>
                 </div>
              </div>
           </div>
        )}
      </motion.div>
    </div>
  );
};

export default Spotlight;
