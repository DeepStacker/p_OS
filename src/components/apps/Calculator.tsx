import React, { useState, useEffect, useMemo } from "react";
import { 
  Plus, 
  Minus, 
  X, 
  Divide, 
  RotateCcw, 
  Delete, 
  History, 
  Maximize2, 
  Hash, 
  Percent, 
  Equal,
  ChevronRight,
  MoreHorizontal,
  ChevronLeft
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const Calculator = () => {
    const [display, setDisplay] = useState("0");
    const [equation, setEquation] = useState("");
    const [history, setHistory] = useState<{ eq: string, res: string }[]>([]);
    const [showHistory, setShowHistory] = useState(false);
    const [isScientific, setIsScientific] = useState(false);

    const handleNumber = (n: string) => {
        if (display === "0" || display === "Error") {
            setDisplay(n);
        } else {
            setDisplay(display + n);
        }
    };

    const handleOperator = (op: string) => {
        setEquation(display + " " + op + " ");
        setDisplay("0");
    };

    const calculate = () => {
        try {
            const result = eval(equation + display).toString();
            setHistory(prev => [{ eq: equation + display, res: result }, ...prev].slice(0, 10));
            setDisplay(result);
            setEquation("");
        } catch (e) {
            setDisplay("Error");
        }
    };

    const clear = () => {
        setDisplay("0");
        setEquation("");
    };

    const sciFunctions = ["sin", "cos", "tan", "log", "ln", "π", "e", "√", "x²", "x³"];

    return (
        <div className="h-full flex bg-[#1C1C1E] text-white font-sans overflow-hidden transition-all duration-500">
            {/* History Ribbon (Pro Layout) */}
            <AnimatePresence>
                {showHistory && (
                    <motion.aside 
                        initial={{ width: 0, opacity: 0 }}
                        animate={{ width: 240, opacity: 1 }}
                        exit={{ width: 0, opacity: 0 }}
                        className="bg-black/20 border-r border-white/5 flex flex-col overflow-hidden"
                    >
                        <div className="p-6 flex flex-col h-full">
                            <div className="flex items-center gap-3 mb-8">
                                <History className="h-4 w-4 text-zinc-600" />
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600">Computation Tape</span>
                            </div>
                            <div className="flex-1 space-y-4 overflow-y-auto no-scrollbar">
                                {history.map((h, i) => (
                                    <div key={i} className="space-y-1 p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/5 transition-all">
                                        <div className="text-[9px] font-bold text-zinc-500 text-right">{h.eq} =</div>
                                        <div className="text-sm font-black text-white text-right">{h.res}</div>
                                    </div>
                                ))}
                                {history.length === 0 && (
                                    <div className="py-20 text-center opacity-10">
                                        <Hash className="h-10 w-10 mx-auto mb-4" />
                                        <p className="text-[9px] font-black uppercase tracking-widest">No History</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.aside>
                )}
            </AnimatePresence>

            {/* Main Interactive Interface */}
            <main className="flex-1 flex flex-col p-8 lg:p-10">
                <header className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center border border-orange-500/20 text-orange-500">
                            <Plus className="h-4 w-4" />
                        </div>
                        <div className="flex flex-col">
                           <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 leading-none">Calculator Pro</span>
                           <span className="text-[8px] font-black text-zinc-700 tracking-tighter italic">Sequoia Engineering Suite</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={() => setIsScientific(!isScientific)}
                            className={cn("px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest transition-all", isScientific ? "bg-orange-500 text-black" : "bg-white/5 text-zinc-500 hover:text-white")}
                        >
                            Scientific
                        </button>
                        <button onClick={() => setShowHistory(!showHistory)} className={cn("p-2 rounded-xl transition-all", showHistory ? "bg-white/10 text-white" : "text-zinc-600 hover:text-white")}><History className="h-4 w-4" /></button>
                    </div>
                </header>

                {/* Display Output */}
                <div className="flex flex-col items-end justify-end mb-10 h-32 px-4 group">
                    <div className="text-[11px] font-bold text-zinc-600 tracking-tight transition-all group-hover:text-amber-500 mb-1">{equation || "\u00A0"}</div>
                    <div className="text-6xl font-black text-white tracking-tighter truncate w-full text-right">{display}</div>
                </div>

                {/* Computational Matrix */}
                <div className="flex-1 grid grid-cols-4 gap-3 lg:gap-4">
                    {/* Extra Scientific Row */}
                    <AnimatePresence>
                        {isScientific && (
                            <motion.div 
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="col-span-full grid grid-cols-5 gap-3 mb-4"
                            >
                                {sciFunctions.map(fn => (
                                    <button key={fn} className="py-4 rounded-2xl bg-white/[0.03] border border-white/5 hover:bg-white/10 text-[9px] font-black uppercase text-zinc-500 hover:text-white transition-all shadow-md">{fn}</button>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Standard Keypad */}
                    <button onClick={clear} className="py-6 rounded-3xl bg-zinc-800/40 text-rose-400 font-black text-sm hover:bg-rose-500 hover:text-white transition-all shadow-xl">AC</button>
                    <button onClick={() => setDisplay(display.startsWith("-") ? display.slice(1) : "-" + display)} className="py-6 rounded-3xl bg-zinc-800/40 text-blue-400 font-black text-sm hover:bg-blue-500 hover:text-white transition-all shadow-xl">+/-</button>
                    <button onClick={() => handleOperator("%")} className="py-6 rounded-3xl bg-zinc-800/40 text-emerald-400 font-black text-sm hover:bg-emerald-500 hover:text-white transition-all shadow-xl">%</button>
                    <button onClick={() => handleOperator("/")} className="py-6 rounded-3xl bg-orange-500/10 text-orange-500 font-black text-lg border border-orange-500/20 hover:bg-orange-500 hover:text-white transition-all shadow-2xl flex items-center justify-center"><Divide className="h-5 w-5" /></button>

                    {["7", "8", "9"].map(n => (
                        <button key={n} onClick={() => handleNumber(n)} className="py-6 rounded-3xl bg-white/5 text-white font-black text-lg border border-white/5 hover:bg-white/10 transition-all shadow-xl">{n}</button>
                    ))}
                    <button onClick={() => handleOperator("*")} className="py-6 rounded-3xl bg-orange-500/10 text-orange-500 font-black text-lg border border-orange-500/20 hover:bg-orange-500 hover:text-white transition-all shadow-2xl flex items-center justify-center"><X className="h-5 w-5" /></button>

                    {["4", "5", "6"].map(n => (
                        <button key={n} onClick={() => handleNumber(n)} className="py-6 rounded-3xl bg-white/5 text-white font-black text-lg border border-white/5 hover:bg-white/10 transition-all shadow-xl">{n}</button>
                    ))}
                    <button onClick={() => handleOperator("-")} className="py-6 rounded-3xl bg-orange-500/10 text-orange-500 font-black text-lg border border-orange-500/20 hover:bg-orange-500 hover:text-white transition-all shadow-2xl flex items-center justify-center"><Minus className="h-5 w-5" /></button>

                    {["1", "2", "3"].map(n => (
                        <button key={n} onClick={() => handleNumber(n)} className="py-6 rounded-3xl bg-white/5 text-white font-black text-lg border border-white/5 hover:bg-white/10 transition-all shadow-xl">{n}</button>
                    ))}
                    <button onClick={() => handleOperator("+")} className="py-6 rounded-3xl bg-orange-500/10 text-orange-500 font-black text-lg border border-orange-500/20 hover:bg-orange-500 hover:text-white transition-all shadow-2xl flex items-center justify-center"><Plus className="h-5 w-5" /></button>

                    <button onClick={() => handleNumber("0")} className="col-span-2 py-6 rounded-3xl bg-white/5 text-white font-black text-lg border border-white/5 hover:bg-white/10 transition-all shadow-xl">0</button>
                    <button onClick={() => handleNumber(".")} className="py-6 rounded-3xl bg-white/5 text-white font-black text-lg border border-white/5 hover:bg-white/10 transition-all shadow-xl">.</button>
                    <button onClick={calculate} className="py-6 rounded-3xl bg-orange-500 text-black font-black text-2xl hover:brightness-110 active:scale-95 transition-all shadow-[0_0_40px_rgba(249,115,22,0.3)] flex items-center justify-center"><Equal className="h-6 w-6" /></button>
                </div>
            </main>
        </div>
    );
};

export default Calculator;
