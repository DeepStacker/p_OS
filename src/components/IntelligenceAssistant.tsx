import React, { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sparkles, 
  BrainCircuit, 
  Activity, 
  ShieldCheck, 
  Zap, 
  ChevronRight, 
  X, 
  Command, 
  Cpu,
  Globe,
  Bell,
  MessageSquare,
  Search,
  Settings,
  Terminal,
  FileText,
  BarChart3,
  Layers,
  ArrowRight,
  Mic,
  Maximize2,
  Loader2,
  Zap as Zap2,
  Trash2,
  Database,
  CloudLightning,
  GitBranch,
  ExternalLink,
  Briefcase,
  Play,
  Image as ImageIcon
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSystem } from "@/contexts/SystemContext";
import { useAuth } from "@/contexts/AuthContext";
import { askSequoia, SequoiaAction } from "@/lib/intelligence";
import ReactMarkdown from "react-markdown";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  status?: string;
  action?: SequoiaAction;
}

const IntelligenceAssistant: React.FC = () => {
    const system = useSystem();
    const { metrics, powerStatus, dockApps } = system;
    const { user } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [activeSuggestion, setActiveSuggestion] = useState<string | null>(null);
    const [isVoiceEnabled, setIsVoiceEnabled] = useState(false);
    
    // Chat State Management
    const [messages, setMessages] = useState<Message[]>([
        { id: "system-1", role: "assistant", content: "Sequoia Intelligence active. Universal Node synchronized. How can I assist your workflow?", timestamp: "SYSTEM" }
    ]);

    useEffect(() => {
        const handleToggle = () => setIsOpen(prev => !prev);
        window.addEventListener('toggle-intelligence', handleToggle);
        return () => window.removeEventListener('toggle-intelligence', handleToggle);
    }, []);
    const [inputValue, setInputValue] = useState("");
    const [isStreaming, setIsStreaming] = useState(false);
    const [currentStatus, setCurrentStatus] = useState<string | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, currentStatus]);

    // Simulated Proactive Intelligence
    useEffect(() => {
        const suggestions = [
            "3 high-match jobs detected in your sector.",
            "Security level verified: ROOT access active.",
            "Proposal synthesis optimized for 'Creative' tone.",
            "System resources are 98% efficient.",
            "VFS sync complete. 12 files backed up."
        ];
        
        const interval = setInterval(() => {
            if (!isOpen) {
               setActiveSuggestion(suggestions[Math.floor(Math.random() * suggestions.length)]);
               setTimeout(() => setActiveSuggestion(null), 6000);
            }
        }, 30000); // Proactive nudge every 30s
        
        return () => clearInterval(interval);
    }, [isOpen]);

    const handleAction = (action: SequoiaAction) => {
        switch(action.type) {
            case 'OPEN_APP':
                const app = dockApps.find(a => a.id === action.payload || a.name.toLowerCase() === action.payload.toLowerCase());
                if (app) {
                    system.openWindow(app.id, app.name, <app.icon className="h-4 w-4" />, app.component);
                }
                break;
            case 'SET_SETTING':
                if (action.payload.key === 'accent') system.setAccentColor(action.payload.value);
                break;
            case 'SET_WALLPAPER':
                system.setWallpaper(action.payload);
                break;
            case 'LOCK':
                system.setPowerStatus('locked');
                break;
            case 'POWER':
                system.triggerPowerAction(action.payload);
                break;
        }
    };

    const speak = (text: string) => {
        if (!isVoiceEnabled) return;
        const synth = window.speechSynthesis;
        const utter = new SpeechSynthesisUtterance(text.replace(/[*#]/g, ''));
        utter.rate = 1.1;
        utter.pitch = 0.9;
        synth.speak(utter);
    };

    const handleSend = async () => {
        if (!inputValue.trim() || isStreaming) return;
        
        const userMsg: Message = { id: Date.now().toString(), role: "user", content: inputValue.trim(), timestamp: new Date().toLocaleTimeString() };
        setMessages(prev => [...prev, userMsg]);
        setInputValue("");
        setIsStreaming(true);
        setCurrentStatus("SYNTHESIZING_INTENT");

        const aiMsg: Message = { id: (Date.now() + 1).toString(), role: "assistant", content: "", timestamp: "SYNTHESIZING" };
        setMessages(prev => [...prev, aiMsg]);

        try {
            let fullText = "";

            await askSequoia(userMsg.content, (chunk, status, action) => {
                if (status) {
                    setCurrentStatus(status);
                }
                if (action) {
                    handleAction(action);
                }
                if (chunk) {
                   fullText += chunk;
                   setMessages(prev => prev.map(m => m.id === aiMsg.id ? { ...m, content: fullText } : m));
                }
            });
            
            speak(fullText);
        } catch (err) {
            setMessages(prev => prev.map(m => m.id === aiMsg.id ? { ...m, content: "Synthesis failure. Kernel busy. Retrying..." } : m));
        } finally {
            setIsStreaming(false);
            setCurrentStatus(null);
        }
    };

    if (powerStatus === 'locked' || powerStatus === 'sleep' || !user) return null;

    const getStatusLabel = (status: string) => {
       switch(status) {
          case 'SYNTHESIZING_INTENT': return 'Analyzing User Intent...';
          case 'INDEXING_JOB_MARKETS': return 'Indexing Global Job Markets...';
          case 'ANALYZING_VFS_REPOSITORIES': return 'Analyzing VFS Repositories...';
          case 'EXECUTING_SYSTEM_OVERRIDE': return 'Executing System Override...';
          case 'ADAPTING_ENVIRONMENT_AESTHETICS': return 'Adapting Environment Aesthetics...';
          case 'OPENING_OPPORTUNITY_INDEXER': return 'Opening Opportunity Indexer...';
          case 'SYNTHESIZING_FINAL_RESPONSE': return 'Synthesizing Professional Response...';
          default: return 'Processing Context...';
       }
    };

    const getStatusIcon = (status: string) => {
       switch(status) {
          case 'SYNTHESIZING_INTENT': return BrainCircuit;
          case 'INDEXING_JOB_MARKETS': return Database;
          case 'ANALYZING_VFS_REPOSITORIES': return GitBranch;
          case 'EXECUTING_SYSTEM_OVERRIDE': return Activity;
          case 'ADAPTING_ENVIRONMENT_AESTHETICS': return ImageIcon;
          case 'OPENING_OPPORTUNITY_INDEXER': return Briefcase;
          case 'SYNTHESIZING_FINAL_RESPONSE': return CloudLightning;
          default: return Loader2;
       }
    };

    return (
        <div className="fixed inset-0 z-[2000] pointer-events-none overflow-hidden select-none font-sans">
            
            {/* Global Overlay Background */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsOpen(false)}
                        className="absolute inset-0 bg-black/40 backdrop-blur-[2px] pointer-events-auto"
                    />
                )}
            </AnimatePresence>

            {/* Sidebar Drawer */}
            <AnimatePresence>
                {isOpen && (
                    <motion.aside 
                        initial={{ x: "100%", opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: "100%", opacity: 0 }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="absolute top-0 right-0 h-full w-full sm:w-[460px] bg-black/80 backdrop-blur-3xl border-l border-white/5 pointer-events-auto flex flex-col shadow-5xl ring-1 ring-white/5"
                    >
                        {/* Dynamic Neural Background */}
                        <div className="absolute inset-0 pointer-events-none opacity-20 overflow-hidden">
                           <div className="absolute top-[-10%] right-[-10%] w-80 h-80 bg-primary/20 blur-[120px] rounded-full animate-pulse" />
                           <div className="absolute bottom-[-10%] left-[-10%] w-80 h-80 bg-emerald-500/20 blur-[120px] rounded-full animate-pulse delay-700" />
                        </div>

                        {/* Intelligence Header */}
                        <header className="px-10 pt-20 pb-8 flex items-center justify-between relative z-10 shrink-0 border-b border-white/5">
                           <div className="flex items-center gap-5">
                              <div className="w-14 h-14 rounded-3xl bg-primary/20 flex items-center justify-center border border-primary/20 text-primary shadow-xl hover:scale-105 transition-transform cursor-pointer">
                                 <BrainCircuit className="h-7 w-7" />
                              </div>
                              <div className="flex flex-col">
                                 <div className="flex items-center gap-3">
                                    <h3 className="text-xl font-black text-white italic tracking-tighter uppercase leading-none">Intelligence Hub</h3>
                                    <div className="px-3 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-[8px] font-black text-primary tracking-widest uppercase">Prime_Live</div>
                                 </div>
                                 <div className="flex items-center gap-2 mt-2">
                                    <div className="h-1 w-1 rounded-full bg-emerald-500 animate-ping" />
                                    <span className="text-[9px] font-black uppercase tracking-[0.4em] text-zinc-600">Unified Node Synchronized</span>
                                 </div>
                              </div>
                           </div>
                           <div className="flex gap-2 text-zinc-600">
                              <button onClick={() => setIsVoiceEnabled(!isVoiceEnabled)} className={cn("w-10 h-10 flex items-center justify-center hover:bg-white/5 rounded-2xl transition-all", isVoiceEnabled ? "text-primary" : "text-zinc-700")}>
                                 <Mic className="h-4 w-4" />
                              </button>
                              <button onClick={() => setMessages([{ id: "sys", role: "assistant", content: "Memory cleared. Initializing fresh node...", timestamp: "SYS" }])} className="w-10 h-10 flex items-center justify-center hover:bg-white/5 rounded-2xl transition-all hover:text-rose-500"><Trash2 className="h-4 w-4" /></button>
                              <button onClick={() => setIsOpen(false)} className="w-10 h-10 flex items-center justify-center hover:bg-white/5 rounded-2xl transition-all"><X className="h-4 w-4" /></button>
                           </div>
                        </header>

                        {/* Chat History Pane */}
                        <div ref={scrollRef} className="flex-1 overflow-y-auto no-scrollbar px-10 py-10 space-y-10 relative z-10 scroll-smooth">
                           {messages.map((msg, i) => (
                              <motion.div 
                                 key={msg.id} 
                                 initial={{ opacity: 0, y: 10, scale: 0.95 }} 
                                 animate={{ opacity: 1, y: 0, scale: 1 }}
                                 className={cn(
                                    "flex flex-col max-w-[95%]",
                                    msg.role === 'user' ? "ml-auto items-end" : "items-start"
                                 )}
                              >
                                 <div className="flex items-center gap-2 mb-3">
                                    <span className="text-[8px] font-black uppercase tracking-[0.3em] text-zinc-700 italic">{msg.role === 'user' ? 'Local_Identity' : 'Sequoia_Intelligence'}</span>
                                    <span className="text-[8px] font-black uppercase text-zinc-800 tracking-widest">{msg.timestamp}</span>
                                 </div>
                                 
                                 {/* Content Container */}
                                 <div className={cn(
                                    "p-6 rounded-[32px] text-sm font-bold leading-relaxed shadow-3xl border backdrop-blur-3xl overflow-hidden relative group",
                                    msg.role === 'user' ? "bg-primary/10 border-primary/20 text-white rounded-tr-[4px]" : "bg-white/[0.04] border-white/5 text-zinc-200 rounded-tl-[4px]"
                                 )}>
                                    {msg.content ? (
                                        <div className="space-y-6">
                                            <div className="prose prose-invert prose-sm max-w-none prose-p:leading-relaxed prose-strong:text-primary prose-strong:font-black prose-code:text-primary prose-pre:bg-primary/5 prose-pre:border prose-pre:border-primary/20">
                                                <ReactMarkdown>
                                                    {msg.content}
                                                </ReactMarkdown>
                                            </div>
                                            
                                            {/* RAG Visual Synthesis: Job Cards */}
                                            {msg.role === 'assistant' && msg.content.includes('[JOB_ID:') && (
                                                <div className="pt-4 grid gap-3">
                                                    {msg.content.match(/\[JOB_ID:(.*?)\]/g)?.map((match, idx) => {
                                                        const id = match.slice(8, -1);
                                                        return (
                                                            <motion.button 
                                                                key={idx}
                                                                whileHover={{ x: 4, backgroundColor: 'rgba(var(--primary), 0.05)' }}
                                                                onClick={() => {
                                                                    const jobTitle = msg.content.split('\n').find(l => l.includes(match))?.split('] ')[1]?.split(' at ')[0] || "Developer";
                                                                    system.openWindow('search', 'Jobs', <Briefcase className="h-4 w-4" />, 'search', { searchTerm: jobTitle });
                                                                }}
                                                                className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/5 group/card transition-all"
                                                            >
                                                                <div className="flex items-center gap-4">
                                                                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 text-primary">
                                                                        <Briefcase className="h-4 w-4" />
                                                                    </div>
                                                                    <div className="text-left">
                                                                        <div className="text-[10px] font-black uppercase tracking-widest text-primary/60">Live Opportunity</div>
                                                                        <div className="text-xs font-black text-white italic">Index_Node: {id.slice(0, 8)}</div>
                                                                    </div>
                                                                </div>
                                                                <ExternalLink className="h-4 w-4 text-zinc-700 group-hover/card:text-primary transition-colors" />
                                                            </motion.button>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="flex flex-col gap-5">
                                            {currentStatus && (
                                               <div className="flex items-center gap-4 px-5 py-3 rounded-2xl bg-primary/10 border border-primary/20 relative overflow-hidden shadow-2xl">
                                                  <div className="absolute inset-0 bg-primary/5 animate-pulse" />
                                                  {React.createElement(getStatusIcon(currentStatus), { className: "h-4 w-4 text-primary animate-spin-slow relative z-10" })}
                                                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary relative z-10 italic">{getStatusLabel(currentStatus)}</span>
                                               </div>
                                            )}
                                            <div className="flex gap-2 py-1 px-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-bounce" />
                                                <div className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-bounce delay-150" />
                                                <div className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-bounce delay-300" />
                                            </div>
                                        </div>
                                    )}
                                 </div>
                              </motion.div>
                           ))}
                        </div>

                        {/* Visual Telemetry: Orbital Health Radial */}
                        <div className="px-10 py-6 grid grid-cols-2 gap-4 relative z-10 bg-black/40 border-t border-white/5 bg-gradient-to-t from-black/60 to-transparent">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between text-[8px] font-black tracking-widest text-zinc-500 uppercase italic">
                                    <span>Core Engine</span>
                                    <span className="text-primary">{metrics.cpu}%</span>
                                </div>
                                <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                    <motion.div 
                                        initial={{ width: 0 }}
                                        animate={{ width: `${metrics.cpu}%` }}
                                        className="h-full bg-primary shadow-[0_0_10px_rgba(var(--primary),0.5)]"
                                    />
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between text-[8px] font-black tracking-widest text-zinc-500 uppercase italic pl-4 border-l border-white/5">
                                    <span>VFS Memory</span>
                                    <span className="text-emerald-500">{Math.floor((metrics.ram/16)*100)}%</span>
                                </div>
                                <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden ml-4">
                                    <motion.div 
                                        initial={{ width: 0 }}
                                        animate={{ width: `${(metrics.ram/16)*100}%` }}
                                        className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Synthesis Console Input */}
                        <footer className="px-8 pb-10 pt-4 relative z-10 shrink-0">
                           <div className="p-8 rounded-[48px] bg-white/[0.03] border border-white/10 shadow-4xl group relative backdrop-blur-md">
                              <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-[48px]" />
                              <div className="flex items-center justify-between mb-5 px-1 relative z-10">
                                 <span className="text-[10px] font-black text-primary uppercase tracking-[0.4em] italic">Kernel rapid synthesis</span>
                                 <div className="flex gap-1.5 grayscale opacity-40">
                                    {[1,2,3,4].map(j => <Activity key={j} className="h-3 w-3 text-primary" />)}
                                 </div>
                              </div>
                              <div className="relative z-10">
                                 <textarea 
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
                                    placeholder="Request system override..."
                                    className="w-full bg-black/60 border border-white/10 rounded-3xl pl-14 pr-16 py-6 text-sm font-bold text-white italic placeholder:text-zinc-800 focus:outline-none focus:border-primary/60 transition-all resize-none h-24 custom-scrollbar shadow-inner"
                                 />
                                 <div className="absolute left-6 top-8"><Mic className={cn("h-4 w-4 transition-colors", isStreaming ? "text-rose-500 animate-pulse" : "text-primary")} /></div>
                                 <button 
                                    onClick={handleSend}
                                    disabled={!inputValue.trim() || isStreaming}
                                    className={cn(
                                        "absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-[20px] flex items-center justify-center transition-all",
                                        isStreaming ? "bg-white/5 cursor-wait" : "bg-primary text-black hover:scale-105 active:scale-95 shadow-2xl shadow-primary/40 ring-4 ring-primary/20"
                                    )}
                                 >
                                    {isStreaming ? <Loader2 className="h-5 w-5 animate-spin" /> : <Play className="h-5 w-5 fill-current" />}
                                 </button>
                              </div>
                           </div>
                        </footer>
                    </motion.aside>
                )}
            </AnimatePresence>

            {/* Notification Orb (Original bubble logic) */}
            <AnimatePresence>
                {activeSuggestion && !isOpen && (
                   <motion.div 
                     initial={{ opacity: 0, scale: 0.8, x: 40 }}
                     animate={{ opacity: 1, scale: 1, x: 0 }}
                     exit={{ opacity: 0, scale: 0.8, x: 20 }}
                     className="absolute bottom-44 right-10 group pointer-events-auto"
                   >
                      <div className="bg-black/90 backdrop-blur-3xl border border-primary/20 p-6 rounded-[32px] shadow-4xl flex items-center gap-5 w-80 relative overflow-hidden">
                         <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                         <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0 border border-primary/10">
                            <Sparkles className="h-5 w-5 text-primary animate-pulse" />
                         </div>
                         <div className="flex flex-col gap-1">
                            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-primary">Neural Nudge</span>
                            <p className="text-xs font-bold text-white leading-relaxed italic pr-4 line-clamp-2">"{activeSuggestion}"</p>
                         </div>
                         <button onClick={() => setActiveSuggestion(null)} className="absolute top-4 right-4 text-zinc-800 hover:text-white transition-colors"><X className="h-3 w-3" /></button>
                      </div>
                   </motion.div>
                )}
            </AnimatePresence>

            {/* Floating Orb Trigger */}
            <div className="absolute bottom-10 right-10 pointer-events-auto">
                <button 
                    onClick={() => setIsOpen(!isOpen)}
                    className={cn(
                        "w-16 h-16 rounded-[28px] flex items-center justify-center transition-all duration-700 relative group overflow-hidden shadow-2xl",
                        isOpen ? "bg-white/10 ring-1 ring-white/10" : "bg-primary shadow-primary/30 hover:scale-110 active:scale-95"
                    )}
                >
                    <div className="absolute inset-0 bg-primary opacity-20 blur-2xl group-hover:opacity-40 transition-opacity" />
                    <AnimatePresence mode="wait">
                        {isOpen ? (
                            <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
                                <X className="h-6 w-6 text-white" />
                            </motion.div>
                        ) : (
                            <motion.div key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} className="relative z-10 flex items-center justify-center h-full w-full">
                                <BrainCircuit className="h-8 w-8 text-black filter drop-shadow-lg" />
                                <motion.div 
                                    className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-4 border-black flex items-center justify-center"
                                    animate={{ scale: [1, 1.2, 1] }}
                                    transition={{ repeat: Infinity, duration: 2 }}
                                >
                                    <div className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </button>
            </div>
        </div>
    );
};

export default IntelligenceAssistant;
