import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  MapPin, 
  Briefcase, 
  RefreshCw, 
  Send, 
  LayoutGrid, 
  List, 
  Bookmark, 
  ChevronDown, 
  Sparkles, 
  BrainCircuit, 
  Zap, 
  ShieldCheck, 
  TrendingUp,
  Filter,
  Activity, 
  User as UserIcon, 
  HardDrive, 
  ChevronRight 
} from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { searchJobs, analyzeJobMatch, JobResult } from "@/lib/intelligence";
import { db, logActivity } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp, query, where, getDocs } from "firebase/firestore";
import { useAuth } from "@/contexts/AuthContext";
import { useSystem } from "@/contexts/SystemContext";

const Jobs = () => {
  const { activeWindows, openWindow } = useSystem();
  const currentWindow = activeWindows.find(w => w.component === 'search');
  
  const [searchTerm, setSearchTerm] = useState("");
  const [location, setLocation] = useState("");
  const [jobs, setJobs] = useState<(JobResult & { aiScore?: number, aiSummary?: string })[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [userSkills, setUserSkills] = useState("Full-Stack, React, AI, Node.js"); // In a real app, this comes from user profile
  
  const [watchlist, setWatchlist] = useState<Set<string>>(new Set());
  const { user } = useAuth();

  // Sequoia Hyper-Linking Synchronization
  useEffect(() => {
    if (currentWindow?.params?.searchTerm) {
      const { searchTerm: st, location: loc } = currentWindow.params;
      setSearchTerm(st);
      if (loc) setLocation(loc);
      
      // Auto-trigger fetch instantly with overrides to bypass state-batching race
      fetchJobs(false, st, loc);
    }
  }, [currentWindow?.params]);

  useEffect(() => {
    const fetchWatchlist = async () => {
      if (!user) return;
      try {
        const q = query(collection(db, "watchlist"), where("userId", "==", user.uid));
        const snapshot = await getDocs(q);
        const ids = new Set(snapshot.docs.map(doc => doc.data().jobId));
        setWatchlist(ids);
      } catch (err) {}
    };
    fetchWatchlist();
  }, [user]);

  const fetchJobs = async (isLoadMore = false, overrideSearch?: string, overrideLocation?: string) => {
    const finalSearch = overrideSearch !== undefined ? overrideSearch : searchTerm;
    const finalLocation = overrideLocation !== undefined ? overrideLocation : location;

    if (!finalSearch.trim()) {
      toast.error("Enter a keyword to initiate Intelligence Search.");
      return;
    }
    
    const nextPage = isLoadMore ? page + 1 : 1;
    if (isLoadMore) setLoadingMore(true);
    else {
        setLoading(true);
        setPage(1);
    }

    try {
      const results = await searchJobs(finalSearch, finalLocation, nextPage);
      
      // Perform AI Analysis on the top results for high-fidelity UI
      const enrichedResults = await Promise.all(results.map(async (job) => {
          try {
             // We only run deep AI on the first page or first few items to save tokens/time
             const analysis = await analyzeJobMatch(job.description, userSkills);
             return { ...job, aiScore: analysis.score, aiSummary: analysis.summary };
          } catch (e) {
             return { ...job, aiScore: 75, aiSummary: "Automated analysis pending..." };
          }
      }));

      if (user) logActivity(user.uid, "JOB_AI_SEARCH", `Searched for ${finalSearch}`);
      
      if (isLoadMore) {
        setJobs(prev => [...prev, ...enrichedResults]);
        setPage(nextPage);
      } else {
        setJobs(enrichedResults);
      }
    } catch (err: any) {
      toast.error("Deep Search failed.");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const toggleWatchlist = async (job: any) => {
    if (!user) {
        toast.error("Unauthorized: Please log in.");
        return;
    }
    if (watchlist.has(job.id)) return;

    try {
        await addDoc(collection(db, "watchlist"), {
        userId: user.uid,
        jobId: job.id,
        title: job.title,
        company: job.company.display_name,
        location: job.location.display_name,
        url: job.redirect_url,
        description: job.description,
        addedAt: serverTimestamp()
        });
        setWatchlist(prev => new Set([...prev, job.id]));
        toast.success("Opportunity pinned to Watchlist.");
    } catch (err) {
        toast.error("Network failure.");
    }
  };

  return (
    <div className="p-10 h-full overflow-y-auto custom-scrollbar bg-black/40 backdrop-blur-3xl font-sans selection:bg-primary/20">
      <div className="max-w-7xl mx-auto space-y-12 min-h-full">
        
        {/* Intelligence Header */}
        <div className="flex flex-col lg:flex-row items-end justify-between gap-8 pb-8 border-b border-white/5">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4 text-left">
             <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Live Market Intelligence</span>
             </div>
             <h1 className="text-4xl font-black tracking-tight text-white/90 uppercase leading-none italic">Opportunity <br/> Indexer</h1>
             <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600 italic">Synthesizing global job feeds via Sequoia-AI Neural Engine.</p>
          </motion.div>
          
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-1 p-1 bg-black/40 rounded-2xl border border-white/5">
                <Button variant="ghost" size="icon" onClick={() => setViewMode('grid')} className={cn("h-10 w-10 rounded-xl", viewMode === 'grid' ? "bg-white/10 text-primary" : "text-zinc-600")}><LayoutGrid className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" onClick={() => setViewMode('list')} className={cn("h-10 w-10 rounded-xl", viewMode === 'list' ? "bg-white/10 text-primary" : "text-zinc-600")}><List className="h-4 w-4" /></Button>
             </div>
             <div className="h-10 w-px bg-white/10" />
             <Button variant="outline" className="h-10 rounded-2xl border-white/5 bg-white/5 font-black uppercase tracking-widest text-[9px] gap-3 px-6 hover:bg-white/10"><Filter className="h-3.5 w-3.5" /> Core Filters</Button>
          </div>
        </div>

        {/* Intelligence Search Array */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="p-1 rounded-3xl border border-white/5 bg-white/[0.02] shadow-2xl relative group"
        >
          <div className="absolute inset-0 bg-primary/5 blur-3xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-700" />
          <form onSubmit={(e) => { e.preventDefault(); fetchJobs(); }} className="relative z-10 flex flex-col lg:flex-row items-center gap-4 p-2">
            <div className="flex-1 flex items-center px-6 gap-4 min-w-0">
              <Briefcase className="h-5 w-5 text-primary opacity-60" />
              <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Enter Keywords (e.g. AI Engineer, VP Ops)..." className="w-full bg-transparent border-none py-5 text-[13px] font-black focus:outline-none placeholder:text-zinc-800 text-white italic" />
            </div>
            <div className="h-10 w-px bg-white/5 hidden lg:block" />
            <div className="flex-1 flex items-center px-6 gap-4 min-w-0">
              <MapPin className="h-5 w-5 text-primary opacity-60" />
              <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Filter Location..." className="w-full bg-transparent border-none py-5 text-[13px] font-black focus:outline-none placeholder:text-zinc-800 text-white italic" />
            </div>
            <button type="submit" disabled={loading} className={cn(
               "h-16 px-12 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] gap-3 flex items-center justify-center transition-all shadow-2xl",
               loading ? "bg-zinc-900 text-zinc-600" : "bg-primary text-black hover:scale-[1.02] active:scale-95 shadow-primary/20"
            )}>
              {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              {loading ? "Searching..." : "Initialize Engine"}
            </button>
          </form>
        </motion.div>

        {/* Intelligence Matrix (Results) */}
        <div className={cn("grid gap-8 pb-20", viewMode === 'grid' ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-3" : "grid-cols-1")}>
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="p-10 rounded-[48px] border border-white/5 bg-white/[0.02] h-80 animate-pulse flex flex-col gap-6">
                 <div className="flex justify-between"><div className="w-12 h-12 rounded-2xl bg-white/5" /><div className="w-12 h-12 rounded-full bg-white/5" /></div>
                 <div className="h-8 bg-white/5 rounded-full w-2/3" />
                 <div className="h-20 bg-white/5 rounded-3xl w-full" />
              </div>
            ))
          ) : (
            <AnimatePresence>
              {jobs.map((job, i) => (
                <motion.div key={job.id} initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="group">
                    <Card className="p-10 rounded-[48px] bg-white/[0.02] border border-white/5 hover:border-primary/20 transition-all shadow-3xl relative overflow-hidden flex flex-col h-full hover:bg-white/[0.04]">
                      {/* Intelligence Decoration */}
                      <div className="absolute top-0 right-0 p-12 opacity-[0.03] group-hover:opacity-10 transition-opacity pointer-events-none"><BrainCircuit className="h-64 w-64 text-primary" /></div>
                      
                      <div className="flex justify-between items-start mb-10 relative z-10">
                          <div className="w-14 h-14 rounded-3xl bg-primary/10 flex items-center justify-center border border-primary/20 text-primary font-black text-xl shadow-xl">{job.company.display_name.slice(0, 1)}</div>
                          <div className="flex items-center gap-3">
                             {/* AI Match Radial (Simulated) */}
                             <div className="relative flex flex-col items-center">
                                <svg className="h-14 w-14 -rotate-90">
                                   <circle cx="28" cy="28" r="24" fill="transparent" stroke="currentColor" strokeWidth="4" className="text-white/5" />
                                   <motion.circle 
                                      cx="28" cy="28" r="24" fill="transparent" stroke="currentColor" strokeWidth="4" 
                                      className="text-primary"
                                      initial={{ pathLength: 0 }}
                                      animate={{ pathLength: (job.aiScore || 75) / 100 }}
                                      transition={{ duration: 1.5, delay: 0.5 }}
                                   />
                                </svg>
                                <span className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-primary">{job.aiScore}%</span>
                                <span className="text-[7px] font-black uppercase tracking-widest text-zinc-600 mt-1">Match Score</span>
                             </div>
                             <button onClick={() => toggleWatchlist(job)} className="p-3 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all"><Bookmark className={cn("h-5 w-5", watchlist.has(job.id) ? "text-primary fill-primary" : "text-zinc-600")} /></button>
                          </div>
                      </div>
                      
                      <div className="space-y-4 mb-8 relative z-10">
                        <h3 className="text-2xl font-black tracking-tighter text-white/90 uppercase leading-none group-hover:text-primary transition-colors">{job.title}</h3>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 italic block">{job.company.display_name} <span className="mx-2 opacity-20">||</span> {job.location.display_name}</p>
                      </div>

                      {/* AI Intelligence Summary */}
                      <div className="mb-10 relative group/info">
                         <div className="absolute inset-0 bg-primary/5 rounded-3xl blur-xl opacity-0 group-hover/info:opacity-100 transition-opacity" />
                         <div className="relative p-6 rounded-3xl bg-black/40 border border-white/5 space-y-3">
                            <div className="flex items-center gap-2">
                               <Sparkles className="h-3.5 w-3.5 text-primary" />
                               <span className="text-[8px] font-black uppercase tracking-[0.3em] text-primary">Intelligence Summary</span>
                            </div>
                            <p className="text-[12px] font-bold leading-relaxed text-zinc-400 italic">
                               "{job.aiSummary || "Initiating deep textual analysis of the requirement parameters..."}"
                            </p>
                         </div>
                      </div>

                      <div className="mt-auto flex items-center gap-4 relative z-10">
                         <Button asChild className="flex-1 h-12 rounded-2xl bg-primary text-black font-black uppercase tracking-widest text-[9px] gap-3 shadow-xl shadow-primary/10 hover:brightness-110 active:scale-95 transition-all"><a href={job.redirect_url} target="_blank" rel="noopener noreferrer">Inspect Details<ChevronRight className="h-3.5 w-3.5" /></a></Button>
                         <div className="px-6 py-2 rounded-2xl border border-white/5 bg-white/5 flex flex-col items-center justify-center">
                            <span className="text-[8px] font-black uppercase tracking-widest text-zinc-600">Estimation</span>
                            <span className="text-[10px] font-black text-white/40 italic">Market Cap</span>
                         </div>
                      </div>
                    </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>

        {/* Global Market Intelligence Footer */}
        {jobs.length > 0 && (
          <div className="flex flex-col items-center gap-10 pb-20 max-w-2xl mx-auto border-t border-white/5 pt-20">
              <div className="flex gap-10 opacity-20 filter grayscale hover:opacity-100 transition-all duration-700">
                 <div className="flex flex-col items-center gap-2 text-zinc-500">
                    <Activity className="h-5 w-5" />
                    <span className="text-[8px] font-black uppercase tracking-widest">Real-time Feed</span>
                 </div>
                 <div className="flex flex-col items-center gap-2 text-zinc-500">
                    <ShieldCheck className="h-5 w-5" />
                    <span className="text-[8px] font-black uppercase tracking-widest">Encrypted Source</span>
                 </div>
                 <div className="flex flex-col items-center gap-2 text-zinc-500">
                    <TrendingUp className="h-5 w-5" />
                    <span className="text-[8px] font-black uppercase tracking-widest">Market Predictive</span>
                 </div>
              </div>
              <Button onClick={() => fetchJobs(true)} disabled={loadingMore} className="h-16 px-16 rounded-[32px] bg-white/5 hover:bg-white/10 text-white/40 font-black uppercase tracking-widest text-[10px] gap-4 border border-white/5 group active:scale-95 transition-all">
                {loadingMore ? <RefreshCw className="h-4 w-4 animate-spin text-primary" /> : <ChevronDown className="h-5 w-5 group-hover:translate-y-1 transition-transform" />}
                Load Remaining Volume
              </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Jobs;
