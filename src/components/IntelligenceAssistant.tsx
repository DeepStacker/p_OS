import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  BrainCircuit, X, Mic, MicOff, Play, Loader2, 
  Sparkles, Volume2, VolumeX, Trash2, ChevronUp,
  Search, Briefcase, FileText, Image as ImageIcon, 
  Terminal, Settings, RotateCcw
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSystem } from "@/contexts/SystemContext";
import { useAuth } from "@/contexts/AuthContext";
import { askSequoia, SequoiaAction, RAGContext } from "@/lib/intelligence";
import ReactMarkdown from "react-markdown";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

type VoiceState = "idle" | "listening" | "processing" | "speaking";

const QUICK_ACTIONS = [
  { label: "Find React jobs", icon: Briefcase },
  { label: "Open Notes", icon: FileText },
  { label: "Change wallpaper to space", icon: ImageIcon },
  { label: "What files do I have?", icon: Search },
  { label: "Open Terminal", icon: Terminal },
  { label: "System status", icon: Settings },
];

const SequoiaAssistant: React.FC = () => {
  const system = useSystem();
  const { metrics, powerStatus, dockApps, vfs, activeWindows, batteryLevel, isWifiEnabled, hostname, accentColor, wallpaper } = system;
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [transcript, setTranscript] = useState("");
  const [voiceState, setVoiceState] = useState<VoiceState>("idle");
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [voiceSupported, setVoiceSupported] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const isListeningRef = useRef(false);
  const wasVoiceInitiatedRef = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Build RAG context from system state
  const ragContext = useMemo((): RAGContext => {
    const vfsFiles: Array<{name: string; snippet: string}> = [];
    const docs = vfs.children?.Users?.children?.node?.children?.Documents?.children;
    if (docs) {
      Object.values(docs).forEach((f: any) => {
        vfsFiles.push({ name: f.name, snippet: (f.content || "").substring(0, 80) });
      });
    }

    return {
      conversationHistory: messages.filter(m => m.content).map(m => ({ role: m.role, content: m.content })),
      vfsFiles,
      openWindows: activeWindows.filter(w => !w.isMinimized).map(w => w.title),
      systemState: {
        battery: batteryLevel,
        cpu: metrics.cpu,
        ram: metrics.ram,
        wifi: isWifiEnabled,
        hostname,
        wallpaper: wallpaper.startsWith("live:") ? `Live: ${wallpaper.replace("live:", "")}` : "Static image",
        accentColor,
      }
    };
  }, [vfs, activeWindows, batteryLevel, metrics, isWifiEnabled, hostname, wallpaper, accentColor, messages]);

  // Initialize speech recognition
  useEffect(() => {
    const handleToggle = () => setIsOpen(prev => !prev);
    window.addEventListener("toggle-intelligence", handleToggle);

    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      setVoiceSupported(true);
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onresult = (event: any) => {
        const current = event.resultIndex;
        const text = event.results[current][0].transcript;
        setTranscript(text);

        // Interrupt TTS if user speaks
        if (window.speechSynthesis.speaking) {
          window.speechSynthesis.cancel();
          setVoiceState("listening");
        }

        if (event.results[current].isFinal) {
          handleSend(text);
          setTranscript("");
        }
      };

      recognition.onerror = () => {
        setVoiceState("idle");
        isListeningRef.current = false;
      };

      recognition.onend = () => {
        // Use ref to avoid stale closure
        if (isListeningRef.current) {
          try { recognition.start(); } catch (e) {}
        } else {
          setVoiceState("idle");
        }
      };

      recognitionRef.current = recognition;
    }

    return () => window.removeEventListener("toggle-intelligence", handleToggle);
  }, []);

  // Auto-scroll messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 300);
  }, [isOpen]);

  const handleAction = (action: SequoiaAction) => {
    switch (action.type) {
      case "OPEN_APP": {
        const app = dockApps.find(a => a.id === action.payload || a.name.toLowerCase() === action.payload.toLowerCase());
        if (app) system.openWindow(app.id, app.name, <app.icon className="h-4 w-4" />, app.component);
        break;
      }
      case "SET_WALLPAPER":
        system.setWallpaper(action.payload);
        break;
      case "LOCK":
        system.setPowerStatus("locked");
        break;
      case "POWER":
        system.triggerPowerAction(action.payload);
        break;
    }
  };

  const speak = (text: string) => {
    if (!ttsEnabled) return;
    setVoiceState("speaking");
    const clean = text.replace(/[*#`\[\]]/g, "").substring(0, 500);
    const sentences = clean.match(/[^.!?]+[.!?]+/g) || [clean];
    
    sentences.forEach((sentence, i) => {
      const utter = new SpeechSynthesisUtterance(sentence.trim());
      utter.rate = 1.05;
      utter.pitch = 1.0;
      if (i === sentences.length - 1) {
        utter.onend = () => setVoiceState("idle");
      }
      window.speechSynthesis.speak(utter);
    });
  };

  const toggleListening = () => {
    if (isListeningRef.current) {
      recognitionRef.current?.stop();
      isListeningRef.current = false;
      setVoiceState("idle");
    } else {
      setTranscript("");
      try {
        recognitionRef.current?.start();
        isListeningRef.current = true;
        setVoiceState("listening");
      } catch (e) {}
    }
  };

  const handleSend = async (forcedText?: string) => {
    const text = forcedText || inputValue;
    if (!text.trim() || isStreaming) return;

    // Track if this was a voice-initiated query
    wasVoiceInitiatedRef.current = !!forcedText;

    // Stop listening during processing
    if (isListeningRef.current) {
      recognitionRef.current?.stop();
      isListeningRef.current = false;
    }

    const userMsg: Message = { id: Date.now().toString(), role: "user", content: text.trim(), timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) };
    setMessages(prev => [...prev, userMsg]);
    setInputValue("");
    setTranscript("");
    setIsStreaming(true);
    setVoiceState("processing");
    setCurrentStatus("Analyzing your request...");

    const aiMsg: Message = { id: (Date.now() + 1).toString(), role: "assistant", content: "", timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) };
    setMessages(prev => [...prev, aiMsg]);

    try {
      let fullText = "";
      await askSequoia(text.trim(), (chunk, status, action) => {
        if (status) {
          const statusMap: Record<string, string> = {
            SYNTHESIZING_INTENT: "Understanding your request...",
            INDEXING_JOB_MARKETS: "Searching job markets...",
            ANALYZING_VFS_REPOSITORIES: "Analyzing repository...",
            EXECUTING_SYSTEM_OVERRIDE: "Executing command...",
            ADAPTING_ENVIRONMENT_AESTHETICS: "Changing wallpaper...",
            OPENING_OPPORTUNITY_INDEXER: "Opening Jobs app...",
            SYNTHESIZING_FINAL_RESPONSE: "Writing response...",
          };
          setCurrentStatus(statusMap[status] || "Processing...");
        }
        if (action) handleAction(action);
        if (chunk) {
          fullText += chunk;
          setMessages(prev => prev.map(m => m.id === aiMsg.id ? { ...m, content: fullText } : m));
        }
      }, ragContext);

      if (fullText && wasVoiceInitiatedRef.current) speak(fullText);
    } catch (err) {
      setMessages(prev => prev.map(m => m.id === aiMsg.id ? { ...m, content: "Something went wrong. Please try again." } : m));
    } finally {
      setIsStreaming(false);
      setCurrentStatus(null);
      if (voiceState !== "speaking") setVoiceState("idle");
    }
  };

  if (powerStatus === "locked" || powerStatus === "sleep" || !user) return null;

  const getStatusLabel = () => {
    if (currentStatus) return currentStatus;
    if (voiceState === "listening") return "Listening...";
    if (voiceState === "speaking") return "Speaking...";
    if (voiceState === "processing") return "Thinking...";
    return null;
  };

  return (
    <div className="fixed inset-0 z-[2000] pointer-events-none select-none font-sans">
      {/* Full-Screen Siri-Style Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 pointer-events-auto flex flex-col"
            style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(40px)", WebkitBackdropFilter: "blur(40px)" }}
          >
            {/* Top bar */}
            <div className="flex items-center justify-between px-8 pt-8">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center shadow-lg">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <span className="text-sm font-semibold text-white/80">Sequoia</span>
                {getStatusLabel() && (
                  <span className="text-xs text-white/40 animate-pulse">{getStatusLabel()}</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setTtsEnabled(!ttsEnabled)}
                  className="p-2 rounded-xl hover:bg-white/10 text-white/40 hover:text-white transition-all"
                  title={ttsEnabled ? "Mute voice" : "Enable voice"}
                >
                  {ttsEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                </button>
                <button
                  onClick={() => { setMessages([]); }}
                  className="p-2 rounded-xl hover:bg-white/10 text-white/40 hover:text-red-400 transition-all"
                  title="Clear conversation"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-xl hover:bg-white/10 text-white/40 hover:text-white transition-all"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Conversation Area */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-8 py-6 space-y-4">
              {messages.length === 0 && !isStreaming && (
                <div className="flex flex-col items-center justify-center h-full gap-8">
                  {/* Waveform Centerpiece */}
                  <motion.div
                    animate={{
                      scale: voiceState === "listening" ? [1, 1.08, 1] : 1,
                    }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="relative"
                  >
                    <div className={cn(
                      "w-28 h-28 rounded-full flex items-center justify-center transition-all duration-700",
                      voiceState === "listening"
                        ? "bg-gradient-to-br from-green-500/30 to-emerald-500/20 shadow-[0_0_80px_rgba(34,197,94,0.2)]"
                        : "bg-gradient-to-br from-violet-500/20 to-blue-500/20 shadow-[0_0_60px_rgba(139,92,246,0.15)]"
                    )}>
                      {voiceState === "listening" ? (
                        <div className="flex gap-[3px] items-center">
                          {[1,2,3,4,5,6,7].map(i => (
                            <motion.div
                              key={i}
                              animate={{ height: [4, Math.random() * 28 + 8, 4] }}
                              transition={{ repeat: Infinity, duration: 0.4 + Math.random() * 0.3, delay: i * 0.05 }}
                              className="w-[3px] rounded-full bg-green-400"
                            />
                          ))}
                        </div>
                      ) : (
                        <Sparkles className="h-10 w-10 text-violet-400/60" />
                      )}
                    </div>
                  </motion.div>

                  <div className="text-center space-y-2">
                    <h2 className="text-2xl font-semibold text-white/90">How can I help?</h2>
                    <p className="text-sm text-white/40 max-w-md">Ask me anything about your workspace, find jobs, open apps, or just chat.</p>
                  </div>

                  {/* Quick Action Chips */}
                  <div className="flex flex-wrap gap-2 max-w-lg justify-center">
                    {QUICK_ACTIONS.map((action, i) => (
                      <motion.button
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        onClick={() => handleSend(action.label)}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/5 border border-white/10 text-sm text-white/70 hover:bg-white/10 hover:text-white hover:border-white/20 transition-all"
                      >
                        <action.icon className="h-3.5 w-3.5" />
                        {action.label}
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}
                >
                  <div className={cn(
                    "max-w-[70%] rounded-2xl px-5 py-4",
                    msg.role === "user"
                      ? "bg-blue-500/20 border border-blue-500/20 text-white"
                      : "bg-white/5 border border-white/10 text-white/90"
                  )}>
                    {msg.role === "assistant" && (
                      <div className="flex items-center gap-2 mb-2 pb-2 border-b border-white/5">
                        <div className="w-5 h-5 rounded-full bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center">
                          <Sparkles className="h-2.5 w-2.5 text-white" />
                        </div>
                        <span className="text-xs text-white/40 font-medium">Sequoia</span>
                        <span className="text-[10px] text-white/20 ml-auto">{msg.timestamp}</span>
                      </div>
                    )}
                    {msg.content ? (
                      <div className="prose prose-invert prose-sm max-w-none prose-p:leading-relaxed prose-p:my-1.5 prose-strong:text-blue-300 prose-code:text-violet-300 prose-pre:bg-black/30 prose-pre:border prose-pre:border-white/10 prose-li:my-0.5 prose-headings:text-white/90">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin text-violet-400" />
                        <span className="text-sm text-white/40">{currentStatus || "Thinking..."}</span>
                      </div>
                    )}
                    {msg.role === "user" && (
                      <div className="text-[10px] text-white/20 mt-2 text-right">{msg.timestamp}</div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Bottom Input Area */}
            <div className="px-8 pb-8 pt-4 space-y-3">
              {/* Live transcript preview */}
              <AnimatePresence>
                {voiceState === "listening" && transcript && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="px-5 py-3 rounded-2xl bg-green-500/10 border border-green-500/20 text-sm text-green-300 italic"
                  >
                    "{transcript}"
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex items-center gap-3">
                {/* Mic button */}
                {voiceSupported && (
                  <button
                    onClick={toggleListening}
                    className={cn(
                      "w-12 h-12 rounded-2xl flex items-center justify-center transition-all shrink-0",
                      voiceState === "listening"
                        ? "bg-green-500 text-white shadow-lg shadow-green-500/30"
                        : voiceState === "speaking"
                        ? "bg-violet-500 text-white shadow-lg shadow-violet-500/30"
                        : "bg-white/10 text-white/50 hover:text-white hover:bg-white/15"
                    )}
                  >
                    {voiceState === "listening" ? (
                      <Mic className="h-5 w-5 animate-pulse" />
                    ) : voiceState === "speaking" ? (
                      <Volume2 className="h-5 w-5 animate-pulse" />
                    ) : (
                      <Mic className="h-5 w-5" />
                    )}
                  </button>
                )}

                {/* Text input */}
                <div className="flex-1 relative">
                  <input
                    ref={inputRef}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                    placeholder="Ask Sequoia anything..."
                    disabled={isStreaming}
                    className="w-full bg-white/10 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/20 focus:ring-2 focus:ring-violet-500/20 transition-all disabled:opacity-50"
                  />
                </div>

                {/* Send button */}
                <button
                  onClick={() => handleSend()}
                  disabled={!inputValue.trim() || isStreaming}
                  className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center transition-all shrink-0",
                    inputValue.trim() && !isStreaming
                      ? "bg-gradient-to-br from-violet-500 to-blue-500 text-white shadow-lg shadow-violet-500/30 hover:shadow-violet-500/50"
                      : "bg-white/5 text-white/20"
                  )}
                >
                  {isStreaming ? <Loader2 className="h-5 w-5 animate-spin" /> : <Play className="h-5 w-5 fill-current" />}
                </button>
              </div>

              {/* Keyboard hints */}
              <div className="flex items-center justify-center gap-6 text-[11px] text-white/20">
                <span>⌘⇧S to toggle</span>
                <span>•</span>
                <span>Enter to send</span>
                {voiceSupported && (
                  <>
                    <span>•</span>
                    <span>Click mic for voice</span>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Trigger Orb */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="absolute bottom-8 right-8 pointer-events-auto"
          >
            <button
              onClick={() => setIsOpen(true)}
              className="w-14 h-14 rounded-full bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center shadow-2xl shadow-violet-500/30 hover:shadow-violet-500/50 hover:scale-110 active:scale-95 transition-all group relative"
            >
              <Sparkles className="h-6 w-6 text-white" />
              {/* Active indicator */}
              {(voiceState === "listening" || isStreaming) && (
                <motion.div
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-green-500 border-2 border-black"
                />
              )}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SequoiaAssistant;
