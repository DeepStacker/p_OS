import { useState } from "react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Copy, Check, RefreshCw, Command, Zap, ArrowRight, MessageSquareCode, Plus, Star } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { generateProposalStream } from "@/lib/intelligence";
import { db, logActivity } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp, query, where, getDocs, orderBy, limit } from "firebase/firestore";

const ProposalGenerator = () => {
  const [jobDescription, setJobDescription] = useState("");
  const [skills, setSkills] = useState("");
  const [hourlyRate, setHourlyRate] = useState("");
  const [proposal, setProposal] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const { user } = useAuth();

  const [activeNode, setActiveNode] = useState<string>("");

  const saveToVault = async (content: string) => {
    if (!user) {
        toast.error("Identity protocol failure: Access Denied.");
        return;
    }
    try {
      await addDoc(collection(db, "proposals"), {
        userId: user.uid,
        jobDescription: jobDescription.trim(),
        skills: skills.trim(),
        rate: hourlyRate.trim(),
        content: content,
        activeNode: activeNode, // Store which node generated it
        createdAt: serverTimestamp()
      });
      if (user) logActivity(user.uid, "VAULT_SAVE", `Saved proposal for ${skills}`);
      toast.success("Saved to your personal industrial vault!");
    } catch (err) {
      console.error("Vault saving error:", err);
      toast.error("Vault link broken. Identity data cached locally.");
    }
  };

  const generateProposal = async () => {
    if (!jobDescription.trim() || !skills.trim()) {
      toast.error("Intelligence Input Required: Parameter mismatch.");
      return;
    }

    setLoading(true);
    setProposal("");
    setActiveNode("Initializing...");

    try {
      await generateProposalStream(
        jobDescription,
        skills,
        hourlyRate,
        (chunk, providerName) => {
            setProposal((prev) => prev + chunk);
            if (providerName) setActiveNode(providerName);
        }
      );
      if (user) logActivity(user.uid, "PROPOSAL_GEN", `Generated proposal for ${skills}`);
      toast.success("Intelligence Sequence Optimized.");
    } catch (err: any) {
      console.error("AI error:", err);
      toast.error("Intelligence Node Offline. Verify industrial keys.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(proposal);
    setCopied(true);
    toast.success("Industrial Intelligence copied to buffer.");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background selection:bg-primary/30 font-sans mesh-bg">
      <Navbar />
      
      <main className="container mx-auto px-6 pt-40 pb-20">
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-16">
          {/* Input Section */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex-1 space-y-12"
          >
            <div>
              <Badge className="mb-4 bg-primary/10 text-primary border-primary/20 px-4 py-1.5 rounded-full uppercase font-black text-[10px] tracking-widest shadow-lg shadow-primary/5">Intelligence Module</Badge>
              <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase leading-none mb-6">
                Architect <br />
                <span className="text-gradient">Premium</span> Proposals.
              </h1>
              <p className="text-muted-foreground font-medium text-lg leading-relaxed max-w-md">
                Convert generic job signals into high-ticket industrial narratives using deep-link AI intelligence.
              </p>
            </div>

            <div className="space-y-10">
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                   <div className="p-1.5 rounded-lg bg-white/5 border border-white/10">
                      <MessageSquareCode className="h-4 w-4 text-primary" />
                   </div>
                   <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Market Signal (Job Description)</label>
                </div>
                <textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste the raw industrial signal here..."
                  className="w-full h-48 glass-card border-white/5 p-8 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-primary/40 rounded-[2.5rem] bg-white/[0.02] placeholder:text-muted-foreground/20 leading-relaxed resize-none shadow-2xl transition-all"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                     <div className="p-1.5 rounded-lg bg-white/5 border border-white/10">
                        <Zap className="h-4 w-4 text-emerald-400" />
                     </div>
                     <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Operator Capability (Skills)</label>
                  </div>
                  <input
                    value={skills}
                    onChange={(e) => setSkills(e.target.value)}
                    placeholder="React, TypeScript, UI/UX..."
                    className="w-full h-16 glass-card border-white/5 px-8 text-sm font-bold focus:outline-none focus:ring-1 focus:ring-primary/40 rounded-3xl bg-white/[0.02] placeholder:text-muted-foreground/20 shadow-xl"
                  />
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                     <div className="p-1.5 rounded-lg bg-white/5 border border-white/10">
                        <Zap className="h-4 w-4 text-blue-400" />
                     </div>
                     <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Logistics Rate (Hourly)</label>
                  </div>
                  <input
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(e.target.value)}
                    placeholder="$50-80/hr..."
                    className="w-full h-16 glass-card border-white/5 px-8 text-sm font-bold focus:outline-none focus:ring-1 focus:ring-primary/40 rounded-3xl bg-white/[0.02] placeholder:text-muted-foreground/20 shadow-xl"
                  />
                </div>
              </div>

              <Button
                size="lg"
                onClick={generateProposal}
                disabled={loading}
                className={cn(
                  "w-full h-20 rounded-[2.5rem] font-black uppercase tracking-[0.25em] text-[11px] gap-4 transition-all shadow-2xl relative overflow-hidden group active:scale-[0.98]",
                  loading ? "bg-white/5 text-muted-foreground pointer-events-none" : "bg-primary hover:bg-primary/90 text-primary-foreground shadow-primary/20"
                )}
              >
                {loading ? <RefreshCw className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5" />}
                {loading ? "Optimizing Intelligence..." : "Initialize Architectural Sequence"}
                <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
              </Button>
            </div>
          </motion.div>

          {/* Output Section */}
          <AnimatePresence mode="wait">
            {proposal ? (
              <motion.div 
                key="proposal"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 30 }}
                className="flex-1"
              >
                <div className="glass-card border-primary/20 rounded-[3rem] p-12 h-full flex flex-col shadow-[0_0_80px_-20px_rgba(16,185,129,0.15)] relative overflow-hidden bg-primary/[0.01]">
                  <div className="absolute top-0 right-0 p-8 flex gap-3">
                     <button
                        onClick={copyToClipboard}
                        className="p-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-primary/40 transition-all group"
                      >
                        {copied ? <Check className="h-5 w-5 text-primary" /> : <Copy className="h-5 w-5 text-muted-foreground group-hover:text-primary" />}
                      </button>
                      <button
                        onClick={() => saveToVault(proposal)}
                        className="p-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-primary/40 transition-all group"
                      >
                        <Star className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
                      </button>
                  </div>

                  <div className="flex-1 prose prose-invert prose-emerald max-w-none pt-12">
                    <div className="font-medium text-lg leading-relaxed whitespace-pre-wrap text-foreground/90 font-mono tracking-tight">
                      {proposal}
                    </div>
                  </div>

                  <div className="mt-12 pt-12 border-t border-white/5 flex items-center justify-between">
                     <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-emerald-400/10">
                           <Zap className="h-4 w-4 text-emerald-400" />
                        </div>
                        <div>
                           <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Node: {activeNode || "Synchronized"}</span>
                           <p className="text-[9px] font-bold text-muted-foreground/40 leading-none">Intelligence Verified</p>
                        </div>
                     </div>
                     <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">Ready for Deployment</p>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex-1 hidden lg:flex items-center justify-center"
              >
                 <div className="text-center space-y-8">
                    <div className="w-32 h-32 rounded-[3.5rem] bg-white/5 flex items-center justify-center mx-auto mb-10 relative">
                        <div className="absolute inset-0 bg-primary/20 blur-3xl opacity-50 rounded-full animate-pulse" />
                        <Sparkles className="h-12 w-12 text-primary/30 relative z-10" />
                    </div>
                    <div className="space-y-4">
                        <h3 className="text-2xl font-black uppercase tracking-tighter text-muted-foreground/40">Archive Standby</h3>
                        <p className="text-sm font-medium text-muted-foreground/30 max-w-[240px] mx-auto leading-relaxed uppercase tracking-widest">
                           Architectural nodes are waiting for operator synchronization.
                        </p>
                    </div>
                 </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

export default ProposalGenerator;
