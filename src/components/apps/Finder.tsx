import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Folder, 
  FileText, 
  ChevronRight, 
  ChevronLeft, 
  Search, 
  LayoutGrid, 
  List, 
  MoreVertical, 
  Trash2, 
  ExternalLink, 
  HardDrive, 
  User, 
  Monitor, 
  Download, 
  Zap, 
  Info,
  Clock,
  Layout,
  Columns,
  Share2,
  FileCode,
  Image as ImageIcon,
  Maximize2
} from "lucide-react";
import { useSystem, VFSNode } from "@/contexts/SystemContext";
import { cn } from "@/lib/utils";

const Finder = () => {
  const { vfs, updateVFS, addLog, openWindow } = useSystem();
  const [currentPath, setCurrentPath] = useState<string[]>(["Users", "node"]);
  const [viewMode, setViewMode] = useState<"grid" | "list" | "columns">("grid");
  const [searchQuery, setSearchTerm] = useState("");
  const [history, setHistory] = useState<string[][]>([["Users", "node"]]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [showInfoPane, setShowInfoPane] = useState(true);

  // Navigate to a specific node in the VFS
  const getCurrentNode = (): VFSNode => {
    let node = vfs;
    for (const segment of currentPath) {
      if (node.children && node.children[segment]) {
        node = node.children[segment];
      }
    }
    return node;
  };

  const currentNode = getCurrentNode();
  const items = useMemo(() => {
    if (!currentNode.children) return [];
    return Object.values(currentNode.children).filter(n => 
      n.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [currentNode, searchQuery]);

  const selectedNode = useMemo(() => {
    if (!selectedItem || !currentNode.children) return null;
    return currentNode.children[selectedItem];
  }, [selectedItem, currentNode]);

  const navigateTo = (segment: string) => {
    const nextPath = [...currentPath, segment];
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(nextPath);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    setCurrentPath(nextPath);
    setSelectedItem(null);
  };

  const goBack = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setCurrentPath(history[historyIndex - 1]);
    }
  };

  const goForward = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setCurrentPath(history[historyIndex + 1]);
    }
  };

  const goToBreadcrumb = (index: number) => {
    const nextPath = currentPath.slice(0, index + 1);
    if (JSON.stringify(nextPath) === JSON.stringify(currentPath)) return;
    
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(nextPath);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    setCurrentPath(nextPath);
    setSelectedItem(null);
  };

  const deleteNode = (e: React.MouseEvent, name: string) => {
    e.stopPropagation();
    const newVFS = JSON.parse(JSON.stringify(vfs));
    let parent = newVFS;
    for (const segment of currentPath) {
      parent = parent.children[segment];
    }
    if (parent.children) {
      delete parent.children[name];
      updateVFS(newVFS);
      addLog(`Finder: Purged ${name}`, "warning");
      if (selectedItem === name) setSelectedItem(null);
    }
  };

  const handleOpen = (node: VFSNode) => {
    if (node.type === "directory") {
      navigateTo(node.name);
    } else {
      openWindow("notes", "Notes Pro", <FileText className="h-4 w-4" />, "notes");
      addLog(`Finder Execution: Opening ${node.name}`, "info");
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#1E1E1E] backdrop-blur-3xl overflow-hidden font-sans text-white/90">
      {/* Enhanced Toolbar */}
      <div className="h-14 border-b border-white/5 flex items-center justify-between px-6 bg-white/[0.03]">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-1">
             <button onClick={goBack} disabled={historyIndex === 0} className="p-2 hover:bg-white/10 rounded-xl disabled:opacity-20 transition-all">
                <ChevronLeft className="h-5 w-5" />
             </button>
             <button onClick={goForward} disabled={historyIndex === history.length - 1} className="p-2 hover:bg-white/10 rounded-xl disabled:opacity-20 transition-all">
                <ChevronRight className="h-5 w-5" />
             </button>
          </div>
          
          <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 bg-black/20 px-4 py-2 rounded-xl border border-white/5">
             <button onClick={() => setCurrentPath([])} className="hover:text-primary transition-colors">OS_DISK</button>
             {currentPath.map((segment, i) => (
                <React.Fragment key={segment}>
                   <ChevronRight className="h-3 w-3 opacity-20" />
                   <button onClick={() => goToBreadcrumb(i)} className="hover:text-primary transition-colors max-w-[100px] truncate">{segment}</button>
                </React.Fragment>
             ))}
          </div>
        </div>

        <div className="flex items-center gap-4">
           <div className="flex items-center gap-1 p-1 bg-black/20 rounded-xl border border-white/5">
              <button onClick={() => setViewMode("grid")} className={cn("p-2 rounded-lg transition-all", viewMode === "grid" ? "bg-white/10 shadow-xl text-primary" : "opacity-40 hover:opacity-100")}><LayoutGrid className="h-4 w-4" /></button>
              <button onClick={() => setViewMode("list")} className={cn("p-2 rounded-lg transition-all", viewMode === "list" ? "bg-white/10 shadow-xl text-primary" : "opacity-40 hover:opacity-100")}><List className="h-4 w-4" /></button>
              <button onClick={() => setViewMode("columns")} className={cn("p-2 rounded-lg transition-all", viewMode === "columns" ? "bg-white/10 shadow-xl text-primary" : "opacity-40 hover:opacity-100")}><Columns className="h-4 w-4" /></button>
           </div>
           
           <div className="w-px h-6 bg-white/10 mx-2" />
           
           <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 group-focus-within:text-primary transition-colors" />
              <input 
                value={searchQuery}
                onChange={e => setSearchTerm(e.target.value)}
                className="bg-black/20 border border-transparent rounded-xl pl-11 pr-5 py-2 text-[11px] font-bold focus:outline-none focus:border-white/10 focus:bg-black/40 w-56 placeholder:text-zinc-700 transition-all" 
                placeholder="Search Volume..."
              />
           </div>
           
           <button onClick={() => setShowInfoPane(!showInfoPane)} className={cn("p-2 rounded-xl transition-all", showInfoPane ? "bg-primary/20 text-primary border border-primary/20" : "hover:bg-white/5 text-zinc-500")}>
              <Info className="h-5 w-5" />
           </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Categories */}
        <aside className="w-64 bg-black/10 border-r border-white/5 flex flex-col gap-8 p-6 overflow-y-auto no-scrollbar">
           <div className="space-y-4">
              <h3 className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.3em] px-2 flex items-center justify-between">
                Favorites
                <Layout className="h-3 w-3 opacity-20" />
              </h3>
              <div className="space-y-1">
                 {[
                   { name: "Global Recents", icon: Clock, path: [] },
                   { name: "Applications", icon: Zap, path: ["Applications"] },
                   { name: "Notes Archive", icon: FileText, path: ["Users", "node", "Documents"] },
                   { name: "Live Desktop", icon: Monitor, path: ["Users", "node", "Desktop"] },
                   { name: "Cloud Downloads", icon: Download, path: [] },
                 ].map(fav => (
                   <button 
                     key={fav.name}
                     onClick={() => fav.path.length > 0 && setCurrentPath(fav.path)}
                     className={cn(
                       "w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-[11px] font-black uppercase tracking-wider transition-all border border-transparent group",
                       JSON.stringify(currentPath) === JSON.stringify(fav.path) 
                         ? "bg-primary/10 text-primary border-primary/20 shadow-2xl" 
                         : "text-zinc-500 hover:bg-white/5 hover:text-white/60"
                     )}
                   >
                     <fav.icon className={cn("h-4 w-4 transition-transform group-hover:scale-110", JSON.stringify(currentPath) === JSON.stringify(fav.path) ? "text-primary" : "opacity-40")} />
                     <span className="truncate">{fav.name}</span>
                   </button>
                 ))}
              </div>
           </div>

           <div className="space-y-4">
              <h3 className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.3em] px-2">VFS Mounts</h3>
              <button 
                onClick={() => setCurrentPath([])}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-[11px] font-black uppercase tracking-wider text-zinc-500 hover:bg-white/5 transition-all group"
              >
                 <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20 group-hover:bg-primary/20 transition-all">
                    <HardDrive className="h-4 w-4 text-primary" />
                 </div>
                 Macintosh HD
              </button>
           </div>
        </aside>

        {/* Content Explorer */}
        <main className="flex-1 overflow-y-auto custom-scrollbar p-10 bg-white/[0.01] relative">
           <div className={cn(
             viewMode === "grid" ? "grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-8" : "flex flex-col gap-1"
           )}>
              <AnimatePresence>
                {items.map((node, i) => (
                  <motion.div
                    key={node.name}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.01 }}
                    onClick={() => setSelectedItem(node.name)}
                    onDoubleClick={() => handleOpen(node)}
                    className={cn(
                      "group relative transition-all duration-300",
                      viewMode === "grid" 
                        ? cn("flex flex-col items-center gap-4 p-6 rounded-[32px] border cursor-default select-none", 
                             selectedItem === node.name ? "bg-primary/10 border-primary/20 shadow-2xl" : "bg-transparent border-transparent hover:bg-white/[0.03]") 
                        : cn("flex items-center justify-between px-6 py-3 rounded-2xl border transition-all cursor-default select-none",
                             selectedItem === node.name ? "bg-primary/10 border-primary/20" : "bg-transparent border-transparent hover:bg-white/5")
                    )}
                  >
                    <div className={cn("flex items-center gap-5", viewMode === "grid" ? "flex-col" : "flex-1")}>
                       <div className={cn(
                         "rounded-3xl flex items-center justify-center transition-all duration-500 overflow-hidden relative shadow-2xl",
                         viewMode === "grid" ? "w-28 h-28 bg-zinc-900/40 border border-white/5 group-hover:scale-105" : "w-10 h-10 bg-zinc-900/40 border border-white/5"
                       )}>
                          <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                          {node.type === "directory" ? (
                            <Folder className={cn("text-primary drop-shadow-2xl", viewMode === "grid" ? "h-14 w-14" : "h-5 w-5")} />
                          ) : (
                            <div className="relative">
                               <FileText className={cn("text-white/20", viewMode === "grid" ? "h-14 w-14" : "h-5 w-5")} />
                               <span className="absolute bottom-1 right-1 px-1 bg-primary rounded-[2px] text-[6px] font-black text-black">MD</span>
                            </div>
                          )}
                       </div>
                       
                       <div className={cn("flex flex-col", viewMode === "grid" ? "items-center text-center" : "items-start")}>
                          <span className="text-[13px] font-black text-white px-2 truncate w-full max-w-[140px] tracking-tight">{node.name}</span>
                          <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">{node.type === "directory" ? "Workspace" : "Persistent Bitmask"}</span>
                       </div>
                    </div>

                    <div className={cn(
                      "flex items-center gap-4 opacity-0 group-hover:opacity-100 transition-all",
                      viewMode === "grid" ? "absolute top-4 right-4" : ""
                    )}>
                       <button onClick={(e) => deleteNode(e, node.name)} className="p-2.5 rounded-full bg-rose-500/20 text-rose-500 border border-rose-500/20 hover:bg-rose-500 transition-all hover:text-white"><Trash2 className="h-4 w-4" /></button>
                       <button className="p-2.5 rounded-full bg-white/5 text-zinc-400 border border-white/5 hover:bg-white/10 transition-all hover:text-white"><Share2 className="h-4 w-4" /></button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {items.length === 0 && (
                <div className="col-span-full py-48 text-center opacity-10">
                   <Monitor className="h-24 w-24 mx-auto mb-10" />
                   <div className="text-3xl font-black uppercase tracking-[0.8em] italic">Empty Volume</div>
                </div>
              )}
           </div>
        </main>

        {/* Multi-Pane: Info / Preview Sidebar */}
        <AnimatePresence>
           {showInfoPane && (
             <motion.aside 
               initial={{ width: 0, opacity: 0 }}
               animate={{ width: 340, opacity: 1 }}
               exit={{ width: 0, opacity: 0 }}
               className="bg-[#1C1C1C] border-l border-white/5 flex flex-col overflow-hidden shadow-3xl"
             >
                {selectedNode ? (
                  <div className="flex flex-col h-full">
                     <div className="h-64 flex items-center justify-center bg-black/40 relative group overflow-hidden border-b border-white/5">
                        <div className="absolute inset-0 bg-primary/5 blur-3xl opacity-20 pointer-events-none" />
                        <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} key={selectedNode.name}>
                           {selectedNode.type === 'directory' ? <Folder className="h-24 w-24 text-primary filter drop-shadow-3xl" /> : <FileText className="h-24 w-24 text-white/10 filter drop-shadow-3xl" />}
                        </motion.div>
                        <div className="absolute bottom-4 right-4 flex gap-2">
                           <button className="p-2.5 rounded-xl bg-white/5 backdrop-blur-xl border border-white/10 hover:bg-white/10 transition-all"><Maximize2 className="h-4 w-4" /></button>
                        </div>
                     </div>

                     <div className="p-8 space-y-8 overflow-y-auto no-scrollbar flex-1">
                        <div className="space-y-2">
                           <h2 className="text-2xl font-black text-white leading-tight tracking-tighter truncate">{selectedNode.name}</h2>
                           <div className="flex items-center gap-3">
                              <span className="px-2 py-0.5 rounded-[4px] bg-primary/20 text-primary text-[8px] font-black uppercase tracking-widest">Metadata Active</span>
                              <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest italic">{selectedNode.type === 'directory' ? 'System Directory' : 'Binary Object'}</span>
                           </div>
                        </div>

                        <div className="space-y-4">
                           {[
                              { label: "Volume Mount", value: `/Users/node/${currentPath.join('/')}` },
                              { label: "Allocation", value: selectedNode.type === 'directory' ? 'Calculated Dynamically' : '2.4 MB' },
                              { label: "Bit Modification", value: new Date(selectedNode.updatedAt).toLocaleString() },
                              { label: "Encryption", value: "AES-256 GCM" }
                           ].map(info => (
                              <div key={info.label} className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all">
                                 <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest block mb-1">{info.label}</span>
                                 <span className="text-[11px] font-black text-white/80 tracking-tight">{info.value}</span>
                              </div>
                           ))}
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 pt-4">
                           <button onClick={() => handleOpen(selectedNode)} className="py-4 bg-primary text-black rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-primary/10 hover:brightness-110 active:scale-95 transition-all">Inspect Object</button>
                           <button className="py-4 bg-white/5 text-white/60 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-white/5 hover:bg-white/10 transition-all">Share Bitmask</button>
                        </div>
                     </div>
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center p-12 text-center opacity-10">
                     <Monitor className="h-16 w-16 mb-8" />
                     <h3 className="text-xl font-black uppercase tracking-[0.4em]">Inspector</h3>
                     <p className="text-[9px] font-black uppercase tracking-widest leading-loose mt-4">Select an authorized system entry to initiate metadata extraction.</p>
                  </div>
                )}
             </motion.aside>
           )}
        </AnimatePresence>
      </div>

      {/* Footer System Status */}
      <footer className="h-8 border-t border-white/5 bg-zinc-950 flex items-center justify-between px-6 shrink-0 relative z-10">
         <div className="flex items-center gap-6">
            <span className="text-[9px] font-black uppercase tracking-widest text-zinc-600 italic">VFS Mount: /Volumes/Macintosh_HD</span>
            <span className="text-[9px] font-black tracking-widest text-zinc-600">{items.length} SYSTEM_ENTRIES FOUND</span>
         </div>
         <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
               <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
               <span className="text-[9px] font-black uppercase tracking-widest text-zinc-600">Encrypted Channel Stable</span>
            </div>
         </div>
      </footer>
    </div>
  );
};

export default Finder;
