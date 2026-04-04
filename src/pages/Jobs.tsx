import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Search, MapPin, Briefcase, RefreshCw, Send, LayoutGrid, List, Bookmark, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { searchJobs, deepDiveJob, JobResult } from "@/lib/intelligence";
import { db, logActivity } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp, query, where, getDocs } from "firebase/firestore";
import { useAuth } from "@/contexts/AuthContext";

const Jobs = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [location, setLocation] = useState("");
  const [jobs, setJobs] = useState<JobResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  
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
      toast.error("Please enter a keyword to search.");
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
      if (user) logActivity(user.uid, "JOB_SEARCH", `Searched for ${searchTerm} in ${location}`);
      if (isLoadMore) {
        setJobs(prev => [...prev, ...results]);
        setPage(nextPage);
      } else {
        setJobs(results);
      }
    } catch (err: any) {
      toast.error("Search failed.");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const toggleWatchlist = async (job: JobResult) => {
    if (!user) {
        toast.error("Please log in.");
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
        toast.success("Added to watchlist.");
    } catch (err) {
        toast.error("Failed to add.");
    }
  };

  return (
    <div className="p-8 h-full overflow-y-auto custom-scrollbar bg-black/40 backdrop-blur-3xl">
      <div className="flex flex-col lg:flex-row items-center justify-between gap-8 mb-12 max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
            <h1 className="text-2xl font-bold tracking-tight uppercase leading-none">Find <span className="text-primary opacity-60">Opportunities</span></h1>
          <p className="text-muted-foreground font-bold text-[9px] uppercase tracking-widest ml-1 opacity-60 mt-1">Global Market Index</p>
        </motion.div>
        
        <div className="flex items-center gap-2 p-1 rounded-md bg-white/5 border border-white/10">
            <Button variant={viewMode === 'grid' ? 'secondary' : 'ghost'} size="icon" onClick={() => setViewMode('grid')} className="h-8 w-8"><LayoutGrid className="h-4 w-4" /></Button>
            <Button variant={viewMode === 'list' ? 'secondary' : 'ghost'} size="icon" onClick={() => setViewMode('list')} className="h-8 w-8"><List className="h-4 w-4" /></Button>
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="p-1 rounded-xl border border-white/10 bg-white/5 mb-12 shadow-inner max-w-7xl mx-auto">
        <form onSubmit={(e) => { e.preventDefault(); fetchJobs(); }} className="flex flex-col md:flex-row items-center gap-2">
          <div className="flex-1 flex items-center px-4 gap-3 min-w-0">
            <Briefcase className="h-4 w-4 text-primary shrink-0 opacity-60" />
            <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Keywords..." className="w-full bg-transparent border-none py-3 text-[12px] font-bold focus:outline-none placeholder:text-muted-foreground/30" />
          </div>
          <div className="h-6 w-[px] bg-white/10 hidden md:block" />
          <div className="flex-1 flex items-center px-4 gap-3 min-w-0">
            <MapPin className="h-4 w-4 text-primary shrink-0 opacity-60" />
            <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Location..." className="w-full bg-transparent border-none py-3 text-[12px] font-bold focus:outline-none placeholder:text-muted-foreground/30" />
          </div>
          <Button type="submit" disabled={loading} className="rounded-lg px-8 h-10 font-bold uppercase tracking-widest text-[9px] gap-2">{loading ? <RefreshCw className="h-3 w-3 animate-spin" /> : <Search className="h-3.5 w-3.5" />}Search</Button>
        </form>
      </motion.div>

      <div className={cn("grid gap-6 mb-12 max-w-7xl mx-auto", viewMode === 'grid' ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1")}>
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="p-6 rounded-xl border border-white/5 bg-white/5 h-64 animate-pulse" />
          ))
        ) : (
          <AnimatePresence>
            {jobs.map((job, i) => (
              <motion.div key={job.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}>
                  <Card className="card-flat p-6 h-full flex flex-col border-white/5 bg-white/5 hover:border-primary/30 transition-all shadow-inner relative overflow-hidden">
                    <div className="flex justify-between items-start mb-4">
                        <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center text-primary font-bold text-[10px]">{job.company.display_name.slice(0, 1)}</div>
                        <button onClick={() => toggleWatchlist(job)} className="p-1.5 rounded-md hover:bg-white/10 transition-all"><Bookmark className={cn("h-3.5 w-3.5", watchlist.has(job.id) ? "text-primary fill-primary" : "text-muted-foreground/40")} /></button>
                    </div>
                    <h3 className="text-sm font-bold tracking-tight mb-1 truncate uppercase">{job.title}</h3>
                    <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground opacity-60 mb-4">{job.company.display_name} • {job.location.display_name}</p>
                    
                    <div className="flex-1 text-[11px] font-medium text-muted-foreground/80 line-clamp-3 mb-6 leading-relaxed italic">
                       {job.description.replace(/<[^>]*>?/gm, '')}
                    </div>

                    <Button asChild className="w-full h-9 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-bold uppercase tracking-widest text-[9px] gap-2"><a href={job.redirect_url} target="_blank" rel="noopener noreferrer">Details<Send className="h-3 w-3" /></a></Button>
                  </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {jobs.length > 0 && (
        <div className="flex justify-center pt-8 border-t border-white/5 max-w-7xl mx-auto">
            <Button onClick={() => fetchJobs(true)} disabled={loadingMore} variant="outline" className="h-10 px-10 rounded-lg border-white/10 bg-white/5 font-bold uppercase tracking-widest text-[9px] gap-2">{loadingMore ? <RefreshCw className="h-3 w-3 animate-spin" /> : <ChevronDown className="h-3 w-3" />}Load More</Button>
        </div>
      )}
    </div>
  );
};

export default Jobs;
