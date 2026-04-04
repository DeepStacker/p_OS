import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { 
  LayoutDashboard, 
  Terminal, 
  Briefcase, 
  Folder, 
  CreditCard, 
  Clock as ClockIcon, 
  AppWindow, 
  FileText, 
  Settings as SettingsIcon,
  LucideIcon
} from "lucide-react";

export interface AppConfig {
  id: string;
  name: string;
  icon: LucideIcon;
  component: string;
}

type AccentColor = "blue" | "purple" | "pink" | "red" | "orange" | "yellow" | "green" | "gray";
type SubscriptionTier = "Standard" | "Professional" | "Enterprise";
export type SnapType = "none" | "full" | "left" | "right" | "center";

// --- Window Manager Types ---
export interface WindowState {
  id: string;
  title: string;
  icon: React.ReactNode;
  component: string; 
  isOpen: boolean;
  isMinimized: boolean;
  isMaximized: boolean;
  snapType: SnapType;
  zIndex: number;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}

// --- VFS Types ---
export interface VFSNode {
  name: string;
  type: "file" | "directory";
  content?: string;
  children?: Record<string, VFSNode>;
  updatedAt: number;
}

interface SystemLog {
  id: string;
  action: string;
  time: string;
  status: "success" | "info" | "warning" | "error";
}

interface SystemContextType {
  // Appearance & Identity
  accentColor: AccentColor;
  setAccentColor: (color: AccentColor) => void;
  showDesktopIcons: boolean;
  setShowDesktopIcons: (show: boolean) => void;
  subscriptionTier: SubscriptionTier;
  setSubscriptionTier: (tier: SubscriptionTier) => void;
  wallpaper: string;
  setWallpaper: (url: string) => void;
  hostname: string;
  setHostname: (name: string) => void;

  // Hardware States
  isWifiEnabled: boolean;
  setIsWifiEnabled: (enabled: boolean) => void;
  isBluetoothEnabled: boolean;
  setIsBluetoothEnabled: (enabled: boolean) => void;
  batteryLevel: number;
  isCharging: boolean;
  setIsCharging: (charging: boolean) => void;

  // Window Manager
  activeWindows: WindowState[];
  openWindow: (id: string, title: string, icon: React.ReactNode, component: string) => void;
  closeWindow: (id: string) => void;
  minimizeWindow: (id: string) => void;
  focusWindow: (id: string) => void;
  maximizeWindow: (id: string) => void;
  snapWindow: (id: string, type: SnapType) => void;
  updateWindowPosition: (id: string, x: number, y: number) => void;

  // Virtual File System (VFS)
  vfs: VFSNode;
  updateVFS: (newNode: VFSNode) => void;

  // Real-time Metrics
  metrics: { cpu: number; ram: number; network: number; };

  // System Logs
  logs: SystemLog[];
  addLog: (action: string, status?: SystemLog["status"]) => void;

  // App Registry
  dockApps: AppConfig[];
}

const SystemContext = createContext<SystemContextType | undefined>(undefined);

const initialVFS: VFSNode = {
  name: "root",
  type: "directory",
  updatedAt: Date.now(),
  children: {
    Users: {
      name: "Users",
      type: "directory",
      updatedAt: Date.now(),
      children: {
        node: {
          name: "node",
          type: "directory",
          updatedAt: Date.now(),
          children: {
            Documents: { name: "Documents", type: "directory", updatedAt: Date.now(), children: {} },
            Desktop: { name: "Desktop", type: "directory", updatedAt: Date.now(), children: {} },
            README: { name: "README", type: "file", content: "Welcome to Node OS Pro Terminal. Type 'help' to begin.", updatedAt: Date.now() }
          }
        }
      }
    },
    Applications: {
      name: "Applications",
      type: "directory",
      updatedAt: Date.now(),
      children: {
        "Dashboard.app": { name: "Dashboard.app", type: "file", content: "SYSTEM_EXEC", updatedAt: Date.now() },
        "Terminal.app": { name: "Terminal.app", type: "file", content: "SYSTEM_EXEC", updatedAt: Date.now() },
        "Settings.app": { name: "Settings.app", type: "file", content: "SYSTEM_EXEC", updatedAt: Date.now() }
      }
    },
    System: {
      name: "System",
      type: "directory",
      updatedAt: Date.now(),
      children: {
        Library: { name: "Library", type: "directory", updatedAt: Date.now(), children: {} }
      }
    }
  }
};

export const SystemProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // App Registry (Define first for state initializer)
  const dockApps: AppConfig[] = [
    { id: "finder", name: "Finder", icon: Folder, component: "finder" },
    { id: "dashboard", name: "Dashboard", icon: LayoutDashboard, component: "dashboard" },
    { id: "terminal", name: "Terminal", icon: Terminal, component: "terminal" },
    { id: "search", name: "Jobs", icon: Briefcase, component: "search" },
    { id: "portfolio", name: "Code", icon: Folder, component: "portfolio" },
    { id: "calculator", name: "Calc", icon: CreditCard, component: "calculator" },
    { id: "calendar", name: "Calendar", icon: ClockIcon, component: "calendar" },
    { id: "clock", name: "Clock", icon: AppWindow, component: "clock" },
    { id: "notes", name: "Notes", icon: FileText, component: "notes" },
    { id: "settings", name: "Setup", icon: SettingsIcon, component: "settings" },
  ];

  // Appearance & Identity
  const [accentColor, setAccentColor] = useState<AccentColor>(() => (localStorage.getItem("system_accent") as AccentColor) || "blue");
  const [showDesktopIcons, setShowDesktopIcons] = useState<boolean>(() => localStorage.getItem("show_desktop_icons") !== "false");
  const [subscriptionTier, setSubscriptionTier] = useState<SubscriptionTier>(() => (localStorage.getItem("system_tier") as SubscriptionTier) || "Standard");
  const [wallpaper, setWallpaper] = useState(() => localStorage.getItem("system_wallpaper") || "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?q=80&w=3474&auto=format&fit=crop");
  const [hostname, setHostname] = useState(() => localStorage.getItem("system_hostname") || "Node-MacBook-Pro");

  // Hardware State
  const [isWifiEnabled, setIsWifiEnabled] = useState(true);
  const [isBluetoothEnabled, setIsBluetoothEnabled] = useState(true);
  const [batteryLevel, setBatteryLevel] = useState(98);
  const [isCharging, setIsCharging] = useState(false);

  // Window Manager State (With Re-hydration)
  const [activeWindows, setActiveWindows] = useState<WindowState[]>(() => {
    const saved = localStorage.getItem("system_windows_layout");
    if (!saved) return [];
    try {
      const layout = JSON.parse(saved);
      return layout.map((win: any) => {
        const app = dockApps.find(a => a.id === win.id);
        if (!app) return null;
        return {
          ...win,
          title: app.name,
          icon: <app.icon className="h-4 w-4" />,
          component: app.component,
          isOpen: true
        };
      }).filter(Boolean);
    } catch { return []; }
  });
  const [maxZIndex, setMaxZIndex] = useState(100);

  // VFS State
  const [vfs, setVfs] = useState<VFSNode>(() => {
    const saved = localStorage.getItem("system_vfs");
    return saved ? JSON.parse(saved) : initialVFS;
  });

  // Metrics & Logs
  const [metrics, setMetrics] = useState({ cpu: 12, ram: 4.2, network: 1.2 });
  const [logs, setLogs] = useState<SystemLog[]>([]);

  // --- Window Actions ---
  const focusWindow = (id: string) => {
    setActiveWindows(prev => {
        const sorted = [...prev].sort((a, b) => b.zIndex - a.zIndex);
        const topZ = sorted.length > 0 ? sorted[0].zIndex : 100;
        return prev.map(w => w.id === id ? { ...w, zIndex: topZ + 1, isMinimized: false } : w);
    });
    setMaxZIndex(prev => prev + 1);
  };

  const openWindow = (id: string, title: string, icon: React.ReactNode, component: string) => {
    setActiveWindows(prev => {
      const existing = prev.find(w => w.id === id);
      if (existing) {
        // Toggle Logic: If it's already focused and not minimized, minimize it.
        const sorted = [...prev].sort((a, b) => b.zIndex - a.zIndex);
        const isFocused = sorted[0]?.id === id;
        
        if (isFocused && !existing.isMinimized) {
           return prev.map(w => w.id === id ? { ...w, isMinimized: true } : w);
        }
        
        // Use timeout-wrapped focus to ensure state consistency
        setTimeout(() => focusWindow(id), 0);
        return prev;
      }
      return [...prev, { id, title, icon, component, isOpen: true, isMinimized: false, isMaximized: false, snapType: "none", zIndex: maxZIndex + 1 }];
    });
    setMaxZIndex(prev => prev + 1);
  };

  const closeWindow = (id: string) => {
    setActiveWindows(prev => prev.filter(w => w.id !== id));
  };

  const minimizeWindow = (id: string) => {
    setActiveWindows(prev => prev.map(w => w.id === id ? { ...w, isMinimized: true } : w));
  };

  const maximizeWindow = (id: string) => {
     setActiveWindows(prev => prev.map(w => {
        if (w.id === id) {
           const nextMaximized = !w.isMaximized;
           return { ...w, isMaximized: nextMaximized, snapType: nextMaximized ? "full" : "none" };
        }
        return w;
     }));
  };

  const snapWindow = (id: string, type: SnapType) => {
    setActiveWindows(prev => prev.map(w => w.id === id ? { ...w, snapType: type, isMaximized: type !== "none" } : w));
    addLog(`Window Snapped: ${type}`, "info");
  };

  const updateWindowPosition = (id: string, x: number, y: number) => {
    setActiveWindows(prev => prev.map(w => w.id === id ? { ...w, x, y } : w));
  };

  const updateVFS = (newNode: VFSNode) => {
    setVfs(newNode);
    localStorage.setItem("system_vfs", JSON.stringify(newNode));
  };

  const addLog = useCallback((action: string, status: SystemLog["status"] = "info") => {
    const newLog: SystemLog = {
      id: Math.random().toString(36).substr(2, 9),
      action,
      time: "Just now",
      status
    };
    setLogs(prev => [newLog, ...prev].slice(0, 50));
  }, []);

  // System State Persistence
  useEffect(() => {
    localStorage.setItem("system_accent", accentColor);
    localStorage.setItem("show_desktop_icons", String(showDesktopIcons));
    localStorage.setItem("system_tier", subscriptionTier);
    localStorage.setItem("system_wallpaper", wallpaper);
    localStorage.setItem("system_hostname", hostname);
  }, [accentColor, showDesktopIcons, subscriptionTier, wallpaper, hostname]);

  // Window Layout Persistence
  useEffect(() => {
    const persistentWindows = activeWindows.map(w => ({
       id: w.id,
       x: w.x,
       y: w.y,
       width: w.width,
       height: w.height,
       isMaximized: w.isMaximized,
       isMinimized: w.isMinimized,
       snapType: w.snapType,
       zIndex: w.zIndex
    }));
    localStorage.setItem("system_windows_layout", JSON.stringify(persistentWindows));
  }, [activeWindows]);

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics({
        cpu: Math.floor(Math.random() * (15 - 5 + 1) + 5),
        ram: Number((Math.random() * (5.1 - 4.2) + 4.2).toFixed(1)),
        network: Number((Math.random() * (3.5 - 0.2) + 0.2).toFixed(1))
      });
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const drainInterval = setInterval(() => {
       setBatteryLevel(prev => {
          if (isCharging) return Math.min(prev + 1, 100);
          return Math.max(prev - 1, 0);
       });
    }, 120000); 
    return () => clearInterval(drainInterval);
  }, [isCharging]);

  return (
    <SystemContext.Provider value={{ 
      accentColor, setAccentColor,
      showDesktopIcons, setShowDesktopIcons,
      subscriptionTier, setSubscriptionTier,
      wallpaper, setWallpaper,
      hostname, setHostname,
      isWifiEnabled, setIsWifiEnabled,
      isBluetoothEnabled, setIsBluetoothEnabled,
      batteryLevel, isCharging, setIsCharging,
      activeWindows, openWindow, closeWindow, minimizeWindow, focusWindow, maximizeWindow, snapWindow, updateWindowPosition,
      vfs, updateVFS,
      metrics, logs, addLog,
      dockApps
    }}>
      {children}
    </SystemContext.Provider>
  );
};

export const useSystem = () => {
  const context = useContext(SystemContext);
  if (!context) throw new Error("useSystem must be used within a SystemProvider");
  return context;
};
