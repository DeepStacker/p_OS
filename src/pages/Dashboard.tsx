import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Activity, 
  Database, 
  Cpu, 
  ShieldCheck, 
  Clock, 
  LayoutDashboard,
  Server
} from "lucide-react";
import { useSystem } from "@/contexts/SystemContext";
import { cn } from "@/lib/utils";

const Dashboard = () => {
  const { metrics, logs, batteryLevel } = useSystem();
  
  const stats = [
    { label: "CPU Usage", value: `${metrics.cpu}%`, icon: Cpu, color: "text-[#34C759]", sub: "Kernel Threads Active" },
    { label: "Memory", value: `${metrics.ram}GB / 16GB`, icon: Database, color: "text-[#007AFF]", sub: "Swap: 512MB" },
    { label: "Network", value: `${metrics.network}MB/s`, icon: Activity, color: "text-[#AF52DE]", sub: "Latency: 24ms" },
    { label: "Energy Index", value: `${batteryLevel}%`, icon: Clock, color: "text-[#FF9500]", sub: "Time Remaining: 4h 12m" },
  ];

  return (
    <div className="p-8 space-y-12 h-full overflow-y-auto custom-scrollbar bg-black/40 backdrop-blur-3xl">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-1">
          <motion.div 
             initial={{ opacity: 0, x: -10 }} 
             animate={{ opacity: 1, x: 0 }}
             className="flex items-center gap-2 text-primary font-black uppercase tracking-[0.3em] text-[10px]"
          >
             <Server className="h-4 w-4" />
             Node Engine Sequoia v1.0.8
          </motion.div>
          <h1 className="text-4xl font-black tracking-tighter text-white">System Environment</h1>
          <p className="text-zinc-500 font-medium italic text-sm">Hardware index and kernel registry monitoring.</p>
        </div>
        
        <div className="flex gap-4">
           <div className="flex items-center gap-3 bg-white/5 px-6 py-4 rounded-[28px] border border-white/5 shadow-inner">
              <div className="h-5 w-5 rounded-full bg-[#34C759] animate-pulse shadow-[0_0_12px_#34C759]" />
              <div className="flex flex-col">
                 <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Node Cluster Status</span>
                 <span className="text-[12px] font-black uppercase tracking-widest text-white/90">Verified Stable</span>
              </div>
           </div>
        </div>
      </div>

      {/* Live Performance Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-zinc-900/40 backdrop-blur-3xl border border-white/10 rounded-[32px] p-8 hover:bg-zinc-900/60 transition-all group relative overflow-hidden shadow-2xl"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="flex items-center justify-between mb-8 relative z-10">
              <div className={cn("p-4 rounded-3xl bg-white/5 shadow-inner border border-white/5", stat.color)}>
                <stat.icon className="h-6 w-6" />
              </div>
              <div className="flex gap-1">
                 {[1,2,3].map(j => <div key={j} className={cn("w-1 h-3 rounded-full bg-white/10", j <= 2 && "bg-white/40")} />)}
              </div>
            </div>
            <div className="space-y-2 relative z-10">
              <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">{stat.label}</p>
              <div className="flex items-baseline gap-2">
                 <p className="text-3xl font-black text-white tracking-tighter">{stat.value}</p>
              </div>
              <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">{stat.sub}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Kernel Registry Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between px-2">
             <h3 className="text-[11px] font-black text-zinc-500 uppercase tracking-[0.3em]">Kernel Event Registry</h3>
             <span className="px-3 py-1 rounded-full bg-white/5 text-[9px] font-black uppercase text-zinc-600 border border-white/5 tracking-widest">Real-time Indexing</span>
          </div>
          
          <div className="bg-zinc-900/40 backdrop-blur-3xl border border-white/10 rounded-[40px] overflow-hidden shadow-2xl h-[400px] flex flex-col">
            <div className="p-8 space-y-4 overflow-y-auto custom-scrollbar flex-1">
              <AnimatePresence mode="popLayout">
                {logs.map((log) => (
                  <motion.div 
                    key={log.id} 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center justify-between p-5 bg-white/5 rounded-3xl hover:bg-white/10 transition-all border border-transparent hover:border-white/10 shadow-sm group"
                  >
                    <div className="flex items-center gap-5">
                      <div className={cn(
                         "h-12 w-12 rounded-[20px] flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform",
                         log.status === 'success' ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" : 
                         log.status === 'warning' ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" : 
                         "bg-blue-500/10 text-blue-500 border border-blue-500/20"
                      )}>
                        {log.status === 'success' ? <ShieldCheck className="h-6 w-6" /> : <Activity className="h-6 w-6" />}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-black text-white/90 uppercase tracking-tight">{log.action}</span>
                        <span className="text-[10px] text-zinc-600 font-black uppercase tracking-widest">{log.time}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-[11px] font-black text-zinc-500 uppercase tracking-[0.3em] px-2">Security Vault</h3>
          <div className="bg-zinc-900/40 backdrop-blur-3xl border border-white/10 rounded-[40px] p-8 flex flex-col items-center justify-center text-center space-y-10 h-[400px] shadow-2xl relative overflow-hidden group">
             <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-primary/10 to-transparent" />
             <div className="relative h-32 w-32 rounded-[40px] bg-primary/10 border-2 border-primary/20 flex items-center justify-center shadow-2xl transform group-hover:rotate-6 transition-transform">
               <ShieldCheck className="h-16 w-16 text-primary filter drop-shadow-2xl" />
             </div>
             <div className="space-y-3 relative z-10">
               <h4 className="text-xl font-black text-white tracking-tighter uppercase">Guard Active</h4>
               <p className="text-xs text-zinc-500 font-bold px-4 leading-relaxed uppercase tracking-wider opacity-60">System-wide encryption and identity protection operational.</p>
             </div>
             <button className="w-full py-5 rounded-[24px] bg-white/5 hover:bg-white/10 text-[10px] font-black uppercase tracking-[0.3em] transition-all border border-white/10 shadow-2xl active:scale-95 group-hover:border-primary/40">
                Initialize Scan
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
