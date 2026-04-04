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
  Terminal
} from "lucide-react";
import { useSystem, VFSNode } from "@/contexts/SystemContext";
import { cn } from "@/lib/utils";

interface CommandLog {
  type: "input" | "output" | "error" | "system" | "code";
  content: React.ReactNode;
}

const Admin = () => {
  const { metrics, accentColor, batteryLevel, isWifiEnabled, logs: systemLogs, addLog, vfs, updateVFS, hostname, openWindow } = useSystem();
  const [input, setInput] = useState("");
  const [currentPath, setCurrentPath] = useState("/Users/node");
  const [terminalLogs, setTerminalLogs] = useState<CommandLog[]>([
    { type: "system", content: `Node OS v1.0.8-PRO Terminal (nsh)` },
    { type: "system", content: `Session initialized for entity 'node' at ${new Date().toLocaleTimeString()}` },
    { type: "system", content: "Type 'help' for technical registry of commands." }
  ]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [terminalLogs]);

  // --- VFS Helpers ---
  const getNodeAtPath = (path: string): VFSNode | null => {
    if (path === "/") return vfs;
    const parts = path.split("/").filter(Boolean);
    let current = vfs;
    for (const part of parts) {
      if (!current.children || !current.children[part]) return null;
      current = current.children[part];
    }
    return current;
  };

  const getAbsolutePath = (relPath: string) => {
    if (relPath.startsWith("/")) return relPath;
    if (relPath === "..") {
        const parts = currentPath.split("/").filter(Boolean);
        parts.pop();
        return "/" + parts.join("/");
    }
    return (currentPath === "/" ? "/" : currentPath + "/") + relPath;
  };

  const handleCommand = (cmdStr: string) => {
    const trimmed = cmdStr.trim();
    if (!trimmed) return;
    const args = trimmed.split(/\s+/);
    const command = args[0].toLowerCase();
    const target = args[1];

    const newLogs: CommandLog[] = [...terminalLogs, { type: "input", content: `${hostname}:${currentPath.split('/').pop() || '/'} node$ ${cmdStr}` }];

    switch (command) {
      case "help":
        newLogs.push({ type: "output", content: (
          <div className="grid grid-cols-3 gap-x-8 gap-y-1 my-2 text-primary/80 uppercase text-[9px] font-black tracking-widest">
            <span>ls [path]</span><span>List directory</span>
            <span>cd [path]</span><span>Change directory</span>
            <span>mkdir [name]</span><span>Create directory</span>
            <span>touch [name]</span><span>Create empty file</span>
            <span>rm [name]</span><span>Remove file/dir</span>
            <span>cat [file]</span><span>Read file content</span>
            <span>nano [file]</span><span>Edit file (sim)</span>
            <span>neofetch</span><span>System stats</span>
            <span>top / ps</span><span>Process monitor</span>
            <span>kill [pid]</span><span>Terminate process</span>
            <span>lsof</span><span>List open files</span>
            <span>whoami</span><span>Current user</span>
            <span>sudo [cmd]</span><span>Root access</span>
            <span>clear</span><span>Clear buffer</span>
            <span>open [app]</span><span>Launch App</span>
          </div>
        )});
        break;

      case "ls":
        const lsPath = getAbsolutePath(target || ".");
        const lsNode = getNodeAtPath(lsPath);
        if (lsNode && lsNode.type === "directory" && lsNode.children) {
          const contents = Object.values(lsNode.children).map(n => (
            <span key={n.name} className={cn("px-2 py-0.5 rounded", n.type === "directory" ? "text-primary font-black" : "text-white/80")}>
              {n.name}{n.type === "directory" ? "/" : ""}
            </span>
          ));
          newLogs.push({ type: "output", content: <div className="flex flex-wrap gap-2 my-2">{contents}</div> });
        } else {
          newLogs.push({ type: "error", content: `ls: ${target || "."}: No such directory` });
        }
        break;

      case "cd":
        if (!target || target === "~") { setCurrentPath("/Users/node"); break; }
        const nextPath = getAbsolutePath(target);
        const nextNode = getNodeAtPath(nextPath);
        if (nextNode && nextNode.type === "directory") {
          setCurrentPath(nextPath === "" ? "/" : nextPath);
        } else {
          newLogs.push({ type: "error", content: `cd: ${target}: No such directory` });
        }
        break;

      case "mkdir":
        if (!target) { newLogs.push({ type: "error", content: "mkdir: missing operand" }); break; }
        const parentPath = currentPath;
        const parentNode = getNodeAtPath(parentPath);
        if (parentNode && parentNode.children) {
          const updatedVFS = JSON.parse(JSON.stringify(vfs));
          const folderParts = parentPath.split("/").filter(Boolean);
          let curr = updatedVFS;
          for (const p of folderParts) curr = curr.children[p];
          
          curr.children[target] = { name: target, type: "directory", updatedAt: Date.now(), children: {} };
          updateVFS(updatedVFS);
          newLogs.push({ type: "output", content: `Directory '${target}' created.` });
        }
        break;

      case "touch":
        if (!target) { newLogs.push({ type: "error", content: "touch: missing file operand" }); break; }
        const tParent = getNodeAtPath(currentPath);
        if (tParent && tParent.children) {
            const upVFS = JSON.parse(JSON.stringify(vfs));
            const parts = currentPath.split("/").filter(Boolean);
            let c = upVFS;
            for (const p of parts) c = c.children[p];
            c.children[target] = { name: target, type: "file", content: "", updatedAt: Date.now() };
            updateVFS(upVFS);
            newLogs.push({ type: "output", content: `File '${target}' initialized.` });
        }
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

      case "sudo":
        newLogs.push({ type: "output", content: (
          <div className="flex items-center gap-3 my-2 text-amber-500 font-black uppercase text-[10px] tracking-widest">
            <Lock className="h-4 w-4" /> Root Authorization Required. Please contact system admin.
          </div>
        )});
        break;

      case "neofetch":
        newLogs.push({ type: "output", content: (
            <div className="flex gap-8 my-6 p-6 bg-white/5 rounded-3xl border border-white/10 shadow-2xl backdrop-blur-xl">
               <div className="text-primary flex items-center justify-center h-24 w-24 bg-white/5 rounded-[40px] border border-white/10">
                  <Terminal className="h-12 w-12" />
               </div>
               <div className="space-y-1 font-mono text-[10px] leading-tight flex-1">
                  <p><span className="text-primary font-black">OS</span>: Node OS 1.0.8 Sequoia-Pro</p>
                  <p><span className="text-primary font-black">HOST</span>: {hostname}</p>
                  <p><span className="text-primary font-black">UPTIME</span>: 2h 45m</p>
                  <p><span className="text-primary font-black">SHELL</span>: nsh 2.0 (Posix-Sim)</p>
                  <p><span className="text-primary font-black">CPU</span>: {metrics.cpu}% Load</p>
                  <p><span className="text-primary font-black">MEM</span>: {metrics.ram}GB / 16.0GB</p>
                  <p><span className="text-primary font-black">VFS</span>: {JSON.stringify(vfs).length} Bytes / 5MB</p>
                  <div className="flex gap-2 mt-4">
                     {["bg-blue-500", "bg-purple-500", "bg-emerald-500", "bg-amber-500", "bg-rose-500"].map(c => <div key={c} className={cn("w-4 h-4 rounded-full", c)} />)}
                  </div>
               </div>
            </div>
        )});
        break;

      case "top":
        newLogs.push({ type: "output", content: (
            <div className="my-4 space-y-2">
                <div className="flex justify-between text-[9px] font-black uppercase text-white/40 tracking-[0.2em] border-b border-white/5 pb-2">
                    <span>PID</span><span>COMMAND</span><span>%CPU</span><span>MEM</span><span>STATE</span>
                </div>
                {[
                    { pid: 1, cmd: "kernel_task", cpu: 0.1, mem: "1.2GB", state: "SLEEPING" },
                    { pid: 64, cmd: "WindowServer", cpu: metrics.cpu * 0.4, mem: "412MB", state: "RUNNING" },
                    { pid: 142, cmd: "Terminal", cpu: 0.8, mem: "124MB", state: "RUNNING" },
                    { pid: 156, cmd: "Dashboard", cpu: metrics.cpu * 0.2, mem: "256MB", state: "WAITING" }
                ].map(p => (
                    <div key={p.pid} className="flex justify-between text-[11px] font-mono text-white/80">
                        <span>{p.pid}</span><span>{p.cmd}</span><span>{p.cpu.toFixed(1)}</span><span>{p.mem}</span><span className="text-emerald-500">{p.state}</span>
                    </div>
                ))}
            </div>
        )});
        break;

      case "clear":
        setTerminalLogs([]);
        setInput("");
        return;

      case "whoami":
            newLogs.push({ type: "output", content: "node://authorized_user_instance_x86" });
            break;

      case "date":
            newLogs.push({ type: "output", content: new Date().toString() });
            break;

      case "open":
            const appName = args[1];
            if (appName) {
                newLogs.push({ type: "output", content: `Initializing ${appName}...` });
                // We'll hook this up to the main openWindow if we can, or just mock it here
                addLog(`Shell Request: Open ${appName}`, "info");
            } else {
                newLogs.push({ type: "error", content: "open: missing app operand" });
            }
            break;

      default:
        newLogs.push({ type: "error", content: `nsh: command not found: ${command}` });
    }

    setTerminalLogs(newLogs);
    setInput("");
  };

  return (
    <div className="h-full flex flex-col font-mono text-white/90 bg-black/60 p-6 overflow-hidden" onClick={() => inputRef.current?.focus()}>
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pb-6"
      >
        {terminalLogs.map((log, i) => (
          <div key={i} className={cn(
            "text-[12px] leading-relaxed",
            log.type === "input" && "text-white font-black opacity-100",
            log.type === "output" && "text-zinc-400 ml-4",
            log.type === "error" && "text-rose-500 font-black uppercase text-[10px] ml-4 bg-rose-500/10 px-2 py-0.5 rounded inline-block",
            log.type === "system" && "text-primary/60 italic font-bold",
            log.type === "code" && "ml-4"
          )}>
            {log.content}
          </div>
        ))}
      </div>

      <form 
        onSubmit={(e) => { e.preventDefault(); handleCommand(input); }}
        className="flex items-center gap-2 border-t border-white/10 pt-4 bg-black/20 -mx-6 px-6"
      >
        <span className="text-primary font-black shrink-0">{hostname.split('-')[0].toLowerCase()}:</span>
        <span className="text-emerald-500 font-black shrink-0">{currentPath.split('/').pop() || '/'}</span>
        <span className="text-white/40 font-black shrink-0">$</span>
        <input
          ref={inputRef}
          autoFocus
          className="flex-1 bg-transparent border-none text-[12px] text-white focus:outline-none placeholder:opacity-10"
          placeholder="System Command Registry..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <div className="flex items-center gap-6 opacity-20 text-[9px] font-black uppercase tracking-widest hidden md:flex">
           <span className="flex items-center gap-2"><Globe className="h-3 w-3" /> Secure Node</span>
           <span className="flex items-center gap-2"><Lock className="h-3 w-3" /> Encrypted</span>
        </div>
      </form>
    </div>
  );
};

export default Admin;
