import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Navigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Terminal, ArrowLeft, ShieldCheck, Lock, UserCircle, ChevronRight, RotateCcw, Shield } from "lucide-react";
import { useSystem } from "@/contexts/SystemContext";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const Auth = () => {
  const { user, loading, signInWithGoogle } = useAuth();
  const { powerStatus, setPowerStatus, wallpaper, localPasscode } = useSystem();
  
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [passcodeAttempt, setPasscodeAttempt] = useState("");
  const [showPasscodeField, setShowPasscodeField] = useState(false);

  useEffect(() => {
    // Determine if we should show the passcode field for rapid resume
    if (localPasscode && (powerStatus === 'locked' || powerStatus === 'sleep')) {
       setShowPasscodeField(true);
    } else {
       setShowPasscodeField(false);
    }
  }, [localPasscode, powerStatus]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  // Handle standalone redirect (Cold Boot)
  if (user && !loading && powerStatus !== 'locked' && powerStatus !== 'sleep') {
    return <Navigate to="/" replace />;
  }

  const handleUnlock = async () => {
    if (isSigningIn) return;
    
    if (user && !showPasscodeField) {
      setPowerStatus('running');
    } else if (showPasscodeField) {
       // Validate Passcode
       if (passcodeAttempt === localPasscode) {
          toast.success("Identity Verified • Resuming Session");
          setPowerStatus('running');
       } else {
          toast.error("Invalid Passcode • Access Denied");
          setPasscodeAttempt("");
       }
    } else {
      setIsSigningIn(true);
      try {
        await signInWithGoogle();
        setPowerStatus('running');
      } catch (err) {
        console.error("Auth Error:", err);
      } finally {
        setIsSigningIn(false);
      }
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center p-6 font-sans overflow-hidden">
      {/* Immersive Blurred Background for Lock/Sleep Screen */}
      {(powerStatus === 'locked' || powerStatus === 'sleep') && (
        <motion.div 
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="absolute inset-0 z-0 bg-cover bg-center"
          style={{ backgroundImage: `url('${wallpaper}')`, filter: "blur(50px) brightness(0.5)" }}
        />
      )}

      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="z-10 flex flex-col items-center max-w-sm w-full"
      >
        {/* User Card */}
        <div className="flex flex-col items-center mb-10 text-center">
           <div className="w-24 h-24 rounded-full bg-white/10 backdrop-blur-3xl border border-white/20 p-1 mb-6 shadow-2xl relative group">
              <div className="absolute inset-0 rounded-full bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity" />
              <UserCircle className="w-full h-full text-white/40" />
           </div>
           <h2 className="text-2xl font-black tracking-tight text-white mb-2 uppercase italic">node_entity</h2>
           {(powerStatus === 'locked' || powerStatus === 'sleep') && (
              <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">Session Suspended</span>
           )}
        </div>

        {/* Dynamic Action Area: Passcode vs Google */}
        <AnimatePresence mode="wait">
          {showPasscodeField ? (
             <motion.div 
               key="passcode"
               initial={{ opacity: 0, scale: 0.9 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0, scale: 0.9 }}
               className="w-full space-y-4"
             >
                <div className="relative flex items-center bg-white/10 border border-white/10 rounded-2xl p-4 focus-within:border-primary/40 transition-all shadow-2xl">
                   <Shield className="h-5 w-5 text-white/20 mr-4" />
                   <input 
                     type="password"
                     autoFocus
                     placeholder="Enter Passcode"
                     className="bg-transparent border-none w-full text-sm font-black text-white tracking-[0.5em] focus:outline-none placeholder:tracking-widest placeholder:opacity-20"
                     value={passcodeAttempt}
                     onChange={(e) => setPasscodeAttempt(e.target.value)}
                     onKeyDown={(e) => e.key === 'Enter' && handleUnlock()}
                   />
                </div>
                <button 
                  onClick={handleUnlock}
                  className="w-full py-3 rounded-xl bg-primary text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-xl hover:brightness-110 active:scale-95 transition-all"
                >
                  Unlock Session
                </button>
                <button 
                  onClick={() => setShowPasscodeField(false)}
                  className="w-full py-2 text-[8px] font-black text-white/20 uppercase tracking-widest hover:text-white/40 transition-colors"
                >
                  Switch to Identity Provider
                </button>
             </motion.div>
          ) : (
            <motion.button
              key="google"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={handleUnlock}
              className="group relative w-72 h-14 rounded-2xl bg-white/10 hover:bg-white/20 backdrop-blur-3xl border border-white/10 flex items-center justify-between px-6 transition-all active:scale-95 shadow-2xl overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="flex items-center gap-4 z-10">
                 <svg className="h-5 w-5" viewBox="0 0 24 24">
                   <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="currentColor" />
                   <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="currentColor" />
                   <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="currentColor" />
                   <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="currentColor" />
                 </svg>
                 <span className="text-[12px] font-black uppercase tracking-widest text-white/80">
                    {powerStatus === 'locked' || powerStatus === 'sleep' ? 'Log In to Node' : 'Continue with Google'}
                 </span>
              </div>
              <div className={cn(
                 "h-8 w-8 rounded-lg flex items-center justify-center transition-all z-10",
                 (powerStatus === 'locked' || powerStatus === 'sleep') ? "bg-emerald-500/20 text-emerald-400 group-hover:bg-emerald-500/40" : "bg-primary/20 text-primary group-hover:bg-primary/40",
                 isSigningIn && "animate-pulse"
              )}>
                 {isSigningIn ? <div className="h-4 w-4 border-2 border-current border-t-transparent animate-spin rounded-full" /> : <ChevronRight className="h-5 w-5" />}
              </div>
            </motion.button>
          )}
        </AnimatePresence>

        {/* System Info */}
        <div className="mt-20 flex gap-10 opacity-30 text-white transition-all hover:opacity-100 duration-500">
           <div className="flex flex-col items-center gap-2">
              <ShieldCheck className="h-4 w-4" />
              <span className="text-[8px] font-black uppercase tracking-widest">Secure</span>
           </div>
           <div className="flex flex-col items-center gap-2">
              <Lock className="h-4 w-4" />
              <span className="text-[8px] font-black uppercase tracking-widest">Crypt</span>
           </div>
           <div className="flex flex-col items-center gap-2">
              <Terminal className="h-4 w-4" />
              <span className="text-[8px] font-black uppercase tracking-widest">Link</span>
           </div>
        </div>

        <p className="mt-16 text-[8px] font-black text-white/20 uppercase tracking-[0.4em] max-w-[240px] text-center leading-loose">
          Proprietary Spatial Environment • Authorized Use Only
        </p>
      </motion.div>

      {/* Footer Power Controls (Login Mode) */}
      {!user && (
         <div className="absolute bottom-12 flex gap-12 text-white/40">
             <button className="flex flex-col items-center gap-2 hover:text-white transition-colors group">
                <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-white/5"><RotateCcw className="h-4 w-4" /></div>
                <span className="text-[8px] font-black uppercase tracking-widest">Restart</span>
             </button>
             <button className="flex flex-col items-center gap-2 hover:text-white transition-colors group">
                <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-white/5"><Lock className="h-4 w-4" /></div>
                <span className="text-[8px] font-black uppercase tracking-widest">Sleep</span>
             </button>
         </div>
      )}
    </div>
  );
};

export default Auth;
