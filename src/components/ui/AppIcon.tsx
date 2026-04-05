import React from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { AppCategory } from "@/contexts/SystemContext";

interface AppIconProps {
  icon: LucideIcon;
  category: AppCategory;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  glow?: boolean;
}

const AppIcon: React.FC<AppIconProps> = ({ 
  icon: Icon, 
  category, 
  size = "md", 
  className,
  glow = true
}) => {
  const categoryStyles: Record<AppCategory, string> = {
    system: "bg-gradient-to-br from-blue-500 to-indigo-700 shadow-blue-500/20",
    web: "bg-gradient-to-br from-cyan-400 to-teal-600 shadow-cyan-400/20",
    media: "bg-gradient-to-br from-fuchsia-500 to-purple-800 shadow-fuchsia-500/20",
    productivity: "bg-gradient-to-br from-amber-400 to-orange-600 shadow-amber-400/20",
    pro: "bg-gradient-to-br from-slate-400 to-slate-800 shadow-slate-400/20"
  };

  const sizeStyles = {
    sm: "h-8 w-8 rounded-lg p-1.5",
    md: "h-12 w-12 rounded-xl p-2.5",
    lg: "h-16 w-16 rounded-2xl p-3.5",
    xl: "h-24 w-24 rounded-[32px] p-6"
  };

  const iconSizes = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
    xl: "h-12 w-12"
  };

  return (
    <div className={cn(
      "relative group transition-all duration-500 flex items-center justify-center",
      sizeStyles[size],
      categoryStyles[category],
      glow && "shadow-2xl",
      "border border-white/20",
      className
    )}>
      {/* Inner Highlight (Bezel Effect) */}
      <div className="absolute inset-[1px] rounded-[inherit] bg-gradient-to-br from-white/30 to-transparent pointer-events-none opacity-50" />
      
      {/* Glassmorphic Frosting */}
      <div className="absolute inset-0 rounded-[inherit] backdrop-blur-[2px] opacity-20 pointer-events-none" />

      {/* Glyph */}
      <Icon className={cn(
        iconSizes[size], 
        "text-white filter drop-shadow-md z-10 group-hover:scale-110 transition-transform duration-500"
      )} />

      {/* Ambient Outer Glow */}
      {glow && (
        <div className={cn(
          "absolute inset-0 rounded-[inherit] blur-2xl opacity-0 group-hover:opacity-40 transition-opacity duration-700 pointer-events-none",
          categoryStyles[category].split(' ').find(c => c.startsWith('bg-'))
        )} />
      )}
    </div>
  );
};

export default AppIcon;
