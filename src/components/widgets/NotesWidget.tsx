import React, { useState, useEffect } from "react";
import BaseWidget from "./BaseWidget";
import { FileText, Save } from "lucide-react";
import { cn } from "@/lib/utils";

const NotesWidget: React.FC<{ id: string; x: number; y: number }> = ({ id, x, y }) => {
  const [content, setContent] = useState(() => localStorage.getItem(`widget-note-${id}`) || "");
  const [isSaved, setIsSaved] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.setItem(`widget-note-${id}`, content);
      setIsSaved(true);
    }, 1000);
    return () => clearTimeout(timer);
  }, [content, id]);

  return (
    <BaseWidget id={id} x={x} y={y}>
      <div className="w-64 h-64 rounded-[40px] bg-[#FFD700]/90 backdrop-blur-3xl border border-[#FFD700]/20 p-8 flex flex-col shadow-2xl group-hover:scale-105 transition-transform duration-500 overflow-hidden relative rotate-1">
        {/* Paper Texture Overlay */}
        <div className="absolute inset-0 bg-white/5 opacity-40 pointer-events-none" />
        
        <header className="flex items-center justify-between mb-4 relative z-10">
           <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-black/40" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-black/30 italic">Sticky_Note</span>
           </div>
           <Save className={cn("h-3 w-3 transition-opacity", isSaved ? "opacity-20" : "opacity-100 text-black/60")} />
        </header>
        
        <textarea 
          value={content}
          onChange={(e) => { setContent(e.target.value); setIsSaved(false); }}
          placeholder="Jot down a neural nudge..."
          className="flex-1 bg-transparent border-none text-black/80 font-black text-sm italic placeholder:text-black/20 focus:outline-none resize-none custom-scrollbar relative z-10 selection:bg-black/10"
        />

        {/* Dynamic Folding Corner */}
        <div className="absolute bottom-[-10px] right-[-10px] w-12 h-12 bg-black/5 rounded-full blur-xl" />
      </div>
    </BaseWidget>
  );
};

export default NotesWidget;
