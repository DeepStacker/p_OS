import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Folder, FileText, ChevronRight, ChevronLeft, Search, LayoutGrid, List, MoreVertical, Trash2, ExternalLink, HardDrive, User, Monitor, Download, Zap } from "lucide-react";
import { useSystem, VFSNode } from "@/contexts/SystemContext";
import { cn } from "@/lib/utils";

const Finder = () => {
  const { vfs, updateVFS, addLog, openWindow } = useSystem();
  const [currentPath, setCurrentPath] = useState<string[]>(["Users", "node"]);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchTerm] = useState("");
  const [history, setHistory] = useState<string[][]>([["Users", "node"]]);
  const [historyIndex, setHistoryIndex] = useState(0);

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

  const navigateTo = (segment: string) => {
    const nextPath = [...currentPath, segment];
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(nextPath);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    setCurrentPath(nextPath);
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
    navigateTo(nextPath[nextPath.length - 1]); // This is simplified for now
    setCurrentPath(nextPath);
  };

  const deleteNode = (name: string) => {
    const newVFS = { ...vfs };
    let parent = newVFS;
    for (const segment of currentPath) {
      parent = parent.children![segment];
    }
    if (parent.children) {
      delete parent.children[name];
      updateVFS(newVFS);
      addLog(`Finder: Deleted ${name}`, "warning");
    }
  };

  const handleOpen = (node: VFSNode) => {
    if (node.type === "directory") {
      navigateTo(node.name);
    } else {
      openWindow("notes", "Notes", <FileText className="h-4 w-4" />, "notes");
      addLog(`Finder: Opening ${node.name}`, "info");
    }
  };

  const items = currentNode.children ? Object.values(currentNode.children).filter(n => n.name.toLowerCase().includes(searchQuery.toLowerCase())) : [];

  return (
    <div className="h-full flex flex-col bg-zinc-950/20 backdrop-blur-3xl overflow-hidden font-sans text-white">
      {/* Toolbar */}
      <div className="h-14 border-b border-white/5 flex items-center justify-between px-6 bg-white/5">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-1">
             <button onClick={goBack} disabled={historyIndex === 0} className="p-1.5 hover:bg-white/10 rounded-md disabled:opacity-20 transition-all">
                <ChevronLeft className="h-4 w-4" />
             </button>
             <button onClick={goForward} disabled={historyIndex === history.length - 1} className="p-1.5 hover:bg-white/10 rounded-md disabled:opacity-20 transition-all">
                <ChevronRight className="h-4 w-4" />
             </button>
          </div>
          
          <div className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-zinc-500">
             <button onClick={() => setCurrentPath([])} className="hover:text-primary transition-colors">root</button>
             {currentPath.map((segment, i) => (
                <React.Fragment key={segment}>
                   <ChevronRight className="h-3 w-3 opacity-20" />
                   <button onClick={() => goToBreadcrumb(i)} className="hover:text-primary transition-colors">{segment}</button>
                </React.Fragment>
             ))}
          </div>
        </div>

        <div className="flex items-center gap-4">
           <div className="flex items-center gap-1 p-1 bg-black/20 rounded-lg border border-white/5">
              <button onClick={() => setViewMode("grid")} className={cn("p-1.5 rounded-md transition-all", viewMode === "grid" ? "bg-white/10 shadow-inner" : "opacity-41 hover:opacity-100")}><LayoutGrid className="h-3.5 w-3.5" /></button>
              <button onClick={() => setViewMode("list")} className={cn("p-1.5 rounded-md transition-all", viewMode === "list" ? "bg-white/10 shadow-inner" : "opacity-41 hover:opacity-100")}><List className="h-3.5 w-3.5" /></button>
           </div>
           
           <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500 group-hover:text-primary transition-colors" />
              <input 
                value={searchQuery}
                onChange={e => setSearchTerm(e.target.value)}
                className="bg-black/20 border border-white/5 rounded-full pl-9 pr-4 py-1.5 text-[11px] font-bold focus:outline-none focus:ring-1 focus:ring-primary w-48 placeholder:text-zinc-700 transition-all group-hover:bg-black/40" 
                placeholder="Search Current..."
              />
           </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside className="w-56 bg-white/5 border-r border-white/5 p-4 flex flex-col gap-6 overflow-y-auto custom-scrollbar">
           <div className="space-y-4">
              <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] px-2">Favorites</h3>
              <div className="space-y-1">
                 {[
                   { name: "Recents", icon: Monitor, path: [] },
                   { name: "Applications", icon: Zap, path: ["Applications"] },
                   { name: "Documents", icon: FileText, path: ["Users", "node", "Documents"] },
                   { name: "Desktop", icon: Monitor, path: ["Users", "node", "Desktop"] },
                   { name: "Downloads", icon: Download, path: [] },
                 ].map(fav => (
                   <button 
                     key={fav.name}
                     onClick={() => fav.path.length > 0 && setCurrentPath(fav.path)}
                     className={cn(
                       "w-full flex items-center gap-3 px-3 py-2 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all",
                       JSON.stringify(currentPath) === JSON.stringify(fav.path) ? "bg-primary shadow-lg shadow-primary/20" : "text-zinc-500 hover:bg-white/5"
                     )}
                   >
                     <fav.icon className="h-4 w-4" />
                     {fav.name}
                   </button>
                 ))}
              </div>
           </div>

           <div className="space-y-4">
              <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] px-2">Locations</h3>
              <button 
                onClick={() => setCurrentPath([])}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-[11px] font-black uppercase tracking-wider text-zinc-500 hover:bg-white/5 transition-all"
              >
                 <HardDrive className="h-4 w-4 text-primary" />
                 Macintosh HD
              </button>
           </div>
        </aside>

        {/* Content */}
        <main className="flex-1 overflow-y-auto custom-scrollbar p-6 bg-white/[0.01]">
           <div className={cn(
             viewMode === "grid" ? "grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6" : "flex flex-col gap-0.5"
           )}>
              <AnimatePresence>
                {items.map((node, i) => (
                  <motion.div
                    key={node.name}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.02 }}
                    className={cn(
                      "group relative",
                      viewMode === "grid" ? "flex flex-col items-center gap-3 p-4 rounded-3xl hover:bg-white/5 transition-all cursor-default" : "flex items-center justify-between px-5 py-2.5 rounded-xl hover:bg-white/5 transition-all"
                    )}
                    onDoubleClick={() => handleOpen(node)}
                  >
                    <div className={cn("flex items-center gap-4", viewMode === "list" && "flex-1")}>
                       <div className={cn(
                         "rounded-2xl transition-all flex items-center justify-center shadow-lg",
                         viewMode === "grid" ? "w-20 h-20 bg-white/5 border border-white/5 group-hover:scale-110" : "w-10 h-10 bg-white/5 border border-white/5"
                       )}>
                          {node.type === "directory" ? <Folder className="h-10 w-10 text-primary drop-shadow-2xl" /> : <FileText className="h-10 w-10 text-white/40 drop-shadow-2xl" />}
                       </div>
                       
                       <div className={cn("flex flex-col", viewMode === "grid" ? "items-center" : "items-start")}>
                          <span className="text-[12px] font-black text-white/90 uppercase tracking-tight text-center truncate w-full px-2">{node.name}</span>
                          <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">{node.type === "directory" ? "Folder" : "Document"}</span>
                       </div>
                    </div>

                    {viewMode === "list" && (
                       <div className="flex items-center gap-6 text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
                          <span>{new Date(node.updatedAt).toLocaleDateString()}</span>
                          <button onClick={() => deleteNode(node.name)} className="p-2 opacity-0 group-hover:opacity-100 hover:text-rose-500 transition-all"><Trash2 className="h-4 w-4" /></button>
                       </div>
                    )}

                    {viewMode === "grid" && (
                       <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-all flex flex-col gap-1">
                          <button onClick={() => deleteNode(node.name)} className="p-2 rounded-full bg-rose-500/20 text-rose-500 border border-rose-500/20 shadow-lg hover:scale-110"><Trash2 className="h-3.5 w-3.5" /></button>
                       </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {items.length === 0 && (
                <div className="col-span-full py-40 text-center opacity-10">
                   <Folder className="h-20 w-20 mx-auto mb-6" />
                   <div className="text-xl font-black uppercase tracking-[0.5em]">Empty Directory</div>
                </div>
              )}
           </div>
        </main>
      </div>

      {/* Footer Info */}
      <div className="h-8 border-t border-white/5 bg-white/5 flex items-center justify-between px-6">
         <span className="text-[9px] font-black uppercase tracking-widest text-zinc-600">{items.length} Items | Sequoia Pro Explorer</span>
         <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
               <div className="w-1.5 h-1.5 rounded-full bg-[#34C759]" />
               <span className="text-[9px] font-black uppercase tracking-widest text-zinc-600 italic">VFS Mount Verified</span>
            </div>
         </div>
      </div>
    </div>
  );
};

export default Finder;
