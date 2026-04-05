import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sparkles, 
  BrainCircuit, 
  X, 
  Check, 
  Copy, 
  RotateCcw,
  Zap,
  AlignLeft,
  Briefcase,
  Maximize2,
  Minimize2,
  ChevronRight,
  Fingerprint
} from "lucide-react";
import { cn } from "@/lib/utils";
import { synthesizeNote } from "@/lib/intelligence";

interface NeuralRefinePaneProps {
  isOpen: boolean;
  onClose: () => void;
  content: string;
  onApply: (refinedContent: string) => void;
}

const NeuralRefinePane: React.FC<NeuralRefinePaneProps> = ({ 
  isOpen, 
  onClose, 
  content, 
  onApply 
}) => {
  const [refinedText, setRefinedText] = useState("");
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<string | null>(null);
  const [activeAction, setActiveAction] = useState<string | null>(null);

  const actions = [
    { id: "Summarize", label: "Executive Summary", icon: AlignLeft, color: "text-blue-400" },
    { id: "Refine", label: "Neural Refactor", icon: Zap, color: "text-amber-400" },
    { id: "Expand", label: "Professional Expansion", icon: Maximize2, color: "text-emerald-400" },
    { id: "Professionalize", label: "Business Manifesto", icon: Briefcase, color: "text-purple-400" }
  ];

  const handleAction = async (actionId: any) => {
    setActiveAction(actionId);
    setIsSynthesizing(true);
    setRefinedText("");
    
    try {
      await synthesizeNote(content, actionId, (chunk, status) => {
        if (status) setCurrentStatus(status);
        if (chunk) setRefinedText(prev => prev + chunk);
      });
    } catch (err) {
      setRefinedText("Synthesis interrupted. Neural kernel busy.");
    } finally {
      setIsSynthesizing(false);
      setCurrentStatus(null);
    }
  };

  if (!isOpen) return null;

  return (
    <motion.aside
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ type: "spring", damping: 30, stiffness: 300 }}
      className="absolute top-0 right-0 h-full w-[400px] bg-[#1C1C1E]/80 backdrop-blur-3xl border-l border-white/5 z-50 flex flex-col shadow-5xl shadow-black"
    >
      {/* Decorative Neural background */}
      <div className="absolute inset-0 pointer-events-none opacity-20 overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 blur-[100px] rounded-full animate-pulse" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 blur-[100px] rounded-full animate-pulse delay-500" />
      </div>

      <header className="px-8 pt-12 pb-6 border-b border-white/5 relative z-10">
        <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/20 flex items-center justify-center text-amber-500 shadow-xl">
                    <BrainCircuit className="h-5 w-5" />
                </div>
                <div>
                    <h3 className="text-sm font-black text-white italic uppercase tracking-tighter">Neural Refine</h3>
                    <div className="flex items-center gap-1.5 mt-0.5">
                        <div className="w-1 h-1 rounded-full bg-amber-500 animate-pulse" />
                        <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest leading-none">Sequoia Prime Core</span>
                    </div>
                </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-xl transition-all text-zinc-600 hover:text-white">
                <X className="h-4 w-4" />
            </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto no-scrollbar px-8 py-8 space-y-8 relative z-10">
        {/* Source Context Snippet */}
        <div className="space-y-3">
            <h4 className="text-[9px] font-black text-zinc-600 uppercase tracking-widest px-1">Source Context</h4>
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 text-[11px] text-zinc-500 italic line-clamp-3 leading-relaxed">
                {content || "Initialize workspace buffers..."}
            </div>
        </div>

        {/* Neural Actions Grid */}
        <div className="grid grid-cols-2 gap-3">
            {actions.map((act) => (
                <button
                    key={act.id}
                    onClick={() => handleAction(act.id)}
                    disabled={isSynthesizing || !content}
                    className={cn(
                        "p-4 rounded-2xl border text-left transition-all relative group overflow-hidden",
                        activeAction === act.id 
                            ? "bg-amber-500/10 border-amber-500/20 shadow-lg" 
                            : "bg-white/[0.02] border-white/5 hover:bg-white/5"
                    )}
                >
                    <act.icon className={cn("h-4 w-4 mb-3", act.color)} />
                    <div className="text-[10px] font-black text-white uppercase tracking-tighter mb-1">{act.label}</div>
                    <div className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest">Synthesis Engine</div>
                    {activeAction === act.id && isSynthesizing && (
                        <motion.div layoutId="neural-select" className="absolute inset-0 bg-amber-500/5 animate-pulse" />
                    )}
                </button>
            ))}
        </div>

        {/* Synthesis Result Area */}
        <div className="flex-1 min-h-[200px] flex flex-col space-y-4">
            <div className="flex items-center justify-between px-1">
                <h4 className="text-[9px] font-black text-zinc-600 uppercase tracking-widest italic">Neural Stream Output</h4>
                {currentStatus && (
                    <div className="flex items-center gap-2">
                        <RotateCcw className="h-2.5 w-2.5 text-amber-500 animate-spin-slow" />
                        <span className="text-[8px] font-black text-amber-500 uppercase tracking-widest animate-pulse">{currentStatus}</span>
                    </div>
                )}
            </div>
            
            <div className={cn(
                "flex-1 p-6 rounded-3xl border transition-all relative min-h-[300px]",
                isSynthesizing ? "bg-amber-500/5 border-amber-500/20 shadow-2xl" : "bg-black/40 border-white/5"
            )}>
                {refinedText ? (
                    <div className="text-[13px] font-medium leading-relaxed text-zinc-300 whitespace-pre-wrap selection:bg-amber-500/30">
                        {refinedText}
                    </div>
                ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center opacity-10 text-center p-12">
                        <Fingerprint className="h-12 w-12 mb-4 animate-pulse text-amber-500" />
                        <p className="text-[9px] font-black uppercase tracking-[0.4em]">Awaiting Intent Synthesis</p>
                    </div>
                )}
            </div>
        </div>
      </div>

      <footer className="p-8 border-t border-white/5 relative z-10 bg-black/20">
        <button
            onClick={() => onApply(refinedText)}
            disabled={!refinedText || isSynthesizing}
            className={cn(
                "w-full py-4 rounded-2xl flex items-center justify-center gap-3 text-[11px] font-black uppercase tracking-widest transition-all",
                refinedText && !isSynthesizing
                    ? "bg-amber-500 text-black shadow-2xl shadow-amber-500/30 hover:brightness-110 active:scale-95"
                    : "bg-white/5 text-zinc-700 cursor-not-allowed"
            )}
        >
            <Check className="h-4 w-4" /> Synthesize Into Buffer
        </button>
      </footer>
    </motion.aside>
  );
};

export default NeuralRefinePane;
