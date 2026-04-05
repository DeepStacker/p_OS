import React from "react";
import { motion, useDragControls } from "framer-motion";
import { X, GripVertical } from "lucide-react";
import { useSystem } from "@/contexts/SystemContext";
import { cn } from "@/lib/utils";

interface BaseWidgetProps {
  id: string;
  x: number;
  y: number;
  children: React.ReactNode;
  className?: string;
}

const BaseWidget: React.FC<BaseWidgetProps> = ({ id, x, y, children, className }) => {
  const { removeWidget, updateWidgetPosition } = useSystem();
  const dragControls = useDragControls();

  return (
    <motion.div
      drag
      dragControls={dragControls}
      dragListener={false}
      dragMomentum={false}
      dragElastic={0}
      initial={false}
      animate={{ x, y }}
      onDragEnd={(_, info) => {
        updateWidgetPosition(id, x + info.offset.x, y + info.offset.y);
      }}
      className={cn(
        "absolute z-[20] group select-none pointer-events-auto",
        className
      )}
    >
      {/* Widget Controls Overlay */}
      <div className="absolute -top-2 -right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-50">
        <button 
          onPointerDown={(e) => dragControls.start(e)}
          className="p-1.5 rounded-full bg-zinc-900/80 border border-white/10 text-white/40 hover:text-white cursor-grab active:cursor-grabbing"
        >
          <GripVertical className="h-3 w-3" />
        </button>
        <button 
          onClick={() => removeWidget(id)}
          className="p-1.5 rounded-full bg-rose-500/80 border border-white/10 text-white hover:bg-rose-600 transition-colors"
        >
          <X className="h-3 w-3" />
        </button>
      </div>

      {children}
    </motion.div>
  );
};

export default BaseWidget;
