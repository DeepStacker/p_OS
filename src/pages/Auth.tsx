import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Navigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles, ArrowLeft, ShieldCheck, Zap } from "lucide-react";

const Auth = () => {
  const { user, loading, signInWithGoogle } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background mesh-bg">
        <div className="relative">
            <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full animate-pulse" />
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent relative z-10" />
        </div>
      </div>
    );
  }

  if (user) return <Navigate to="/dashboard" replace />;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6 mesh-bg relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
      
      <Link to="/" className="absolute top-8 left-8 flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors font-bold text-xs uppercase tracking-widest">
        <ArrowLeft className="h-4 w-4" /> Back to Base
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="glass-card rounded-[2.5rem] p-10 border-white/5 shadow-2xl relative overflow-hidden group">
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 blur-3xl rounded-full group-hover:bg-primary/20 transition-all duration-700" />
          
          <div className="relative z-10 text-center font-sans">
            <div className="mb-8 flex justify-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center shadow-inner">
                <Sparkles className="h-8 w-8 text-primary" />
              </div>
            </div>
            
            <h1 className="text-3xl font-black tracking-tighter uppercase mb-2">Initialize Session</h1>
            <p className="text-muted-foreground font-medium mb-10 leading-relaxed">
              Authenticate via Secure Neural Link to access your industrial freelance tools.
            </p>

            <Button
              onClick={signInWithGoogle}
              className="w-full h-14 rounded-2xl bg-white text-black hover:bg-white/90 font-black text-sm uppercase tracking-widest gap-4 shadow-xl shadow-white/5 transition-all active:scale-[0.98]"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Continue with Google
            </Button>

            <div className="mt-10 pt-8 border-t border-white/5 flex flex-col gap-3">
               <div className="flex items-center justify-center gap-2 opacity-50">
                    <ShieldCheck className="h-4 w-4 text-emerald-400" />
                    <span className="text-[10px] font-black uppercase tracking-widest">End-to-End Encryption</span>
               </div>
               <div className="flex items-center justify-center gap-2 opacity-30 group cursor-help transition-opacity hover:opacity-100">
                    <Zap className="h-3.5 w-3.5" />
                    <span className="text-[9px] font-black uppercase tracking-widest">Multi-Auth Node Sync</span>
               </div>
            </div>
            
            <p className="mt-8 text-[9px] font-bold text-muted-foreground/40 uppercase tracking-[0.2em] leading-relaxed max-w-[240px] mx-auto">
              By initializing, you confirm the 
              <Link to="#" className="text-muted-foreground/60 hover:text-primary mx-1 transition-colors underline decoration-dotted underline-offset-4">Protocols</Link> 
              and 
              <Link to="#" className="text-muted-foreground/60 hover:text-primary mx-1 transition-colors underline decoration-dotted underline-offset-4">Privacy Framework</Link>.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;
