import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, Award, Zap, Clock, ExternalLink, ChevronRight, BarChart3, Database, Layers, Sparkles, FolderLock, Trash2, Star, Github, Search } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from "recharts";
import { useAuth } from "@/contexts/AuthContext";
import { db, logActivity } from "@/lib/firebase";
import { collection, query, where, onSnapshot, deleteDoc, doc } from "firebase/firestore";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

interface Proposal {
  id: string;
  jobDescription: string;
  skills: string;
  rate: string;
  content: string;
  createdAt: any;
}

interface WatchlistJob {
  id: string;
  jobId: string;
  title: string;
  company: string;
  location: string;
  url: string;
  addedAt: any;
  type?: "REPO" | "JOB";
}

interface ActivityLog {
  id: string;
  type: string;
  action: string;
  timestamp: any;
}

const Dashboard = () => {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [watchlist, setWatchlist] = useState<WatchlistJob[]>([]);
  const [activity, setActivity] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!user) return;

    // Real-time Proposals Signal (Resilient Mode)
    const unsubProp = onSnapshot(
      query(collection(db, "proposals"), where("userId", "==", user.uid)),
      (snap) => {
        const data = snap.docs.map(doc => ({ 
          id: doc.id, 
          ...doc.data({ serverTimestamps: 'estimate' }) 
        })) as Proposal[];
        setProposals(data.sort((a, b) => {
          const dA = a.createdAt?.toDate?.() || new Date();
          const dB = b.createdAt?.toDate?.() || new Date();
          return dB.getTime() - dA.getTime();
        }));
        setLoading(false);
      }
    );

    // Real-time Watchlist Signal
    const unsubWatch = onSnapshot(
      query(collection(db, "watchlist"), where("userId", "==", user.uid)),
      (snap) => {
        const data = snap.docs.map(doc => ({ 
          id: doc.id, 
          ...doc.data({ serverTimestamps: 'estimate' }) 
        })) as WatchlistJob[];
        setWatchlist(data.sort((a, b) => {
          const dA = a.addedAt?.toDate?.() || new Date();
          const dB = b.addedAt?.toDate?.() || new Date();
          return dB.getTime() - dA.getTime();
        }));
      }
    );

    // Real-time Activity Logs
    const unsubAct = onSnapshot(
      query(collection(db, "activity_logs"), where("userId", "==", user.uid)),
      (snap) => {
        const data = snap.docs.map(doc => ({ 
          id: doc.id, 
          ...doc.data({ serverTimestamps: 'estimate' }) 
        })) as ActivityLog[];
        setActivity(data.sort((a, b) => {
          const dA = a.timestamp?.toDate?.() || new Date();
          const dB = b.timestamp?.toDate?.() || new Date();
          return dB.getTime() - dA.getTime();
        }));
      }
    );

    return () => {
      unsubProp();
      unsubWatch();
      unsubAct();
    };
  }, [user]);

  const deleteProposal = async (id: string) => {
    try {
      await deleteDoc(doc(db, "proposals", id));
      toast.success("Industrial Archive purged.");
    } catch (err) {
      toast.error("Deletion node failed.");
    }
  };

  const removeFromWatchlist = async (id: string) => {
    try {
      await deleteDoc(doc(db, "watchlist", id));
      toast.success("Priority Lead decommissioned.");
    } catch (err) {
      toast.error("Resource de-sync failed.");
    }
  };

  const exportToJSON = (p: Proposal) => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(p, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute("href", dataStr);
    dlAnchor.setAttribute("download", `proposal_${p.id.slice(0, 8)}.json`);
    document.body.appendChild(dlAnchor);
    dlAnchor.click();
    dlAnchor.remove();
    toast.success("Industrial Artifact exported to disk.");
  };

  const filteredProposals = proposals.filter(p => 
    p.jobDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.skills.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredWatchlist = watchlist.filter(w => 
    w.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    w.company.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const chartData = proposals.length > 0 ? Array.from({ length: 7 }).map((_, i) => {
    const day = new Date();
    day.setDate(day.getDate() - (6 - i));
    const dayStr = day.toLocaleDateString('en-US', { weekday: 'short' });
    const count = proposals.filter(p => {
      const pDate = p.createdAt?.toDate?.() || new Date();
      return pDate.toLocaleDateString() === day.toLocaleDateString();
    }).length;
    return { day: dayStr, count };
  }) : [
    { day: "Mon", count: 0 }, { day: "Tue", count: 0 }, { day: "Wed", count: 0 }, 
    { day: "Thu", count: 0 }, { day: "Fri", count: 0 }, { day: "Sat", count: 0 }, { day: "Sun", count: 0 }
  ];

  const stats = [
    { label: "Proposals Generated", value: proposals.length, icon: Zap, color: "text-primary" },
    { label: "Total Archives", value: watchlist.length + proposals.length, icon: Database, color: "text-emerald-400" },
    { label: "Synchronized Watchlist", value: watchlist.length, icon: Star, color: "text-blue-400" },
  ];

  return (
    <div className="min-h-screen bg-background selection:bg-primary/30 mesh-bg relative overflow-hidden">
      <Navbar />
      
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/5 blur-[160px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none" />

      <main className="container mx-auto px-6 pt-40 pb-20 relative z-10">
        <div className="flex flex-col md:flex-row items-end justify-between gap-8 mb-16">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20 px-4 py-1.5 rounded-full uppercase font-black text-[10px] tracking-widest shadow-lg shadow-primary/5">Operator Command Center</Badge>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase leading-none">
                System <br />
                <span className="text-gradient">Telemetry.</span>
            </h1>
          </motion.div>
          
          <div className="flex items-center gap-3">
             <div className="p-4 rounded-3xl glass-card border-white/5 text-center min-w-[140px] shadow-2xl">
                <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-1.5 opacity-60">Status</p>
                <div className="flex items-center justify-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
                    <span className="text-xs font-black uppercase tracking-widest text-emerald-400">Online</span>
                </div>
             </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={(val) => { setActiveTab(val); setSearchQuery(""); }} className="space-y-12">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <TabsList className="bg-white/5 border border-white/10 p-1.5 rounded-full inline-flex h-auto max-w-full overflow-x-auto shadow-2xl">
                <TabsTrigger value="overview" className="rounded-full px-10 py-3 font-black uppercase tracking-[0.15em] text-[10px] data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all">
                <BarChart3 className="h-3.5 w-3.5 mr-2" /> Overview
                </TabsTrigger>
                <TabsTrigger value="vault" className="rounded-full px-10 py-3 font-black uppercase tracking-[0.15em] text-[10px] data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all">
                <FolderLock className="h-3.5 w-3.5 mr-2" /> Proposal Archive
                </TabsTrigger>
                <TabsTrigger value="priority" className="rounded-full px-10 py-3 font-black uppercase tracking-[0.15em] text-[10px] data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all">
                <Star className="h-3.5 w-3.5 mr-2" /> Global Watchlist
                </TabsTrigger>
            </TabsList>

            {activeTab !== "overview" && (
                <div className="max-w-md w-full relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
                    <Input 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={`Search ${activeTab === 'vault' ? 'Archives' : 'Watchlist'}...`}
                        className="h-12 pl-12 rounded-2xl bg-white/5 border-white/10 focus:ring-primary/40 focus:border-primary/40 transition-all shadow-xl"
                    />
                </div>
            )}
          </div>

          <TabsContent value="overview">
            <div className="grid gap-10 lg:grid-cols-3 mb-10">
              {stats.map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Card className="glass-card p-10 rounded-[2.5rem] border-white/5 flex flex-col justify-center h-full hover:border-primary/30 transition-all group relative overflow-hidden shadow-2xl">
                    <div className="absolute top-8 right-8 p-3 rounded-2xl bg-white/5 border border-white/10 group-hover:scale-110 transition-transform">
                      <stat.icon className={cn("h-6 w-6", stat.color)} />
                    </div>
                    <div className="relative z-10">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 mb-2">{stat.label}</p>
                        <h2 className="text-5xl font-black tracking-tighter leading-none">{stat.value}</h2>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>

            <div className="grid gap-10 lg:grid-cols-3">
              <Card className="lg:col-span-2 glass-card p-12 rounded-[2.5rem] border-white/5 shadow-2xl relative overflow-hidden text-card-foreground">
                <div className="flex items-center justify-between mb-12">
                  <div>
                    <h3 className="text-2xl font-black uppercase tracking-tight">Industrial Velocity</h3>
                    <p className="text-sm text-muted-foreground font-medium">Generation performance over last 7 cycles</p>
                  </div>
                  <Badge variant="outline" className="px-5 py-2 border-primary/20 text-primary uppercase font-black text-[10px] tracking-widest bg-primary/5">Real-time Stream</Badge>
                </div>
                
                <div className="h-[350px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis 
                        dataKey="day" 
                        stroke="#4b5563" 
                        fontSize={10} 
                        tickLine={false} 
                        axisLine={false} 
                        style={{ fontWeight: '900', textTransform: 'uppercase' }}
                      />
                      <YAxis 
                        stroke="#4b5563" 
                        fontSize={10} 
                        tickLine={false} 
                        axisLine={false} 
                        tickFormatter={(v) => `${v}`}
                        style={{ fontWeight: '900' }}
                      />
                      <Tooltip 
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="glass-card p-6 rounded-2xl border-white/5 shadow-2xl bg-background/80 backdrop-blur-xl">
                                <p className="text-[10px] font-black uppercase text-muted-foreground/60 mb-2 tracking-widest border-b border-white/5 pb-2">{payload[0].payload.day}</p>
                                <p className="text-3xl font-black text-emerald-400 tracking-tighter">{payload[0].value} <span className="text-[10px] uppercase text-emerald-400/60 ml-2 tracking-widest">Nodes</span></p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="count" 
                        stroke="#10b981" 
                        strokeWidth={5}
                        fillOpacity={1} 
                        fill="url(#colorCount)" 
                        animationDuration={2000}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              <Card className="glass-card p-10 rounded-[2.5rem] border-white/5 shadow-2xl relative overflow-hidden flex flex-col h-full">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h3 className="text-xl font-black uppercase tracking-tight">System Logs</h3>
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">Industrial Telemetry</p>
                    </div>
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
                </div>
                
                <div className="space-y-6 flex-1 overflow-y-auto max-h-[400px] pr-2 custom-scrollbar">
                    <AnimatePresence>
                        {activity.slice(0, 15).map((log, i) => (
                            <motion.div 
                                key={log.id} 
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className="flex items-start gap-4 group"
                            >
                                <div className={cn(
                                    "w-1.5 h-1.5 rounded-full mt-1.5 shrink-0",
                                    log.type === 'VAULT_SAVE' ? 'bg-emerald-400' :
                                    log.type === 'MARKET_SCAN' ? 'bg-blue-400' : 
                                    log.type === 'PROPOSAL_GEN' ? 'bg-primary' : 'bg-white/20'
                                )} />
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-foreground/80 leading-none group-hover:text-primary transition-colors">
                                        {log.type.replace('_', ' ')}
                                    </p>
                                    <p className="text-[11px] font-medium text-muted-foreground/60 leading-tight">
                                        {log.action}
                                    </p>
                                    <p className="text-[9px] font-bold text-muted-foreground/20 italic">
                                        {new Date(log.timestamp?.toDate?.() || Date.now()).toLocaleTimeString()}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                    {activity.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-full opacity-20 py-20 grayscale">
                            <Clock className="h-10 w-10 mb-4" />
                            <p className="text-[9px] font-black uppercase tracking-[0.2em]">Synchronizing Logs...</p>
                        </div>
                    )}
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="vault">
            <div className="grid gap-8 grid-cols-1 md:grid-cols-2">
                <AnimatePresence>
                  {filteredProposals.map((p, i) => (
                    <motion.div 
                        key={p.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ delay: i * 0.05 }}
                    >
                        <Card className="glass-card border-white/5 rounded-[2.5rem] p-10 h-full flex flex-col group hover:border-primary/40 transition-all overflow-hidden relative shadow-2xl">
                           <div className="flex items-center justify-between mb-8">
                             <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
                                   <Database className="h-4 w-4 text-emerald-400 opacity-60" />
                                </div>
                                <div>
                                    <p className="text-[9px] font-black uppercase text-muted-foreground/40 tracking-widest leading-none mb-1">Archive ID</p>
                                    <p className="text-[10px] font-black tracking-widest opacity-80 uppercase leading-none">{p.id.slice(0, 8)}</p>
                                </div>
                             </div>
                             <button onClick={() => deleteProposal(p.id)} className="p-2.5 rounded-xl bg-red-400/5 border border-red-400/10 hover:bg-red-400/10 transition-all">
                                <Trash2 className="h-4 w-4 text-red-500/60" />
                             </button>
                           </div>

                           <h3 className="text-xl font-black tracking-tighter uppercase mb-2 line-clamp-1 group-hover:text-primary transition-colors">
                              {p.jobDescription.slice(0, 50)}...
                           </h3>
                           <p className="text-[10px] font-black uppercase text-muted-foreground/40 tracking-[0.2em] mb-10 border-b border-white/5 pb-4">
                              Skills: {p.skills}
                           </p>

                           <div className="prose prose-invert prose-emerald text-sm text-muted-foreground line-clamp-4 font-medium leading-relaxed mb-10 flex-1">
                              {p.content}
                           </div>

                           <div className="flex gap-3">
                               <Dialog>
                                   <DialogTrigger asChild>
                                       <Button className="flex-1 h-12 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-black uppercase tracking-widest text-[9px] gap-2 transition-all shadow-xl">
                                           Launch Archive <ExternalLink className="h-3 w-3" />
                                       </Button>
                                   </DialogTrigger>
                                   <DialogContent className="max-w-4xl max-h-[85vh] glass-card border-white/10 rounded-[3rem] p-0 overflow-hidden shadow-2xl">
                                       <DialogHeader className="p-10 pb-6 border-b border-white/5">
                                           <div className="flex items-center justify-between">
                                               <div>
                                                   <DialogTitle className="text-3xl font-black uppercase tracking-tighter mb-1 font-black">Proposal Artifact</DialogTitle>
                                                   <DialogDescription className="text-[10px] font-black uppercase text-muted-foreground/40 tracking-widest">Archive Node: {p.id}</DialogDescription>
                                               </div>
                                               <Button onClick={() => exportToJSON(p)} variant="outline" className="h-10 rounded-xl border-white/10 bg-white/5 font-black uppercase text-[9px] tracking-widest gap-2 hover:bg-emerald-500/10 hover:text-emerald-400 hover:border-emerald-500/20 transition-all">
                                                   <Database className="h-3.5 w-3.5" /> Export Artifact
                                               </Button>
                                           </div>
                                       </DialogHeader>
                                       <ScrollArea className="p-10 pt-6 h-[400px]">
                                           <div className="prose prose-invert prose-emerald max-w-none">
                                               <div className="text-base text-foreground/90 font-mono whitespace-pre-wrap leading-relaxed">
                                                   {p.content}
                                               </div>
                                           </div>
                                       </ScrollArea>
                                       <DialogFooter className="p-10 pt-6 border-t border-white/5 bg-white/[0.02]">
                                           <div className="w-full flex items-center justify-between gap-4">
                                               <div className="hidden md:block">
                                                   <p className="text-[9px] font-black uppercase text-muted-foreground/40 tracking-widest leading-none mb-1">Target Profile</p>
                                                   <p className="text-[10px] font-black tracking-widest text-foreground/60 uppercase">{p.skills}</p>
                                               </div>
                                               <Button onClick={() => { navigator.clipboard.writeText(p.content); toast.success("Copied to industrial buffer."); }} className="h-12 px-10 rounded-xl bg-primary font-black uppercase text-[10px] tracking-widest">Copy to Buffer</Button>
                                           </div>
                                       </DialogFooter>
                                   </DialogContent>
                               </Dialog>
                           </div>
                        </Card>
                    </motion.div>
                  ))}
                  {filteredProposals.length === 0 && !loading && (
                    <div className="col-span-full py-40 text-center opacity-40">
                         <FolderLock className="h-16 w-16 mx-auto mb-8 opacity-20" />
                         <h3 className="text-2xl font-black uppercase tracking-tighter mb-2">{searchQuery ? "No Matches" : "Archive Empty"}</h3>
                         <p className="text-[10px] font-black uppercase tracking-widest">{searchQuery ? `Signal mismatch for "${searchQuery}"` : "No saved proposals found in your industrial archive."}</p>
                    </div>
                  )}
                </AnimatePresence>
            </div>
          </TabsContent>

          <TabsContent value="priority">
            <div className="grid gap-8 grid-cols-1 md:grid-cols-2">
                <AnimatePresence>
                  {filteredWatchlist.map((job, i) => (
                    <motion.div 
                        key={job.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ delay: i * 0.05 }}
                    >
                        <Card className="glass-card border-white/5 rounded-[2.5rem] p-10 h-full flex flex-col group hover:border-primary/40 transition-all overflow-hidden relative shadow-2xl">
                           <div className="flex items-center justify-between mb-8">
                              <div className="flex items-center gap-3">
                                 <div className={cn(
                                     "w-10 h-10 rounded-xl flex items-center justify-center",
                                     job.type === 'REPO' ? "bg-emerald-500/10" : "bg-primary/10"
                                 )}>
                                    {job.type === 'REPO' ? <Github className="h-4 w-4 text-emerald-400" /> : <Sparkles className="h-4 w-4 text-primary" />}
                                 </div>
                                 <div>
                                     <p className="text-[9px] font-black uppercase text-muted-foreground/40 tracking-widest leading-none mb-1">{job.type === 'REPO' ? "Repository Node" : "Source Verified"}</p>
                                     <p className="text-[10px] font-black tracking-widest opacity-80 uppercase leading-none">{new Date(job.addedAt?.toDate?.() || Date.now()).toLocaleDateString()}</p>
                                 </div>
                              </div>
                             <button onClick={() => removeFromWatchlist(job.id)} className="p-2.5 rounded-xl bg-red-400/5 border border-red-400/10 hover:bg-red-400/10 transition-all">
                                <Trash2 className="h-4 w-4 text-red-500/60" />
                             </button>
                           </div>

                           <h3 className="text-xl font-black tracking-tighter uppercase mb-2 line-clamp-1 group-hover:text-primary transition-colors">
                              {job.title}
                           </h3>
                           <p className="text-[10px] font-black uppercase text-muted-foreground/40 tracking-[0.2em] mb-10 border-b border-white/5 pb-4">
                              Company: {job.company} • {job.location}
                           </p>

                           <Button asChild className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-black uppercase tracking-widest text-[9px] gap-2 transition-all shadow-xl">
                              <a href={job.url} target="_blank" rel="noopener noreferrer">
                                 Apply to Contract <ExternalLink className="h-3 w-3" />
                              </a>
                           </Button>
                        </Card>
                    </motion.div>
                  ))}
                  {filteredWatchlist.length === 0 && !loading && (
                    <div className="col-span-full py-40 text-center opacity-40">
                         <Star className="h-16 w-16 mx-auto mb-8 opacity-20" />
                         <h3 className="text-2xl font-black uppercase tracking-tighter mb-2">{searchQuery ? "No Matches" : "Watchlist Clear"}</h3>
                         <p className="text-[10px] font-black uppercase tracking-widest">{searchQuery ? `No signals found for "${searchQuery}"` : "No saved jobs or repositories in your global watchlist."}</p>
                    </div>
                  )}
                </AnimatePresence>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Dashboard;
