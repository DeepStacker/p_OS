import React, { useState, useEffect } from "react";
import { Save, FileText, Plus, Trash2, Edit3, FolderOpen, ChevronRight, FileCode } from "lucide-react";
import { useSystem, VFSNode } from "@/contexts/SystemContext";
import { cn } from "@/lib/utils";

const Notes = () => {
    const { vfs, updateVFS, addLog } = useSystem();
    const [activeFile, setActiveFile] = useState<string | null>(null);
    const [content, setContent] = useState("");
    const [explorer, setExplorer] = useState<VFSNode[]>([]);

    useEffect(() => {
        // Flatten user documents for the sidebar
        const userDocs = vfs.children?.Users?.children?.node?.children?.Documents?.children;
        if (userDocs) {
            setExplorer(Object.values(userDocs));
        }
    }, [vfs]);

    const handleSave = () => {
        if (!activeFile) return;
        const upVFS = JSON.parse(JSON.stringify(vfs));
        const docs = upVFS.children.Users.children.node.children.Documents;
        if (docs.children[activeFile]) {
            docs.children[activeFile].content = content;
            docs.children[activeFile].updatedAt = Date.now();
            updateVFS(upVFS);
            addLog(`File saved to VFS: ${activeFile}`, "success");
        }
    };

    const createNewFile = () => {
        const name = prompt("Enter filename (e.g. notes.txt):");
        if (!name) return;
        const upVFS = JSON.parse(JSON.stringify(vfs));
        const docs = upVFS.children.Users.children.node.children.Documents;
        docs.children[name] = { name, type: "file", content: "", updatedAt: Date.now() };
        updateVFS(upVFS);
        setActiveFile(name);
        setContent("");
    };

    return (
        <div className="h-full flex bg-zinc-950 text-white font-sans overflow-hidden">
            {/* Sidebar Explorer */}
            <aside className="w-64 bg-zinc-900/30 border-r border-white/5 flex flex-col p-4">
                <div className="flex items-center justify-between mb-6 px-2">
                    <div className="flex items-center gap-2">
                        <FolderOpen className="h-4 w-4 text-primary" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Documents</span>
                    </div>
                    <button onClick={createNewFile} className="p-1 hover:bg-white/10 rounded-md transition-all text-primary"><Plus className="h-4 w-4" /></button>
                </div>

                <div className="flex-1 space-y-1 overflow-y-auto custom-scrollbar">
                    {explorer.map(file => (
                        <button
                            key={file.name}
                            onClick={() => { setActiveFile(file.name); setContent(file.content || ""); }}
                            className={cn(
                                "w-full text-left px-3 py-2 rounded-xl text-[11px] font-bold transition-all flex items-center justify-between group",
                                activeFile === file.name ? "bg-primary/20 text-white border border-primary/20" : "text-zinc-500 hover:bg-white/5 border border-transparent"
                            )}
                        >
                            <div className="flex items-center gap-3">
                                <FileText className={cn("h-4 w-4", activeFile === file.name ? "text-primary" : "opacity-40")} />
                                <span className="truncate max-w-[120px]">{file.name}</span>
                            </div>
                            <ChevronRight className={cn("h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity", activeFile === file.name && "opacity-100")} />
                        </button>
                    ))}
                    {explorer.length === 0 && (
                        <div className="py-12 text-center opacity-20">
                            <FileCode className="h-8 w-8 mx-auto mb-2" />
                            <p className="text-[10px] font-black uppercase tracking-widest">No Documents</p>
                        </div>
                    )}
                </div>
            </aside>

            {/* Editor Area */}
            <main className="flex-1 flex flex-col relative overflow-hidden bg-white/[0.01]">
                {activeFile ? (
                    <>
                        <header className="h-14 px-6 border-b border-white/5 flex items-center justify-between shrink-0">
                            <div className="flex flex-col">
                                <h3 className="text-sm font-black tracking-tight text-white/90">{activeFile}</h3>
                                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-600 italic">VFS Persistence: Active</span>
                            </div>
                            <button 
                                onClick={handleSave}
                                className="flex items-center gap-2 px-5 py-2 bg-primary/20 text-primary rounded-xl border border-primary/20 text-[10px] font-black uppercase tracking-widest hover:bg-primary/30 transition-all active:scale-95 shadow-xl shadow-primary/5"
                            >
                                <Save className="h-3.5 w-3.5" /> Save Buffer
                            </button>
                        </header>
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            className="flex-1 bg-transparent p-10 focus:outline-none text-[13px] leading-relaxed font-mono resize-none text-zinc-300 custom-scrollbar"
                            placeholder="Awaiting system input..."
                            spellCheck={false}
                        />
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center opacity-20 text-center px-20">
                        <Edit3 className="h-16 w-16 mb-6" />
                        <h2 className="text-xl font-black uppercase tracking-[0.3em]">Editor Hub</h2>
                        <p className="text-[10px] font-black uppercase tracking-widest mt-2 max-w-xs leading-relaxed">Select a volume entry to begin bitmasking. All changes are persisted to the Virtual File System.</p>
                    </div>
                )}
            </main>
        </div>
    );
};

export default Notes;
