import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RotateCcw, Power, Terminal } from "lucide-react";
import { useSystem } from "@/contexts/SystemContext";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

const PowerOverlay: React.FC = () => {
  const { powerStatus, setPowerStatus } = useSystem();
  const { signOut } = useAuth();
  const [showBootLogo, setShowBootLogo] = useState(false);

  // Restart Sequence
  useEffect(() => {
    if (powerStatus === "restart") {
      setShowBootLogo(true);
      
      // Force sign out on restart/boot for cold start simulation
      signOut();

      const timer = setTimeout(() => {
        setShowBootLogo(false);
        setPowerStatus("running");
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [powerStatus, setPowerStatus, signOut]);

  if (powerStatus === "running" || powerStatus === "locked") return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center">
      <AnimatePresence mode="wait">
        {/* Sleep Mode: Click to Wake */}
        {powerStatus === "sleep" && (
          <motion.div
            key="sleep"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black cursor-none"
            onClick={() => setPowerStatus("locked")}
          >
             {/* Subtle indicator for the developer/user */}
             <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/5 text-[9px] font-black uppercase tracking-[0.4em]">
                System Suspended • Click to Resume
             </div>
          </motion.div>
        )}

        {/* Shut Down Mode: Reboot to Restart */}
        {powerStatus === "shutdown" && (
          <motion.div
            key="shutdown"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black flex flex-col items-center justify-center"
          >
             <motion.div
               initial={{ scale: 0.9, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               transition={{ delay: 0.5 }}
               className="flex flex-col items-center gap-6"
             >
                <div className="w-16 h-16 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center shadow-2xl">
                   <Power className="h-8 w-8 text-white/20" />
                </div>
                <button
                  onClick={() => setPowerStatus("restart")}
                  className="px-6 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-white/40 text-[10px] font-black uppercase tracking-widest transition-all"
                >
                  Restart System
                </button>
             </motion.div>
          </motion.div>
        )}

        {/* Restart Mode: Boot Logo */}
        {powerStatus === "restart" && (
          <motion.div
            key="restart"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black flex items-center justify-center"
          >
             <AnimatePresence>
                {showBootLogo && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.1 }}
                    className="flex flex-col items-center gap-4"
                  >
                     <Terminal className="h-16 w-16 text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]" />
                     <div className="h-1 w-32 bg-white/10 rounded-full overflow-hidden mt-8">
                        <motion.div
                          initial={{ x: "-100%" }}
                          animate={{ x: "0%" }}
                          transition={{ duration: 3, ease: "easeInOut" }}
                          className="h-full w-full bg-white"
                        />
                     </div>
                  </motion.div>
                )}
             </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PowerOverlay;
