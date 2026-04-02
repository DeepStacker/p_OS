import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { motion, AnimatePresence } from "framer-motion";
import { Users, FileText, Activity, Shield, ArrowUpRight, Search, Zap, Database, Clock, BarChart3 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, limit } from "firebase/firestore";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from "recharts";
import { cn } from "@/lib/utils";

interface GlobalActivity {
  id: string;
  type: string;
  action: string;
  timestamp: any;
  userId: string;
}

const AdminDashboard = () => {
  const [stats, setStats] = useState({ proposals: 0, watchlist: 0, users: 0 });
  const [activity, setActivity] = useState<GlobalActivity[]>([]);
  const [proposals, setProposals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Global Proposals Stream
    const unsubProp = onSnapshot(collection(db, "proposals"), (snap) => {
        const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data({ serverTimestamps: 'estimate' }) }));
        setProposals(data);
        setStats(prev => ({ ...prev, proposals: snap.size }));
        setLoading(false);
    });
    
    // Global Activity Logs Stream
    const unsubAct = onSnapshot(
      query(collection(db, "activity_logs"), limit(50)), 
      (snap) => {
        const docs = snap.docs.map(doc => ({ 
            id: doc.id, 
            ...doc.data({ serverTimestamps: 'estimate' }) 
        })) as GlobalActivity[];
        
        const sorted = docs.sort((a, b) => {
            const dA = a.timestamp?.toDate?.() || new Date();
            const dB = b.timestamp?.toDate?.() || new Date();
            return dB.getTime() - dA.getTime();
        });
        
        setActivity(sorted);
        const uniqueUsers = new Set(docs.map(doc => doc.userId));
        setStats(prev => ({ ...prev, users: uniqueUsers.size }));
    });

    const unsubWatch = onSnapshot(collection(db, "watchlist"), (snap) => {
        setStats(prev => ({ ...prev, watchlist: snap.size }));
    });

    return () => {
        unsubProp();
        unsubAct();
        unsubWatch();
    };
  }, []);

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

  const displayStats = [
    { label: "Global AI Nodes", value: stats.proposals, icon: Users, trend: "+Global", color: "text-primary" },
    { label: "Archived Proposals", value: stats.proposals, icon: FileText, trend: "Live", color: "text-emerald-400" },
    { label: "Active Operators", value: stats.users, icon: Activity, trend: "Stable", color: "text-blue-400" },
    { label: "Security Layer", value: "ACTIVE", icon: Shield, trend: "Defiant", color: "text-red-400" },
  ];

  return (
    <div className="min-h-screen bg-background selection:bg-primary/30 font-sans mesh-bg relative overflow-hidden">
      <Navbar />
      
      <div className="absolute top-0 left-0 w-[1000px] h-[1000px] bg-emerald-500/[0.03] blur-[160px] rounded-full pointer-events-none" />

      <main className="container mx-auto px-6 pt-32 pb-20 relative z-10">
        <div className="flex flex-col lg:flex-row items-end justify-between gap-8 mb-16">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
             <Badge className="mb-4 bg-emerald-500/10 text-emerald-400 border-emerald-500/20 px-4 py-1.5 rounded-full uppercase font-black text-[10px] tracking-widest shadow-lg shadow-emerald-500/5">System Overlord</Badge>
             <div className="flex items-center gap-4 mb-2">
              <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase leading-none">Admin <br /><span className="text-emerald-400">Overlord.</span></h1>
            </div>
            <p className="text-muted-foreground font-medium text-lg ml-1 opacity-60 uppercase tracking-[0.2em] text-[10px]">Real-time Global Tactical Telemetry</p>
          </motion.div>
          
          <div className="flex items-center gap-3">
             <div className="p-4 rounded-3xl glass-card border-white/5 text-center min-w-[140px] shadow-2xl bg-white/[0.02]">
                <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-1.5 opacity-60">Network</p>
                <div className="flex items-center justify-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
                    <span className="text-xs font-black uppercase tracking-widest text-emerald-400">Broadcasting</span>
                </div>
             </div>
          </div>
        </div>

        {/* Global Stats Grid */}
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4 mb-16">
          {displayStats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="glass-card p-10 rounded-[2.5rem] border-white/5 group hover:border-emerald-500/40 transition-all duration-500 relative overflow-hidden shadow-2xl">
                <div className="absolute top-8 right-8 p-3 rounded-2xl bg-white/5 border border-white/10 group-hover:scale-110 transition-transform">
                  <stat.icon className={cn("h-6 w-6", stat.color)} />
                </div>
                <div className="relative z-10">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 mb-2">{stat.label}</p>
                    <div className="flex items-baseline gap-2">
                        <h3 className="text-5xl font-black tracking-tighter leading-none">{stat.value}</h3>
                        <Badge variant="outline" className="border-none text-[8px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-500/10 h-5">{stat.trend}</Badge>
                    </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Global Velocity Chart */}
        <div className="grid gap-10 lg:grid-cols-3 mb-16">
            <Card className="lg:col-span-2 glass-card p-12 rounded-[2.5rem] border-white/5 shadow-2xl relative overflow-hidden bg-white/[0.01]">
                <div className="flex items-center justify-between mb-12">
                  <div>
                    <h3 className="text-2xl font-black uppercase tracking-tight">Global Extraction Velocity</h3>
                    <p className="text-sm text-muted-foreground font-medium">Network-wide generation nodes over 7 cycles</p>
                  </div>
                  <Badge variant="outline" className="px-5 py-2 border-emerald-500/20 text-emerald-400 uppercase font-black text-[10px] tracking-widest bg-emerald-500/5">Telemetry Active</Badge>
                </div>
                
                <div className="h-[350px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="colorAdmin" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="day" stroke="#4b5563" fontSize={10} tickLine={false} axisLine={false} style={{ fontWeight: '900', textTransform: 'uppercase' }} />
                      <YAxis stroke="#4b5563" fontSize={10} tickLine={false} axisLine={false} style={{ fontWeight: '900' }} />
                      <Tooltip 
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="glass-card p-6 rounded-2xl border-white/5 shadow-2xl bg-background/80 backdrop-blur-xl">
                                <p className="text-[10px] font-black uppercase text-muted-foreground/60 mb-2 tracking-widest border-b border-white/5 pb-2">{payload[0].payload.day}</p>
                                <p className="text-3xl font-black text-emerald-400 tracking-tighter">{payload[0].value} <span className="text-[10px] uppercase text-emerald-400/60 ml-2 tracking-widest">Global Artifacts</span></p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Area type="monotone" dataKey="count" stroke="#10b981" strokeWidth={5} fillOpacity={1} fill="url(#colorAdmin)" animationDuration={2000} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
            </Card>

            {/* Global Activity Feed */}
            <Card className="glass-card p-10 rounded-[2.5rem] border-white/5 shadow-2xl relative overflow-hidden flex flex-col h-full bg-white/[0.01]">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h3 className="text-xl font-black uppercase tracking-tight">Global System Logs</h3>
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">Multi-Operator Telemetry</p>
                    </div>
                </div>
                
                <div className="space-y-6 flex-1 overflow-y-auto max-h-[400px] pr-2 custom-scrollbar">
                    <AnimatePresence>
                        {activity.map((log, i) => (
                            <motion.div 
                                key={log.id} 
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="flex items-start gap-4 group"
                            >
                                <div className={cn(
                                    "w-1.5 h-1.5 rounded-full mt-1.5 shrink-0",
                                    log.type === 'VAULT_SAVE' ? 'bg-emerald-400' :
                                    log.type === 'MARKET_SCAN' ? 'bg-blue-400' : 'bg-primary'
                                )} />
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-foreground/80 leading-none group-hover:text-emerald-400 transition-colors">
                                            {log.type.replace('_', ' ')}
                                        </p>
                                        <Badge variant="outline" className="text-[7px] p-0 px-1 border-white/5 opacity-40 font-black tracking-tighter">{log.userId.slice(0, 5)}</Badge>
                                    </div>
                                    <p className="text-[11px] font-medium text-muted-foreground/60 leading-tight"> {log.action} </p>
                                    <p className="text-[9px] font-bold text-muted-foreground/20 italic"> {new Date(log.timestamp?.toDate?.() || Date.now()).toLocaleTimeString()} </p>
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

        {/* Global Node Registry (Table) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-[3rem] border-white/5 overflow-hidden shadow-2xl relative bg-white/[0.01]"
        >
          <div className="p-12 pb-8 border-b border-white/5 flex items-center justify-between">
             <div>
                <h2 className="text-3xl font-black uppercase tracking-tighter mb-1">Global Node Registry</h2>
                <p className="text-[10px] font-black uppercase text-muted-foreground/40 tracking-widest">Active Industrial System Operators</p>
             </div>
             <Badge variant="outline" className="px-5 py-2 border-emerald-500/20 text-emerald-400 font-black uppercase tracking-widest text-[9px] bg-emerald-500/5">Network Stream Live</Badge>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left bg-white/[0.02]">
                  <th className="px-12 py-8 text-[11px] font-black uppercase tracking-widest text-muted-foreground/50 border-b border-white/5">Identity Node</th>
                  <th className="px-12 py-8 text-[11px] font-black uppercase tracking-widest text-muted-foreground/50 border-b border-white/5">Local Archive Volume</th>
                  <th className="px-12 py-8 text-[11px] font-black uppercase tracking-widest text-muted-foreground/50 border-b border-white/5">Tier Status</th>
                  <th className="px-12 py-8 text-[11px] font-black uppercase tracking-widest text-muted-foreground/50 border-b border-white/5">Heartbeat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {/* Dynamic Table from global users - using the activity list to identify unique IDs */}
                {[...new Set(activity.map(a => a.userId))].map((uid, i) => (
                  <tr key={uid} className="group hover:bg-white/[0.03] transition-colors">
                    <td className="px-12 py-10">
                        <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center font-black text-xs text-emerald-400 group-hover:scale-110 transition-transform uppercase">
                            {uid.slice(0, 2)}
                        </div>
                        <div>
                            <p className="text-sm font-black text-foreground uppercase tracking-tight">Operator_{uid.slice(0, 4)}</p>
                            <p className="text-[10px] text-muted-foreground/60 font-bold uppercase tracking-widest mt-1">Node Hash: {uid}</p>
                        </div>
                        </div>
                    </td>
                    <td className="px-12 py-10">
                        <div className="flex items-baseline gap-1">
                            <span className="text-lg font-black text-foreground/80">{activity.filter(a => a.userId === uid).length}</span>
                            <span className="text-[10px] font-black uppercase text-muted-foreground/30">Operations</span>
                        </div>
                    </td>
                    <td className="px-12 py-10">
                        <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/20 font-black text-[9px] px-4 py-1.5 uppercase tracking-widest">Active Node</Badge>
                    </td>
                    <td className="px-12 py-10">
                        <div className="flex items-center gap-3">
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
                        <span className="text-[10px] font-black uppercase text-emerald-400 tracking-widest leading-none">Broadcasting</span>
                        </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="p-10 pt-6 border-t border-white/5 text-center">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">
              Admin Overlord Module v9.4.0 • Enterprise Industrial Mesh Registry
            </p>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default AdminDashboard;
