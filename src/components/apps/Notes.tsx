import React, { useState, useEffect, useMemo } from "react";
import { 
  Save, 
  FileText, 
  Plus, 
  Trash2, 
  Edit3, 
  FolderOpen, 
  ChevronRight, 
  FileCode, 
  Pinned, 
  Star, 
  Clock, 
  Search,
  MoreHorizontal,
  Layout,
  Maximize2,
  Type,
  Hash,
  List as ListIcon,
  Image as ImageIcon,
  Share2
} from "lucide-react";
import { useSystem, VFSNode } from "@/contexts/SystemContext";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const Notes = () => {
    const { vfs, updateVFS, addLog } = useSystem();
    const [activeFile, setActiveFile] = useState<string | null>(null);
    const [content, setContent] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    // Dynamic Explorer Logic
    const allNotes = useMemo(() => {
        const userDocs = vfs.children?.Users?.children?.node?.children?.Documents?.children;
        if (!userDocs) return [];
        return Object.values(userDocs).map((f: any) => ({
            ...f,
            snippet: f.content?.substring(0, 60) || "No additional text",
            timeStr: new Date(f.updatedAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }));
    }, [vfs]);

    const filteredNotes = useMemo(() => {
        return allNotes.filter(n => n.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }, [allNotes, searchQuery]);

    const activeNote = useMemo(() => {
        return allNotes.find(n => n.name === activeFile) || null;
    }, [allNotes, activeFile]);

    const handleSave = () => {
        if (!activeFile) return;
        const upVFS = JSON.parse(JSON.stringify(vfs));
        const docs = upVFS.children.Users.children.node.children.Documents;
        if (docs.children[activeFile]) {
            docs.children[activeFile].content = content;
            docs.children[activeFile].updatedAt = Date.now();
            updateVFS(upVFS);
            addLog(`Note synchronization complete: ${activeFile}`, "success");
        }
    };

    const createNewFile = () => {
        const name = `Note ${allNotes.length + 1}.md`;
        const upVFS = JSON.parse(JSON.stringify(vfs));
        const docs = upVFS.children.Users.children.node.children.Documents;
        docs.children[name] = { name, type: "file", content: "", updatedAt: Date.now() };
        updateVFS(upVFS);
        setActiveFile(name);
        setContent("");
    };

    const deleteActiveNote = () => {
        if (!activeFile) return;
        const upVFS = JSON.parse(JSON.stringify(vfs));
        const docs = upVFS.children.Users.children.node.children.Documents;
        delete docs.children[activeFile];
        updateVFS(upVFS);
        setActiveFile(null);
        setContent("");
        addLog(`Note purged: ${activeFile}`, "warning");
    };

    // Markdown-Lite Renderer
    const renderContent = (text: string) => {
        return text.split('\n').map((line, i) => {
            if (line.startsWith('# ')) return <h1 key={i} className="text-3xl font-black text-white mb-4 tracking-tighter">{line.replace('# ', '')}</h1>;
            if (line.startsWith('## ')) return <h2 key={i} className="text-2xl font-black text-white/90 mb-3 tracking-tight">{line.replace('## ', '')}</h2>;
            if (line.startsWith('- ')) return <li key={i} className="ml-4 text-zinc-400 list-disc mb-1">{line.replace('- ', '')}</li>;
            if (line.startsWith('> ')) return <blockquote key={i} className="border-l-4 border-primary/40 bg-primary/5 p-4 rounded-r-xl italic text-zinc-400 mb-4">{line.replace('> ', '')}</blockquote>;
            return <p key={i} className="mb-4 text-zinc-400 leading-relaxed">{line}</p>;
        });
    };

    return (
        <div className="h-full flex bg-[#1C1C1E] text-white font-sans overflow-hidden">
            {/* Folder Sidebar */}
            <aside className={cn(
                "bg-[#2C2C2E]/50 backdrop-blur-3xl border-r border-white/5 flex flex-col transition-all duration-300",
                isSidebarCollapsed ? "w-0 opacity-0 overflow-hidden" : "w-64"
            )}>
                <div className="p-6 flex flex-col h-full">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center border border-amber-500/20 text-amber-500">
                                <Star className="h-4 w-4" fill="currentColor" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Workspace</span>
                        </div>
                        <button onClick={createNewFile} className="p-2 hover:bg-white/5 rounded-xl transition-all text-amber-500"><Plus className="h-5 w-5" /></button>
                    </div>

                    <div className="relative mb-6">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-600" />
                        <input 
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            placeholder="Find strings..."
                            className="w-full bg-white/5 border border-white/5 rounded-xl pl-9 pr-4 py-2.5 text-[11px] font-bold focus:outline-none focus:ring-1 focus:ring-amber-500/40 transition-all"
                        />
                    </div>

                    <nav className="flex-1 space-y-1 overflow-y-auto custom-scrollbar pr-1">
                        <div className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-3 px-3">Recent Buffers</div>
                        {filteredNotes.map(note => (
                            <button
                                key={note.name}
                                onClick={() => { setActiveFile(note.name); setContent(note.content || ""); }}
                                className={cn(
                                    "w-full text-left p-4 rounded-2xl transition-all border group relative overflow-hidden",
                                    activeFile === note.name 
                                        ? "bg-amber-500/10 border-amber-500/20 shadow-2xl" 
                                        : "bg-transparent border-transparent hover:bg-white/5"
                                )}
                            >
                                {activeFile === note.name && <motion.div layoutId="note-active" className="absolute inset-0 bg-amber-500/5" />}
                                <div className="relative z-10">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className={cn("text-[12px] font-black tracking-tight truncate", activeFile === note.name ? "text-amber-500" : "text-white/80")}>{note.name}</span>
                                        <span className="text-[8px] font-bold text-zinc-600 shrink-0">{note.timeStr}</span>
                                    </div>
                                    <p className="text-[10px] font-bold text-zinc-500 line-clamp-1 italic">{note.snippet}</p>
                                </div>
                            </button>
                        ))}
                    </nav>

                    <div className="pt-6 mt-6 border-t border-white/5 opacity-40">
                        <div className="flex items-center gap-3 px-3 py-2">
                           <Trash2 className="h-4 w-4" />
                           <span className="text-[10px] font-black uppercase tracking-widest">Trash Vault</span>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Workspace */}
            <main className="flex-1 flex flex-col bg-transparent relative overflow-hidden">
                <header className="h-16 px-8 border-b border-white/5 flex items-center justify-between bg-zinc-900/10">
                    <div className="flex items-center gap-6">
                        <button onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} className="p-2 hover:bg-white/5 rounded-xl transition-all text-zinc-500 hover:text-white">
                            <Layout className="h-4 w-4" />
                        </button>
                        {activeFile && (
                            <div className="flex items-center gap-3">
                                <div className="h-4 w-px bg-white/10" />
                                <div className="flex flex-col">
                                    <h2 className="text-sm font-black tracking-tight flex items-center gap-2">
                                        {activeFile}
                                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                                    </h2>
                                    <span className="text-[8px] font-black uppercase tracking-widest text-zinc-500">Synthesizing Persistent Buffer...</span>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-3">
                        {activeFile && (
                            <>
                                <button onClick={deleteActiveNote} className="p-2 text-rose-500/40 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all"><Trash2 className="h-4 w-4" /></button>
                                <button className="p-2 text-zinc-500 hover:text-white hover:bg-white/5 rounded-xl transition-all"><Share2 className="h-4 w-4" /></button>
                                <div className="h-4 w-px bg-white/10 mx-2" />
                                <button 
                                    onClick={handleSave}
                                    className="flex items-center gap-3 px-6 py-2.5 bg-amber-500 text-black rounded-xl text-[10px] font-black uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all shadow-xl shadow-amber-500/20"
                                >
                                    <Save className="h-3.5 w-3.5" /> Sync Node
                                </button>
                            </>
                        )}
                    </div>
                </header>

                <div className="flex-1 flex overflow-hidden">
                    {activeFile ? (
                        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 divide-x divide-white/5">
                            {/* Editor Pane */}
                            <div className="flex flex-col relative h-full bg-[#1C1C1E]">
                                <div className="p-2 border-b border-white/5 flex items-center gap-2 overflow-x-auto no-scrollbar bg-black/20">
                                   <button className="px-3 py-1.5 rounded-lg hover:bg-white/5 text-zinc-500 hover:text-white transition-all"><Hash className="h-3 w-3" /></button>
                                   <button className="px-3 py-1.5 rounded-lg hover:bg-white/5 text-zinc-500 hover:text-white transition-all"><Type className="h-3 w-3" /></button>
                                   <button className="px-3 py-1.5 rounded-lg hover:bg-white/5 text-zinc-500 hover:text-white transition-all"><ListIcon className="h-3 w-3" /></button>
                                   <button className="px-3 py-1.5 rounded-lg hover:bg-white/5 text-zinc-500 hover:text-white transition-all"><ImageIcon className="h-3 w-3" /></button>
                                </div>
                                <textarea
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    autoFocus
                                    className="flex-1 bg-transparent p-12 focus:outline-none text-[15px] font-medium leading-[2] resize-none text-zinc-300 custom-scrollbar placeholder:opacity-10"
                                    placeholder="# Start your Pro-Manifesto...\n\nUse Markdown-lite for high-fidelity formatting."
                                    spellCheck={false}
                                />
                            </div>

                            {/* Live Rendering Pane (Pro Feature) */}
                            <div className="hidden lg:flex flex-col h-full bg-[#1C1C1E]/50 p-12 overflow-y-auto custom-scrollbar selection:bg-amber-500/20">
                                <div className="max-w-prose mx-auto w-full">
                                    {content ? (
                                        renderContent(content)
                                    ) : (
                                        <div className="h-full flex flex-col items-center justify-center opacity-10 text-center grayscale">
                                            <FileCode className="h-20 w-20 mb-6" />
                                            <p className="text-[12px] font-black uppercase tracking-[0.5em]">Live Rendering Inactive</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-center px-12 relative">
                            <div className="absolute inset-0 bg-gradient-to-b from-amber-500/5 to-transparent pointer-events-none" />
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="relative z-10"
                            >
                                <div className="w-24 h-24 rounded-[40px] bg-amber-500 shadow-[0_0_50px_rgba(245,158,11,0.2)] flex items-center justify-center mx-auto mb-8 border-4 border-white/10 group overflow-hidden">
                                    <div className="absolute inset-0 bg-white/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <Edit3 className="h-10 w-10 text-black filter drop-shadow-lg" />
                                </div>
                                <h2 className="text-3xl font-black text-white/90 uppercase tracking-tighter mb-4">Node Notes Pro</h2>
                                <p className="text-[11px] font-black text-zinc-500 uppercase tracking-[0.4em] max-w-sm mx-auto leading-loose italic">Precision Content Synthesis Environment<br/>Integrated Markdown • VFS Sync • Pro Tier</p>
                                <button 
                                    onClick={createNewFile}
                                    className="mt-12 px-10 py-4 bg-white/5 hover:bg-white/10 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all border border-white/5 active:scale-95"
                                >
                                    Initialize Fresh Buffer
                                </button>
                            </motion.div>
                        </div>
                    )}
                </div>

                {/* Status Bar */}
                <footer className="h-7 border-t border-white/5 bg-black/20 flex items-center justify-between px-6 shrink-0">
                    <div className="flex items-center gap-6">
                        <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">{content.split(/\s+/).filter(x => x).length} Words</span>
                        <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">{content.length} Characters</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                           <div className="w-1.5 h-1.5 rounded-full bg-amber-500 shadow-[0_0_5px_rgba(245,158,11,0.5)]" />
                           <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest italic">Sync Localhost Active</span>
                        </div>
                    </div>
                </footer>
            </main>
        </div>
    );
};

export default Notes;
