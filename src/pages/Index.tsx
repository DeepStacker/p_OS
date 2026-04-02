import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles, FileText, FolderGit2, Zap, ArrowRight, CheckCircle2, Star, ShieldCheck } from "lucide-react";
import Navbar from "@/components/Navbar";

const features = [
  {
    icon: FileText,
    title: "AI Proposal Architect",
    description: "Multi-model orchestration generates persuasive, tailored proposals in seconds.",
  },
  {
    icon: FolderGit2,
    title: "Curation Lab",
    description: "Sync your GitHub. Export stunning, interactive portfolios automatically.",
  },
  {
    icon: Zap,
    title: "Real-time Job Radar",
    description: "Industrial scanning of global markets with AI-priority filtering.",
  },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-background selection:bg-primary/30 selection:text-primary-foreground">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden mesh-bg">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 bg-primary/10 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="container relative mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest mb-8">
              <Sparkles className="h-3.5 w-3.5" />
              Intelligence Driven Freelancing
            </div>
            
            <h1 className="text-5xl md:text-8xl font-black tracking-tighter mb-8 leading-[0.9]">
              SCALE YOUR <br />
              <span className="text-gradient">EMPIRE.</span>
            </h1>
            
            <p className="max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground font-medium mb-10 leading-relaxed">
              The only AI-powered Operating System for elite freelancers. 
              Architect professional proposals and curate stunning portfolios in one unified ecosystem.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/auth">
                <Button size="lg" className="h-14 px-8 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-black text-lg gap-3 shadow-[0_20px_50px_-12px_rgba(16,185,129,0.4)] hover:scale-[1.02] transition-all">
                  Get Started <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link to="/auth">
                <Button variant="ghost" size="lg" className="h-14 px-8 rounded-full font-bold text-lg border border-white/5 bg-white/5 hover:bg-white/10 backdrop-blur-sm">
                  Watch Demo
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Social Proof */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 1 }}
            className="mt-20 flex flex-wrap justify-center items-center gap-10 opacity-40 grayscale pointer-events-none"
          >
            <div className="flex items-center gap-2 font-display font-bold text-2xl uppercase tracking-tighter">Github</div>
            <div className="flex items-center gap-2 font-display font-bold text-2xl uppercase tracking-tighter">Adzuna</div>
            <div className="flex items-center gap-2 font-display font-bold text-2xl uppercase tracking-tighter">Razorpay</div>
            <div className="flex items-center gap-2 font-display font-bold text-2xl uppercase tracking-tighter">OpenRouter</div>
          </motion.div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="container mx-auto px-6 py-24">
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.8 }}
              className="group glass-card p-10 rounded-3xl hover:border-primary/40 transition-all duration-500"
            >
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500">
                <feature.icon className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-4 tracking-tight group-hover:text-primary transition-colors">
                {feature.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-24 border-y border-white/5 bg-black/20 overflow-hidden relative">
        <div className="container mx-auto px-6 flex flex-col lg:flex-row items-center justify-between gap-12">
          <div className="max-w-xl">
            <h2 className="text-4xl font-black tracking-tighter mb-6 leading-tight">
              DESIGNED FOR THE <br />
              <span className="text-gradient uppercase">1% OF FREELANCERS.</span>
            </h2>
            <p className="text-muted-foreground text-lg font-medium leading-relaxed mb-8">
              Don't settle for static text. Use the same tools internal recruitment teams use to scan, match, and win high-ticket contracts.
            </p>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                <span className="font-semibold">Firebase Multi-Auth Security</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                <span className="font-semibold">Llama 3.3 Optimized Drafting</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                <span className="font-semibold">Vault Pro Revision Storage</span>
              </div>
            </div>
          </div>
          
          <div className="relative w-full max-w-lg">
            <div className="absolute inset-0 bg-primary/20 blur-[100px] rounded-full pointer-events-none" />
            <div className="relative glass-card p-8 rounded-3xl border-white/10 shadow-2xl">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <Star className="h-6 w-6 text-emerald-400" />
                </div>
                <div>
                  <h4 className="font-bold">Verified Professional</h4>
                  <p className="text-xs text-muted-foreground">Top Rated Freelancer on Upwork</p>
                </div>
              </div>
              <p className="italic text-lg font-medium text-foreground mb-4">
                "Proposal Pro doubled my win rate in 3 weeks. The Curation Lab is a game changer for my technical portfolio."
              </p>
              <div className="flex items-center gap-2 text-primary">
                <ShieldCheck className="h-4 w-4" />
                <span className="text-[10px] font-bold uppercase tracking-widest leading-none">Security Verified Engineering</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 border-t border-white/5 opacity-80">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-3">
            <Sparkles className="h-6 w-6 text-primary" />
            <span className="font-display font-black text-2xl tracking-tighter">PROPOSAL PRO.</span>
          </div>
          <div className="flex items-center gap-8 text-xs font-bold uppercase tracking-widest text-muted-foreground">
            <Link to="#" className="hover:text-primary transition-colors">Twitter</Link>
            <Link to="#" className="hover:text-primary transition-colors">GitHub</Link>
            <Link to="#" className="hover:text-primary transition-colors">Privacy</Link>
            <Link to="#" className="hover:text-primary transition-colors">Terms</Link>
          </div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">
            Built by Antigravity AI © 2026
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
