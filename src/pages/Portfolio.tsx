import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Folder, 
  ExternalLink, 
  Bookmark, 
  Loader2, 
  Github, 
  Terminal, 
  Sparkles, 
  BrainCircuit, 
  Zap, 
  Activity, 
  ChevronRight, 
  Code2, 
  ShieldCheck, 
  Cpu,
  Search,
  Star,
  GitFork,
  BarChart3,
  Info
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { analyzeRepo } from "@/lib/intelligence";
import { db, logActivity } from "@/lib/firebase";
import { collection, addDoc, query, where, getDocs, deleteDoc, doc, serverTimestamp, onSnapshot } from "firebase/firestore";

interface Repo {
  id: number;
  name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
  topics: string[];
  // AI Augmented fields
  aiSentiment?: string;
  aiImpact?: string;
  aiStack?: string[];
}

const langColors: Record<string, string> = {
  TypeScript: "bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]",
  JavaScript: "bg-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.5)]",
  Python: "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]",
  Rust: "bg-orange-600 shadow-[0_0_10px_rgba(234,88,12,0.5)]",
  Go: "bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.5)]",
};

const Portfolio = () => {
  const [username, setUsername] = useState("");
  const [repos, setRepos] = useState<Repo[]>([]);
  const [loading, setLoading] = useState(false);
  const [watchlist, setWatchlist] = useState<Set<string>>(new Set());
  const { user } = useAuth();
  
  const [selectedRepo, setSelectedRepo] = useState<Repo | null>(null);
  const [showInspector, setShowInspector] = useState(false);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "watchlist"), where("userId", "==", user.uid));
    const unsub = onSnapshot(q, (snap) => {
      const ids = new Set(snap.docs.map(doc => doc.data().jobId));
      setWatchlist(ids);
    });
    return () => unsub();
  }, [user]);

  const fetchRepos = async () => {
    if (!username.trim()) {
      toast.error("Initialize system identity for GitHub traversal.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`https://api.github.com/users/${username.trim()}/repos?sort=updated&per_page=30`);
      if (!res.ok) throw new Error("identity_not_found");
      const data: Repo[] = await res.json();
      
      // Perform AI Pre-analysis on the top 6 repos
      const enriched = await Promise.all(data.slice(0, 12).map(async (r) => {
          try {
             const analysis = await analyzeRepo(r.name, r.description || "System implementation logic.");
             return { ...r, aiSentiment: analysis.sentiment, aiImpact: analysis.impact, aiStack: analysis.stack };
          } catch (e) {
             return { ...r, aiSentiment: "Modern", aiImpact: "High-performance architecture.", aiStack: [r.language || "Polymorphic"] };
          }
      }));

      setRepos(enriched.filter((r) => !r.name.includes(".github")));
      toast.success(`Traversal complete: ${enriched.length} volumes mapped.`);
    } catch {
      toast.error("Network failure during identity traversal.");
    }
    setLoading(false);
  };

  const toggleWatchlist = async (e: React.MouseEvent, repo: Repo) => {
    e.stopPropagation();
    if (!user) {
        toast.error("Unauthorized interaction.");
        return;
    }
    try {
      if (watchlist.has(String(repo.id))) {
        const q = query(collection(db, "watchlist"), where("userId", "==", user.uid), where("jobId", "==", String(repo.id)));
        const snap = await getDocs(q);
        snap.forEach(async (d) => await deleteDoc(doc(db, "watchlist", d.id)));
      } else {
        await addDoc(collection(db, "watchlist"), {
          userId: user.uid,
          jobId: String(repo.id),
          title: repo.name,
          company: "GitHub_Source",
          location: repo.language || "Polymorphic",
          url: repo.html_url,
          addedAt: serverTimestamp(),
          type: "REPO"
        });
        if (user) logActivity(user.uid, "REPO_PIN", `Pinned ${repo.name}`);
      }
    } catch (err) {
      toast.error("Persistence failed.");
    }
  };

  return (
    <div className="p-10 h-full overflow-y-auto custom-scrollbar bg-black/40 backdrop-blur-3xl font-sans selection:bg-primary/20">
      <div className="max-w-7xl mx-auto space-y-12 min-h-full">
        
        {/* Intelligence Portfolio Header */}
        <div className="flex flex-col lg:flex-row items-end justify-between gap-8 pb-8 border-b border-white/5">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4 text-left">
             <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                <BrainCircuit className="h-3.5 w-3.5 text-emerald-500" />
                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em]">Source Code Intelligence</span>
             </div>
             <h1 className="text-4xl font-black tracking-tight text-white/90 uppercase leading-none italic">Repository <br/> Architect</h1>
             <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600 italic">Automated sentiment mapping and tech-stack synthesis from GitHub Metadata.</p>
          </motion.div>
          
          <Button variant="outline" onClick={() => setShowInspector(!showInspector)} className={cn("h-10 rounded-2xl border-white/5 bg-white/5 font-black uppercase tracking-widest text-[9px] gap-3 px-6 hover:bg-white/10 transition-all", showInspector && "bg-primary/10 text-primary border-primary/20")}>
             <Info className="h-4 w-4" /> AI Inspector
          </Button>
        </div>

        {/* Global Identity Traversal Bar */}
        <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="p-1 rounded-[32px] border border-white/5 bg-white/[0.02] shadow-inner max-w-2xl mx-auto relative group">
          <div className="absolute inset-0 bg-emerald-500/5 blur-3xl opacity-0 group-focus-within:opacity-100 transition-opacity" />
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-2">
            <div className="flex-1 flex items-center px-6 gap-4 py-1">
              <Github className="h-5 w-5 text-emerald-500 shrink-0 opacity-60" />
              <input value={username} onChange={(e) => setUsername(e.target.value)} onKeyDown={(e) => e.key === "Enter" && fetchRepos()} placeholder="Traverse GitHub identity..." className="w-full bg-transparent border-none py-4 text-[13px] font-black focus:outline-none placeholder:text-zinc-800 text-white italic" />
            </div>
            <button onClick={fetchRepos} disabled={loading} className={cn(
               "px-10 h-14 rounded-2xl font-black uppercase tracking-widest text-[10px] gap-3 flex items-center justify-center transition-all shadow-2xl",
               loading ? "bg-zinc-900 text-zinc-600" : "bg-white/5 border border-white/10 text-white hover:bg-white/10 active:scale-95"
            )}>
               {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Terminal className="h-4 w-4 text-emerald-500" />}
               {loading ? "Searching..." : "Pulse Profile"}
            </button>
          </div>
        </motion.div>

        {/* Unified Matrix Viewport */}
        <div className="flex flex-col lg:flex-row gap-8">
           {/* Primary Repository Matrix */}
           <div className="flex-1">
              <AnimatePresence mode="wait">
                {repos.length > 0 ? (
                  <motion.div layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
                    {repos.map((repo, i) => (
                      <motion.div key={repo.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} onClick={() => setSelectedRepo(repo)} className="group">
                        <Card className={cn(
                           "p-10 rounded-[48px] border bg-white/[0.02] hover:bg-white/[0.04] transition-all shadow-3xl relative overflow-hidden flex flex-col h-full cursor-default select-none group",
                           selectedRepo?.id === repo.id ? "border-emerald-500/40 ring-1 ring-emerald-500/20" : "border-white/5"
                        )}>
                          {/* AI Intelligence Decal */}
                          <div className="absolute top-0 right-0 p-10 opacity-[0.02] group-hover:opacity-10 transition-opacity"><Zap className="h-48 w-48 text-emerald-500" /></div>
                          
                          <div className="flex justify-between items-start mb-8 relative z-10">
                              <div className="w-12 h-12 rounded-3xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shadow-xl"><Folder className="h-5 w-5 text-emerald-500" /></div>
                              <div className="flex items-center gap-2">
                                 {/* AI Sentiment Badge */}
                                 <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[8px] font-black uppercase tracking-widest">{repo.aiSentiment || "Inert"}</div>
                                 <button onClick={(e) => toggleWatchlist(e, repo)} className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 transition-all border border-white/5"><Bookmark className={cn("h-4 w-4", watchlist.has(String(repo.id)) ? "text-emerald-500 fill-emerald-500" : "text-zinc-600")} /></button>
                              </div>
                          </div>
                          
                          <div className="space-y-4 mb-4 relative z-10">
                            <h3 className="text-xl font-black tracking-tighter text-white/90 uppercase leading-none group-hover:text-emerald-500 transition-colors truncate">{repo.name}</h3>
                            <div className="flex items-center gap-3">
                              {repo.language && (
                                <div className="flex items-center gap-2 px-3 py-1 bg-black/40 rounded-full border border-white/5">
                                   <div className={cn("w-1.5 h-1.5 rounded-full", langColors[repo.language] || "bg-zinc-500")} />
                                   <span className="text-[8px] font-black uppercase text-zinc-500 tracking-widest">{repo.language}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          <p className="text-[12px] text-zinc-500 font-bold line-clamp-2 mb-8 leading-relaxed italic relative z-10">
                              {repo.description || "Core repository architecture managing high-fidelity system procedures."}
                          </p>

                          <div className="mt-auto flex items-center justify-between pt-6 border-t border-white/5 relative z-10">
                              <a href={repo.html_url} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} className="flex items-center gap-2 text-[8px] font-black uppercase tracking-widest text-emerald-500 hover:brightness-125 transition-all">Inspect Source <ExternalLink className="h-3 w-3" /></a>
                              <div className="flex gap-4">
                                 <div className="flex items-center gap-2 group/stat">
                                    <Star className="h-3.5 w-3.5 text-zinc-600 group-hover/stat:text-amber-500 transition-colors" />
                                    <span className="text-[12px] font-black text-white/60 tabular-nums">{repo.stargazers_count}</span>
                                 </div>
                                 <div className="flex items-center gap-2 group/stat">
                                    <GitFork className="h-3.5 w-3.5 text-zinc-600 group-hover/stat:text-blue-500 transition-colors" />
                                    <span className="text-[12px] font-black text-white/60 tabular-nums">{repo.forks_count}</span>
                                 </div>
                              </div>
                          </div>
                        </Card>
                      </motion.div>
                    ))}
                  </motion.div>
                ) : (
                  <div className="py-48 text-center flex flex-col items-center justify-center opacity-10 filter grayscale select-none">
                     <Github className="h-32 w-32 mb-10 text-white" />
                     <h3 className="text-3xl font-black uppercase tracking-[0.6em] italic">Identity Lockdown</h3>
                     <p className="text-[10px] font-black uppercase tracking-widest mt-6 opacity-60">System awaiting authorization to traverse global repository indices.</p>
                  </div>
                )}
              </AnimatePresence>
           </div>

           {/* AI Inspector Sidebar */}
           <AnimatePresence>
              {showInspector && (
                 <motion.aside 
                   initial={{ width: 0, opacity: 0 }}
                   animate={{ width: 340, opacity: 1 }}
                   exit={{ width: 0, opacity: 0 }}
                   className="shrink-0 bg-white/[0.02] border border-white/5 rounded-[48px] overflow-hidden flex flex-col h-fit sticky top-0"
                 >
                    {selectedRepo ? (
                      <div className="p-10 space-y-10">
                         <div className="space-y-4">
                            <div className="flex items-center gap-3">
                               <Sparkles className="h-5 w-5 text-emerald-500" />
                               <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Live Synthesis Report</span>
                            </div>
                            <h2 className="text-3xl font-black text-white tracking-tighter uppercase leading-none">{selectedRepo.name}</h2>
                            <div className="flex flex-wrap gap-2 pt-2">
                               {selectedRepo.aiStack?.map(s => (
                                  <span key={s} className="px-3 py-1 bg-black/40 rounded-xl border border-white/5 text-[8px] font-black text-zinc-500 uppercase tracking-widest">{s}</span>
                               ))}
                            </div>
                         </div>

                         <div className="space-y-6">
                            <div className="p-6 rounded-3xl bg-emerald-500/5 border border-emerald-500/10 space-y-3">
                               <div className="flex items-center gap-2">
                                  <BarChart3 className="h-4 w-4 text-emerald-500 opacity-60" />
                                  <span className="text-[9px] font-black uppercase tracking-widest text-emerald-500/60">Impact Analysis</span>
                               </div>
                               <p className="text-sm font-bold text-emerald-500/80 leading-relaxed italic">
                                  "{selectedRepo.aiImpact}"
                                </p>
                            </div>

                            <div className="space-y-4">
                               {[
                                  { label: "Deployment Sentiment", value: selectedRepo.aiSentiment || "Inert", icon: ShieldCheck },
                                  { label: "Code Volatility", value: "Low", icon: Activity },
                                  { label: "Infrastructure Type", value: selectedRepo.language || "Polymorphic", icon: Cpu }
                               ].map(stat => (
                                  <div key={stat.label} className="flex items-center justify-between p-5 rounded-2xl bg-black/20 border border-white/5 group">
                                     <div className="flex items-center gap-3 opacity-40 group-hover:opacity-100 transition-opacity">
                                        <stat.icon className="h-4 w-4" />
                                        <span className="text-[9px] font-black uppercase tracking-widest">{stat.label}</span>
                                     </div>
                                     <span className="text-[12px] font-black text-white/80 uppercase italic">{stat.value}</span>
                                  </div>
                               ))}
                            </div>
                         </div>

                         <Button asChild className="w-full h-14 rounded-[32px] bg-emerald-500 text-black font-black uppercase tracking-widest text-[10px] gap-3 shadow-xl shadow-emerald-500/10 hover:brightness-110 active:scale-95 transition-all"><a href={selectedRepo.html_url} target="_blank" rel="noopener noreferrer">Request Read-Access</a></Button>
                      </div>
                    ) : (
                      <div className="p-20 text-center flex flex-col items-center justify-center grayscale opacity-10">
                         <BarChart3 className="h-16 w-16 mb-8" />
                         <span className="text-[10px] font-black uppercase tracking-[0.4em]">Audit Inactive</span>
                      </div>
                    )}
                 </motion.aside>
              )}
           </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Portfolio;
