import { useState } from "react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Terminal, RefreshCw, FileText, Activity, ArrowRight, Plus, Copy } from "lucide-react";
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
        timestamp: new Date().toISOString()
      });
      if (user) logActivity(user.uid, "ARCHIVE_SAVE", `Saved proposal for ${skills}`);
      toast.success("Proposal saved to your archive!");
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
    setActiveProvider("Generating...");
    setProposal("");
    setLoading(true);
    try {
      await generateProposalStream(
        jobDescription,
        skills,
        hourlyRate,
        (chunk, providerName) => {
            setProposal((prev) => prev + chunk);
            if (providerName) setActiveProvider(providerName);
        }
      );
      if (user) logActivity(user.uid, "PROPOSAL_GEN", `Generated proposal for ${skills}`);
      toast.success("Proposal generated successfully.");
    } catch (err: any) {
      console.error("AI error:", err);
      toast.error("Failed to generate proposal.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(proposal);
    setCopied(true);
    toast.success("Proposal copied to clipboard.");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-10 h-full overflow-y-auto bg-black/20 custom-scrollbar">
      <div className="flex flex-col lg:flex-row gap-12 max-w-7xl mx-auto">
        {/* Input Section */}
        <motion.div 
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex-1 space-y-6"
        >
          <div>
            <h1 className="text-2xl font-bold tracking-tight uppercase mb-2">
              Drafting <span className="text-primary opacity-60">System</span>
            </h1>
            <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest opacity-60 leading-relaxed max-w-sm">
              Generate professional responses based on job requirements.
            </p>
          </div>

          <div className="space-y-8">
            <div className="space-y-3">
              <label className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground opacity-60">Original Requirement</label>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Insert job details..."
                className="w-full h-40 border border-white/10 p-5 text-[12px] font-medium focus:outline-none focus:ring-1 focus:ring-primary rounded-lg bg-white/5 placeholder:text-muted-foreground/30 leading-relaxed resize-none transition-all shadow-inner"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground opacity-60">Competencies</label>
                <input
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  placeholder="Keywords..."
                  className="w-full h-10 border border-white/10 px-5 text-[12px] font-bold focus:outline-none focus:ring-1 focus:ring-primary rounded-lg bg-white/5 placeholder:text-muted-foreground/30 shadow-inner"
                />
              </div>
              <div className="space-y-3">
                <label className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground opacity-60">Parameters</label>
                <input
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(e.target.value)}
                  placeholder="Rate..."
                  className="w-full h-10 border border-white/10 px-5 text-[12px] font-bold focus:outline-none focus:ring-1 focus:ring-primary rounded-lg bg-white/5 placeholder:text-muted-foreground/30 shadow-inner"
                />
              </div>
            </div>

            <Button
              size="lg"
              onClick={generateProposal}
              disabled={loading}
              className={cn(
                "w-full h-12 rounded-xl font-bold uppercase tracking-widest text-[9px] gap-3 transition-all shadow-lg",
                loading ? "bg-muted text-muted-foreground" : "bg-primary text-primary-foreground"
              )}
            >
              {loading ? <RefreshCw className="h-3 w-3 animate-spin" /> : <Terminal className="h-3.5 w-3.5" />}
              {loading ? "Drafting..." : "Process Draft"}
            </Button>
          </div>
        </motion.div>

        {/* Output Section */}
        <div className="flex-1">
          <AnimatePresence mode="wait">
            {proposal ? (
              <motion.div 
                key="proposal"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="h-full flex flex-col"
              >
                <div className="bg-white/5 border border-white/10 rounded-xl p-8 h-full flex flex-col relative mac-shadow-lg shadow-inner">
                  <div className="flex-1 prose max-w-none pt-4 overflow-y-auto max-h-[300px]">
                    <div className="font-medium text-[13px] leading-relaxed whitespace-pre-wrap text-foreground tracking-tight">
                      {proposal}
                    </div>
                  </div>
                  <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
                     <div className="flex gap-2">
                       <Button onClick={copyToClipboard} variant="outline" size="sm" className="h-8 rounded-md border-white/10 bg-white/5 text-[9px] font-bold uppercase tracking-widest">{copied ? "Success" : "Copy"}</Button>
                       <Button onClick={() => saveToArchive(proposal)} variant="outline" size="sm" className="h-8 rounded-md border-white/10 bg-white/5 text-[9px] font-bold uppercase tracking-widest">Save</Button>
                     </div>
                     <p className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground opacity-40">Final Output</p>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="h-full flex items-center justify-center opacity-20 filter grayscale">
                  <div className="text-center">
                    <FileText className="h-12 w-12 mx-auto mb-4" />
                    <p className="text-[10px] font-bold uppercase tracking-widest">Awaiting system input</p>
                  </div>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Proposals;
