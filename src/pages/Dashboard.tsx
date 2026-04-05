import React, { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Activity, 
  Database, 
  Cpu, 
  ShieldCheck, 
  Clock, 
  LayoutDashboard,
  Server,
  Sparkles,
  BrainCircuit,
  Zap,
  Fingerprint,
  Globe,
  Bell,
  ArrowUpRight,
  TrendingUp
} from "lucide-react";
import { useSystem } from "@/contexts/SystemContext";
import { cn } from "@/lib/utils";

const Dashboard = () => {
  const { metrics, logs, batteryLevel } = useSystem();
  
  const stats = [
    { label: "Neural Load", value: `${metrics.cpu}%`, icon: Cpu, color: "text-primary", sub: "Core_Threads_Active", glow: "shadow-primary/20" },
    { label: "VFS Registry", value: `${metrics.ram}GB`, icon: Database, color: "text-blue-500", sub: "Buffer_Synchronized", glow: "shadow-blue-500/20" },
    { label: "Traffic Index", value: `${metrics.network}MB/s`, icon: Activity, color: "text-purple-500", sub: "Latency_24ms", glow: "shadow-purple-500/20" },
    { label: "Energy Flux", value: `${batteryLevel}%`, icon: Zap, color: "text-amber-500", sub: "Time_Remaining:_4h 12m", glow: "shadow-amber-500/20" },
  ];

  const aiInsights = useMemo(() => [
     { title: "Cognitive Sync", value: "Optimal", desc: "System-wide neural pathways are operating within 92% efficiency parameters.", icon: BrainCircuit },
     { title: "Market Volatility", value: "Low", desc: "Job market indices suggest a 14% increase in 'AI Architect' demand.", icon: TrendingUp },
     { title: "Identity Shield", value: "Verified", desc: "Biometric and session-based encryption layers are fully operational.", icon: Fingerprint },
  ], []);

  return (
    <div className="p-10 space-y-12 h-full overflow-y-auto custom-scrollbar bg-black/40 backdrop-blur-3xl font-sans selection:bg-primary/20">
      
      {/* High-Fidelity Intelligence Header */}
      <div className="flex flex-col xl:flex-row items-end justify-between gap-10 pb-10 border-b border-white/5">
        <div className="space-y-6">
          <motion.div 
             initial={{ opacity: 0, x: -10 }} 
             animate={{ opacity: 1, x: 0 }}
             className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20"
          >
             <Sparkles className="h-3.5 w-3.5 text-primary" />
             <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Sequoia_Intelligence_Kernel_v2.5</span>
          </motion.div>
          <div className="space-y-4">
            <h1 className="text-5xl font-black tracking-tighter text-white/90 uppercase leading-none italic">Intelligence <br/> Overview</h1>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600 italic">Global telemetry and proactive system diagnostic registry.</p>
          </div>
        </div>
        
        <div className="flex gap-6">
           <div className="flex items-center gap-6 bg-white/[0.02] px-8 py-6 rounded-[40px] border border-white/5 shadow-3xl hover:bg-white/[0.04] transition-all group">
              <div className="h-12 w-12 rounded-[20px] bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shadow-xl group-hover:scale-110 transition-transform">
                 <ShieldCheck className="h-6 w-6 text-emerald-500" />
              </div>
              <div className="flex flex-col">
                 <span className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-600 mb-1">System_Health</span>
                 <span className="text-xl font-black uppercase tracking-tight text-white/90 italic">Operational Stable</span>
              </div>
           </div>
        </div>
      </div>

      {/* Neural Performance Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="group relative"
          >
             <div className={cn("absolute inset-0 blur-3xl opacity-0 group-hover:opacity-20 transition-opacity", stat.glow)} />
             <Card className="bg-white/[0.02] border border-white/5 rounded-[48px] p-10 hover:bg-white/[0.04] transition-all relative overflow-hidden shadow-3xl flex flex-col h-full active:scale-[0.98]">
                <div className="absolute top-0 right-0 p-10 opacity-[0.03] group-hover:opacity-10 transition-opacity pointer-events-none text-white"><stat.icon className="h-32 w-32" /></div>
                
                <div className="flex items-center justify-between mb-10 relative z-10">
                   <div className={cn("w-14 h-14 rounded-3xl bg-white/5 flex items-center justify-center border border-white/5 shadow-xl", stat.color)}>
                      <stat.icon className="h-6 w-6" />
                   </div>
                   <div className="flex gap-1">
                      {[1,2,3,4].map(j => <div key={j} className={cn("w-1.5 h-6 rounded-full bg-white/5", j <= 3 && "bg-white/20")} />)}
                   </div>
                </div>

                <div className="space-y-4 relative z-10">
                   <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.4em] italic">{stat.label}</p>
                   <p className="text-4xl font-black text-white/90 tracking-tighter tabular-nums">{stat.value}</p>
                   <p className="text-[9px] font-black text-zinc-700 uppercase tracking-[0.2em]">{stat.sub}</p>
                </div>
             </Card>
          </motion.div>
        ))}
      </div>

      {/* Proactive Intelligence & Kernel Flux */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-12">
        
        {/* Proactive Intelligence Feed */}
        <div className="xl:col-span-2 space-y-8">
           <header className="flex items-center justify-between px-4">
              <div className="flex items-center gap-3">
                 <BrainCircuit className="h-5 w-5 text-primary opacity-60" />
                 <h3 className="text-[11px] font-black text-zinc-500 uppercase tracking-[0.4em]">Proactive Intelligence Insights</h3>
              </div>
              <button className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-primary hover:brightness-125 transition-all">Deep Audit <ArrowUpRight className="h-3.5 w-3.5" /></button>
           </header>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {aiInsights.map((insight, i) => (
                 <motion.div 
                   key={insight.title}
                   initial={{ opacity: 0, x: -10 }}
                   animate={{ opacity: 1, x: 0 }}
                   transition={{ delay: 0.5 + (i * 0.1) }}
                   className="p-8 rounded-[40px] bg-white/[0.02] border border-white/5 space-y-6 hover:bg-white/[0.04] transition-all group shadow-2xl"
                 >
                    <div className="flex items-center justify-between">
                       <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 text-primary shadow-xl"><insight.icon className="h-5 w-5" /></div>
                       <div className="px-4 py-1.5 rounded-full bg-black/40 border border-white/5 text-[9px] font-black text-white/40 uppercase tracking-widest">{insight.value}</div>
                    </div>
                    <div className="space-y-3">
                       <h4 className="text-lg font-black text-white/90 uppercase tracking-tight">{insight.title}</h4>
                       <p className="text-[11px] font-bold text-zinc-500 leading-relaxed italic">"{insight.desc}"</p>
                    </div>
                 </motion.div>
              ))}
              
              {/* Specialized Market Prediction Widget */}
              <div className="p-8 rounded-[40px] bg-primary/10 border border-primary/20 shadow-2xl flex flex-col justify-between group overflow-hidden relative">
                 <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity"><Zap className="h-32 w-32 text-primary" /></div>
                 <div>
                    <span className="text-[8px] font-black uppercase tracking-[0.4em] text-primary mb-2 block">Market_Predicive_Index</span>
                    <h4 className="text-2xl font-black text-white/90 uppercase tracking-tighter leading-8 italic">Synthesizing <br/> Opportunity Flow...</h4>
                 </div>
                 <div className="mt-8 flex items-center justify-between">
                    <div className="flex items-center gap-4 text-emerald-500">
                       <TrendingUp className="h-5 w-5" />
                       <span className="text-2xl font-black tabular-nums">+14.2%</span>
                    </div>
                    <button className="h-10 w-10 rounded-full bg-black/40 flex items-center justify-center border border-white/10 text-white/40 group-hover:text-primary transition-colors"><ChevronRight className="h-5 w-5" /></button>
                 </div>
              </div>
           </div>

           {/* Kernel Flux Monitor (Log Registry) */}
           <div className="space-y-6 pt-6">
              <h3 className="text-[11px] font-black text-zinc-500 uppercase tracking-[0.4em] px-4 italic">Kernel_Flux_Monitor</h3>
              <div className="bg-white/[0.02] border border-white/5 rounded-[48px] overflow-hidden shadow-3xl h-64 flex flex-col group">
                 <div className="p-10 space-y-6 overflow-y-auto no-scrollbar flex-1 mask-linear-bottom">
                    <AnimatePresence mode="popLayout">
                       {logs.slice(0, 10).map((log) => (
                          <motion.div 
                             key={log.id}
                             initial={{ opacity: 0, x: -10 }}
                             animate={{ opacity: 1, x: 0 }}
                             className="flex items-center justify-between p-6 rounded-3xl bg-black/40 border border-white/[0.02] hover:bg-white/5 transition-all group/item hover:border-white/5"
                          >
                             <div className="flex items-center gap-6">
                                <div className={cn(
                                   "h-10 w-10 rounded-xl flex items-center justify-center shadow-inner",
                                   log.status === 'success' ? "bg-emerald-500/10 text-emerald-500" : "bg-primary/10 text-primary"
                                )}>
                                   <Zap className="h-4 w-4" />
                                </div>
                                <div className="flex flex-col">
                                   <span className="text-[11px] font-black text-white/80 uppercase tracking-tighter group-hover/item:text-primary transition-colors">{log.action}</span>
                                   <span className="text-[8px] text-zinc-700 font-black uppercase tracking-[0.3em] mt-1">{log.time}_GMT_UTC</span>
                                </div>
                             </div>
                             <div className="flex items-center gap-3">
                                <span className="text-[8px] font-black uppercase tracking-widest text-zinc-800">Verified</span>
                                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
                             </div>
                          </motion.div>
                       ))}
                    </AnimatePresence>
                 </div>
              </div>
           </div>
        </div>

        {/* Global Security & Identity Vault */}
        <div className="space-y-8">
           <h3 className="text-[11px] font-black text-zinc-500 uppercase tracking-[0.4em] px-4">Neural Security Vault</h3>
           <div className="bg-white/[0.02] border border-white/5 rounded-[48px] p-10 flex flex-col items-center justify-center text-center space-y-12 h-full min-h-[600px] shadow-4xl relative overflow-hidden group">
              <div className="absolute inset-0 bg-primary/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
              
              <div className="relative">
                 <div className="absolute inset-0 bg-primary/20 blur-3xl animate-pulse" />
                 <div className="relative h-40 w-40 rounded-[56px] bg-black/40 border-2 border-primary/20 flex items-center justify-center shadow-4xl group-hover:rotate-6 transition-transform duration-700">
                    <ShieldCheck className="h-20 w-20 text-primary filter drop-shadow-2xl" />
                 </div>
              </div>

              <div className="space-y-4 relative z-10">
                 <h4 className="text-3xl font-black text-white/90 tracking-tighter uppercase italic">Neural Guard v4</h4>
                 <p className="text-[10px] text-zinc-600 font-black px-10 leading-relaxed uppercase tracking-[0.2em] italic">Encrypted session persistence and automated multi-layer identity verification operational.</p>
              </div>

              <div className="grid grid-cols-2 gap-4 w-full relative z-10">
                 <div className="p-4 rounded-3xl bg-black/40 border border-white/5 space-y-2">
                    <span className="text-[8px] font-black uppercase text-zinc-700 tracking-widest">Global Status</span>
                    <div className="text-sm font-black text-emerald-500 italic uppercase">Secure</div>
                 </div>
                 <div className="p-4 rounded-3xl bg-black/40 border border-white/5 space-y-2">
                    <span className="text-[8px] font-black uppercase text-zinc-700 tracking-widest">Encryption</span>
                    <div className="text-sm font-black text-primary italic uppercase">AES-256-X</div>
                 </div>
              </div>

              <button className="w-full h-16 rounded-[32px] bg-primary text-black font-black uppercase tracking-[0.3em] text-[10px] transition-all shadow-primary/20 shadow-2xl active:scale-95 hover:brightness-110 relative z-10">
                 Run Advanced Diagnostic
              </button>
           </div>
        </div>
      </div>
      
      {/* Global Metadata Footer */}
      <footer className="pt-10 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-10 opacity-20 filter grayscale hover:opacity-80 transition-all duration-700 pb-20">
         <div className="flex gap-12">
            <div className="flex flex-col gap-2">
               <span className="text-[9px] font-black uppercase tracking-widest text-zinc-600">Local_IP</span>
               <span className="text-[11px] font-black text-white/50 tracking-widest">192.168.1.104</span>
            </div>
            <div className="flex flex-col gap-2">
               <span className="text-[9px] font-black uppercase tracking-widest text-zinc-600">Sync_Node</span>
               <span className="text-[11px] font-black text-white/50 tracking-widest">ASIA-SOUTH-1</span>
            </div>
         </div>
         <div className="flex items-center gap-10">
            <div className="flex items-center gap-3">
               <Globe className="h-4 w-4 text-zinc-600" />
               <span className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-700">Sequoia Secure Mesh Active</span>
            </div>
            <div className="h-4 w-px bg-white/10" />
            <div className="text-[9px] font-black uppercase tracking-[0.5em] text-zinc-700">NODE_OS_v2.5_PRIME</div>
         </div>
      </footer>
    </div>
  );
};

export default Dashboard;
