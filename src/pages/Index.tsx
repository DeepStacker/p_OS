import React from "react";
import { motion } from "framer-motion";
import { 
  Terminal, 
  Cpu, 
  Shield, 
  Zap,
  Info,
  ChevronRight,
  Monitor,
  Database,
  Lock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  const specs = [
    { icon: Cpu, label: "Distributed Engine", desc: "Multimodal processing across verified system nodes." },
    { icon: Monitor, label: "Glassmorphic UI", desc: "High-performance interface with optimized kernel renders." },
    { icon: Shield, label: "Secure Protocols", desc: "Encryption for all transaction and identity data." },
  ];

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-black font-sans">
      <div className="flex w-full max-w-5xl h-[600px] rounded-[32px] overflow-hidden border border-white/10 shadow-2xl bg-zinc-900/40 backdrop-blur-3xl animate-in fade-in zoom-in duration-700">
        {/* Left Section: Branding */}
        <div className="w-1/2 p-12 flex flex-col justify-between bg-zinc-950/20 border-r border-white/5">
          <div className="space-y-6">
            <motion.div 
               initial={{ opacity: 0, x: -20 }}
               animate={{ opacity: 1, x: 0 }}
               className="flex items-center gap-3 text-primary"
            >
               <Zap className="h-4 w-4 fill-primary" />
               <span className="text-[10px] font-black uppercase tracking-[0.3em]">System Live</span>
            </motion.div>
            
            <motion.h1 
               initial={{ opacity: 0, scale: 0.9 }}
               animate={{ opacity: 1, scale: 1 }}
               className="text-6xl font-black tracking-tighter text-white"
            >
               NODE <span className="text-primary italic">OS</span>
            </motion.h1>
            
            <p className="text-zinc-500 text-sm leading-relaxed font-bold">
               Universal operating environment for advanced market operations and distributed workspace management.
            </p>
          </div>

          <div className="space-y-2 pt-8 border-t border-white/5">
             <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-zinc-600">
                <span>Version: 1.0.8-STABLE</span>
                <span>Kernel: NODE_V16</span>
             </div>
             <div className="flex items-center gap-2">
                <div className="h-1 w-1 rounded-full bg-primary" />
                <span className="text-[10px] font-black uppercase tracking-widest text-primary">Verified Environment</span>
             </div>
          </div>
        </div>

        {/* Right Section: Specs */}
        <div className="w-1/2 p-12 bg-white/[0.02] space-y-10 flex flex-col justify-center">
           <h3 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500 text-right">System Specifications</h3>
           
           <div className="space-y-6">
              {specs.map((spec, i) => (
                <motion.div
                  key={spec.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-start gap-4 p-4 rounded-2xl hover:bg-white/5 transition-all group border border-transparent hover:border-white/5 shadow-sm"
                >
                  <div className="p-3 rounded-2xl bg-zinc-900/50 text-white/40 group-hover:text-primary transition-colors shadow-inner">
                     <spec.icon className="h-5 w-5" />
                  </div>
                  <div className="space-y-1">
                     <h4 className="text-sm font-bold text-white/90">{spec.label}</h4>
                     <p className="text-[11px] text-zinc-500 font-medium leading-normal">{spec.desc}</p>
                  </div>
                </motion.div>
              ))}
           </div>

           <div className="pt-6">
              <Button 
                onClick={() => navigate("/")}
                className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest gap-3 shadow-2xl group active:scale-95 transition-all"
              >
                Continue to Desktop
                <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
