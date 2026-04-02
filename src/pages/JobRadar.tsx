import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Search, MapPin, Briefcase, RefreshCw, Send, Clock, LayoutGrid, List, Sparkles, Star, ChevronDown, Filter, Info, ShieldCheck, Zap } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { searchJobs, analyzeJobMatch, deepDiveJob, JobResult } from "@/lib/intelligence";
import { db, logActivity } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp, query, where, getDocs } from "firebase/firestore";
import { useAuth } from "@/contexts/AuthContext";

const JobRadar = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [location, setLocation] = useState("");
  const [jobs, setJobs] = useState<JobResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  
  const [analysisLoading, setAnalysisLoading] = useState<string | null>(null);
  const [analysisResults, setAnalysisResults] = useState<Record<string, string>>({});
  
  const [diveLoading, setDiveLoading] = useState<string | null>(null);
  const [diveResults, setDiveResults] = useState<Record<string, string>>({});

  const [watchlist, setWatchlist] = useState<Set<string>>(new Set());
  const { user } = useAuth();

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

  const fetchJobs = async (isLoadMore = false) => {
    if (!searchTerm.trim()) {
      toast.error("Intelligence Protocol: Keyword Required.");
      return;
    }
    
    const nextPage = isLoadMore ? page + 1 : 1;
    if (isLoadMore) setLoadingMore(true);
    else {
        setLoading(true);
        setPage(1);
    }

    try {
      const results = await searchJobs(searchTerm, location, nextPage);
      
      if (user) logActivity(user.uid, "MARKET_SCAN", `Searched for ${searchTerm} in ${location}`);
      
      if (isLoadMore) {
        // Appending ensures "Load More" works as expected
        setJobs(prev => [...prev, ...results]);
        setPage(nextPage);
      } else {
        setJobs(results);
      }
      
      if (results.length === 0) {
          if (isLoadMore) toast.info("Deep Signal: No more industrial nodes found in this sector.");
          else toast.error("Signal Scan: No active results. Try broadening parameters.");
      } else {
          toast.success(`Deep Signal: ${isLoadMore ? "Augmented" : "Synchronized"} +${results.length} real-world contracts.`);
      }
    } catch (err: any) {
      console.error("Job fetch error:", err);
      toast.error("Telemetry Intelligence Failed. Re-sync in progress.");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleDeepDive = async (job: JobResult) => {
    setDiveLoading(job.id);
    try {
      const detailedOverview = await deepDiveJob(job.description);
      setDiveResults(prev => ({ ...prev, [job.id]: detailedOverview }));
      if (user) logActivity(user.uid, "DEEP_DIVE", `Analyzed job: ${job.title}`);
      toast.success("Intelligence Deep Dive: Full Analysis Decrypted.");
    } catch (err) {
      toast.error("Deep Dive Offline.");
    } finally {
      setDiveLoading(null);
    }
  };

  const toggleWatchlist = async (job: JobResult) => {
    if (!user) {
        toast.error("Identity protocol required for Watchlist synchronization.");
        return;
    }
    if (watchlist.has(job.id)) {
        toast.info("Node already synchronized in your priority leads.");
        return;
    }

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
      toast.success("Industrial Lead prioritized in your Watchlist.");
    } catch (err) {
      toast.error("Watchlist Node failed to synchronize.");
    }
  };

  return (
    <div className="min-h-screen bg-background selection:bg-primary/30 font-sans mesh-bg">
      <Navbar />
      
      <main className="container mx-auto px-6 pt-40 pb-20">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8 mb-16">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
             <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-xl bg-primary/10">
                <Search className="h-6 w-6 text-primary" />
              </div>
              <h1 className="text-4xl font-black tracking-tighter uppercase leading-none">Market Radar <span className="text-primary text-sm font-black tracking-widest ml-2 px-3 py-1 bg-primary/10 rounded-full border border-primary/20">Deep Signal V2</span></h1>
            </div>
            <p className="text-muted-foreground font-medium text-lg ml-1">Universal extraction of real-world freelance contracts</p>
          </motion.div>
          
          <div className="flex items-center gap-4">
            <Button variant="outline" className="rounded-full border-white/5 bg-white/5 h-11 px-6 font-bold uppercase tracking-widest text-[10px] gap-2">
               <ShieldCheck className="h-4 w-4 text-emerald-400" /> Signal Verified
            </Button>
            <div className="flex items-center gap-2 p-1 rounded-full bg-white/5 border border-white/10 shadow-xl">
              <Button 
                  variant={viewMode === 'grid' ? 'secondary' : 'ghost'} 
                  size="icon" 
                  onClick={() => setViewMode('grid')}
                  className="rounded-full h-10 w-10 transition-all font-bold"
              >
                  <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button 
                  variant={viewMode === 'list' ? 'secondary' : 'ghost'} 
                  size="icon" 
                  onClick={() => setViewMode('list')}
                  className="rounded-full h-10 w-10 transition-all font-bold"
              >
                  <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-2 rounded-full border-white/5 mb-20 shadow-2xl relative group max-w-4xl mx-auto"
        >
          <div className="absolute inset-0 bg-primary/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
          <form onSubmit={(e) => { e.preventDefault(); fetchJobs(); }} className="flex flex-col md:flex-row items-center gap-2 relative z-10">
            <div className="flex-1 flex items-center px-6 gap-3 min-w-0">
              <Briefcase className="h-4 w-4 text-primary shrink-0" />
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Keywords (e.g. React)..."
                className="w-full bg-transparent border-none py-4 text-sm font-bold focus:outline-none placeholder:text-muted-foreground/30"
              />
            </div>
            <div className="h-6 w-[1px] bg-white/10 hidden md:block" />
            <div className="flex-1 flex items-center px-6 gap-3 min-w-0">
              <MapPin className="h-4 w-4 text-emerald-400 shrink-0" />
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Location (e.g. Bengaluru)..."
                className="w-full bg-transparent border-none py-4 text-sm font-bold focus:outline-none placeholder:text-muted-foreground/30"
              />
            </div>
            <Button
              type="submit"
              size="lg"
              className={cn(
                "rounded-full px-10 h-14 font-black uppercase tracking-widest gap-2 shadow-lg shadow-primary/20 transition-all active:scale-[0.98]",
                loading ? "bg-white/5 pointer-events-none border border-white/5" : "bg-primary hover:bg-primary/90 text-primary-foreground"
              )}
              disabled={loading}
            >
              {loading ? <RefreshCw className="h-5 w-5 animate-spin" /> : <RefreshCw className="h-5 w-5" />}
              {loading ? "SEARCHING..." : "SCAN MARKET"}
            </Button>
          </form>
        </motion.div>

        {/* Results Grid */}
        <div className={cn(
            "grid gap-8 mb-20",
            viewMode === 'grid' ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
        )}>
          {loading ? (
            Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="glass-card p-8 rounded-3xl space-y-4 border-white/5 h-[400px]">
                <Skeleton className="h-6 w-3/4 rounded-full bg-white/10" />
                <Skeleton className="h-4 w-1/2 rounded-full bg-white/10" />
                <div className="pt-8 space-y-3">
                  <Skeleton className="h-32 w-full rounded-2xl bg-white/10" />
                  <Skeleton className="h-10 w-full rounded-xl bg-white/10" />
                </div>
              </div>
            ))
          ) : jobs.length > 0 ? (
            <AnimatePresence>
              {jobs.map((job, i) => (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ y: -8 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card className="glass-card border-white/5 rounded-[2.5rem] h-full flex flex-col group hover:border-primary/40 transition-all duration-500 overflow-hidden relative shadow-[0_30px_60px_-15px_rgba(0,0,0,0.4)]">
                    <CardHeader className="p-8">
                      <div className="flex items-start justify-between mb-4">
                        <Badge variant="outline" className="px-3 py-1 border-primary/20 uppercase font-black text-[9px] tracking-widest text-primary bg-primary/5">
                          Real-time Lead
                        </Badge>
                        <button 
                            onClick={() => toggleWatchlist(job)}
                            className={cn(
                                "p-2.5 rounded-xl border transition-all active:scale-95",
                                watchlist.has(job.id) ? "bg-primary/20 border-primary/40" : "bg-white/5 border-white/10 hover:border-primary/40"
                            )}>
                            <Star className={cn("h-4 w-4", watchlist.has(job.id) ? "text-primary fill-primary" : "text-muted-foreground")} />
                        </button>
                      </div>
                      <CardTitle className="text-xl md:text-2xl font-black tracking-tight leading-tight mb-2 group-hover:text-primary transition-colors">
                        {job.title}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                        <span className="flex items-center gap-1.5 underline decoration-primary/40 underline-offset-4">{job.company.display_name}</span>
                        <span className="flex items-center gap-1.5 text-emerald-400/60 leading-none">{job.location.display_name}</span>
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="px-8 pb-8 flex-1">
                      <div className="border-t border-white/5 pt-6 space-y-6">
                         
                         {diveResults[job.id] ? (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                                <div className="flex items-center gap-2 mb-2">
                                    <Zap className="h-3.5 w-3.5 text-primary" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-primary">Tactical Overview</span>
                                </div>
                                <div className="text-[11px] font-medium text-foreground leading-relaxed whitespace-pre-wrap">
                                   {diveResults[job.id]}
                                </div>
                            </motion.div>
                         ) : (
                            <div className="space-y-4">
                                <p className="text-sm text-muted-foreground font-medium leading-relaxed italic line-clamp-3 opacity-60">
                                    {job.description.replace(/<[^>]*>?/gm, '')}
                                </p>
                                <Button 
                                    onClick={() => handleDeepDive(job)}
                                    disabled={diveLoading === job.id}
                                    variant="outline" 
                                    className="h-10 px-5 rounded-full text-[9px] font-black uppercase tracking-widest bg-white/5 border-white/10 hover:bg-primary/20 hover:text-primary hover:border-primary/40 gap-2 transition-all"
                                >
                                    {diveLoading === job.id ? <RefreshCw className="h-3 w-3 animate-spin" /> : <Info className="h-3.5 w-3.5" />}
                                    Deep Dive Analysis
                                </Button>
                            </div>
                         )}
                      </div>
                    </CardContent>
                    <CardFooter className="px-8 pb-8 pt-0 flex flex-col gap-4">
                        <Button
                          asChild
                          className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-black border-none uppercase tracking-[0.25em] text-[10px] gap-3 group/btn transition-all shadow-xl shadow-primary/20"
                        >
                          <a href={job.redirect_url} target="_blank" rel="noopener noreferrer">
                            Initialize Response <Send className="h-4 w-4 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
                          </a>
                        </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          ) : (
            <div className="col-span-full py-40 text-center flex flex-col items-center justify-center">
                <div className="w-24 h-24 rounded-[2.5rem] bg-white/5 flex items-center justify-center mb-8 relative">
                    <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full animate-pulse" />
                    <Search className="h-10 w-10 text-primary/40 relative z-10" />
                </div>
                <h3 className="text-3xl font-black uppercase mb-4 tracking-tighter">Deep Signal Inactive</h3>
                <p className="max-w-xs mx-auto text-sm text-muted-foreground font-medium mb-10 leading-relaxed opacity-60">
                   Waiting for industrial keyword synchronization. Initialize a Market Scan to find elite freelance contracts.
                </p>
            </div>
          )}
        </div>

        {/* Load More Pagination */}
        {jobs.length > 0 && (
            <div className="flex justify-center pt-20 border-t border-white/5">
                <Button
                    onClick={() => fetchJobs(true)}
                    disabled={loadingMore}
                    variant="outline"
                    className="h-16 px-16 rounded-full border-white/10 bg-white/5 hover:bg-white/10 font-black uppercase tracking-[0.4em] text-[10px] gap-4 shadow-2xl transition-all hover:scale-105 active:scale-95 group/more"
                >
                    {loadingMore ? <RefreshCw className="h-5 w-5 animate-spin" /> : <ChevronDown className="h-5 w-5 group-hover/more:translate-y-1 transition-transform" />}
                    {loadingMore ? "SYNCHRONIZING..." : "LOAD MORE LEADS"}
                </Button>
            </div>
        )}
      </main>
    </div>
  );
};

export default JobRadar;
