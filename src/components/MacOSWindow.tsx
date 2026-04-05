import React, { useState } from "react";
import { motion, AnimatePresence, useDragControls } from "framer-motion";
import { X, Minus, Maximize2, Layout, Columns, LayoutPanelTop } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSystem, WindowState, SnapType } from "@/contexts/SystemContext";

interface MacOSWindowProps {
  window: WindowState;
  children: React.ReactNode;
}

const MacOSWindow: React.FC<MacOSWindowProps> = ({ 
  window,
  children
}) => {
  const { closeWindow, minimizeWindow, maximizeWindow, focusWindow, snapWindow, updateWindowPosition } = useSystem();
  const [showSnapMenu, setShowSnapMenu] = useState(false);
  const dragControls = useDragControls();

  const getSnapStyles = (type: SnapType) => {
    switch (type) {
      case "full":
        return {
          width: "calc(100vw - 32px)",
          height: "calc(100vh - 80px)",
          x: 16,
          y: 48,
          borderRadius: "14px 14px 0 0"
        };
      case "left":
        return {
          width: "calc(50vw - 20px)",
          height: "calc(100vh - 80px)",
          x: 16,
          y: 48,
          borderRadius: "14px 0 0 0"
        };
      case "right":
        return {
          width: "calc(50vw - 20px)",
          height: "calc(100vh - 80px)",
          x: "calc(50vw + 4px)",
          y: 48,
          borderRadius: "0 14px 0 0"
        };
      case "center":
        return {
          width: "calc(70vw)",
          height: "calc(80vh)",
          x: "15vw",
          y: "10vh",
          borderRadius: "14px"
        };
      default:
        return {
          width: window.width || "800px",
          height: window.height || "550px",
          x: window.x !== undefined ? window.x : 100, 
          y: window.y !== undefined ? window.y : 100,
          borderRadius: "14px"
        };
    }
  };

  const snapStyles = getSnapStyles(window.snapType);

  const handleDragEnd = (event: any, info: any) => {
    if (window.snapType === "none") {
       // Since we are using transforms for everything now, we just update the state
       const newX = (window.x || 0) + info.offset.x;
       const newY = (window.y || 0) + info.offset.y;
       updateWindowPosition(window.id, newX, newY);
    }
  };

  return (
    <motion.div
      drag={window.snapType === "none" && !window.isMaximized}
      dragControls={dragControls}
      dragListener={false}
      dragMomentum={false}
      dragElastic={0}
      dragConstraints={{ left: 0, right: 1200, top: 0, bottom: 800 }}
      onDragStart={() => focusWindow(window.id)}
      onDragEnd={handleDragEnd}
      onMouseDown={() => focusWindow(window.id)}
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ 
        opacity: 1, 
        scale: 1, 
        ...snapStyles,
        zIndex: window.zIndex
      }}
      exit={{ 
        opacity: 0, 
        scale: 0, 
        y: 600, // Genie accelerate to dock
        filter: "blur(20px)",
        transition: { duration: 0.5, ease: [0.32, 0, 0.67, 0] }
      }}
      transition={{ type: "spring", damping: 30, stiffness: 350 }}
      className={cn(
        "absolute flex flex-col overflow-hidden shadow-2xl backdrop-blur-3xl border border-white/10 group pointer-events-auto",
        window.snapType !== "none" ? "shadow-none" : "min-w-[600px] min-h-[400px]"
      )}
      style={{
        boxShadow: window.snapType === "none" ? `
          0 0 0 0.5px rgba(255, 255, 255, 0.1),
          0 20px 50px rgba(0, 0, 0, 0.4),
          0 0 40px rgba(255, 255, 255, 0.02)
        ` : "none"
      }}
    >
      <div 
        onPointerDown={(e) => dragControls.start(e)}
        className={cn(
          "h-10 flex items-center px-4 bg-zinc-900/30 border-b border-white/5 shrink-0 select-none cursor-default",
          window.snapType === "none" && !window.isMaximized && "cursor-grab active:cursor-grabbing"
        )}
      >
        <div className="flex gap-3 w-24 items-center">
          <button onClick={() => closeWindow(window.id)} className="w-3.5 h-3.5 rounded-full bg-[#FF5F57] border border-black/10 flex items-center justify-center group/btn">
             <X className="h-2 w-2 opacity-0 group-hover/btn:opacity-100 transition-opacity text-black/40" />
          </button>
          <button onClick={() => minimizeWindow(window.id)} className="w-3.5 h-3.5 rounded-full bg-[#FEBC2E] border border-black/10 flex items-center justify-center group/btn">
             <Minus className="h-2 w-2 opacity-0 group-hover/btn:opacity-100 transition-opacity text-black/40" />
          </button>
          <div className="relative" onMouseEnter={() => setShowSnapMenu(true)} onMouseLeave={() => setShowSnapMenu(false)}>
            <button onClick={() => maximizeWindow(window.id)} className="w-3.5 h-3.5 rounded-full bg-[#28C840] border border-black/10 flex items-center justify-center group/btn">
               <Maximize2 className="h-2 w-2 opacity-0 group-hover/btn:opacity-100 transition-opacity text-black/40" />
            </button>
            <AnimatePresence>
               {showSnapMenu && (
                 <motion.div initial={{ opacity: 0, y: 10, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.9 }} className="absolute top-6 left-0 w-48 bg-zinc-900/80 backdrop-blur-3xl border border-white/10 rounded-xl shadow-2xl p-2 z-[100] space-y-1">
                    <button onClick={() => { snapWindow(window.id, "full"); setShowSnapMenu(false); }} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-primary text-white transition-all group/item">
                       <Maximize2 className="h-3.5 w-3.5 text-primary group-hover/item:text-white" />
                       <span className="text-[10px] font-black uppercase tracking-widest">Fill Screen</span>
                    </button>
                    <div className="flex gap-1 h-12">
                       <button onClick={() => snapWindow(window.id, "left")} className="flex-1 bg-white/5 hover:bg-primary rounded-lg flex items-center justify-center transition-all"><Columns className="h-4 w-4 rotate-180" /></button>
                       <button onClick={() => snapWindow(window.id, "right")} className="flex-1 bg-white/5 hover:bg-primary rounded-lg flex items-center justify-center transition-all"><Columns className="h-4 w-4" /></button>
                    </div>
                    <button onClick={() => { snapWindow(window.id, "center"); setShowSnapMenu(false); }} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-primary text-white transition-all group/item">
                       <LayoutPanelTop className="h-3.5 w-3.5 text-primary group-hover/item:text-white" />
                       <span className="text-[10px] font-black uppercase tracking-widest">Center Focus</span>
                    </button>
                    <button onClick={() => { snapWindow(window.id, "none"); setShowSnapMenu(false); }} className="w-full text-center py-1 text-[9px] font-bold text-zinc-500 hover:text-white uppercase tracking-widest">Reset Layout</button>
                 </motion.div>
               )}
            </AnimatePresence>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center gap-2 opacity-100 pr-20" onPointerDown={(e) => dragControls.start(e)}>
          <div className="opacity-40">{window.icon}</div>
          <span className="text-[11px] font-black uppercase tracking-[0.2em] text-white/50">{window.title}</span>
        </div>
      </div>
      <div className="flex-1 overflow-auto custom-scrollbar relative bg-zinc-950/40">{children}</div>
    </motion.div>
  );
};

export default MacOSWindow;
