import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { FolderGit2, ExternalLink, Star, GitFork, Loader2, Github, CheckCircle2, Layout, Plus, Share2, Sparkles, Binary } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
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
}

const langColors: Record<string, string> = {
  TypeScript: "bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]",
  JavaScript: "bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.5)]",
  Python: "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]",
  Rust: "bg-orange-600 shadow-[0_0_8px_rgba(234,88,12,0.5)]",
  Go: "bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.5)]",
  Java: "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]",
  CSS: "bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.5)]",
  HTML: "bg-orange-400 shadow-[0_0_8px_rgba(251,146,60,0.5)]",
};

const PortfolioGenerator = () => {
  const [username, setUsername] = useState("");
  const [repos, setRepos] = useState<Repo[]>([]);
  const [loading, setLoading] = useState(false);
  const [watchlist, setWatchlist] = useState<Set<string>>(new Set());
  const { user } = useAuth();
  const [selectedRepos, setSelectedRepos] = useState<Set<number>>(new Set());

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
      toast.error("Industrial Protocol error: Identity Missing.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`https://api.github.com/users/${username.trim()}/repos?sort=updated&per_page=40`);
      if (!res.ok) throw new Error("identity_not_found");
      const data: Repo[] = await res.json();
      setRepos(data.filter((r) => !r.name.includes(".github")));
      setSelectedRepos(new Set(data.slice(0, 6).map((r) => r.id)));
      toast.success(`Identity Verified: Found ${data.length} architectural nodes.`);
    } catch {
      toast.error("Identity synchronization failure. Check GitHub node status.");
    }
    setLoading(false);
  };

  const toggleWatchlist = async (repo: Repo) => {
    if (!user) {
        toast.error("Identity protocol required for Watchlist synchronization.");
        return;
    }

    try {
      if (watchlist.has(String(repo.id))) {
        // Find the doc and delete
        const q = query(
          collection(db, "watchlist"), 
          where("userId", "==", user.uid), 
          where("jobId", "==", String(repo.id))
        );
        const snap = await getDocs(q);
        snap.forEach(async (d) => await deleteDoc(doc(db, "watchlist", d.id)));
        toast.success("Repository node de-synchronized.");
      } else {
        await addDoc(collection(db, "watchlist"), {
          userId: user.uid,
          jobId: String(repo.id),
          title: repo.name,
          company: "GitHub Source",
          location: repo.language || "Polymorphic",
          url: repo.html_url,
          addedAt: serverTimestamp(),
          type: "REPO"
        });
        if (user) logActivity(user.uid, "WATCHLIST_ADD", `Saved repo: ${repo.name}`);
        toast.success("Repository prioritized in your Industrial Dashboard.");
      }
    } catch (err) {
      toast.error("Resource synchronization failed.");
    }
  };

  const toggleRepo = (id: number) => {
    setSelectedRepos((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-background selection:bg-primary/30 mesh-bg relative overflow-hidden">
      <Navbar />
      
      {/* Decorative elements */}
      <div className="absolute top-40 right-0 w-96 h-96 bg-primary/10 blur-[160px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-500/5 blur-[200px] rounded-full pointer-events-none" />

      <main className="container mx-auto px-6 pt-40 pb-32 relative z-10">
        <div className="flex flex-col lg:flex-row items-end justify-between gap-12 mb-20">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
             <Badge className="mb-4 bg-primary/10 text-primary border-primary/20 px-4 py-1 rounded-full uppercase font-black text-[9px] tracking-[0.2em] shadow-lg shadow-primary/5">Node Curation Lab</Badge>
             <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase leading-none mb-6">
               Architect Your <br />
               <span className="text-gradient">Legacy Archive.</span>
             </h1>
             <p className="max-w-xl text-muted-foreground font-medium text-lg leading-relaxed">
               Convert raw source code into industrial-grade portfolio artifacts. Transform your GitHub footprint into a professional visual narrative.
             </p>
          </motion.div>
          
          <div className="flex items-center gap-4">
             <div className="p-4 rounded-2xl glass-card text-center min-w-[120px] border-white/5">
                <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-1">Curated Nodes</p>
                <p className="text-3xl font-black text-primary">{selectedRepos.size}</p>
             </div>
             <div className="p-4 rounded-2xl glass-card text-center min-w-[120px] border-white/5">
                <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-1">Sync Status</p>
                <p className={cn("text-xs font-black uppercase tracking-widest mt-2", selectedRepos.size > 0 ? "text-emerald-400" : "text-muted-foreground")}>
                   {selectedRepos.size > 0 ? "PROTOCOL READY" : "IDLE"}
                </p>
             </div>
          </div>
        </div>

        {/* GitHub Input */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-3 rounded-[2.5rem] border-white/5 mb-24 shadow-2xl relative group overflow-hidden max-w-3xl"
        >
          <div className="absolute inset-0 bg-primary/5 blur-[100px] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
          <div className="flex flex-col md:flex-row items-center gap-3 relative z-10">
            <div className="flex-1 flex items-center px-6 gap-4 py-4 md:py-0">
              <Github className="h-6 w-6 text-primary shrink-0 opacity-50" />
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && fetchRepos()}
                placeholder="Synchronize GitHub Identity..."
                className="w-full bg-transparent border-none text-lg font-bold focus:outline-none placeholder:text-muted-foreground/20 tracking-tight"
              />
            </div>
            <Button
              size="lg"
              className={cn(
                "w-full md:w-auto rounded-[1.5rem] px-10 h-16 font-black uppercase tracking-[0.2em] text-[10px] gap-4 shadow-xl shadow-primary/20 transition-all active:scale-[0.98]",
                loading ? "bg-white/5 pointer-events-none" : "bg-primary hover:bg-primary/90 text-primary-foreground"
              )}
              onClick={fetchRepos}
              disabled={loading}
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              {loading ? "SCANNING GRID..." : "INITIALIZE SCAN"}
            </Button>
          </div>
        </motion.div>

        {/* Repos Grid */}
        <AnimatePresence mode="wait">
          {repos.length > 0 ? (
            <motion.div
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid gap-10 md:grid-cols-2 lg:grid-cols-3"
            >
              {repos.map((repo, i) => {
                const isSelected = selectedRepos.has(repo.id);
                return (
                  <motion.div
                    key={repo.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    onClick={() => toggleRepo(repo.id)}
                    className="cursor-pointer group flex flex-col h-full"
                  >
                    <div className={cn(
                      "glass-card border-white/5 rounded-[2.5rem] p-10 flex flex-col h-full transition-all duration-700 relative overflow-hidden group-hover:-translate-y-2",
                      isSelected ? "border-primary/40 shadow-[0_0_60px_-20px_rgba(16,185,129,0.3)] bg-primary/[0.03]" : "hover:bg-white/[0.03]"
                    )}>
                      {isSelected && (
                         <div className="absolute top-8 right-8 z-20 flex gap-2">
                            <motion.button 
                                onClick={(e) => { e.stopPropagation(); toggleWatchlist(repo); }}
                                initial={{ scale: 0 }} 
                                animate={{ scale: 1 }}
                                className={cn(
                                    "p-2 rounded-xl border transition-all",
                                    watchlist.has(String(repo.id)) ? "bg-primary/20 border-primary/40" : "bg-background/80 border-white/10"
                                )}
                            >
                                <Star className={cn("h-4 w-4", watchlist.has(String(repo.id)) ? "text-primary fill-primary" : "text-muted-foreground")} />
                            </motion.button>
                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                                <CheckCircle2 className="h-8 w-8 text-primary fill-primary/10 border-4 border-background rounded-full" />
                            </motion.div>
                         </div>
                      )}
                      
                      <div className="relative z-10">
                        <div className="flex items-center gap-4 mb-8">
                            <div className={cn(
                            "w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500",
                            isSelected ? "bg-primary/20 rotate-12" : "bg-white/5 group-hover:bg-primary/10 group-hover:rotate-6"
                            )}>
                            {isSelected ? <Binary className="h-7 w-7 text-primary" /> : <FolderGit2 className="h-7 w-7 text-muted-foreground/60" />}
                            </div>
                            <div className="flex-1 overflow-hidden">
                            <h3 className="text-xl font-black tracking-tighter uppercase line-clamp-1 group-hover:text-primary transition-colors">{repo.name}</h3>
                            <div className="flex items-center gap-2 mt-1">
                                {repo.language && (
                                    <>
                                    <div className={cn("w-2 h-2 rounded-full", langColors[repo.language] || "bg-gray-600")} />
                                    <span className="text-[10px] font-black uppercase text-muted-foreground/50 tracking-widest">{repo.language}</span>
                                    </>
                                )}
                            </div>
                            </div>
                        </div>

                        <p className="text-sm text-muted-foreground font-medium mb-10 line-clamp-3 leading-relaxed opacity-70 group-hover:opacity-100 transition-opacity">
                            {repo.description || "Experimental protocol architecture with proprietary logic nodes and reactive data frameworks."}
                        </p>

                        <div className="grid grid-cols-2 gap-4 mb-10">
                           <div className="bg-white/5 rounded-2xl p-4 border border-white/5 text-center">
                              <Star className="h-4 w-4 text-emerald-400 mx-auto mb-1 opacity-60" />
                              <span className="text-sm font-black text-foreground">{repo.stargazers_count}</span>
                              <p className="text-[8px] font-black uppercase text-muted-foreground/40 mt-0.5">Stars</p>
                           </div>
                           <div className="bg-white/5 rounded-2xl p-4 border border-white/5 text-center">
                              <GitFork className="h-4 w-4 text-blue-400 mx-auto mb-1 opacity-60" />
                              <span className="text-sm font-black text-foreground">{repo.forks_count}</span>
                              <p className="text-[8px] font-black uppercase text-muted-foreground/40 mt-0.5">Forks</p>
                           </div>
                        </div>

                        <div className="flex items-center justify-between pt-8 border-t border-white/5">
                            <button
                                onClick={(e) => { e.stopPropagation(); toast.info("Initializing node preview..."); }}
                                className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"
                            >
                                <Layout className="h-3.5 w-3.5" /> Node Metadata
                            </button>
                            <a
                            href={repo.html_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-primary hover:opacity-70 transition-all"
                            >
                            Source <ExternalLink className="h-3 w-3" />
                            </a>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="py-32 text-center flex flex-col items-center justify-center max-w-2xl mx-auto"
            >
              <div className="w-24 h-24 rounded-[2.5rem] bg-white/5 flex items-center justify-center mb-10 relative group">
                <div className="absolute inset-0 bg-primary/20 blur-3xl opacity-50 rounded-full animate-pulse" />
                <Github className="h-10 w-10 text-muted-foreground relative z-10 transition-transform group-hover:scale-110" />
              </div>
              <h3 className="text-3xl font-black uppercase mb-4 tracking-tighter">Grid Connection Silent</h3>
              <p className="text-muted-foreground font-medium mb-12 leading-relaxed">
                 Enter your GitHub identity to begin curating high-end artifacts from your global repository network. Intelligence starts with your legacy.
              </p>
              <div className="flex gap-4">
                  <Button variant="ghost" onClick={() => { setUsername("vercel"); fetchRepos(); }} className="h-14 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-white/5 bg-white/5 px-8 hover:bg-white/10">Grid: Vercel</Button>
                  <Button variant="ghost" onClick={() => { setUsername("shadcn"); fetchRepos(); }} className="h-14 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-white/5 bg-white/5 px-8 hover:bg-white/10">Grid: UI</Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default PortfolioGenerator;
