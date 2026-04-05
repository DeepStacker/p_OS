import React, { useState, useEffect, useRef, useMemo } from "react";
import { 
  Terminal as TerminalIcon, 
  ChevronRight, 
  Zap, 
  Shield, 
  Cpu, 
  Database, 
  Clock, 
  Search, 
  Trash2, 
  History,
  Maximize2,
  Settings,
  Circle,
  Hash,
  Activity,
  User as UserIcon,
  Globe
} from "lucide-react";
import { useSystem } from "@/contexts/SystemContext";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const Terminal = () => {
    const { addLog, metrics, closeWindow } = useSystem();
    const [history, setHistory] = useState<string[]>([]);
    const [input, setInput] = useState("");
    const [outputs, setOutputs] = useState<{ type: "input" | "output" | "error" | "system", content: string, time?: string }[]>([
        { type: "system", content: "Node OS v2.0-PRO 'Sequoia' Terminal (nsh 4.2)" },
        { type: "system", content: "Authorized session initialized. Security Level: ROOT." },
        { type: "system", content: "Type 'help' for the specialized command registry." },
    ]);
    const [currentTheme, setCurrentTheme] = useState<"sequoia" | "dracula" | "matrix" | "minimal">("sequoia");
    const [showHistory, setShowHistory] = useState(false);
    
    const scrollRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const themes = {
        sequoia: { bg: "bg-[#1C1C1E]/80", text: "text-white/90", border: "border-white/5", accent: "text-amber-500", prompt: "text-amber-500" },
        dracula: { bg: "bg-[#282a36]/90", text: "text-[#f8f8f2]", border: "border-[#44475a]", accent: "text-[#bd93f9]", prompt: "text-[#50fa7b]" },
        matrix: { bg: "bg-black/95", text: "text-[#00FF41]", border: "border-[#00FF41]/20", accent: "text-[#00FF41]", prompt: "text-[#00FF41]" },
        minimal: { bg: "bg-zinc-950/60", text: "text-zinc-100", border: "border-white/5", accent: "text-blue-500", prompt: "text-zinc-500" }
    };

    const theme = themes[currentTheme];

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [outputs]);

    const handleCommand = (cmd: string) => {
        if (!cmd.trim()) return;

        setHistory(prev => [...prev, cmd]);
        setOutputs(prev => [...prev, { type: "input", content: cmd, time: new Date().toLocaleTimeString() }]);

        const parts = cmd.toLowerCase().trim().split(" ");
        const baseCmd = parts[0];

        switch (baseCmd) {
            case "help":
                setOutputs(prev => [...prev, { type: "output", content: "Available Commands: help, clear, theme, top, whoami, exit, neofetch, nsh_update, logs, flush" }]);
                break;
            case "clear":
                setOutputs([]);
                break;
            case "theme":
                if (parts[1] && themes[parts[1] as keyof typeof themes]) {
                    setCurrentTheme(parts[1] as any);
                    setOutputs(prev => [...prev, { type: "system", content: `Visual interface redirected to ${parts[1]} profile.` }]);
                } else {
                    setOutputs(prev => [...prev, { type: "error", content: "Available Themes: sequoia, dracula, matrix, minimal" }]);
                }
                break;
            case "top":
                setOutputs(prev => [...prev, { type: "output", content: `CPU Load: ${metrics.cpu}% | Memory: ${metrics.memory}% | Processes: 14 Active` }]);
                break;
            case "whoami":
                setOutputs(prev => [...prev, { type: "output", content: "node@authorized_instance (Root Developer)" }]);
                break;
            case "exit":
                closeWindow("terminal");
                break;
            case "neofetch":
                setOutputs(prev => [...prev, { type: "output", content: `
   /\\_/\\
  ( o.o )  OS: Node OS Sequoia v2.0-PRO
   > ^ <   Host: Sequoia-Quantum-X1
           Kernel: NSH 4.2.0-STABLE
           Shell: zsh (simulated)
           Resolution: 1920x1080
           DE: Sequoia-Spatial
           WM: Node-WM
           CPU: Quantum Tensor Core
           Memory: 64MB / 128MB
                ` }]);
                break;
            case "nsh_update":
                setOutputs(prev => [...prev, { type: "system", content: "Checking for firmware updates..." }]);
                setTimeout(() => setOutputs(prev => [...prev, { type: "output", content: "NSH is already at the current stable version (4.2.1)." }]), 1500);
                break;
            default:
                setOutputs(prev => [...prev, { type: "error", content: `nsh: command not found: ${baseCmd}. Type 'help' for instructions.` }]);
        }
        setInput("");
    };

    return (
        <div className={cn("h-full flex flex-col backdrop-blur-3xl overflow-hidden font-mono transition-all duration-500", theme.bg, theme.border)}>
            {/* Pro Terminal Header */}
            <header className="h-12 border-b border-white/5 flex items-center justify-between px-6 bg-black/20">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-3">
                        <TerminalIcon className={cn("h-4 w-4", theme.accent)} />
                        <span className={cn("text-[10px] font-black uppercase tracking-[0.2em]", theme.text)}>Node_SH / Root</span>
                    </div>
                    <div className="flex items-center gap-4 text-[9px] font-bold text-zinc-600">
                        <div className="flex items-center gap-2">
                           <Activity className="h-3 w-3" />
                           <span>RT: {metrics.cpu}%</span>
                        </div>
                        <div className="flex items-center gap-2">
                           <Globe className="h-3 w-3" />
                           <span>127.0.0.1</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1 p-1 bg-black/20 rounded-lg border border-white/5">
                        <button onClick={() => setCurrentTheme("sequoia")} className={cn("p-1.5 rounded-md", currentTheme === "sequoia" ? "bg-white/10" : "opacity-40")}><Circle className="h-2.5 w-2.5 fill-amber-500 text-amber-500" /></button>
                        <button onClick={() => setCurrentTheme("dracula")} className={cn("p-1.5 rounded-md", currentTheme === "dracula" ? "bg-white/10" : "opacity-40")}><Circle className="h-2.5 w-2.5 fill-purple-500 text-purple-500" /></button>
                        <button onClick={() => setCurrentTheme("matrix")} className={cn("p-1.5 rounded-md", currentTheme === "matrix" ? "bg-white/10" : "opacity-40")}><Circle className="h-2.5 w-2.5 fill-green-500 text-green-500" /></button>
                    </div>
                    <button onClick={() => setShowHistory(!showHistory)} className={cn("p-2 rounded-xl transition-all", showHistory ? "bg-primary/20 text-primary" : "hover:bg-white/5 text-zinc-600")}>
                        <History className="h-4 w-4" />
                    </button>
                </div>
            </header>

            <div className="flex-1 flex overflow-hidden">
                {/* Main Prompt Area */}
                <main 
                    className="flex-1 p-8 overflow-y-auto no-scrollbar custom-scrollbar"
                    ref={scrollRef}
                    onClick={() => inputRef.current?.focus()}
                >
                    <div className="space-y-3">
                        {outputs.map((out, i) => (
                            <div key={i} className="flex flex-col gap-1">
                                {out.type === "input" ? (
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center">
                                            <span className="bg-primary px-3 py-0.5 text-black text-[9px] font-black rounded-l-[4px]">ROOT</span>
                                            <span className="bg-white/10 px-3 py-0.5 text-white/60 text-[9px] font-black rounded-r-[4px]">~</span>
                                        </div>
                                        <ChevronRight className={cn("h-3 w-3", theme.prompt)} />
                                        <span className={cn("text-[13px] font-medium tracking-tight", theme.text)}>{out.content}</span>
                                    </div>
                                ) : (
                                    <div className="flex flex-col">
                                        <pre className={cn(
                                            "text-[12px] leading-relaxed whitespace-pre-wrap font-medium",
                                            out.type === "error" ? "text-rose-500" : 
                                            out.type === "system" ? "text-primary italic opacity-60" : theme.text
                                        )}>
                                            {out.content}
                                        </pre>
                                        {out.time && <span className="text-[8px] font-bold text-zinc-700 uppercase mt-1 tracking-widest">{out.time}</span>}
                                    </div>
                                )}
                            </div>
                        ))}

                        {/* Interactive Prompt */}
                        <div className="flex items-center gap-3 group pt-2">
                             <div className="flex items-center">
                                <span className="bg-primary px-3 py-0.5 text-black text-[9px] font-black rounded-l-[4px]">ROOT</span>
                                <span className={cn("bg-white/5 px-3 py-0.5 text-[9px] font-black rounded-r-[4px] border-r border-white/5", theme.text)}>~</span>
                            </div>
                            < ChevronRight className={cn("h-3 w-3 transition-transform group-focus-within:translate-x-1", theme.prompt)} />
                            <input 
                                ref={inputRef}
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                onKeyDown={e => e.key === "Enter" && handleCommand(input)}
                                className={cn("flex-1 bg-transparent border-none focus:outline-none text-[13px] font-medium tracking-tight h-6", theme.text)}
                                spellCheck={false}
                                autoFocus
                            />
                        </div>
                    </div>
                </main>

                {/* History Drawer */}
                <AnimatePresence>
                    {showHistory && (
                        <motion.aside
                            initial={{ width: 0, opacity: 0 }}
                            animate={{ width: 280, opacity: 1 }}
                            exit={{ width: 0, opacity: 0 }}
                            className="bg-black/20 border-l border-white/5 flex flex-col overflow-hidden"
                        >
                            <div className="p-6 flex flex-col h-full">
                                <div className="flex items-center gap-2 mb-6">
                                    <History className="h-4 w-4 text-zinc-600" />
                                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-600">Command Buffer</span>
                                </div>
                                <div className="flex-1 space-y-2 overflow-y-auto no-scrollbar">
                                    {history.map((h, i) => (
                                        <button 
                                            key={i} 
                                            onClick={() => handleCommand(h)}
                                            className="w-full text-left p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/5 transition-all group"
                                        >
                                            <span className="text-[10px] font-bold text-zinc-500 group-hover:text-primary transition-colors truncate block">{h}</span>
                                        </button>
                                    ))}
                                    {history.length === 0 && (
                                        <div className="py-20 text-center opacity-10">
                                            <Search className="h-10 w-10 mx-auto mb-4" />
                                            <p className="text-[9px] font-black uppercase tracking-widest">Buffer Empty</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.aside>
                    )}
                </AnimatePresence>
            </div>

            {/* Powerline Footer */}
            <footer className="h-8 border-t border-white/5 flex items-center justify-between px-6 bg-black/40 text-[9px] font-black uppercase tracking-widest">
                <div className="flex items-center h-full">
                    <div className="flex items-center h-full gap-4 text-zinc-600">
                        <div className="flex items-center gap-2">
                            <Hash className="h-3.5 w-3.5 text-primary" />
                            <span>NODE_NSH</span>
                        </div>
                        <div className="h-3 w-px bg-white/5" />
                        <div className="flex items-center gap-2">
                            <Shield className="h-3.5 w-3.5 text-emerald-500" />
                            <span>V-ENCRYPT</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center h-full gap-6 text-zinc-600">
                    <div className="flex items-center gap-2">
                        <Clock className="h-3.5 w-3.5" />
                        <span>UTC: {new Date().toLocaleTimeString()}</span>
                    </div>
                    <div className="flex items-center gap-2 group cursor-pointer hover:text-white transition-colors">
                        <Settings className="h-3.5 w-3.5" />
                        <span>PREFS</span>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Terminal;
