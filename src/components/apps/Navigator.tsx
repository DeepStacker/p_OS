import React, { useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Globe, 
  ChevronLeft, 
  ChevronRight, 
  RotateCw, 
  Home, 
  Search, 
  ShieldCheck, 
  Lock, 
  Star, 
  Clock, 
  Share2,
  ExternalLink,
  Plus,
  Layout,
  Maximize2,
  X,
  Sparkles,
  Zap,
  AlignLeft,
  Briefcase,
  Terminal,
  Database,
  GitBranch,
  ArrowRight,
  History,
  MoreVertical,
  ChevronDown,
  Fingerprint,
  RotateCcw
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSystem } from '@/contexts/SystemContext';

const Navigator = () => {
    const { addLog } = useSystem();
    const [url, setUrl] = useState("https://wikipedia.org");
    const [inputValue, setInputValue] = useState("https://wikipedia.org");
    const [history, setHistory] = useState(["https://wikipedia.org"]);
    const [historyIndex, setHistoryIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [isInsightOpen, setIsInsightOpen] = useState(false);
    const [suggestions, setSuggestions] = useState<string[]>([]);

    const handleNavigate = (e: React.FormEvent) => {
        e.preventDefault();
        const input = inputValue.trim();
        if (!input) return;

        // Neural Redirect: Detect search intents vs valid URLs
        const isUrl = input.includes('.') && !input.includes(' ');
        let targetUrl = input;

        if (isUrl) {
            if (!targetUrl.startsWith('http')) targetUrl = `https://${targetUrl}`;
        } else {
            // REDIRECT TO REAL SEARCH ENGINE (Google)
            targetUrl = `https://www.google.com/search?q=${encodeURIComponent(input)}&igu=1`;
            addLog(`Redirecting professional query to Sequoia Search Engine (Google Node)...`, "info");
        }

        setUrl(targetUrl);
        setHistory(prev => [...prev.slice(0, historyIndex + 1), targetUrl]);
        setHistoryIndex(prev => prev + 1);
        setIsLoading(true);
        setTimeout(() => setIsLoading(false), 600);
        addLog(`Navigator Intelligence synchronizing Node: ${targetUrl.slice(0, 30)}...`, "info");
    };

    const goBack = () => {
        if (historyIndex > 0) {
            setHistoryIndex(prev => prev - 1);
            const prev = history[historyIndex - 1];
            setUrl(prev);
            setInputValue(prev);
        }
    };

    const goForward = () => {
        if (historyIndex < history.length - 1) {
            setHistoryIndex(prev => prev + 1);
            const next = history[historyIndex + 1];
            setUrl(next);
            setInputValue(next);
        }
    };

    return (
        <div className="h-full flex flex-col bg-[#0A0A0B] text-white font-sans overflow-hidden">
            {/* Obsidian Glass Tab Bar */}
            <header className="h-10 bg-black/40 border-b border-white/5 flex items-center px-4 gap-2 shrink-0">
                <div className="flex items-center bg-white/10 px-4 py-1.5 rounded-t-xl gap-3 border-x border-t border-white/10 min-w-[200px]">
                    <Globe className="h-3 w-3 text-primary" />
                    <span className="text-[10px] font-black uppercase tracking-tighter truncate italic">{url.replace('https://', '')}</span>
                    <X className="h-2.5 w-2.5 text-zinc-600 hover:text-white" />
                </div>
                <button className="p-2 hover:bg-white/5 rounded-lg text-zinc-700 transition-all"><Plus className="h-3 w-3" /></button>
            </header>

            {/* Premium Navigator Toolbar */}
            <div className="h-16 border-b border-white/5 bg-black/20 backdrop-blur-3xl px-6 flex items-center gap-6 shrink-0 relative z-40 shadow-xl">
                <div className="flex items-center gap-1">
                    <button onClick={goBack} disabled={historyIndex === 0} className="p-2 hover:bg-white/5 rounded-xl text-zinc-500 disabled:opacity-20"><ChevronLeft className="h-4 w-4" /></button>
                    <button onClick={goForward} disabled={historyIndex === history.length - 1} className="p-2 hover:bg-white/5 rounded-xl text-zinc-500 disabled:opacity-20"><ChevronRight className="h-4 w-4" /></button>
                    <button onClick={() => { setIsLoading(true); setTimeout(() => setIsLoading(false), 600); }} className="p-2 hover:bg-white/5 rounded-xl text-zinc-500 hover:text-white transition-all"><RotateCw className={cn("h-4 w-4", isLoading && "animate-spin")} /></button>
                </div>

                <form onSubmit={handleNavigate} className="flex-1 max-w-2xl relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-3">
                        <Search className="h-3 w-3 text-zinc-600 group-focus-within:text-primary" />
                        <div className="h-3 w-px bg-white/5" />
                    </div>
                    <input 
                        value={inputValue}
                        onChange={(e) => {
                            setInputValue(e.target.value);
                            if (e.target.value.length > 2) setSuggestions([`${e.target.value} docs`, `${e.target.value} tutorial`, `${e.target.value} github`]);
                            else setSuggestions([]);
                        }}
                        className="w-full bg-[#1C1C1E]/60 border border-white/5 rounded-2xl pl-12 pr-10 py-2.5 text-xs font-bold tracking-widest text-white/80 focus:outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/5 transition-all shadow-inner italic"
                        placeholder="REQUEST NODE SYNCHRONIZATION OR SEARCH..."
                    />
                    
                    {/* Neural Suggest Overlay */}
                    <AnimatePresence>
                        {suggestions.length > 0 && (
                            <motion.div 
                                initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                                className="absolute top-[calc(100%+8px)] left-0 right-0 bg-[#0A0A0B]/95 backdrop-blur-3xl border border-white/10 rounded-2xl shadow-4xl p-2 overflow-hidden z-50"
                            >
                                {suggestions.map((s, i) => (
                                    <button 
                                        key={i}
                                        onClick={() => { setInputValue(s); handleNavigate({ preventDefault: () => {} } as any); setSuggestions([]); }}
                                        className="w-full flex items-center gap-4 px-4 py-3 hover:bg-primary/10 rounded-xl group/s transition-all border border-transparent hover:border-primary/20"
                                    >
                                        <History className="h-3 w-3 text-zinc-700 group-hover/s:text-primary" />
                                        <span className="text-[10px] font-black uppercase text-zinc-400 group-hover/s:text-white">{s}</span>
                                        <ArrowRight className="h-3 w-3 ml-auto opacity-0 group-hover/s:opacity-100 text-primary" />
                                    </button>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </form>

                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => setIsInsightOpen(!isInsightOpen)}
                        className={cn("px-4 py-2 rounded-xl flex items-center gap-2 text-[9px] font-black uppercase tracking-widest transition-all", isInsightOpen ? "bg-primary text-black" : "bg-white/5 text-zinc-500 hover:text-white border border-white/5")}
                    >
                        <Sparkles className="h-3.5 w-3.5" /> Sequoia Insight
                    </button>
                    <button className="p-2.5 bg-white/5 border border-white/5 rounded-xl text-zinc-500 hover:text-white transition-all"><MoreVertical className="h-3.5 w-3.5" /></button>
                </div>
            </div>

            {/* Neural Sync Progress Bar */}
            <div className="h-0.5 w-full bg-white/5 overflow-hidden relative shrink-0">
                <AnimatePresence>
                    {isLoading && (
                        <motion.div 
                            initial={{ x: "-100%" }} animate={{ x: "100%" }} transition={{ repeat: Infinity, duration: 1.5 }}
                            className="absolute inset-x-0 h-full bg-gradient-to-r from-transparent via-primary to-transparent opacity-60"
                        />
                    )}
                </AnimatePresence>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex overflow-hidden">
                <main className="flex-1 relative bg-white overflow-hidden">
                    <iframe 
                        src={url}
                        className="w-full h-full border-none bg-white"
                        title="Navigator Sandbox"
                        onLoad={() => setIsLoading(false)}
                    />
                    
                    {isLoading && (
                        <div className="absolute inset-0 z-10 bg-zinc-950/40 backdrop-blur-sm flex flex-col items-center justify-center pointer-events-none">
                            <RotateCcw className="h-8 w-8 text-primary animate-spin-slow mb-4" />
                            <span className="text-[8px] font-black text-primary uppercase tracking-[0.4em] animate-pulse">Neural Synchronization In Progress</span>
                        </div>
                    )}
                </main>

                {/* Sequoia Insight Sidebar */}
                <AnimatePresence>
                    {isInsightOpen && (
                        <motion.aside 
                            initial={{ width: 0, opacity: 0 }} animate={{ width: 320, opacity: 1 }} exit={{ width: 0, opacity: 0 }}
                            className="h-full bg-black/40 backdrop-blur-3xl border-l border-white/5 flex flex-col shrink-0 overflow-hidden"
                        >
                            <div className="p-8 space-y-8 min-w-[320px]">
                                <header className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-xl bg-primary/20 flex items-center justify-center text-primary border border-primary/20">
                                            <Sparkles className="h-4 w-4" />
                                        </div>
                                        <h3 className="text-xs font-black uppercase tracking-widest text-white italic">Sequoia Insight</h3>
                                    </div>
                                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5 shadow-inner">
                                        <div className="text-[8px] font-black text-zinc-700 uppercase tracking-[0.3em] mb-2">Executive Summary</div>
                                        <p className="text-[10px] font-black text-zinc-300 leading-relaxed italic">"Analyzing the professional node synchronization. Real-world redirect validated through Google infrastructure."</p>
                                    </div>
                                </header>

                                <div className="space-y-4">
                                    <div className="text-[8px] font-black text-zinc-700 uppercase tracking-[0.3em] px-1 italic">Professional Metrics</div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl shadow-lg">
                                            <div className="text-[7px] font-black text-zinc-500 uppercase mb-1">Authenticity</div>
                                            <div className="text-xs font-black text-emerald-500 tracking-tighter">99.2%</div>
                                        </div>
                                        <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl shadow-lg">
                                            <div className="text-[7px] font-black text-zinc-500 uppercase mb-1">Depth</div>
                                            <div className="text-xs font-black text-primary tracking-tighter">ELITE</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="text-[8px] font-black text-zinc-700 uppercase tracking-[0.3em] px-1 italic">Neural Operations</div>
                                    {[
                                        { label: "Synthesize Data", icon: Database },
                                        { label: "Fact Check Node", icon: ShieldCheck },
                                        { label: "Extract Professional Node", icon: Briefcase }
                                    ].map((act, i) => (
                                        <button key={i} className="w-full flex items-center gap-4 p-3 hover:bg-white/5 rounded-xl group/act transition-all border border-transparent hover:border-white/5 text-left">
                                            <act.icon className="h-3.5 w-3.5 text-zinc-700 group-hover/act:text-primary transition-colors" />
                                            <span className="text-[9px] font-black uppercase text-zinc-500 group-hover/act:text-white tracking-widest">{act.label}</span>
                                        </button>
                                    ))}
                                </div>

                                <div className="mt-auto pt-8 border-t border-white/5 text-center">
                                    <div className="flex items-center justify-center gap-3 opacity-20">
                                        <Fingerprint className="h-4 w-4 text-emerald-500" />
                                        <span className="text-[8px] font-black text-zinc-400 uppercase tracking-[0.2em]">Node Verified</span>
                                    </div>
                                </div>
                            </div>
                        </motion.aside>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default Navigator;
