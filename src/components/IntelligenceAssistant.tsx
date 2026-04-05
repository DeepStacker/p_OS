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
  Image as ImageIcon,
  Waves,
  Fingerprint,
  RotateCcw,
  Unplug,
  History,
  Pin,
  ChevronDown,
  Volume2
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

const SequoiaFullDuplex: React.FC = () => {
    const system = useSystem();
    const { metrics, powerStatus, dockApps } = system;
    const { user } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [isStreaming, setIsStreaming] = useState(false);
    const [inputValue, setInputValue] = useState("");
    const [transcript, setTranscript] = useState("");
    const [currentStatus, setCurrentStatus] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    
    // Voice Recognition Ref
    const recognitionRef = useRef<any>(null);
    const synthRef = useRef<SpeechSynthesis | null>(window.speechSynthesis);

    useEffect(() => {
        const handleToggle = () => setIsOpen(prev => !prev);
        window.addEventListener('toggle-intelligence', handleToggle);
        
        // Initialize Full-Duplex Speech Recognition
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = true; // FULL DUPLEX
            recognitionRef.current.interimResults = true;

            recognitionRef.current.onresult = (event: any) => {
                const current = event.resultIndex;
                const transcriptText = event.results[current][0].transcript;
                setTranscript(transcriptText);
                
                // Neural Interruption Logic
                if (synthRef.current?.speaking) {
                    synthRef.current.cancel(); // INTERRUPT AI
                }

                if (event.results[current].isFinal) {
                    handleSend(transcriptText);
                    setTranscript("");
                }
            };
            
            recognitionRef.current.onerror = () => setIsListening(false);
            recognitionRef.current.onend = () => { if (isListening) recognitionRef.current.start(); };
        }

        return () => window.removeEventListener('toggle-intelligence', handleToggle);
    }, [isListening]);

    const handleAction = (action: SequoiaAction) => {
        if (action.type === 'OPEN_APP') {
            const app = dockApps.find(a => a.id === action.payload || a.name.toLowerCase() === action.payload.toLowerCase());
            if (app) system.openWindow(app.id, app.name, <app.icon className="h-4 w-4" />, app.component);
        }
    };

    const speak = (text: string) => {
        if (!synthRef.current) return;
        const utter = new SpeechSynthesisUtterance(text.replace(/[*#]/g, ''));
        utter.rate = 1.1;
        utter.pitch = 0.9;
        synthRef.current.speak(utter);
    };

    const handleSend = async (forcedText?: string) => {
        const text = forcedText || inputValue;
        if (!text.trim() || isStreaming) return;
        
        const userMsg: Message = { id: Date.now().toString(), role: "user", content: text.trim(), timestamp: new Date().toLocaleTimeString() };
        setMessages(prev => [userMsg, ...prev].slice(0, 5));
        setInputValue("");
        setIsStreaming(true);
        setCurrentStatus("SYNTHESIZING_INTENT");

        const aiMsg: Message = { id: (Date.now() + 1).toString(), role: "assistant", content: "", timestamp: "SYNTHESIZING" };
        setMessages(prev => [aiMsg, ...prev]);

        try {
            let fullText = "";
            await askSequoia(text.trim(), (chunk, status, action) => {
                if (status) setCurrentStatus(status);
                if (action) handleAction(action);
                if (chunk) {
                   fullText += chunk;
                   setMessages(prev => prev.map(m => m.id === aiMsg.id ? { ...m, content: fullText } : m));
                }
            });
            speak(fullText);
        } catch (err) {
            setMessages(prev => prev.map(m => m.id === aiMsg.id ? { ...m, content: "Synthesis failure." } : m));
        } finally {
            setIsStreaming(false);
            setCurrentStatus(null);
        }
    };

    const toggleListening = () => {
        if (isListening) {
            recognitionRef.current?.stop();
            setIsListening(false);
        } else {
            recognitionRef.current?.start();
            setIsListening(true);
        }
    };

    if (powerStatus === 'locked' || !user) return null;

    return (
        <div className="fixed inset-x-0 top-10 z-[3000] pointer-events-none flex flex-col items-center select-none font-sans">
            {/* Neural Dynamic Island Architecture */}
            <motion.div 
                layout
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className={cn(
                    "relative pointer-events-auto transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)]",
                    "bg-[#0A0A0B]/80 backdrop-blur-3xl border border-white/10 shadow-5xl overflow-hidden",
                    isOpen ? "w-[600px] rounded-[48px] p-8" : "w-[240px] rounded-full px-6 py-2"
                )}
            >
                {/* Standard Minimal Pill View */}
                {!isOpen ? (
                    <div className="flex items-center justify-between w-full h-full cursor-pointer group" onClick={() => setIsOpen(true)}>
                        <div className="flex items-center gap-3">
                            <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                <BrainCircuit className="h-3.5 w-3.5" />
                            </div>
                            <span className="text-[9px] font-black uppercase text-zinc-500 tracking-widest italic group-hover:text-white transition-colors">Sequoia Pro</span>
                        </div>
                        <div className="flex items-center gap-2">
                             {isListening && <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity }} className="w-1.5 h-1.5 rounded-full bg-amber-500" />}
                             {isStreaming && <Loader2 className="h-3 w-3 animate-spin text-primary" />}
                             <div className="h-3 w-px bg-white/5 mx-1" />
                             <Activity className="h-3 w-3 text-zinc-800" />
                        </div>
                    </div>
                ) : (
                    /* Expanded Dynamic Hub View */
                    <div className="space-y-6">
                        <header className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shadow-2xl">
                                    <BrainCircuit className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-black uppercase italic tracking-tighter text-white">Full-Duplex Node</h3>
                                    <div className="flex items-center gap-2 mt-1">
                                        <div className="h-1 w-1 rounded-full bg-emerald-500 animate-ping" />
                                        <span className="text-[8px] font-black text-zinc-700 uppercase tracking-widest leading-none">Unified Neural Hub</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={toggleListening} className={cn("p-3 rounded-2xl transition-all", isListening ? "bg-amber-500 text-black shadow-xl shadow-amber-500/20" : "bg-white/5 text-zinc-600 hover:text-white border border-white/5")}>
                                    <Waves className={cn("h-4 w-4", isListening && "animate-pulse")} />
                                </button>
                                <button onClick={() => setIsOpen(false)} className="p-3 bg-white/5 border border-white/5 rounded-2xl text-zinc-600 hover:text-white transition-all"><ChevronDown className="h-4 w-4" /></button>
                            </div>
                        </header>

                        {/* Liquid Interaction Portal */}
                        <div className="relative group">
                             <input 
                                value={isListening ? (transcript || "Listening Context...") : inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleSend())}
                                placeholder="Request system orchestration..."
                                className={cn(
                                    "w-full bg-black/60 border rounded-[28px] py-6 pl-16 pr-24 text-sm font-black text-white italic placeholder:text-zinc-800 focus:outline-none transition-all shadow-inner",
                                    isListening ? "border-amber-500/30 ring-4 ring-amber-500/5 shadow-[0_0_40px_rgba(245,158,11,0.1)]" : "border-white/5 focus:border-primary/40 focus:ring-4 focus:ring-primary/5"
                                )}
                             />
                             <div className="absolute left-6 top-1/2 -translate-y-1/2">
                                 <Mic className={cn("h-4 w-4 transition-colors", isListening ? "text-amber-500 animate-pulse" : "text-primary")} />
                             </div>
                             <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-3">
                                 {isStreaming && <div className="text-[8px] font-black text-primary uppercase tracking-widest animate-pulse italic">Thinking</div>}
                                 <button 
                                    onClick={() => handleSend()}
                                    disabled={!inputValue.trim() || isStreaming || isListening}
                                    className={cn(
                                        "w-10 h-10 rounded-2xl flex items-center justify-center transition-all",
                                        inputValue.trim() && !isStreaming ? "bg-primary text-black shadow-2xl shadow-primary/40" : "bg-white/5 text-zinc-800"
                                    )}
                                 >
                                     <Play className="h-4 w-4 fill-current" />
                                 </button>
                             </div>
                        </div>

                        {/* Synthesis Log / Status */}
                        <AnimatePresence>
                            {currentStatus && (
                                <motion.div 
                                    initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                                    className="flex items-center gap-3 px-5 py-3 bg-primary/5 border border-primary/20 rounded-2xl shadow-inner"
                                >
                                    <RotateCcw className="h-3 w-3 text-primary animate-spin-slow" />
                                    <span className="text-[9px] font-black text-primary uppercase tracking-widest italic">{currentStatus.replace(/_/g, ' ')}</span>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Recent Full-Duplex Responses */}
                        <div className="max-h-[300px] overflow-y-auto no-scrollbar space-y-6">
                            {messages.map((msg, i) => (
                                <motion.div 
                                    key={msg.id}
                                    initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                                    className={cn(
                                        "p-6 rounded-[32px] border transition-all relative group",
                                        msg.role === 'user' ? "bg-white/5 border-white/5 ml-12 rounded-tr-[4px]" : "bg-primary/5 border-primary/20 mr-12 rounded-tl-[4px]"
                                    )}
                                >
                                    <div className="flex items-center justify-between mb-3 text-[8px] font-black uppercase tracking-widest text-zinc-700 italic">
                                        <span>{msg.role === 'user' ? 'Local Identity' : 'Sequoia Intelligence'}</span>
                                        <span className="opacity-40">{msg.timestamp}</span>
                                    </div>
                                    <div className="text-[13px] font-bold text-zinc-200 leading-relaxed italic">
                                        <ReactMarkdown>
                                            {msg.content}
                                        </ReactMarkdown>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                )}
            </motion.div>

            {/* Quick Trigger (Always-On anchor) */}
            {!isOpen && (
                <div className="mt-6 flex gap-4 pointer-events-auto">
                    <button onClick={toggleListening} className={cn("w-12 h-12 rounded-2xl flex items-center justify-center transition-all bg-white/10 backdrop-blur-3xl border border-white/10 text-white/40 hover:text-white", isListening && "text-amber-500 border-amber-500/20")}>
                        <Volume2 className={cn("h-5 w-5", isListening && "animate-pulse")} />
                    </button>
                    <button onClick={() => setIsOpen(true)} className="px-6 py-3 bg-primary text-black rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-2xl shadow-primary/40 hover:scale-105 active:scale-95 transition-all">
                        Orchestrate Hub
                    </button>
                </div>
            )}
        </div>
    );
};

export default SequoiaFullDuplex;
