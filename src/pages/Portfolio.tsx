import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Folder, ExternalLink, Bookmark, Loader2, Github, Terminal } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
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
  TypeScript: "bg-blue-500",
  JavaScript: "bg-yellow-400",
  Python: "bg-emerald-500",
  Rust: "bg-orange-600",
  Go: "bg-cyan-400",
  Java: "bg-red-500",
  CSS: "bg-purple-500",
  HTML: "bg-orange-400",
};

const Portfolio = () => {
  const [username, setUsername] = useState("");
  const [repos, setRepos] = useState<Repo[]>([]);
  const [loading, setLoading] = useState(false);
  const [watchlist, setWatchlist] = useState<Set<string>>(new Set());
  const { user } = useAuth();

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
      toast.error("Please enter a GitHub username.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`https://api.github.com/users/${username.trim()}/repos?sort=updated&per_page=40`);
      if (!res.ok) throw new Error("identity_not_found");
      const data: Repo[] = await res.json();
      setRepos(data.filter((r) => !r.name.includes(".github")));
      toast.success(`Found ${data.length} repositories.`);
    } catch {
      toast.error("Failed to fetch repositories.");
    }
    setLoading(false);
  };

  const toggleWatchlist = async (repo: Repo) => {
    if (!user) {
        toast.error("Please log in.");
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
          company: "GitHub",
          location: repo.language || "Polymorphic",
          url: repo.html_url,
          addedAt: serverTimestamp(),
          type: "REPO"
        });
        if (user) logActivity(user.uid, "PORTFOLIO_UPDATE", `Updated portfolio: ${repo.name}`);
      }
    } catch (err) {
      toast.error("Update failed.");
    }
  };

  return (
    <div className="p-8 h-full overflow-y-auto custom-scrollbar bg-black/40 backdrop-blur-3xl">
      <div className="flex flex-col lg:flex-row items-end justify-between gap-8 mb-12 max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
           <h1 className="text-2xl font-bold tracking-tight uppercase mb-1 text-white">
             Project <span className="text-primary opacity-60">Index</span>
           </h1>
           <p className="text-muted-foreground font-bold text-[9px] uppercase tracking-widest opacity-60">
             Source Code Curation
           </p>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="p-1 rounded-xl border border-white/10 bg-white/5 mb-16 shadow-inner max-w-2xl mx-auto">
        <div className="flex flex-col md:flex-row items-center gap-2">
          <div className="flex-1 flex items-center px-4 gap-3 py-1">
            <Github className="h-5 w-5 text-primary shrink-0 opacity-60" />
            <input value={username} onChange={(e) => setUsername(e.target.value)} onKeyDown={(e) => e.key === "Enter" && fetchRepos()} placeholder="Enter username..." className="w-full bg-transparent border-none py-3 text-[12px] font-bold focus:outline-none placeholder:text-muted-foreground/30 text-white" />
          </div>
          <Button onClick={fetchRepos} disabled={loading} className="rounded-lg px-8 h-10 font-bold uppercase tracking-widest text-[9px] gap-2">{loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Terminal className="h-3.5 w-3.5" />}Fetch Account</Button>
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        {repos.length > 0 ? (
          <motion.div layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto">
            {repos.map((repo, i) => (
              <motion.div key={repo.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                <Card className="card-flat p-6 h-full flex flex-col border-white/5 bg-white/5 hover:border-primary/30 transition-all shadow-inner relative overflow-hidden group">
                  <div className="flex justify-between items-start mb-4">
                      <div className="w-8 h-8 rounded-md bg-white/5 flex items-center justify-center border border-white/10"><Folder className="h-3.5 w-3.5 text-primary" /></div>
                      <button onClick={() => toggleWatchlist(repo)} className="p-2 rounded-md hover:bg-white/10 transition-all"><Bookmark className={cn("h-3.5 w-3.5", watchlist.has(String(repo.id)) ? "text-primary fill-primary" : "text-muted-foreground/40")} /></button>
                  </div>
                  
                  <h3 className="text-sm font-bold tracking-tight mb-1 truncate uppercase text-white">{repo.name}</h3>
                  <div className="flex items-center gap-2 mb-4">
                    {repo.language && <><div className={cn("w-1.5 h-1.5 rounded-full", langColors[repo.language] || "bg-muted")} /><span className="text-[8px] font-bold uppercase text-muted-foreground/60 tracking-widest">{repo.language}</span></>}
                  </div>

                  <p className="text-[11px] text-muted-foreground/80 font-medium line-clamp-3 mb-6 leading-relaxed italic flex-1">
                      {repo.description || "Source code architecture and implementation details for optimized environment management."}
                  </p>

                  <div className="flex items-center justify-between pt-4 border-t border-white/5">
                      <a href={repo.html_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-[8px] font-bold uppercase tracking-widest text-primary hover:opacity-70 transition-all">Source <ExternalLink className="h-3 w-3" /></a>
                      <div className="flex gap-3 scale-90">
                         <div className="flex items-center gap-1 text-white"><span className="text-xs font-bold">{repo.stargazers_count}</span><p className="text-[7px] font-bold uppercase text-muted-foreground/40 mt-0.5">S</p></div>
                         <div className="flex items-center gap-1 text-white"><span className="text-xs font-bold">{repo.forks_count}</span><p className="text-[7px] font-bold uppercase text-muted-foreground/40 mt-0.5">F</p></div>
                      </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="py-24 text-center flex flex-col items-center justify-center max-w-md mx-auto opacity-40 filter grayscale">
             <Github className="h-12 w-12 mb-6 text-white" />
             <p className="text-[10px] font-bold uppercase tracking-widest leading-relaxed text-white">System awaiting GitHub identity authorization for index population.</p>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Portfolio;
