import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Download, Trash2, ExternalLink, Search, Star, Globe, 
  Terminal, Code, Database, FileText, Briefcase, 
  Layout, Palette, Shield, Zap, ChevronRight, Package,
  Check, Play, Grid, List, Filter
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSystem } from '@/contexts/SystemContext';

interface AppManifest {
  id: string;
  name: string;
  description: string;
  category: "development" | "productivity" | "media" | "utilities" | "web";
  icon: any;
  color: string;
  repo?: string;
  url?: string;
  type: "iframe" | "external";
  author: string;
  stars?: number;
  version: string;
}

const APP_CATALOG: AppManifest[] = [
  // Development
  { id: "vscode-web", name: "VS Code Web", description: "Full-featured code editor in the browser. Edit, debug, and build right from Node OS.", category: "development", icon: Code, color: "from-blue-500 to-blue-600", url: "https://vscode.dev", type: "external", author: "Microsoft", stars: 165000, version: "1.85" },
  { id: "github-dev", name: "GitHub Dev", description: "Open any GitHub repo in a web editor instantly. Read and edit code with full syntax highlighting.", category: "development", icon: Code, color: "from-gray-700 to-gray-800", url: "https://github.dev", type: "external", author: "GitHub", stars: 50000, version: "2.0" },
  { id: "stackblitz", name: "StackBlitz", description: "Full-stack web IDE powered by WebContainers. Run Node.js entirely in your browser.", category: "development", icon: Zap, color: "from-blue-400 to-indigo-500", url: "https://stackblitz.com", type: "external", author: "StackBlitz", stars: 12000, version: "2.0" },
  { id: "codesandbox", name: "CodeSandbox", description: "Cloud development platform. Create, share, and collaborate on web projects.", category: "development", icon: Package, color: "from-gray-600 to-gray-700", url: "https://codesandbox.io", type: "external", author: "CodeSandbox", stars: 13000, version: "3.0" },
  { id: "replit", name: "Replit", description: "Collaborative browser IDE supporting 50+ languages including Python, Node.js, Go, and more.", category: "development", icon: Terminal, color: "from-orange-500 to-orange-600", url: "https://replit.com", type: "external", author: "Replit", stars: 8000, version: "4.0" },
  
  // Productivity
  { id: "notion", name: "Notion", description: "All-in-one workspace for notes, docs, wikis, and project management.", category: "productivity", icon: FileText, color: "from-gray-800 to-black", url: "https://notion.so", type: "external", author: "Notion Labs", stars: 25000, version: "2024" },
  { id: "excalidraw", name: "Excalidraw", description: "Virtual whiteboard for sketching hand-drawn diagrams. Open source and free.", category: "productivity", icon: Palette, color: "from-violet-500 to-purple-600", url: "https://excalidraw.com", type: "iframe", author: "Excalidraw", stars: 62000, version: "0.17" },
  { id: "todoist", name: "Todoist", description: "Task management and to-do list app used by 30 million people.", category: "productivity", icon: Check, color: "from-red-500 to-red-600", url: "https://todoist.com", type: "external", author: "Doist", stars: 5000, version: "2024" },
  
  // Web
  { id: "vercel", name: "Vercel", description: "Deploy web projects with zero configuration. The platform for frontend developers.", category: "web", icon: Globe, color: "from-black to-gray-900", url: "https://vercel.com", type: "external", author: "Vercel", stars: 12000, version: "2024" },
  { id: "supabase", name: "Supabase Studio", description: "Open source Firebase alternative. Postgres database, Auth, Storage, and Realtime.", category: "web", icon: Database, color: "from-emerald-500 to-green-600", url: "https://supabase.com/dashboard", type: "external", author: "Supabase", stars: 68000, version: "2.0" },
  { id: "railway", name: "Railway", description: "Infrastructure platform for deploying apps. Postgres, Redis, and more in seconds.", category: "web", icon: Zap, color: "from-purple-600 to-indigo-700", url: "https://railway.app", type: "external", author: "Railway", stars: 5000, version: "2024" },
  
  // Utilities  
  { id: "jsoncrack", name: "JSON Crack", description: "Visualize JSON data as interactive graphs. Makes complex data structures easy to understand.", category: "utilities", icon: Layout, color: "from-amber-500 to-orange-500", url: "https://jsoncrack.com/editor", type: "iframe", author: "JSON Crack", stars: 29000, version: "2.0" },
  { id: "regex101", name: "Regex101", description: "Build, test, and debug regex patterns with real-time explanation and match info.", category: "utilities", icon: Search, color: "from-teal-500 to-cyan-600", url: "https://regex101.com", type: "external", author: "Regex101", stars: 3000, version: "2024" },
  { id: "devtools", name: "DevTools Tips", description: "Collection of useful tips and tricks for browser developer tools.", category: "utilities", icon: Shield, color: "from-sky-400 to-blue-500", url: "https://devtoolstips.org", type: "iframe", author: "Community", stars: 2000, version: "2024" },
  
  // Media
  { id: "photopea", name: "Photopea", description: "Advanced online photo editor. Works with PSD, XD, Sketch, and all major image formats.", category: "media", icon: Palette, color: "from-blue-600 to-blue-800", url: "https://www.photopea.com", type: "iframe", author: "Photopea", stars: 7000, version: "5.6" },
  { id: "figma", name: "Figma", description: "Collaborative interface design tool used by millions of designers worldwide.", category: "media", icon: Palette, color: "from-purple-500 to-pink-500", url: "https://figma.com", type: "external", author: "Figma (Adobe)", stars: 15000, version: "2024" },
];

const CATEGORIES = ["all", "development", "productivity", "web", "utilities", "media"] as const;

const AppStore = () => {
    const { addLog, openWindow } = useSystem();
    const [installedApps, setInstalledApps] = useState<string[]>(() => {
        const saved = localStorage.getItem("node_os_installed_apps");
        return saved ? JSON.parse(saved) : [];
    });
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState<typeof CATEGORIES[number]>("all");
    const [selectedApp, setSelectedApp] = useState<AppManifest | null>(null);
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

    const filteredApps = useMemo(() => {
        return APP_CATALOG.filter(app => {
            const matchSearch = !search || app.name.toLowerCase().includes(search.toLowerCase()) || app.description.toLowerCase().includes(search.toLowerCase());
            const matchCategory = category === "all" || app.category === category;
            return matchSearch && matchCategory;
        });
    }, [search, category]);

    const installApp = (app: AppManifest) => {
        const updated = [...installedApps, app.id];
        setInstalledApps(updated);
        localStorage.setItem("node_os_installed_apps", JSON.stringify(updated));
        addLog(`Installed: ${app.name}`, "success");
    };

    const uninstallApp = (appId: string) => {
        const updated = installedApps.filter(id => id !== appId);
        setInstalledApps(updated);
        localStorage.setItem("node_os_installed_apps", JSON.stringify(updated));
        addLog(`Uninstalled: ${appId}`, "info");
    };

    const launchApp = (app: AppManifest) => {
        if (app.type === "iframe") {
            openWindow(app.id, app.name, <app.icon className="h-4 w-4" />, "navigator", { url: app.url });
        } else {
            window.open(app.url, "_blank");
        }
        addLog(`Launched: ${app.name}`, "success");
    };

    const categoryIcons: Record<string, any> = {
        all: Grid, development: Code, productivity: FileText, web: Globe, utilities: Shield, media: Palette,
    };

    return (
        <div className="h-full flex bg-[#0a0a0c] text-white font-sans overflow-hidden">
            {/* Sidebar */}
            <aside className="w-56 bg-[#111113] border-r border-white/5 flex flex-col shrink-0">
                <div className="p-5 border-b border-white/5">
                    <div className="flex items-center gap-2.5 mb-1">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center">
                            <Package className="h-4 w-4 text-white" />
                        </div>
                        <div>
                            <div className="text-sm font-semibold">App Store</div>
                            <div className="text-[10px] text-zinc-500">{APP_CATALOG.length} apps</div>
                        </div>
                    </div>
                </div>

                <div className="p-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-600" />
                        <input
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Search apps..."
                            className="w-full bg-white/5 border border-white/5 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-white/15"
                        />
                    </div>
                </div>

                <nav className="flex-1 px-2 space-y-0.5 overflow-y-auto">
                    {CATEGORIES.map(cat => {
                        const Icon = categoryIcons[cat] || Grid;
                        return (
                            <button
                                key={cat}
                                onClick={() => setCategory(cat)}
                                className={cn(
                                    "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs capitalize transition-all",
                                    category === cat ? "bg-white/10 text-white font-medium" : "text-zinc-500 hover:bg-white/5 hover:text-white"
                                )}
                            >
                                <Icon className="h-3.5 w-3.5" />
                                {cat}
                                <span className="ml-auto text-[10px] text-zinc-600">
                                    {cat === "all" ? APP_CATALOG.length : APP_CATALOG.filter(a => a.category === cat).length}
                                </span>
                            </button>
                        );
                    })}
                </nav>

                {/* Installed count */}
                <div className="p-4 border-t border-white/5">
                    <div className="flex items-center gap-2 text-[11px] text-zinc-500">
                        <Download className="h-3 w-3" />
                        {installedApps.length} installed
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <div className="px-8 pt-6 pb-4 flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-semibold capitalize">{category === "all" ? "All Apps" : category}</h1>
                        <p className="text-xs text-zinc-500 mt-0.5">{filteredApps.length} apps available</p>
                    </div>
                    <div className="flex items-center gap-2 bg-white/5 rounded-lg p-1 border border-white/5">
                        <button onClick={() => setViewMode("grid")} className={cn("p-1.5 rounded", viewMode === "grid" ? "bg-white/10 text-white" : "text-zinc-600")}><Grid className="h-3.5 w-3.5" /></button>
                        <button onClick={() => setViewMode("list")} className={cn("p-1.5 rounded", viewMode === "list" ? "bg-white/10 text-white" : "text-zinc-600")}><List className="h-3.5 w-3.5" /></button>
                    </div>
                </div>

                {/* App Grid/List */}
                <div className="flex-1 overflow-y-auto px-8 pb-8">
                    <div className={cn(
                        viewMode === "grid" 
                            ? "grid grid-cols-2 xl:grid-cols-3 gap-4" 
                            : "space-y-2"
                    )}>
                        {filteredApps.map((app, i) => {
                            const isInstalled = installedApps.includes(app.id);
                            
                            return viewMode === "grid" ? (
                                <motion.div
                                    key={app.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.03 }}
                                    onClick={() => setSelectedApp(app)}
                                    className="bg-white/[0.03] border border-white/5 rounded-2xl p-5 hover:bg-white/[0.06] hover:border-white/10 transition-all cursor-pointer group"
                                >
                                    <div className="flex items-start gap-4 mb-4">
                                        <div className={cn("w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center shrink-0 shadow-lg", app.color)}>
                                            <app.icon className="h-5 w-5 text-white" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm font-medium text-white truncate">{app.name}</div>
                                            <div className="text-[10px] text-zinc-500">{app.author} • v{app.version}</div>
                                        </div>
                                    </div>
                                    <p className="text-xs text-zinc-400 leading-relaxed line-clamp-2 mb-4">{app.description}</p>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-1.5 text-[10px] text-zinc-600">
                                            <Star className="h-3 w-3" />
                                            {app.stars ? `${(app.stars / 1000).toFixed(0)}k` : "—"}
                                        </div>
                                        {isInstalled ? (
                                            <div className="flex gap-1.5">
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); launchApp(app); }}
                                                    className="px-3 py-1.5 bg-blue-500 text-white rounded-lg text-[11px] font-medium hover:bg-blue-600 transition-all flex items-center gap-1"
                                                >
                                                    <Play className="h-3 w-3" /> Open
                                                </button>
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); uninstallApp(app.id); }}
                                                    className="p-1.5 text-zinc-600 hover:text-red-400 rounded-lg hover:bg-white/5 transition-all"
                                                >
                                                    <Trash2 className="h-3 w-3" />
                                                </button>
                                            </div>
                                        ) : (
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); installApp(app); }}
                                                className="px-3 py-1.5 bg-white/10 text-white rounded-lg text-[11px] font-medium hover:bg-white/15 transition-all flex items-center gap-1"
                                            >
                                                <Download className="h-3 w-3" /> Install
                                            </button>
                                        )}
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key={app.id}
                                    initial={{ opacity: 0, x: -5 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.02 }}
                                    onClick={() => setSelectedApp(app)}
                                    className="flex items-center gap-4 p-4 bg-white/[0.02] border border-white/5 rounded-xl hover:bg-white/[0.05] transition-all cursor-pointer"
                                >
                                    <div className={cn("w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center shrink-0", app.color)}>
                                        <app.icon className="h-4 w-4 text-white" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-medium text-white">{app.name}</div>
                                        <div className="text-[11px] text-zinc-500 truncate">{app.description}</div>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                        {isInstalled ? (
                                            <button onClick={(e) => { e.stopPropagation(); launchApp(app); }} className="px-3 py-1.5 bg-blue-500 text-white rounded-lg text-[11px] font-medium">Open</button>
                                        ) : (
                                            <button onClick={(e) => { e.stopPropagation(); installApp(app); }} className="px-3 py-1.5 bg-white/10 text-white rounded-lg text-[11px] font-medium">Install</button>
                                        )}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </main>

            {/* App Detail Sidebar */}
            <AnimatePresence>
                {selectedApp && (
                    <motion.aside
                        initial={{ width: 0, opacity: 0 }} animate={{ width: 320, opacity: 1 }} exit={{ width: 0, opacity: 0 }}
                        className="h-full bg-[#111113] border-l border-white/5 shrink-0 overflow-y-auto overflow-x-hidden"
                    >
                        <div className="p-6 space-y-6 min-w-[320px]">
                            <button onClick={() => setSelectedApp(null)} className="text-xs text-zinc-500 hover:text-white transition-all">← Back</button>
                            
                            <div className="flex items-center gap-4">
                                <div className={cn("w-16 h-16 rounded-2xl bg-gradient-to-br flex items-center justify-center shadow-xl", selectedApp.color)}>
                                    <selectedApp.icon className="h-7 w-7 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold">{selectedApp.name}</h2>
                                    <p className="text-xs text-zinc-500">{selectedApp.author}</p>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                {installedApps.includes(selectedApp.id) ? (
                                    <>
                                        <button onClick={() => launchApp(selectedApp)} className="flex-1 py-2.5 bg-blue-500 text-white rounded-xl text-sm font-medium hover:bg-blue-600 transition-all flex items-center justify-center gap-2">
                                            <Play className="h-4 w-4" /> Open
                                        </button>
                                        <button onClick={() => uninstallApp(selectedApp.id)} className="py-2.5 px-4 bg-white/5 text-red-400 rounded-xl text-sm hover:bg-red-500/10 transition-all">
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </>
                                ) : (
                                    <button onClick={() => installApp(selectedApp)} className="flex-1 py-2.5 bg-white/10 text-white rounded-xl text-sm font-medium hover:bg-white/15 transition-all flex items-center justify-center gap-2">
                                        <Download className="h-4 w-4" /> Install
                                    </button>
                                )}
                            </div>

                            <p className="text-sm text-zinc-400 leading-relaxed">{selectedApp.description}</p>

                            <div className="grid grid-cols-3 gap-3">
                                <div className="p-3 bg-white/[0.03] rounded-xl text-center">
                                    <div className="text-xs font-semibold text-white">{selectedApp.stars ? `${(selectedApp.stars / 1000).toFixed(0)}k` : "—"}</div>
                                    <div className="text-[10px] text-zinc-600">Stars</div>
                                </div>
                                <div className="p-3 bg-white/[0.03] rounded-xl text-center">
                                    <div className="text-xs font-semibold text-white">v{selectedApp.version}</div>
                                    <div className="text-[10px] text-zinc-600">Version</div>
                                </div>
                                <div className="p-3 bg-white/[0.03] rounded-xl text-center">
                                    <div className="text-xs font-semibold text-white capitalize">{selectedApp.type}</div>
                                    <div className="text-[10px] text-zinc-600">Type</div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="text-[10px] text-zinc-600 uppercase tracking-wider">Details</div>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs">
                                        <span className="text-zinc-500">Category</span>
                                        <span className="text-white capitalize">{selectedApp.category}</span>
                                    </div>
                                    {selectedApp.repo && (
                                        <div className="flex justify-between text-xs">
                                            <span className="text-zinc-500">Repository</span>
                                            <a href={selectedApp.repo} target="_blank" className="text-blue-400 hover:underline">{selectedApp.repo.replace("https://github.com/", "")}</a>
                                        </div>
                                    )}
                                    <div className="flex justify-between text-xs">
                                        <span className="text-zinc-500">Launch Mode</span>
                                        <span className="text-white">{selectedApp.type === "iframe" ? "In-app window" : "External browser"}</span>
                                    </div>
                                </div>
                            </div>

                            {selectedApp.url && (
                                <button 
                                    onClick={() => window.open(selectedApp.url, "_blank")}
                                    className="w-full flex items-center justify-center gap-2 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-xs text-zinc-400 hover:text-white transition-all"
                                >
                                    <ExternalLink className="h-3.5 w-3.5" /> Visit website
                                </button>
                            )}
                        </div>
                    </motion.aside>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AppStore;
