import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Terminal, 
  RefreshCw, 
  FileText, 
  Activity, 
  ArrowRight, 
  Plus, 
  Copy, 
  Zap, 
  Shield, 
  Sparkles, 
  Sliders, 
  Layout, 
  CheckCircle,
  BarChart3,
  BrainCircuit,
  Settings,
  ChevronRight,
  Monitor
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { generateProposalStream } from "@/lib/intelligence";
import { db, logActivity } from "@/lib/firebase";
import { collection, addDoc } from "firebase/firestore";

const Proposals = () => {
  const [jobDescription, setJobDescription] = useState("");
  const [skills, setSkills] = useState("");
  const [hourlyRate, setHourlyRate] = useState("");
  const [proposal, setProposal] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const { user } = useAuth();
  const [activeProvider, setActiveProvider] = useState<string>("");
  
  // AI Feature States
  const [tone, setTone] = useState("Professional");
  const [template, setTemplate] = useState("Standard");
  const [showAIInsights, setShowAIInsights] = useState(false);

  const saveToArchive = async (content: string) => {
    if (!user) {
        toast.error("Please log in to save proposals.");
        return;
    }
    const isMock = !import.meta.env.VITE_FIREBASE_API_KEY;
    if (isMock) {
        toast.success("Proposal saved! (Simulation Mode)");
        return;
    }
    try {
      await addDoc(collection(db, "proposals"), {
        userId: user.uid,
        jobDescription: jobDescription.trim(),
        skills: skills.trim(),
        rate: hourlyRate.trim(),
        content: content,
        activeProvider: activeProvider, 
        tone: tone,
        timestamp: new Date().toISOString()
      });
      if (user) logActivity(user.uid, "ARCHIVE_SAVE", `Saved ${tone} proposal`);
      toast.success("Proposal archived with Intelligence Metadata.");
    } catch (err) {
      console.error("Saving error:", err);
      toast.error("Failed to save proposal.");
    }
  };

  const generateProposal = async () => {
    if (!jobDescription.trim() || !skills.trim()) {
      toast.error("Please provide both a job description and your skills.");
      return;
    }
    setActiveProvider("Initializing Intel Engine...");
    setProposal("");
    setLoading(true);
    setShowAIInsights(false);
    
    try {
      await generateProposalStream(
        jobDescription,
        skills,
        hourlyRate,
        tone,
        template,
        (chunk, providerName) => {
            setProposal((prev) => prev + chunk);
            if (providerName) setActiveProvider(providerName);
        }
      );
      if (user) logActivity(user.uid, "PROPOSAL_GEN", `Generated ${tone} draft`);
      toast.success("Synthesis complete. AI Analysis ready.");
      setShowAIInsights(true);
    } catch (err: any) {
      console.error("AI error:", err);
      toast.error("Process failed. The Intelligence Kernel is currently busy.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(proposal);
    setCopied(true);
    toast.success("Draft copied to buffer.");
    setTimeout(() => setCopied(false), 2000);
  };

  // Simulated AI Insights
  const aiMetrics = useMemo(() => {
    return [
       { label: "Persuasion Factor", value: tone === "Creative" ? "92%" : "84%", icon: BrainCircuit },
       { label: "Clarity Index", value: "98%", icon: Shield },
       { label: "Competency Match", value: "Elite", icon: Zap },
       { label: "Success Probability", value: "High", icon: BarChart3 },
    ];
  }, [tone]);

  return (
    <div className="p-10 h-full overflow-y-auto bg-black/40 backdrop-blur-3xl custom-scrollbar font-sans selection:bg-primary/20">
      <div className="flex flex-col xl:flex-row gap-12 max-w-7xl mx-auto min-h-full">
        
        {/* Intelligence Architect (Sidebar Control) */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="xl:w-[400px] shrink-0 space-y-10"
        >
          <header className="space-y-4">
             <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Sequoia Intelligence Suite</span>
             </div>
             <div>
                <h1 className="text-4xl font-black tracking-tight text-white/90 uppercase leading-none italic">Proposal <br/> Architect</h1>
                <p className="mt-4 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600 leading-relaxed max-w-xs italic">High-fidelity drafting via automated content synthesis.</p>
             </div>
          </header>

          <div className="space-y-10">
            {/* Context Inputs */}
            <div className="space-y-6">
               <div className="space-y-3">
                  <div className="flex items-center gap-2 px-2 text-zinc-500">
                     <Monitor className="h-3.5 w-3.5" />
                     <label className="text-[9px] font-black uppercase tracking-widest leading-none">Job Requirements (VFS Input)</label>
                  </div>
                  <textarea
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    placeholder="Bitmask your requirements here..."
                    className="w-full h-40 border border-white/5 p-6 text-[12px] font-bold focus:outline-none focus:border-primary/20 rounded-3xl bg-white/[0.02] placeholder:text-zinc-800 leading-relaxed resize-none transition-all shadow-inner custom-scrollbar italic"
                  />
               </div>

               <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-3">
                     <label className="text-[9px] font-black uppercase tracking-widest text-zinc-600 px-2 leading-none">Core_Stack</label>
                     <input
                       value={skills}
                       onChange={(e) => setSkills(e.target.value)}
                       placeholder="React, AI, zsh..."
                       className="w-full h-12 border border-white/5 px-6 text-[12px] font-black focus:outline-none focus:border-primary/20 rounded-2xl bg-white/[0.02] placeholder:text-zinc-800 shadow-inner"
                     />
                  </div>
                  <div className="space-y-3">
                     <label className="text-[9px] font-black uppercase tracking-widest text-zinc-600 px-2 leading-none">Allocation_Limit</label>
                     <input
                       value={hourlyRate}
                       onChange={(e) => setHourlyRate(e.target.value)}
                       placeholder="$120/hr"
                       className="w-full h-12 border border-white/5 px-6 text-[12px] font-black focus:outline-none focus:border-primary/20 rounded-2xl bg-white/[0.02] placeholder:text-zinc-800 shadow-inner"
                     />
                  </div>
               </div>
            </div>

            {/* AI Control Overrides */}
            <div className="p-8 rounded-[40px] bg-white/[0.02] border border-white/5 space-y-8 flex flex-col relative overflow-hidden">
               <div className="absolute top-0 right-0 p-4 opacity-10"><BrainCircuit className="h-20 w-20" /></div>
               
               <div className="space-y-4">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Tone Synthesis</h3>
                  <div className="grid grid-cols-2 gap-3 p-1 bg-black/40 rounded-2xl border border-white/5">
                     {["Professional", "Creative"].map(t => (
                        <button 
                           key={t}
                           onClick={() => setTone(t)}
                           className={cn("py-2.5 rounded-xl text-[9px] font-black uppercase tracking-[0.1em] transition-all", tone === t ? "bg-primary text-black shadow-xl" : "text-zinc-600 hover:text-white")}
                        >
                           {t}
                        </button>
                     ))}
                  </div>
               </div>

               <div className="space-y-4">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Output Template</h3>
                  <div className="space-y-2">
                     {["Standard", "Technical", "Executive"].map(tmp => (
                        <button 
                           key={tmp}
                           onClick={() => setTemplate(tmp)}
                           className={cn("w-full flex items-center justify-between px-5 py-3 rounded-2xl border transition-all group", 
                               template === tmp ? "bg-white/5 border-primary/20 text-white" : "border-transparent text-zinc-600 hover:bg-white/5")}
                        >
                           <span className="text-[10px] font-black uppercase tracking-widest">{tmp} Deployment</span>
                           {template === tmp ? <CheckCircle className="h-3.5 w-3.5 text-primary" /> : <ChevronRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100" />}
                        </button>
                     ))}
                  </div>
               </div>
            </div>

            <button
              onClick={generateProposal}
              disabled={loading}
              className={cn(
                "w-full h-16 rounded-3xl font-black uppercase tracking-[0.3em] text-[11px] gap-4 transition-all shadow-2xl relative overflow-hidden group",
                loading ? "bg-zinc-900 border border-white/5" : "bg-primary text-black shadow-primary/20 hover:scale-[1.02] active:scale-95"
              )}
            >
              <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-10 transition-opacity" />
              {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Sparkles className="h-5 w-5" />}
              {loading ? "Synthesizing Draft..." : "Initialize Synthesis"}
            </button>
          </div>
        </motion.div>

        {/* Content Viewport & Intelligence Pane */}
        <div className="flex-1 flex flex-col min-h-full">
          <AnimatePresence mode="wait">
            {proposal ? (
              <motion.div 
                key="proposal"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex-1 flex flex-col lg:flex-row gap-8"
              >
                {/* Result Inspector Sidebar */}
                {showAIInsights && (
                   <motion.div 
                     initial={{ opacity: 0, width: 0 }}
                     animate={{ opacity: 1, width: 280 }}
                     className="shrink-0 flex flex-col gap-6"
                   >
                      <div className="p-8 rounded-[40px] bg-primary/10 border border-primary/20 space-y-8 h-full">
                         <div className="flex items-center gap-3">
                            <BrainCircuit className="h-5 w-5 text-primary" />
                            <h4 className="text-[10px] font-black uppercase tracking-widest">AI Audit Report</h4>
                         </div>
                         <div className="space-y-6">
                            {aiMetrics.map(metric => (
                               <div key={metric.label} className="p-5 rounded-2xl bg-black/20 border border-white/5 space-y-2 group">
                                  <div className="flex items-center gap-2 opacity-40 group-hover:opacity-100 transition-opacity">
                                     <metric.icon className="h-3 w-3" />
                                     <span className="text-[8px] font-black uppercase tracking-widest">{metric.label}</span>
                                  </div>
                                  <div className="text-xl font-black tracking-tight">{metric.value}</div>
                               </div>
                            ))}
                         </div>
                         <div className="pt-6 border-t border-white/5 flex flex-col gap-3">
                            <span className="text-[8px] font-black uppercase tracking-widest text-zinc-600">Active Node Engine</span>
                            <div className="px-4 py-2 rounded-xl bg-black/40 text-[9px] font-black uppercase tracking-widest text-primary truncate border border-white/5">{activeProvider}</div>
                         </div>
                      </div>
                   </motion.div>
                )}

                {/* Synthesis Output Pane */}
                <div className="flex-1 bg-white/[0.02] border border-white/5 rounded-[48px] p-12 flex flex-col relative overflow-hidden group shadow-3xl">
                   <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity"><FileText className="h-64 w-64" /></div>
                   
                   <header className="flex items-center justify-between mb-10 shrink-0">
                      <div className="flex flex-col">
                         <span className="text-[9px] font-black text-primary uppercase tracking-[0.4em] mb-2">Validated Buffer</span>
                         <h3 className="text-2xl font-black text-white/90 italic tracking-tighter uppercase">Proposal_Final_Draft.md</h3>
                      </div>
                      <div className="flex gap-4">
                        <Button onClick={copyToClipboard} variant="outline" size="lg" className="h-12 rounded-2xl border-white/5 bg-white/5 font-black uppercase tracking-widest text-[9px] px-8 hover:bg-white/10 transition-all">{copied ? "Success" : "Copy to VFS"}</Button>
                        <Button onClick={() => saveToArchive(proposal)} className="h-12 rounded-2xl bg-primary text-black font-black uppercase tracking-widest text-[9px] px-8 hover:brightness-110 transition-all shadow-xl shadow-primary/10">Archive Draft</Button>
                      </div>
                   </header>

                   <div className="flex-1 prose prose-invert max-w-none pt-4 overflow-y-auto custom-scrollbar pr-4">
                    <div className="font-medium text-[15px] leading-relaxed whitespace-pre-wrap text-white/70 tracking-tight selection:bg-primary selection:text-black">
                      {proposal}
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center opacity-10 text-center grayscale select-none">
                  <div className="p-20 rounded-full border-4 border-dashed border-white/20">
                    <BrainCircuit className="h-32 w-32 mx-auto mb-10 text-white" />
                  </div>
                  <p className="text-2xl font-black uppercase tracking-[0.4em] italic mt-12">Awaiting Intelligence Initialization</p>
                  <p className="text-[10px] font-black uppercase tracking-widest mt-4 opacity-60">System mapped to Global Node Network via encrypted bridge.</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Proposals;
