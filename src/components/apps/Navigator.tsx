import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Globe, ChevronLeft, ChevronRight, RotateCw, Search, Lock, Star, 
  Plus, X, Home, ExternalLink, MoreVertical, Sparkles, ShieldCheck,
  Briefcase, Database, Fingerprint, History, ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSystem } from '@/contexts/SystemContext';

interface Tab {
  id: string;
  url: string;
  title: string;
}

// Sites known to work inside iframes
const IFRAME_FRIENDLY_SITES = [
  "https://en.wikipedia.org",
  "https://en.m.wikipedia.org",
  "https://www.openstreetmap.org",
  "https://archive.org",
  "https://lite.duckduckgo.com",
];

const DEFAULT_BOOKMARKS = [
  { name: "Wikipedia", url: "https://en.wikipedia.org/wiki/Main_Page" },
  { name: "DuckDuckGo", url: "https://lite.duckduckgo.com" },
  { name: "OpenStreetMap", url: "https://www.openstreetmap.org" },
  { name: "Internet Archive", url: "https://archive.org" },
];

const Navigator = () => {
    const { addLog } = useSystem();
    const [tabs, setTabs] = useState<Tab[]>([{ id: "tab-1", url: "https://en.wikipedia.org/wiki/Main_Page", title: "Wikipedia" }]);
    const [activeTabId, setActiveTabId] = useState("tab-1");
    const [inputValue, setInputValue] = useState("https://en.wikipedia.org/wiki/Main_Page");
    const [isLoading, setIsLoading] = useState(false);
    const [iframeError, setIframeError] = useState(false);
    const [isInsightOpen, setIsInsightOpen] = useState(false);
    const [history, setHistory] = useState<string[]>(["https://en.wikipedia.org/wiki/Main_Page"]);
    const [historyIndex, setHistoryIndex] = useState(0);
    const iframeRef = useRef<HTMLIFrameElement>(null);

    const activeTab = tabs.find(t => t.id === activeTabId) || tabs[0];
    const currentUrl = activeTab?.url || "";

    // Check if URL likely works in iframe
    const canIframe = (url: string): boolean => {
        return IFRAME_FRIENDLY_SITES.some(site => url.startsWith(site)) || url.startsWith("data:") || url.startsWith("blob:");
    };

    const navigate = (url: string) => {
        let targetUrl = url.trim();
        if (!targetUrl) return;

        // Detect search vs URL
        const isUrl = targetUrl.includes('.') && !targetUrl.includes(' ');
        if (!isUrl) {
            // Search via DuckDuckGo (iframe-friendly lite version)
            targetUrl = `https://lite.duckduckgo.com/?q=${encodeURIComponent(targetUrl)}`;
        } else if (!targetUrl.startsWith('http')) {
            targetUrl = `https://${targetUrl}`;
        }

        setIframeError(!canIframe(targetUrl));
        setTabs(prev => prev.map(t => t.id === activeTabId ? { ...t, url: targetUrl, title: getDomain(targetUrl) } : t));
        setInputValue(targetUrl);
        setIsLoading(true);
        setTimeout(() => setIsLoading(false), 1500);
        
        const newHistory = [...history.slice(0, historyIndex + 1), targetUrl];
        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
        addLog(`Navigating to ${getDomain(targetUrl)}`, "info");
    };

    const getDomain = (url: string): string => {
        try { return new URL(url).hostname.replace("www.", ""); } catch { return url; }
    };

    const goBack = () => {
        if (historyIndex > 0) {
            const newIndex = historyIndex - 1;
            setHistoryIndex(newIndex);
            const prevUrl = history[newIndex];
            setTabs(prev => prev.map(t => t.id === activeTabId ? { ...t, url: prevUrl, title: getDomain(prevUrl) } : t));
            setInputValue(prevUrl);
            setIframeError(!canIframe(prevUrl));
        }
    };

    const goForward = () => {
        if (historyIndex < history.length - 1) {
            const newIndex = historyIndex + 1;
            setHistoryIndex(newIndex);
            const nextUrl = history[newIndex];
            setTabs(prev => prev.map(t => t.id === activeTabId ? { ...t, url: nextUrl, title: getDomain(nextUrl) } : t));
            setInputValue(nextUrl);
            setIframeError(!canIframe(nextUrl));
        }
    };

    const addTab = () => {
        const newTab: Tab = { id: `tab-${Date.now()}`, url: "https://en.wikipedia.org/wiki/Main_Page", title: "New Tab" };
        setTabs(prev => [...prev, newTab]);
        setActiveTabId(newTab.id);
        setInputValue(newTab.url);
        setIframeError(false);
    };

    const closeTab = (id: string) => {
        if (tabs.length === 1) return;
        const idx = tabs.findIndex(t => t.id === id);
        const newTabs = tabs.filter(t => t.id !== id);
        setTabs(newTabs);
        if (activeTabId === id) {
            const newActive = newTabs[Math.min(idx, newTabs.length - 1)];
            setActiveTabId(newActive.id);
            setInputValue(newActive.url);
            setIframeError(!canIframe(newActive.url));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        navigate(inputValue);
    };

    return (
        <div className="h-full flex flex-col bg-[#0e0e10] text-white font-sans overflow-hidden">
            {/* Tab Bar */}
            <div className="h-10 bg-[#1a1a1d] border-b border-white/5 flex items-center px-2 gap-1 shrink-0 overflow-x-auto no-scrollbar">
                {tabs.map(tab => (
                    <div 
                        key={tab.id}
                        onClick={() => { setActiveTabId(tab.id); setInputValue(tab.url); setIframeError(!canIframe(tab.url)); }}
                        className={cn(
                            "flex items-center gap-2 px-3 py-1.5 rounded-lg min-w-[140px] max-w-[200px] cursor-pointer group text-xs transition-all",
                            activeTabId === tab.id ? "bg-[#2a2a2e] text-white" : "text-zinc-500 hover:bg-white/5"
                        )}
                    >
                        <Globe className="h-3 w-3 shrink-0 text-zinc-500" />
                        <span className="truncate flex-1">{tab.title}</span>
                        {tabs.length > 1 && (
                            <X 
                                className="h-3 w-3 shrink-0 opacity-0 group-hover:opacity-100 hover:text-red-400 transition-all" 
                                onClick={(e) => { e.stopPropagation(); closeTab(tab.id); }} 
                            />
                        )}
                    </div>
                ))}
                <button onClick={addTab} className="p-1.5 hover:bg-white/5 rounded-lg text-zinc-600 shrink-0"><Plus className="h-3.5 w-3.5" /></button>
            </div>

            {/* Toolbar */}
            <div className="h-14 border-b border-white/5 bg-[#141416] px-4 flex items-center gap-3 shrink-0">
                <div className="flex items-center gap-1">
                    <button onClick={goBack} disabled={historyIndex === 0} className="p-2 rounded-lg hover:bg-white/5 text-zinc-500 disabled:opacity-20 transition-all"><ChevronLeft className="h-4 w-4" /></button>
                    <button onClick={goForward} disabled={historyIndex === history.length - 1} className="p-2 rounded-lg hover:bg-white/5 text-zinc-500 disabled:opacity-20 transition-all"><ChevronRight className="h-4 w-4" /></button>
                    <button onClick={() => iframeRef.current && (iframeRef.current.src = currentUrl)} className="p-2 rounded-lg hover:bg-white/5 text-zinc-500 hover:text-white transition-all">
                        <RotateCw className={cn("h-3.5 w-3.5", isLoading && "animate-spin")} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 max-w-2xl relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2">
                        {currentUrl.startsWith("https") ? <Lock className="h-3 w-3 text-green-500" /> : <Globe className="h-3 w-3 text-zinc-500" />}
                    </div>
                    <input 
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onFocus={(e) => e.target.select()}
                        className="w-full bg-[#0e0e10] border border-white/10 rounded-xl pl-8 pr-4 py-2 text-sm text-white/80 focus:outline-none focus:border-blue-500/40 focus:ring-2 focus:ring-blue-500/10 transition-all"
                        placeholder="Search or enter URL..."
                    />
                </form>

                <div className="flex items-center gap-1">
                    <button 
                        onClick={() => setIsInsightOpen(!isInsightOpen)}
                        className={cn("px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-xs transition-all", isInsightOpen ? "bg-violet-500 text-white" : "bg-white/5 text-zinc-500 hover:text-white")}
                    >
                        <Sparkles className="h-3 w-3" /> AI
                    </button>
                    <button onClick={() => window.open(currentUrl, "_blank")} className="p-2 rounded-lg hover:bg-white/5 text-zinc-500 hover:text-white transition-all" title="Open in real browser">
                        <ExternalLink className="h-3.5 w-3.5" />
                    </button>
                </div>
            </div>

            {/* Bookmarks Bar */}
            <div className="h-9 bg-[#141416]/50 border-b border-white/5 flex items-center px-4 gap-4 shrink-0">
                {DEFAULT_BOOKMARKS.map(bm => (
                    <button key={bm.name} onClick={() => navigate(bm.url)} className="flex items-center gap-1.5 text-[11px] text-zinc-500 hover:text-white transition-all">
                        <Globe className="h-3 w-3" />
                        {bm.name}
                    </button>
                ))}
            </div>

            {/* Progress bar */}
            <div className="h-0.5 w-full bg-transparent overflow-hidden shrink-0">
                {isLoading && (
                    <motion.div 
                        initial={{ x: "-100%" }} animate={{ x: "100%" }} transition={{ repeat: Infinity, duration: 1.2 }}
                        className="h-full bg-gradient-to-r from-transparent via-blue-500 to-transparent"
                    />
                )}
            </div>

            {/* Main Content */}
            <div className="flex-1 flex overflow-hidden">
                <main className="flex-1 relative bg-white">
                    {iframeError ? (
                        /* Fallback for sites that block iframes */
                        <div className="h-full bg-[#0e0e10] flex flex-col items-center justify-center px-12 text-center">
                            <div className="w-20 h-20 rounded-2xl bg-zinc-800 flex items-center justify-center mb-6">
                                <ShieldCheck className="h-8 w-8 text-zinc-600" />
                            </div>
                            <h2 className="text-xl font-semibold text-white mb-2">This site can't be embedded</h2>
                            <p className="text-sm text-zinc-500 max-w-md mb-6">
                                <strong>{getDomain(currentUrl)}</strong> blocks inline display for security. You can open it in your real browser instead.
                            </p>
                            <div className="flex gap-3">
                                <button 
                                    onClick={() => window.open(currentUrl, "_blank")}
                                    className="px-6 py-3 bg-blue-500 text-white rounded-xl text-sm font-medium hover:bg-blue-600 transition-all flex items-center gap-2"
                                >
                                    <ExternalLink className="h-4 w-4" /> Open in browser
                                </button>
                                <button 
                                    onClick={() => navigate("https://en.wikipedia.org/wiki/Main_Page")}
                                    className="px-6 py-3 bg-white/5 text-zinc-300 rounded-xl text-sm hover:bg-white/10 transition-all flex items-center gap-2"
                                >
                                    <Home className="h-4 w-4" /> Go home
                                </button>
                            </div>
                            <p className="text-xs text-zinc-700 mt-8">Tip: Wikipedia, DuckDuckGo, OpenStreetMap, and Archive.org work inline.</p>
                        </div>
                    ) : (
                        <iframe 
                            ref={iframeRef}
                            src={currentUrl}
                            className="w-full h-full border-none"
                            title="Browser"
                            onLoad={() => setIsLoading(false)}
                            sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                        />
                    )}
                </main>

                {/* AI Sidebar */}
                <AnimatePresence>
                    {isInsightOpen && (
                        <motion.aside 
                            initial={{ width: 0, opacity: 0 }} animate={{ width: 280, opacity: 1 }} exit={{ width: 0, opacity: 0 }}
                            className="h-full bg-[#141416] border-l border-white/5 flex flex-col shrink-0 overflow-hidden"
                        >
                            <div className="p-6 space-y-6 min-w-[280px]">
                                <div className="flex items-center gap-3">
                                    <div className="w-7 h-7 rounded-lg bg-violet-500/20 flex items-center justify-center text-violet-400">
                                        <Sparkles className="h-3.5 w-3.5" />
                                    </div>
                                    <span className="text-xs font-semibold text-white">Sequoia Insight</span>
                                </div>

                                <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                                    <div className="text-[10px] text-zinc-600 uppercase tracking-wider mb-2">Current page</div>
                                    <p className="text-xs text-zinc-300 leading-relaxed">{getDomain(currentUrl)}</p>
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                    <div className="p-3 bg-white/[0.03] border border-white/5 rounded-lg">
                                        <div className="text-[10px] text-zinc-600 mb-1">Security</div>
                                        <div className="text-xs font-medium text-green-400">{currentUrl.startsWith("https") ? "Secure" : "Not secure"}</div>
                                    </div>
                                    <div className="p-3 bg-white/[0.03] border border-white/5 rounded-lg">
                                        <div className="text-[10px] text-zinc-600 mb-1">Embeddable</div>
                                        <div className="text-xs font-medium">{canIframe(currentUrl) ? <span className="text-green-400">Yes</span> : <span className="text-amber-400">No</span>}</div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="text-[10px] text-zinc-600 uppercase tracking-wider">Actions</div>
                                    <button onClick={() => window.open(currentUrl, "_blank")} className="w-full flex items-center gap-3 p-3 hover:bg-white/5 rounded-lg text-xs text-zinc-400 hover:text-white transition-all">
                                        <ExternalLink className="h-3.5 w-3.5" /> Open externally
                                    </button>
                                    <button onClick={() => navigator.clipboard?.writeText(currentUrl)} className="w-full flex items-center gap-3 p-3 hover:bg-white/5 rounded-lg text-xs text-zinc-400 hover:text-white transition-all">
                                        <Database className="h-3.5 w-3.5" /> Copy URL
                                    </button>
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
