import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Terminal as TerminalIcon, 
  ChevronRight, 
  Shield, 
  Cpu, 
  Database, 
  Activity, 
  Clock,
  Zap,
  AppWindow,
  Maximize2,
  Lock,
  Globe,
  Terminal,
  Search,
  FileSearch,
  HardDrive
} from "lucide-react";
import { useSystem, VFSNode } from "@/contexts/SystemContext";
import { cn } from "@/lib/utils";

interface CommandLog {
  type: "input" | "output" | "error" | "system" | "code";
  content: React.ReactNode;
}

const TerminalApp = () => {
  const { metrics, accentColor, batteryLevel, isWifiEnabled, logs: systemLogs, addLog, vfs, updateVFS, hostname, openWindow, closeWindow, dockApps } = useSystem();
  
  const [input, setInput] = useState("");
  const [currentPath, setCurrentPath] = useState("/Users/node");
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [terminalLogs, setTerminalLogs] = useState<CommandLog[]>([
    { type: "system", content: `Node OS v1.2.5-PRO 'Sequoia' Terminal (nsh)` },
    { type: "system", content: `Authorized session initialized at ${new Date().toLocaleTimeString()}` },
    { type: "system", content: "Type 'help' for the specialized command registry." }
  ]);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [terminalLogs]);

  // --- VFS Logic ---
  const getNodeAtPath = (path: string): VFSNode | null => {
    if (path === "/" || path === "") return vfs;
    if (path === "~") return vfs.children?.Users?.children?.node || null;
    
    const parts = path.split("/").filter(p => p && p !== ".");
    let current = vfs;
    
    for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        if (part === "..") {
           // Not easily handled in mid-path with this simple VFS walker, 
           // but getAbsolutePath already resolves '..'
           continue; 
        }
        if (!current.children || !current.children[part]) return null;
        current = current.children[part];
    }
    return current;
  };

  const getAbsolutePath = (relPath: string) => {
    if (relPath === "." || relPath === "./") return currentPath;
    if (relPath.startsWith("/")) return relPath;
    if (relPath === "~") return "/Users/node";
    
    const parts = currentPath.split("/").filter(Boolean);
    if (relPath === "..") {
      parts.pop();
      return "/" + parts.join("/");
    }
    
    return (currentPath === "/" ? "/" : currentPath + "/") + relPath;
  };

  // --- Interaction Logic ---
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (historyIndex < history.length - 1) {
        const nextIndex = historyIndex + 1;
        setHistoryIndex(nextIndex);
        setInput(history[history.length - 1 - nextIndex]);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIndex > 0) {
        const nextIndex = historyIndex - 1;
        setHistoryIndex(nextIndex);
        setInput(history[history.length - 1 - nextIndex]);
      } else {
        setHistoryIndex(-1);
        setInput("");
      }
    } else if (e.key === "Tab") {
      e.preventDefault();
      handleAutocomplete();
    }
  };

  const handleAutocomplete = () => {
    const parts = input.split(" ");
    const lastPart = parts[parts.length - 1];
    if (!lastPart) return;

    // Autocomplete Apps
    const appMatches = dockApps.filter(app => app.id.startsWith(lastPart.toLowerCase()));
    if (appMatches.length === 1) {
        parts[parts.length - 1] = appMatches[0].id;
        setInput(parts.join(" "));
        return;
    }

    // Autocomplete Files/Dirs
    const parentNode = getNodeAtPath(currentPath);
    if (parentNode && parentNode.children) {
      const matches = Object.keys(parentNode.children).filter(name => name.startsWith(lastPart));
      if (matches.length === 1) {
        parts[parts.length - 1] = matches[0];
        setInput(parts.join(" "));
      }
    }
  };

  const handleCommand = (cmdStr: string) => {
    const trimmed = cmdStr.trim();
    if (!trimmed) return;
    
    setHistory(prev => [trimmed, ...prev].slice(0, 50));
    setHistoryIndex(-1);

    const args = trimmed.split(/\s+/);
    const command = args[0].toLowerCase();
    const target = args[1];

    const prompt = `${hostname.split('-')[0].toLowerCase()}:${currentPath.split('/').pop() || '/'} node$`;
    const newLogs: CommandLog[] = [...terminalLogs, { type: "input", content: `${prompt} ${cmdStr}` }];

    switch (command) {
      case "help":
        newLogs.push({ type: "output", content: (
          <div className="grid grid-cols-4 gap-x-6 gap-y-2 my-4 text-[10px] font-black tracking-widest uppercase text-primary/70">
            <span>ls</span><span>cd</span><span>pwd</span><span>mkdir</span>
            <span>touch</span><span>rm</span><span>cat</span><span>echo</span>
            <span>grep</span><span>find</span><span>which</span><span>man</span>
            <span>df</span><span>du</span><span>sw_vers</span><span>head</span>
            <span>tail</span><span>open</span><span>neofetch</span><span>top</span>
            <span>whoami</span><span>uname</span><span>uptime</span><span>clear</span>
            <span>history</span><span>date</span><span>sudo</span><span>exit</span>
          </div>
        )});
        break;

      case "ls":
        const lsPath = getAbsolutePath(target || ".");
        const lsNode = getNodeAtPath(lsPath);
        if (lsNode && lsNode.type === "directory" && lsNode.children) {
          const contents = Object.values(lsNode.children).map(n => (
            <span key={n.name} className={cn(
                "px-2 py-0.5 rounded transition-colors", 
                n.type === "directory" ? "text-blue-400 font-black hover:bg-blue-400/10" : "text-white/80 hover:bg-white/5"
            )}>
              {n.name}{n.type === "directory" ? "/" : ""}
            </span>
          ));
          newLogs.push({ type: "output", content: <div className="flex flex-wrap gap-2 my-2">{contents}</div> });
        } else {
          newLogs.push({ type: "error", content: `nsh: ls: ${target || "."}: No such directory` });
        }
        break;

      case "pwd":
        newLogs.push({ type: "output", content: currentPath });
        break;

      case "cd":
        const nextPath = getAbsolutePath(target || "~");
        const nextNode = getNodeAtPath(nextPath);
        if (nextNode && nextNode.type === "directory") {
          setCurrentPath(nextPath || "/");
        } else {
          newLogs.push({ type: "error", content: `nsh: cd: ${target}: No such directory` });
        }
        break;

      case "echo":
        newLogs.push({ type: "output", content: args.slice(1).join(" ") });
        break;

      case "mkdir":
        if (!target) { newLogs.push({ type: "error", content: "nsh: mkdir: missing operand" }); break; }
        const mkdirParent = getNodeAtPath(currentPath);
        if (mkdirParent && mkdirParent.children) {
            const upVFS = JSON.parse(JSON.stringify(vfs));
            const parts = currentPath.split("/").filter(Boolean);
            let c = upVFS;
            for (const p of parts) c = c.children[p];
            c.children[target] = { name: target, type: "directory", updatedAt: Date.now(), children: {} };
            updateVFS(upVFS);
            newLogs.push({ type: "output", content: `nsh: created directory '${target}'` });
        }
        break;

      case "touch":
        if (!target) { newLogs.push({ type: "error", content: "nsh: touch: missing operand" }); break; }
        const touchParent = getNodeAtPath(currentPath);
        if (touchParent && touchParent.children) {
            const upVFS = JSON.parse(JSON.stringify(vfs));
            const parts = currentPath.split("/").filter(Boolean);
            let c = upVFS;
            for (const p of parts) c = c.children[p];
            c.children[target] = { name: target, type: "file", content: "", updatedAt: Date.now() };
            updateVFS(upVFS);
            newLogs.push({ type: "output", content: `nsh: initialized file '${target}'` });
        }
        break;

      case "rm":
        if (!target) { newLogs.push({ type: "error", content: "nsh: rm: missing operand" }); break; }
        const rmParent = getNodeAtPath(currentPath);
        if (rmParent && rmParent.children && rmParent.children[target]) {
            const upVFS = JSON.parse(JSON.stringify(vfs));
            const parts = currentPath.split("/").filter(Boolean);
            let c = upVFS;
            for (const p of parts) c = c.children[p];
            delete c.children[target];
            updateVFS(upVFS);
            newLogs.push({ type: "output", content: `nsh: removed '${target}'` });
        } else {
            newLogs.push({ type: "error", content: `nsh: rm: ${target}: No such file or directory` });
        }
        break;

      case "grep":
        const pattern = target;
        const fileToGrep = args[2];
        if (!pattern || !fileToGrep) { newLogs.push({ type: "error", content: "usage: grep [pattern] [file]" }); break; }
        const gNode = getNodeAtPath(getAbsolutePath(fileToGrep));
        if (gNode && gNode.type === "file" && gNode.content) {
            const matches = gNode.content.split("\n").filter(line => line.includes(pattern));
            newLogs.push({ type: "output", content: matches.join("\n") || "(no matches)" });
        } else {
            newLogs.push({ type: "error", content: `nsh: grep: ${fileToGrep}: No such file` });
        }
        break;

      case "find":
        if (!target) { newLogs.push({ type: "error", content: "usage: find [name]" }); break; }
        const results: string[] = [];
        const searchVFS = (node: VFSNode, path: string) => {
            if (node.name.includes(target)) results.push(path);
            if (node.children) {
                Object.values(node.children).forEach(child => searchVFS(child, `${path}/${child.name}`));
            }
        };
        searchVFS(vfs, "");
        newLogs.push({ type: "output", content: results.join("\n") || "No results found" });
        break;

      case "which":
        const cmdToFind = target;
        if (!cmdToFind) break;
        const isBuiltin = ["ls", "cd", "pwd", "mkdir", "touch", "rm", "cat", "echo", "grep", "find", "which", "man", "df", "du", "sw_vers", "head", "tail", "open", "neofetch", "top", "ps", "whoami", "uname", "uptime", "clear", "history", "date", "sudo", "exit"].includes(cmdToFind);
        if (isBuiltin) newLogs.push({ type: "output", content: `nsh: builtin command: ${cmdToFind}` });
        else newLogs.push({ type: "error", content: `${cmdToFind} not found` });
        break;

      case "man":
        newLogs.push({ type: "output", content: `Manual page for ${target || "system"} - Sequoia Pro Core Utilities v1.2.5` });
        break;

      case "sw_vers":
        newLogs.push({ type: "output", content: (
            <div className="space-y-1">
                <p>ProductName: Node OS</p>
                <p>ProductVersion: 15.0.1 (Sequoia)</p>
                <p>BuildVersion: 24B83</p>
            </div>
        )});
        break;

      case "df":
        newLogs.push({ type: "output", content: (
            <div className="grid grid-cols-5 gap-4 opacity-70">
                <span>Filesystem</span><span>Size</span><span>Used</span><span>Avail</span><span>Capacity</span>
                <span>/dev/disk3s1s1</span><span>994Gi</span><span>124Gi</span><span>820Gi</span><span>13%</span>
                <span>devfs</span><span>202Ki</span><span>202Ki</span><span>0Bi</span><span>100%</span>
            </div>
        )});
        break;

      case "cat":
        if (!target) { newLogs.push({ type: "error", content: "cat: missing file operand" }); break; }
        const cNode = getNodeAtPath(getAbsolutePath(target));
        if (cNode && cNode.type === "file") {
            newLogs.push({ type: "code", content: <pre className="p-4 bg-white/5 rounded-xl border border-white/5 text-[11px] font-mono whitespace-pre-wrap">{cNode.content || "(empty file)"}</pre> });
        } else {
            newLogs.push({ type: "error", content: `cat: ${target}: No such file` });
        }
        break;

      case "uname":
        newLogs.push({ type: "output", content: "Node OS 1.2.5 Darwin x86_64 Sequoia-Pro" });
        break;

      case "uptime":
        newLogs.push({ type: "output", content: "up 13:12, 1 user, load average: 0.15, 0.10, 0.08" });
        break;

      case "history":
        newLogs.push({ type: "output", content: (
            <div className="space-y-0.5 opacity-60">
                {history.reverse().map((h, i) => <div key={i}>{i+1}  {h}</div>)}
            </div>
        )});
        break;

      case "neofetch":
        newLogs.push({ type: "output", content: (
            <div className="flex gap-10 my-6 p-8 bg-white/5 rounded-[40px] border border-white/10 shadow-2xl backdrop-blur-2xl">
               <div className="text-primary flex items-center justify-center h-28 w-28 bg-white/5 rounded-[50px] border border-white/10 shadow-inner group">
                  <Terminal className="h-14 w-14 group-hover:scale-110 transition-transform duration-500" />
               </div>
               <div className="space-y-1 font-mono text-[11px] leading-tight flex-1">
                  <p className="text-lg font-black text-white mb-2 leading-none">node@sequoia-pro</p>
                  <p><span className="text-primary font-black opacity-60">OS</span>: Node OS 1.2.5 Sequoia</p>
                  <p><span className="text-primary font-black opacity-60">KERNEL</span>: xnu-node-1.2.5</p>
                  <p><span className="text-primary font-black opacity-60">UPTIME</span>: 13h 12m</p>
                  <p><span className="text-primary font-black opacity-60">SHELL</span>: nsh 3.5 (Posix-Sim)</p>
                  <p><span className="text-primary font-black opacity-60">CPU</span>: Virtual Node Engine (8) @ 3.4GHz</p>
                  <p><span className="text-primary font-black opacity-60">MEM</span>: {metrics.ram}GB / 16.0GB ({((metrics.ram/16)*100).toFixed(0)}%)</p>
                  <div className="flex gap-2 mt-5">
                     {["bg-blue-500", "bg-purple-500", "bg-emerald-500", "bg-amber-500", "bg-rose-500", "bg-white"].map(c => <div key={c} className={cn("w-5 h-2 rounded-full", c)} />)}
                  </div>
               </div>
            </div>
        )});
        break;

      case "open":
        const appToOpen = dockApps.find(a => a.id.toLowerCase() === target?.toLowerCase());
        if (appToOpen) {
            newLogs.push({ type: "system", content: `Spawning window for ${appToOpen.name}...` });
            openWindow(appToOpen.id, appToOpen.name, <appToOpen.icon className="h-4 w-4" />, appToOpen.component);
            addLog(`Terminal Spawn: ${appToOpen.name}`, "success");
        } else {
            newLogs.push({ type: "error", content: `nsh: open: ${target}: Application not found in registry` });
        }
        break;

      case "exit":
        newLogs.push({ type: "system", content: "Terminating session..." });
        setTerminalLogs(newLogs);
        setTimeout(() => closeWindow("terminal"), 500);
        return;

      case "clear":
        setTerminalLogs([]);
        setInput("");
        return;

      default:
        newLogs.push({ type: "error", content: `nsh: command not found: ${command}` });
    }

    setTerminalLogs(newLogs);
    setInput("");
  };

  return (
    <div className="h-full flex flex-col font-mono text-white/90 bg-black/70 p-8 overflow-hidden">
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pb-20 select-text cursor-text"
        onClick={() => {
           if (window.getSelection()?.toString() === "") {
              inputRef.current?.focus();
           }
        }}
      >
        {terminalLogs.map((log, i) => (
          <div key={i} className={cn(
            "text-[13px] leading-relaxed break-all",
            log.type === "input" && "text-white font-black",
            log.type === "output" && "text-zinc-400 ml-5 whitespace-pre-wrap",
            log.type === "error" && "text-rose-500 font-extrabold uppercase text-[10px] ml-5 bg-rose-500/10 px-3 py-1 rounded-lg border border-rose-500/20 inline-block",
            log.type === "system" && "text-primary italic font-bold opacity-60",
            log.type === "code" && "ml-5"
          )}>
            {log.content}
          </div>
        ))}
      </div>

      <form 
        onSubmit={(e) => { e.preventDefault(); handleCommand(input); }}
        className="flex items-center gap-3 border-t border-white/10 pt-6 bg-black/30 -mx-8 px-8"
      >
        <div className="flex items-center gap-2 shrink-0">
            <span className="text-primary font-black">node</span>
            <span className="text-white/20 font-black">@</span>
            <span className="text-emerald-500 font-black">{currentPath.split('/').pop() || '/'}</span>
            <ChevronRight className="h-4 w-4 text-white/40" />
        </div>
        <input
          ref={inputRef}
          autoFocus
          className="flex-1 bg-transparent border-none text-[13px] text-white focus:outline-none placeholder:text-white/5"
          placeholder="Execute system call..."
          value={input}
          onKeyDown={handleKeyDown}
          onChange={(e) => setInput(e.target.value)}
          spellCheck={false}
          autoComplete="off"
        />
        <div className="flex items-center gap-8 opacity-20 text-[10px] font-black uppercase tracking-[0.3em] hidden xl:flex">
           <span className="flex items-center gap-2"><Globe className="h-3.5 w-3.5" /> Posix Link</span>
           <span className="flex items-center gap-2"><Lock className="h-3.5 w-3.5" /> 256-Bit</span>
        </div>
      </form>
    </div>
  );
};

export default TerminalApp;
