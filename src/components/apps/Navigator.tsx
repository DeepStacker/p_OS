import React, { useState, useRef } from 'react';
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
  X
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
    const [isSecure, setIsSecure] = useState(true);

    const handleNavigate = (e: React.FormEvent) => {
        e.preventDefault();
        let targetUrl = inputValue;
        if (!targetUrl.startsWith('http')) targetUrl = `https://${targetUrl}`;
        
        setUrl(targetUrl);
        setHistory(prev => [...prev.slice(0, historyIndex + 1), targetUrl]);
        setHistoryIndex(prev => prev + 1);
        setIsLoading(true);
        setTimeout(() => setIsLoading(false), 1500);
        addLog(`Navigator synchronizing Node: ${targetUrl}`, "info");
    };

    const goBack = () => {
        if (historyIndex > 0) {
            setHistoryIndex(prev => prev - 1);
            const prevUrl = history[historyIndex - 1];
            setUrl(prevUrl);
            setInputValue(prevUrl);
        }
    };

    const goForward = () => {
        if (historyIndex < history.length - 1) {
            setHistoryIndex(prev => prev + 1);
            const nextUrl = history[historyIndex + 1];
            setUrl(nextUrl);
            setInputValue(nextUrl);
        }
    };

    return (
        <div className="h-full flex flex-col bg-[#1C1C1E] text-white font-sans overflow-hidden">
            {/* Address Bar Synthesis */}
            <header className="h-16 border-b border-white/5 bg-black/40 backdrop-blur-3xl px-6 flex items-center gap-6 shrink-0 relative z-20">
                <div className="flex items-center gap-2">
                    <button onClick={goBack} disabled={historyIndex === 0} className="p-2 hover:bg-white/5 rounded-xl text-zinc-500 disabled:opacity-20 transition-all"><ChevronLeft className="h-4 w-4" /></button>
                    <button onClick={goForward} disabled={historyIndex === history.length - 1} className="p-2 hover:bg-white/5 rounded-xl text-zinc-500 disabled:opacity-20 transition-all"><ChevronRight className="h-4 w-4" /></button>
                    <button onClick={() => { setIsLoading(true); setTimeout(() => setIsLoading(false), 1000); }} className="p-2 hover:bg-white/5 rounded-xl text-zinc-500 hover:text-white transition-all"><RotateCw className={cn("h-4 w-4", isLoading && "animate-spin")} /></button>
                </div>

                <form onSubmit={handleNavigate} className="flex-1 max-w-2xl relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-3">
                        {isSecure ? <Lock className="h-3 w-3 text-emerald-500" /> : <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />}
                        <div className="h-3 w-px bg-white/10" />
                    </div>
                    <input 
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-2xl pl-14 pr-10 py-2.5 text-xs font-black tracking-widest text-white/80 focus:outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/5 transition-all placeholder:opacity-10"
                        placeholder="ENTER NODE ADDRESS..."
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-3">
                        {isLoading && <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />}
                        <Star className="h-3 w-3 text-zinc-700 hover:text-amber-500 cursor-pointer" />
                    </div>
                </form>

                <div className="flex items-center gap-4">
                    <button className="p-2.5 bg-white/5 border border-white/5 rounded-xl text-zinc-500 hover:text-white transition-all shadow-xl"><Share2 className="h-3.5 w-3.5" /></button>
                    <button className="p-2.5 bg-white/5 border border-white/5 rounded-xl text-zinc-500 hover:text-white transition-all shadow-xl"><Plus className="h-3.5 w-3.5" /></button>
                </div>
            </header>

            {/* Bookmark Deck */}
            <div className="h-10 bg-black/20 border-b border-white/5 flex items-center px-8 gap-6 shrink-0 overflow-x-auto no-scrollbar relative z-10">
                {[
                   { name: "Node VFS", icon: DatabaseIcon, url: "https://nodeos.app/dev" },
                   { name: "Wikipedia", icon: Globe, url: "https://wikipedia.org" },
                   { name: "GitHub Node", icon: GitBranch, url: "https://github.com" },
                   { name: "Nexus Prime", icon: Sparkles, url: "https://nexus.node" }
                ].map(mark => (
                    <button 
                        key={mark.name}
                        onClick={() => { setUrl(mark.url); setInputValue(mark.url); }}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-white/5 text-[9px] font-black uppercase tracking-widest text-zinc-500 hover:text-white transition-all shrink-0 border border-transparent hover:border-white/5"
                    >
                        <mark.icon className="h-3 w-3 text-primary opacity-40" />
                        {mark.name}
                    </button>
                ))}
            </div>

            {/* Global Sandbox Layer */}
            <main className="flex-1 relative bg-white overflow-hidden group">
                {isLoading && (
                    <div className="absolute inset-0 z-10 bg-zinc-950 flex flex-col items-center justify-center text-center px-12">
                        <div className="w-20 h-20 rounded-[32px] bg-primary/10 flex items-center justify-center border border-primary/20 text-primary mb-8 shadow-4xl animate-pulse">
                            <Globe className="h-10 w-10 animate-spin-slow" />
                        </div>
                        <h2 className="text-xl font-black text-white italic uppercase tracking-tighter mb-2">Synchronizing Remote Node</h2>
                        <span className="text-[10px] font-black text-zinc-700 uppercase tracking-[0.4em]">{url}</span>
                    </div>
                )}

                {/* Secure Sandbox Message for Incompatible Sites */}
                <iframe 
                    src={url}
                    className="w-full h-full border-none bg-white"
                    title="Navigator Sandbox"
                    onLoad={() => setIsLoading(false)}
                />

                {/* Fallback Overlay (When iframe fails or for aesthetic nudge) */}
                <div className="absolute inset-x-8 bottom-8 pointer-events-none group-hover:pointer-events-auto">
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 rounded-2xl bg-zinc-950/80 backdrop-blur-3xl border border-white/10 shadow-3xl flex items-center justify-between"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 text-emerald-500 shadow-inner">
                                <ShieldCheck className="h-5 w-5" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black text-white uppercase tracking-widest">Enhanced Node Isolation</span>
                                <p className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest">Global Sandbox Active • X-Frame Defense Enabled</p>
                            </div>
                        </div>
                        <button className="px-6 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-[9px] font-black uppercase tracking-widest border border-white/5 transition-all text-white/40 hover:text-white">Request Deep Link</button>
                    </motion.div>
                </div>
            </main>
        </div>
    );
};

// Internal node icons as placeholders
const DatabaseIcon = (props: any) => <Layout {...props} />;
const GitBranch = (props: any) => <Layout {...props} />;
const Sparkles = (props: any) => <Layout {...props} />;

export default Navigator;
