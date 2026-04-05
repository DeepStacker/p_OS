import React, { useState, useEffect, useRef, useCallback } from "react";
import { Terminal as XTerminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import { WebLinksAddon } from "@xterm/addon-web-links";
import "@xterm/xterm/css/xterm.css";
import { useSystem, VFSNode } from "@/contexts/SystemContext";

// ============================================================
// Virtual Shell Engine — Runs real-feeling commands in-browser
// ============================================================

interface ShellEnv {
  cwd: string;
  HOME: string;
  USER: string;
  SHELL: string;
  PATH: string;
  TERM: string;
  [key: string]: string;
}

const DEFAULT_ENV: ShellEnv = {
  cwd: "/Users/node",
  HOME: "/Users/node",
  USER: "node",
  SHELL: "/bin/nsh",
  PATH: "/usr/local/bin:/usr/bin:/bin",
  TERM: "xterm-256color",
  HOSTNAME: "Node-MacBook-Pro",
  EDITOR: "nano",
  LANG: "en_US.UTF-8",
};

// Resolve path relative to cwd
const resolvePath = (cwd: string, path: string): string => {
  if (path.startsWith("/")) return normalizePath(path);
  if (path.startsWith("~")) return normalizePath("/Users/node" + path.slice(1));
  const parts = cwd.split("/").filter(Boolean);
  path.split("/").forEach(p => {
    if (p === "..") parts.pop();
    else if (p !== "." && p !== "") parts.push(p);
  });
  return "/" + parts.join("/");
};

const normalizePath = (p: string): string => {
  const parts = p.split("/").filter(Boolean);
  const resolved: string[] = [];
  parts.forEach(part => {
    if (part === "..") resolved.pop();
    else if (part !== ".") resolved.push(part);
  });
  return "/" + resolved.join("/");
};

// Navigate VFS tree by path
const getNode = (vfs: VFSNode, path: string): VFSNode | null => {
  const parts = path.split("/").filter(Boolean);
  let current = vfs;
  for (const part of parts) {
    if (current.type !== "directory" || !current.children?.[part]) return null;
    current = current.children[part];
  }
  return current;
};

// Set a node in VFS tree (creates parents as needed)
const setNode = (vfs: VFSNode, path: string, node: VFSNode): VFSNode => {
  const parts = path.split("/").filter(Boolean);
  const clone = JSON.parse(JSON.stringify(vfs));
  let current = clone;
  for (let i = 0; i < parts.length - 1; i++) {
    if (!current.children) current.children = {};
    if (!current.children[parts[i]]) {
      current.children[parts[i]] = { name: parts[i], type: "directory", updatedAt: Date.now(), children: {} };
    }
    current = current.children[parts[i]];
  }
  if (!current.children) current.children = {};
  current.children[parts[parts.length - 1]] = node;
  return clone;
};

// Delete a node from VFS
const deleteNode = (vfs: VFSNode, path: string): VFSNode => {
  const parts = path.split("/").filter(Boolean);
  const clone = JSON.parse(JSON.stringify(vfs));
  let current = clone;
  for (let i = 0; i < parts.length - 1; i++) {
    if (!current.children?.[parts[i]]) return clone;
    current = current.children[parts[i]];
  }
  if (current.children) delete current.children[parts[parts.length - 1]];
  return clone;
};

const Terminal = () => {
    const { vfs, updateVFS, addLog, metrics, hostname, closeWindow, batteryLevel, accentColor, activeWindows } = useSystem();
    const termRef = useRef<HTMLDivElement>(null);
    const xtermRef = useRef<XTerminal | null>(null);
    const fitAddonRef = useRef<FitAddon | null>(null);
    const envRef = useRef<ShellEnv>({ ...DEFAULT_ENV });
    const inputBuffer = useRef("");
    const historyRef = useRef<string[]>([]);
    const historyIndexRef = useRef(-1);
    const cursorPosRef = useRef(0);
    const vfsRef = useRef(vfs);

    // Keep VFS ref in sync
    useEffect(() => { vfsRef.current = vfs; }, [vfs]);

    const writeColor = useCallback((text: string, color: string = "37") => {
        xtermRef.current?.write(`\x1b[${color}m${text}\x1b[0m`);
    }, []);

    const writeLn = useCallback((text: string, color?: string) => {
        if (color) {
            xtermRef.current?.write(`\x1b[${color}m${text}\x1b[0m\r\n`);
        } else {
            xtermRef.current?.write(text + "\r\n");
        }
    }, []);

    const showPrompt = useCallback(() => {
        const env = envRef.current;
        const shortCwd = env.cwd.replace(env.HOME, "~");
        // Format: [user@host dir] $
        xtermRef.current?.write(`\x1b[1;32m${env.USER}\x1b[0m@\x1b[1;34m${hostname || "node-os"}\x1b[0m \x1b[1;36m${shortCwd}\x1b[0m \x1b[1;33m$\x1b[0m `);
    }, [hostname]);

    // ============================================================
    // COMMAND EXECUTION ENGINE
    // ============================================================
    const executeCommand = useCallback(async (rawInput: string) => {
        const trimmed = rawInput.trim();
        if (!trimmed) { showPrompt(); return; }

        // Handle command chaining with &&
        if (trimmed.includes(" && ")) {
            const commands = trimmed.split(" && ");
            for (const cmd of commands) {
                await executeCommand(cmd.trim());
            }
            return;
        }

        // Handle output redirect >
        let outputFile: string | null = null;
        let cmdStr = trimmed;
        if (cmdStr.includes(" > ")) {
            const parts = cmdStr.split(" > ");
            cmdStr = parts[0].trim();
            outputFile = parts[1]?.trim() || null;
        }

        // Handle pipes |
        if (cmdStr.includes(" | ")) {
            const pipeParts = cmdStr.split(" | ").map(s => s.trim());
            let pipeOutput = "";
            for (const pipeCmd of pipeParts) {
                pipeOutput = await executeSingleCommand(pipeCmd, pipeOutput);
            }
            if (outputFile && pipeOutput) {
                const fullPath = resolvePath(envRef.current.cwd, outputFile);
                const newVfs = setNode(vfsRef.current, fullPath, { name: outputFile.split("/").pop()!, type: "file", content: pipeOutput, updatedAt: Date.now() });
                updateVFS(newVfs);
            } else if (pipeOutput) {
                pipeOutput.split("\n").forEach(line => writeLn(line));
            }
            showPrompt();
            return;
        }

        const output = await executeSingleCommand(cmdStr);
        if (outputFile && output) {
            const fullPath = resolvePath(envRef.current.cwd, outputFile);
            const newVfs = setNode(vfsRef.current, fullPath, { name: outputFile.split("/").pop()!, type: "file", content: output, updatedAt: Date.now() });
            updateVFS(newVfs);
            writeLn(`Written to ${outputFile}`, "32");
        } else if (output) {
            output.split("\n").forEach(line => writeLn(line));
        }
        showPrompt();
    }, [showPrompt, writeLn, updateVFS]);

    const executeSingleCommand = useCallback(async (cmdStr: string, pipeInput?: string): Promise<string> => {
        const tokens = parseTokens(cmdStr);
        if (tokens.length === 0) return "";
        
        const cmd = tokens[0];
        const args = tokens.slice(1);
        const env = envRef.current;

        switch (cmd) {
            // --- FILE SYSTEM ---
            case "ls": {
                const target = args.find(a => !a.startsWith("-")) || ".";
                const fullPath = resolvePath(env.cwd, target);
                const node = getNode(vfsRef.current, fullPath);
                if (!node || node.type !== "directory") return `ls: ${target}: No such file or directory`;
                const showAll = args.includes("-a") || args.includes("-la") || args.includes("-al");
                const showLong = args.includes("-l") || args.includes("-la") || args.includes("-al");
                const entries = Object.values(node.children || {});
                if (showAll) entries.unshift({ name: ".", type: "directory", updatedAt: Date.now() } as any, { name: "..", type: "directory", updatedAt: Date.now() } as any);
                if (showLong) {
                    const lines = entries.map(e => {
                        const perms = e.type === "directory" ? "drwxr-xr-x" : "-rw-r--r--";
                        const size = e.content?.length || 0;
                        const date = new Date(e.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
                        const color = e.type === "directory" ? "\x1b[1;34m" : "\x1b[0m";
                        return `${perms}  1 ${env.USER} staff  ${String(size).padStart(6)} ${date} ${color}${e.name}\x1b[0m`;
                    });
                    return `total ${entries.length}\n` + lines.join("\n");
                }
                return entries.map(e => e.type === "directory" ? `\x1b[1;34m${e.name}\x1b[0m` : e.name).join("  ");
            }

            case "cd": {
                const target = args[0] || env.HOME;
                const fullPath = resolvePath(env.cwd, target);
                const node = getNode(vfsRef.current, fullPath);
                if (!node || node.type !== "directory") return `cd: no such directory: ${target}`;
                env.cwd = fullPath;
                return "";
            }

            case "pwd": return env.cwd;

            case "mkdir": {
                if (!args[0]) return "mkdir: missing operand";
                const mkdirRecursive = args.includes("-p");
                const dirName = args.find(a => !a.startsWith("-"))!;
                const fullPath = resolvePath(env.cwd, dirName);
                const newVfs = setNode(vfsRef.current, fullPath, { name: dirName.split("/").pop()!, type: "directory", updatedAt: Date.now(), children: {} });
                updateVFS(newVfs);
                return "";
            }

            case "touch": {
                if (!args[0]) return "touch: missing file operand";
                const fullPath = resolvePath(env.cwd, args[0]);
                const existing = getNode(vfsRef.current, fullPath);
                if (!existing) {
                    const newVfs = setNode(vfsRef.current, fullPath, { name: args[0].split("/").pop()!, type: "file", content: "", updatedAt: Date.now() });
                    updateVFS(newVfs);
                }
                return "";
            }

            case "cat": {
                if (!args[0]) return pipeInput || "";
                const fullPath = resolvePath(env.cwd, args[0]);
                const node = getNode(vfsRef.current, fullPath);
                if (!node) return `cat: ${args[0]}: No such file or directory`;
                if (node.type === "directory") return `cat: ${args[0]}: Is a directory`;
                return node.content || "";
            }

            case "echo": {
                let text = args.join(" ");
                // Handle variable expansion
                text = text.replace(/\$(\w+)/g, (_, name) => env[name] || "");
                // Strip quotes
                text = text.replace(/^["']|["']$/g, "");
                return text;
            }

            case "rm": {
                if (!args[0]) return "rm: missing operand";
                const target = args.find(a => !a.startsWith("-"))!;
                const fullPath = resolvePath(env.cwd, target);
                const node = getNode(vfsRef.current, fullPath);
                if (!node) return `rm: ${target}: No such file or directory`;
                if (node.type === "directory" && !args.includes("-r") && !args.includes("-rf")) return `rm: ${target}: is a directory`;
                const newVfs = deleteNode(vfsRef.current, fullPath);
                updateVFS(newVfs);
                return "";
            }

            case "cp": {
                if (args.length < 2) return "cp: missing destination";
                const srcPath = resolvePath(env.cwd, args[0]);
                const dstPath = resolvePath(env.cwd, args[1]);
                const srcNode = getNode(vfsRef.current, srcPath);
                if (!srcNode) return `cp: ${args[0]}: No such file or directory`;
                const clone = JSON.parse(JSON.stringify(srcNode));
                clone.name = args[1].split("/").pop()!;
                const newVfs = setNode(vfsRef.current, dstPath, clone);
                updateVFS(newVfs);
                return "";
            }

            case "mv": {
                if (args.length < 2) return "mv: missing destination";
                const srcPath = resolvePath(env.cwd, args[0]);
                const dstPath = resolvePath(env.cwd, args[1]);
                const srcNode = getNode(vfsRef.current, srcPath);
                if (!srcNode) return `mv: ${args[0]}: No such file or directory`;
                const clone = JSON.parse(JSON.stringify(srcNode));
                clone.name = args[1].split("/").pop()!;
                let newVfs = setNode(vfsRef.current, dstPath, clone);
                newVfs = deleteNode(newVfs, srcPath);
                updateVFS(newVfs);
                return "";
            }

            case "head": {
                const content = pipeInput || (() => { const p = resolvePath(env.cwd, args.find(a => !a.startsWith("-")) || ""); const n = getNode(vfsRef.current, p); return n?.content || ""; })();
                const lines = parseInt(args.find(a => a.startsWith("-"))?.slice(1) || "10");
                return content.split("\n").slice(0, lines).join("\n");
            }

            case "tail": {
                const content = pipeInput || (() => { const p = resolvePath(env.cwd, args.find(a => !a.startsWith("-")) || ""); const n = getNode(vfsRef.current, p); return n?.content || ""; })();
                const lines = parseInt(args.find(a => a.startsWith("-"))?.slice(1) || "10");
                const allLines = content.split("\n");
                return allLines.slice(Math.max(0, allLines.length - lines)).join("\n");
            }

            case "wc": {
                const content = pipeInput || (() => { const p = resolvePath(env.cwd, args[0] || ""); const n = getNode(vfsRef.current, p); return n?.content || ""; })();
                const lines = content.split("\n").length;
                const words = content.split(/\s+/).filter(Boolean).length;
                const chars = content.length;
                return `  ${lines}  ${words}  ${chars}`;
            }

            case "grep": {
                if (!args[0]) return "Usage: grep PATTERN [FILE]";
                const pattern = args[0];
                const content = pipeInput || (() => { const p = resolvePath(env.cwd, args[1] || ""); const n = getNode(vfsRef.current, p); return n?.content || ""; })();
                const caseInsensitive = args.includes("-i");
                const regex = new RegExp(pattern, caseInsensitive ? "i" : "");
                return content.split("\n").filter(line => regex.test(line)).map(line => {
                    return line.replace(regex, (match) => `\x1b[1;31m${match}\x1b[0m`);
                }).join("\n");
            }

            case "find": {
                const searchPath = resolvePath(env.cwd, args.find(a => !a.startsWith("-")) || ".");
                const namePattern = args[args.indexOf("-name") + 1] || "";
                const results: string[] = [];
                const search = (node: VFSNode, path: string) => {
                    if (!namePattern || node.name.includes(namePattern.replace(/\*/g, ""))) results.push(path);
                    if (node.children) Object.values(node.children).forEach(c => search(c, path + "/" + c.name));
                };
                const startNode = getNode(vfsRef.current, searchPath);
                if (startNode) search(startNode, searchPath);
                return results.join("\n");
            }

            case "tree": {
                const targetPath = resolvePath(env.cwd, args[0] || ".");
                const node = getNode(vfsRef.current, targetPath);
                if (!node || node.type !== "directory") return `tree: ${args[0] || "."}: not a directory`;
                const lines: string[] = [];
                const render = (n: VFSNode, prefix: string, isLast: boolean) => {
                    const connector = isLast ? "└── " : "├── ";
                    const color = n.type === "directory" ? "\x1b[1;34m" : "\x1b[0m";
                    lines.push(prefix + connector + color + n.name + "\x1b[0m");
                    if (n.children) {
                        const children = Object.values(n.children);
                        children.forEach((child, i) => render(child, prefix + (isLast ? "    " : "│   "), i === children.length - 1));
                    }
                };
                lines.push(`\x1b[1;34m${node.name}\x1b[0m`);
                if (node.children) {
                    const children = Object.values(node.children);
                    children.forEach((child, i) => render(child, "", i === children.length - 1));
                }
                return lines.join("\n");
            }

            // --- SYSTEM ---
            case "whoami": return env.USER;
            case "hostname": return hostname || "node-os";
            case "uname": {
                if (args.includes("-a")) return "NodeOS 24.0.0 Node-MacBook-Pro arm64 Sequoia-Kernel";
                return "NodeOS";
            }
            case "uptime": {
                const hours = Math.floor(Math.random() * 24);
                return ` ${new Date().toLocaleTimeString()}  up ${hours} hours, 1 user, load averages: 1.${metrics.cpu} ${(metrics.ram / 16).toFixed(2)} ${(metrics.network / 10).toFixed(2)}`;
            }
            case "date": return new Date().toString();
            case "cal": {
                const now = new Date();
                const month = now.toLocaleString("default", { month: "long" });
                const year = now.getFullYear();
                const firstDay = new Date(year, now.getMonth(), 1).getDay();
                const daysInMonth = new Date(year, now.getMonth() + 1, 0).getDate();
                let cal = `     ${month} ${year}\nSu Mo Tu We Th Fr Sa\n`;
                cal += "   ".repeat(firstDay);
                for (let d = 1; d <= daysInMonth; d++) {
                    const str = d === now.getDate() ? `\x1b[7m${d.toString().padStart(2)}\x1b[0m` : d.toString().padStart(2);
                    cal += str + " ";
                    if ((d + firstDay) % 7 === 0) cal += "\n";
                }
                return cal;
            }

            case "top":
            case "htop": {
                return `Processes: 42 total, 2 running, 40 sleeping\nCPU usage: ${metrics.cpu}%  |  Memory: ${metrics.ram}GB / 16GB  |  Network: ${metrics.network}MB/s\nBattery: ${batteryLevel}%\n\n  PID  COMMAND         %CPU  %MEM\n  001  node-kernel      ${metrics.cpu}.0   2.1\n  002  window-server    3.2   1.8\n  003  sequoia-ai       2.1   4.2\n  004  vfs-daemon       0.5   0.3\n  005  audio-engine     1.2   0.8`;
            }

            case "ps": {
                const procs = activeWindows.filter(w => !w.isMinimized).map((w, i) => `  ${(100 + i).toString().padEnd(6)} ${w.title.padEnd(20)} running`);
                return `  PID    COMMAND              STATUS\n` + procs.join("\n");
            }

            case "df": return `Filesystem      Size   Used  Avail  Use%  Mounted on\n/dev/disk1s1    256G    82G   174G   32%  /\ndevfs           120K   120K     0B  100%  /dev\ntmpfs           2.0G   512M   1.5G   25%  /tmp`;

            case "free": return `              total        used        free      shared     available\nMem:          16384        ${Math.floor(metrics.ram * 1024)}       ${16384 - Math.floor(metrics.ram * 1024)}           0       ${16384 - Math.floor(metrics.ram * 1024)}\nSwap:          4096           0        4096`;

            case "env":
            case "printenv": return Object.entries(env).map(([k, v]) => `${k}=${v}`).join("\n");

            case "export": {
                if (!args[0]) return Object.entries(env).map(([k, v]) => `declare -x ${k}="${v}"`).join("\n");
                const [key, ...valParts] = args[0].split("=");
                env[key] = valParts.join("=").replace(/^["']|["']$/g, "");
                return "";
            }

            case "which": {
                if (!args[0]) return "which: missing argument";
                const known = ["ls", "cd", "pwd", "mkdir", "cat", "echo", "rm", "cp", "mv", "curl", "node", "npm", "git", "python3", "clear", "exit"];
                return known.includes(args[0]) ? `/usr/local/bin/${args[0]}` : `${args[0]} not found`;
            }

            case "man": return args[0] ? `${args[0].toUpperCase()}(1)\n\nNAME\n    ${args[0]} — ${args[0]} command\n\nDESCRIPTION\n    Standard ${args[0]} implementation for Node OS.\n    Run '${args[0]} --help' for usage information.` : "What manual page do you want?";

            // --- NETWORK ---
            case "curl": {
                const urlArg = args.find(a => a.startsWith("http"));
                if (!urlArg) return "curl: try 'curl --help' for more information";
                const silent = args.includes("-s") || args.includes("--silent");
                if (!silent) writeLn(`  % Total    % Received`, "36");
                try {
                    const res = await fetch(urlArg);
                    const text = await res.text();
                    return text.substring(0, 2000) + (text.length > 2000 ? "\n... (truncated)" : "");
                } catch (e: any) {
                    return `curl: (7) Failed to connect: ${e.message}`;
                }
            }

            case "wget": {
                const urlArg = args.find(a => a.startsWith("http"));
                if (!urlArg) return "wget: missing URL";
                try {
                    const res = await fetch(urlArg);
                    const text = await res.text();
                    const filename = urlArg.split("/").pop() || "index.html";
                    const fullPath = resolvePath(env.cwd, filename);
                    const newVfs = setNode(vfsRef.current, fullPath, { name: filename, type: "file", content: text, updatedAt: Date.now() });
                    updateVFS(newVfs);
                    return `Saving to: '${filename}'\n${filename}    [${text.length} bytes]`;
                } catch (e: any) {
                    return `wget: unable to retrieve: ${e.message}`;
                }
            }

            case "ping": {
                const target = args[0] || "google.com";
                const lines = [`PING ${target} (142.250.80.46): 56 data bytes`];
                for (let i = 0; i < 4; i++) {
                    const ms = (Math.random() * 30 + 10).toFixed(1);
                    lines.push(`64 bytes from ${target}: icmp_seq=${i} ttl=118 time=${ms} ms`);
                }
                lines.push(`\n--- ${target} ping statistics ---\n4 packets transmitted, 4 received, 0% packet loss`);
                return lines.join("\n");
            }

            case "ifconfig":
            case "ip": return `en0: flags=8863<UP,BROADCAST,RUNNING,SIMPLEX,MULTICAST>\n  inet 192.168.1.${Math.floor(Math.random() * 254 + 1)} netmask 0xffffff00\n  ether a4:83:e7:xx:xx:xx\n  status: active\n\nlo0: flags=8049<UP,LOOPBACK,RUNNING,MULTICAST>\n  inet 127.0.0.1 netmask 0xff000000`;

            // --- NODE / JS ---
            case "node": {
                if (args[0] === "-v" || args[0] === "--version") return "v20.11.0";
                if (args[0] === "-e" || args[0] === "--eval") {
                    const code = args.slice(1).join(" ").replace(/^["']|["']$/g, "");
                    try {
                        const result = new Function(`"use strict"; return (${code})`)();
                        return String(result);
                    } catch (e: any) {
                        return `\x1b[31m${e.message}\x1b[0m`;
                    }
                }
                if (args[0] && !args[0].startsWith("-")) {
                    const fullPath = resolvePath(env.cwd, args[0]);
                    const file = getNode(vfsRef.current, fullPath);
                    if (!file || file.type !== "file") return `node: Cannot find module '${args[0]}'`;
                    try {
                        const fn = new Function("console", "require", "process", "module", "exports", file.content || "");
                        const logs: string[] = [];
                        const mockConsole = { log: (...a: any[]) => logs.push(a.map(String).join(" ")), error: (...a: any[]) => logs.push(`\x1b[31m${a.join(" ")}\x1b[0m`) };
                        fn(mockConsole, () => ({}), { env, argv: ["node", args[0], ...args.slice(1)], exit: () => {} }, {}, {});
                        return logs.join("\n");
                    } catch (e: any) {
                        return `\x1b[31m${e.stack || e.message}\x1b[0m`;
                    }
                }
                return "Welcome to Node.js v20.11.0.\nType node -e '<code>' to evaluate JavaScript.";
            }

            case "npm": {
                if (args[0] === "-v" || args[0] === "--version") return "10.2.4";
                if (args[0] === "init") return `Wrote to ${env.cwd}/package.json:\n{\n  "name": "${env.cwd.split("/").pop()}",\n  "version": "1.0.0"\n}`;
                if (args[0] === "install" || args[0] === "i") {
                    const pkg = args[1] || "";
                    if (!pkg) return "npm install <package> — Install a package";
                    writeLn(`\x1b[90mResolving ${pkg}@latest...\x1b[0m`);
                    await new Promise(r => setTimeout(r, 500));
                    return `added 1 package in 0.5s\n\n1 package is looking for funding\n  run \`npm fund\` for details`;
                }
                if (args[0] === "list" || args[0] === "ls") return `${env.cwd}\n└── (empty)`;
                return `npm <command>\n\nUsage:\n  npm init\n  npm install <pkg>\n  npm list\n  npm -v`;
            }

            case "npx": {
                if (!args[0]) return "npx: specify a package to execute";
                return `npx: '${args[0]}' would be executed in a full Node.js environment.\nThis is a browser-based terminal. Use 'node -e' for JavaScript execution.`;
            }

            // --- GIT ---
            case "git": {
                if (!args[0]) return "usage: git [--version] <command> [<args>]";
                if (args[0] === "--version") return "git version 2.42.0";
                if (args[0] === "init") {
                    const gitPath = resolvePath(env.cwd, ".git");
                    const newVfs = setNode(vfsRef.current, gitPath, { name: ".git", type: "directory", updatedAt: Date.now(), children: {} });
                    updateVFS(newVfs);
                    return `Initialized empty Git repository in ${env.cwd}/.git/`;
                }
                if (args[0] === "status") return "On branch main\nnothing to commit, working tree clean";
                if (args[0] === "clone") {
                    const repoUrl = args[1];
                    if (!repoUrl) return "usage: git clone <repository>";
                    const repoName = repoUrl.split("/").pop()?.replace(".git", "") || "repo";
                    writeLn(`Cloning into '${repoName}'...`, "36");
                    try {
                        const apiUrl = repoUrl.replace("https://github.com/", "https://api.github.com/repos/").replace(".git", "");
                        const res = await fetch(apiUrl);
                        const data = await res.json();
                        if (data.message) return `fatal: repository '${repoUrl}' not found`;
                        
                        const repoPath = resolvePath(env.cwd, repoName);
                        const readmeContent = `# ${data.name}\n\n${data.description || "No description"}\n\nStars: ${data.stargazers_count}\nLanguage: ${data.language}\nLicense: ${data.license?.name || "None"}`;
                        let newVfs = setNode(vfsRef.current, repoPath, { name: repoName, type: "directory", updatedAt: Date.now(), children: {} });
                        newVfs = setNode(newVfs, repoPath + "/README.md", { name: "README.md", type: "file", content: readmeContent, updatedAt: Date.now() });
                        newVfs = setNode(newVfs, repoPath + "/.git", { name: ".git", type: "directory", updatedAt: Date.now(), children: {} });
                        updateVFS(newVfs);
                        writeLn(`remote: Counting objects: ${data.size || 100}`, "90");
                        return `Receiving objects: 100%, done.\nResolving deltas: 100%, done.`;
                    } catch (e: any) {
                        return `fatal: unable to access '${repoUrl}': ${e.message}`;
                    }
                }
                return `git: '${args[0]}' is not a git command.`;
            }

            // --- PYTHON ---
            case "python":
            case "python3": {
                if (args[0] === "--version" || args[0] === "-V") return "Python 3.12.0";
                if (args[0] === "-c") {
                    const code = args.slice(1).join(" ").replace(/^["']|["']$/g, "");
                    // Simple Python-to-JS translation for basic operations
                    try {
                        const jsCode = code
                            .replace(/print\((.*)\)/g, "($1)")
                            .replace(/len\((.*)\)/g, "($1).length")
                            .replace(/range\((\d+)\)/g, "Array.from({length:$1},(_,i)=>i)")
                            .replace(/True/g, "true").replace(/False/g, "false").replace(/None/g, "null");
                        const result = new Function(`"use strict"; return ${jsCode}`)();
                        return String(result);
                    } catch {
                        return `Traceback: SyntaxError in evaluated expression.\nNote: Only basic Python expressions are supported in browser mode.`;
                    }
                }
                return "Python 3.12.0\nUse: python3 -c '<expression>' for evaluation.\nNote: Full Python requires a backend server.";
            }

            // --- DOCKER (simulated info) ---
            case "docker": {
                if (args[0] === "--version") return "Docker version 24.0.7, build 311b9ff (simulated)";
                if (args[0] === "ps") return "CONTAINER ID   IMAGE   COMMAND   CREATED   STATUS   PORTS   NAMES\n(no containers — Docker requires a backend server)";
                return "Docker commands require a backend server to execute.\nThis browser terminal cannot run containers directly.";
            }

            case "brew": {
                if (args[0] === "--version") return "Homebrew 4.2.0 (simulated)";
                return "Homebrew requires system-level access.\nThis browser terminal operates in a sandboxed environment.";
            }

            // --- UTILS ---
            case "clear": xtermRef.current?.clear(); return "";
            case "history": return historyRef.current.map((h, i) => `  ${(i + 1).toString().padStart(4)}  ${h}`).join("\n");
            case "exit": case "quit": closeWindow("terminal"); return "";
            
            case "sort": {
                const content = pipeInput || "";
                const lines = content.split("\n");
                return args.includes("-r") ? lines.sort().reverse().join("\n") : lines.sort().join("\n");
            }

            case "uniq": return (pipeInput || "").split("\n").filter((line, i, arr) => i === 0 || line !== arr[i - 1]).join("\n");
            case "tr": {
                if (args.length < 2 || !pipeInput) return "tr: missing operands";
                return pipeInput.split(args[0]).join(args[1]);
            }
            case "rev": return (pipeInput || args.join(" ")).split("").reverse().join("");
            case "base64": return pipeInput ? btoa(pipeInput) : (args[0] === "-d" && args[1]) ? atob(args[1]) : "Usage: echo text | base64";
            case "md5": case "sha256sum": return `${Array.from({length: 32}, () => Math.floor(Math.random()*16).toString(16)).join("")}  ${args[0] || "stdin"}`;

            case "sleep": {
                const secs = parseInt(args[0]) || 1;
                await new Promise(r => setTimeout(r, Math.min(secs, 5) * 1000));
                return "";
            }

            case "seq": {
                const start = args.length > 1 ? parseInt(args[0]) : 1;
                const end = parseInt(args.length > 1 ? args[1] : args[0]) || 10;
                return Array.from({length: end - start + 1}, (_, i) => start + i).join("\n");
            }

            case "yes": {
                const text = args[0] || "y";
                return Array(10).fill(text).join("\n") + "\n(stopped after 10 lines)";
            }

            case "help": return `\x1b[1;33mNode OS Shell (nsh) — Available Commands\x1b[0m

\x1b[1;36mFile System:\x1b[0m
  ls, cd, pwd, mkdir, touch, cat, rm, cp, mv, find, tree, head, tail, wc, grep

\x1b[1;36mNetwork:\x1b[0m
  curl <url>, wget <url>, ping <host>, ifconfig

\x1b[1;36mDevelopment:\x1b[0m
  node [-e code | file.js], npm [init|install|list], git [init|clone|status], python3 -c '<expr>'

\x1b[1;36mSystem:\x1b[0m
  whoami, hostname, uname, uptime, date, cal, top, ps, df, free, env, export, which, man, history

\x1b[1;36mUtilities:\x1b[0m
  echo, sort, uniq, tr, rev, base64, sleep, seq, clear, exit

\x1b[1;36mOperators:\x1b[0m  pipe (|), redirect (>), chain (&&)`;

            case "neofetch": return `\x1b[1;34m
    .---.      \x1b[0m  ${env.USER}@${hostname}
   \x1b[1;34m/     \\     \x1b[0m  ────────────────
  \x1b[1;34m|  O O  |    \x1b[0m  \x1b[1;33mOS:\x1b[0m Node OS Sequoia v2.8
  \x1b[1;34m|  ___  |    \x1b[0m  \x1b[1;33mKernel:\x1b[0m NSH 4.2.0
  \x1b[1;34m \\     /     \x1b[0m  \x1b[1;33mShell:\x1b[0m nsh (xterm)
   \x1b[1;34m'---'      \x1b[0m  \x1b[1;33mCPU:\x1b[0m Neural Tensor @ ${metrics.cpu}%
               \x1b[1;33mMemory:\x1b[0m ${metrics.ram}GB / 16GB
               \x1b[1;33mBattery:\x1b[0m ${batteryLevel}%
               \x1b[1;33mAccent:\x1b[0m ${accentColor}`;

            default:
                return `\x1b[31mnsh: command not found: ${cmd}\x1b[0m\nType 'help' for available commands.`;
        }
    }, [metrics, batteryLevel, hostname, accentColor, activeWindows, showPrompt, writeLn, updateVFS, closeWindow]);

    // Parse command string into tokens (respects quotes)
    const parseTokens = (cmd: string): string[] => {
        const tokens: string[] = [];
        let current = "";
        let inQuote = false;
        let quoteChar = "";
        for (const char of cmd) {
            if (inQuote) {
                if (char === quoteChar) { inQuote = false; } 
                else { current += char; }
            } else {
                if (char === '"' || char === "'") { inQuote = true; quoteChar = char; }
                else if (char === " ") { if (current) { tokens.push(current); current = ""; } }
                else { current += char; }
            }
        }
        if (current) tokens.push(current);
        return tokens;
    };

    // ============================================================
    // XTERM.JS INITIALIZATION
    // ============================================================
    useEffect(() => {
        if (!termRef.current) return;

        const term = new XTerminal({
            theme: {
                background: "#0c0c0e",
                foreground: "#e4e4e7",
                cursor: "#f59e0b",
                cursorAccent: "#0c0c0e",
                selectionBackground: "#f59e0b40",
                black: "#1c1c1e",
                red: "#ef4444",
                green: "#22c55e",
                yellow: "#f59e0b",
                blue: "#3b82f6",
                magenta: "#a855f7",
                cyan: "#06b6d4",
                white: "#e4e4e7",
                brightBlack: "#71717a",
                brightRed: "#f87171",
                brightGreen: "#4ade80",
                brightYellow: "#fbbf24",
                brightBlue: "#60a5fa",
                brightMagenta: "#c084fc",
                brightCyan: "#22d3ee",
                brightWhite: "#ffffff",
            },
            fontSize: 13,
            fontFamily: "'SF Mono', 'Fira Code', 'Cascadia Code', Menlo, Monaco, monospace",
            cursorBlink: true,
            cursorStyle: "bar",
            scrollback: 5000,
            allowProposedApi: true,
        });

        const fitAddon = new FitAddon();
        const webLinksAddon = new WebLinksAddon();
        term.loadAddon(fitAddon);
        term.loadAddon(webLinksAddon);
        term.open(termRef.current);

        setTimeout(() => fitAddon.fit(), 50);
        xtermRef.current = term;
        fitAddonRef.current = fitAddon;

        // Welcome message
        term.write("\x1b[1;34m");
        term.write("┌─────────────────────────────────────────┐\r\n");
        term.write("│  \x1b[1;33mNode OS Shell (nsh)\x1b[1;34m v4.2              │\r\n");
        term.write("│  Type 'help' for available commands      │\r\n");
        term.write("└─────────────────────────────────────────┘\r\n");
        term.write("\x1b[0m\r\n");
        showPrompt();

        // Handle resize
        const resizeObserver = new ResizeObserver(() => {
            try { fitAddon.fit(); } catch {}
        });
        resizeObserver.observe(termRef.current);

        // Handle input
        term.onKey(({ key, domEvent }) => {
            const ev = domEvent;
            const printable = !ev.altKey && !ev.ctrlKey && !ev.metaKey;

            if (ev.ctrlKey && ev.key === "c") {
                term.write("^C\r\n");
                inputBuffer.current = "";
                cursorPosRef.current = 0;
                showPrompt();
                return;
            }

            if (ev.ctrlKey && ev.key === "l") {
                term.clear();
                showPrompt();
                return;
            }

            if (ev.ctrlKey && ev.key === "u") {
                // Clear line
                const len = inputBuffer.current.length;
                term.write("\x1b[2K\r");
                inputBuffer.current = "";
                cursorPosRef.current = 0;
                showPrompt();
                return;
            }

            if (domEvent.keyCode === 13) { // Enter
                term.write("\r\n");
                const cmd = inputBuffer.current;
                inputBuffer.current = "";
                cursorPosRef.current = 0;
                if (cmd.trim()) {
                    historyRef.current.push(cmd);
                    historyIndexRef.current = historyRef.current.length;
                }
                executeCommand(cmd);
                return;
            }

            if (domEvent.keyCode === 8 || domEvent.keyCode === 127 || domEvent.keyCode === 46) { // Backspace or Delete
                if (inputBuffer.current.length > 0) {
                    inputBuffer.current = inputBuffer.current.slice(0, -1);
                    cursorPosRef.current = Math.max(0, cursorPosRef.current - 1);
                    term.write("\b \b");
                }
                return;
            }

            if (domEvent.keyCode === 38) { // Up arrow
                if (historyRef.current.length > 0) {
                    historyIndexRef.current = Math.max(0, historyIndexRef.current - 1);
                    const histCmd = historyRef.current[historyIndexRef.current] || "";
                    // Clear current line
                    term.write("\x1b[2K\r");
                    showPrompt();
                    term.write(histCmd);
                    inputBuffer.current = histCmd;
                    cursorPosRef.current = histCmd.length;
                }
                return;
            }

            if (domEvent.keyCode === 40) { // Down arrow
                historyIndexRef.current = Math.min(historyRef.current.length, historyIndexRef.current + 1);
                const histCmd = historyRef.current[historyIndexRef.current] || "";
                term.write("\x1b[2K\r");
                showPrompt();
                term.write(histCmd);
                inputBuffer.current = histCmd;
                cursorPosRef.current = histCmd.length;
                return;
            }

            if (domEvent.keyCode === 9) { // Tab completion
                ev.preventDefault();
                const partial = inputBuffer.current.split(" ").pop() || "";
                if (partial) {
                    const parentPath = resolvePath(envRef.current.cwd, partial.includes("/") ? partial.substring(0, partial.lastIndexOf("/")) || "/" : ".");
                    const node = getNode(vfsRef.current, parentPath);
                    const prefix = partial.includes("/") ? partial.substring(partial.lastIndexOf("/") + 1) : partial;
                    if (node?.children) {
                        const matches = Object.keys(node.children).filter(k => k.startsWith(prefix));
                        if (matches.length === 1) {
                            const completion = matches[0].slice(prefix.length);
                            const suffix = node.children[matches[0]].type === "directory" ? "/" : " ";
                            term.write(completion + suffix);
                            inputBuffer.current += completion + suffix;
                            cursorPosRef.current += completion.length + suffix.length;
                        } else if (matches.length > 1) {
                            term.write("\r\n" + matches.join("  ") + "\r\n");
                            showPrompt();
                            term.write(inputBuffer.current);
                        }
                    }
                }
                return;
            }

            if (printable) {
                inputBuffer.current += key;
                cursorPosRef.current++;
                term.write(key);
            }
        });

        // Handle paste
        term.onData((data) => {
            // Only handle paste events (multi-character input)
            if (data.length > 1 && !data.startsWith("\x1b")) {
                inputBuffer.current += data;
                cursorPosRef.current += data.length;
                term.write(data);
            }
        });

        return () => {
            resizeObserver.disconnect();
            term.dispose();
        };
    }, []);

    return (
        <div className="h-full w-full bg-[#0c0c0e] overflow-hidden">
            <div ref={termRef} className="h-full w-full" />
        </div>
    );
};

export default Terminal;
