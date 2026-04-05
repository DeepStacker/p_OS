import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack, 
  Volume2, 
  Music as MusicIcon, 
  ListMusic, 
  Heart, 
  Repeat, 
  Shuffle,
  Mic2,
  Share,
  MoreHorizontal
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSystem } from '@/contexts/SystemContext';

const PLAYLIST = [
  { id: 1, title: "Lofi Neural Node", artist: "Sequoia Ambient", duration: "3:45", color: "from-indigo-500/20 to-purple-500/20" },
  { id: 2, title: "Synthwave Incursion", artist: "Cyber Runner", duration: "4:12", color: "from-rose-500/20 to-orange-500/20" },
  { id: 3, title: "Deep Work Flow", artist: "Focus Engine", duration: "2:58", color: "from-emerald-500/20 to-teal-500/20" },
  { id: 4, title: "Night Drive Node", artist: "Vector Glide", duration: "3:30", color: "from-blue-500/20 to-cyan-500/20" },
  { id: 5, title: "Binary Dreams", artist: "Silicon Pulse", duration: "5:10", color: "from-zinc-500/20 to-slate-500/20" }
];

const Music = () => {
    const { addLog } = useSystem();
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTrack, setCurrentTrack] = useState(PLAYLIST[0]);
    const [progress, setProgress] = useState(0);
    const [volume, setVolume] = useState(80);

    // Simulated Progress Sync
    useEffect(() => {
        let interval: any;
        if (isPlaying) {
            interval = setInterval(() => {
                setProgress(prev => (prev >= 100 ? 0 : prev + 0.5));
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isPlaying]);

    const handlePlayPause = () => {
        setIsPlaying(!isPlaying);
        addLog(isPlaying ? "Audio stream paused" : `Symphony active: Playing ${currentTrack.title}`, isPlaying ? "info" : "success");
    };

    return (
        <div className="h-full flex flex-col bg-[#0A0A0A] text-white font-sans overflow-hidden">
            <div className="flex-1 flex overflow-hidden">
                {/* Playlist Sidebar */}
                <aside className="w-64 bg-black/40 border-r border-white/5 flex flex-col p-6 overflow-y-auto no-scrollbar">
                    <div className="flex items-center gap-3 mb-10 px-2">
                        <div className="w-10 h-10 rounded-2xl bg-primary/20 flex items-center justify-center border border-primary/20 text-primary">
                            <ListMusic className="h-5 w-5" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Node Audio</span>
                            <span className="text-[12px] font-black uppercase text-white">Symphony Pro</span>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest px-3 mb-4 block">Universal Feed</span>
                        {PLAYLIST.map(track => (
                            <button 
                                key={track.id}
                                onClick={() => { setCurrentTrack(track); setProgress(0); setIsPlaying(true); }}
                                className={cn(
                                    "w-full flex items-center gap-4 p-3 rounded-2xl transition-all group relative",
                                    currentTrack.id === track.id ? "bg-white/5 border border-white/10" : "hover:bg-white/5 border border-transparent"
                                )}
                            >
                                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br shadow-lg", track.color)}>
                                    <MusicIcon className={cn("h-4 w-4", currentTrack.id === track.id ? "text-primary" : "text-white/40")} />
                                </div>
                                <div className="flex flex-col text-left overflow-hidden">
                                    <span className={cn("text-[11px] font-black truncate", currentTrack.id === track.id ? "text-primary" : "text-white")}>{track.title}</span>
                                    <span className="text-[9px] font-bold text-zinc-600 truncate uppercase mt-0.5">{track.artist}</span>
                                </div>
                            </button>
                        ))}
                    </div>
                </aside>

                {/* Main Visualizer Player */}
                <main className="flex-1 relative flex flex-col items-center justify-center p-12 overflow-hidden bg-gradient-to-b from-primary/5 to-transparent">
                    {/* Background Visualizer Nodes */}
                    <div className="absolute inset-0 pointer-events-none transition-all duration-1000">
                        <div className={cn("absolute inset-0 bg-gradient-to-br opacity-20 blur-[120px] transition-all duration-1000", currentTrack.color)} />
                        <AnimatePresence>
                           {isPlaying && (
                              <div className="absolute inset-x-0 bottom-0 top-1/2 flex items-end justify-center gap-1.5 px-20 pb-40 opacity-20">
                                 {[...Array(24)].map((_, i) => (
                                    <motion.div 
                                       key={i}
                                       initial={{ height: 10 }}
                                       animate={{ height: [Math.random()*120 + 20, Math.random()*120 + 20, Math.random()*120 + 20] }}
                                       transition={{ repeat: Infinity, duration: 1.5, delay: i * 0.05 }}
                                       className="w-2.5 bg-primary/40 rounded-full"
                                    />
                                 ))}
                              </div>
                           )}
                        </AnimatePresence>
                    </div>

                    {/* Album Art Synthesis */}
                    <motion.div 
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        key={currentTrack.id}
                        className="relative z-10 w-72 h-72 mb-12"
                    >
                        <div className={cn("absolute inset-0 rounded-[48px] bg-gradient-to-br shadow-5xl border border-white/10 flex flex-col items-center justify-center transition-all duration-1000", currentTrack.color)}>
                            <MusicIcon className={cn("h-24 w-24 text-white/10", isPlaying && "animate-spin-slow")} />
                        </div>
                        {/* Interactive UI Nodes */}
                        <div className="absolute -right-6 top-1/2 -translate-y-1/2 flex flex-col gap-4">
                           <button className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-3xl border border-white/10 flex items-center justify-center hover:bg-rose-500/20 text-white/40 hover:text-rose-500 transition-all shadow-2xl"><Heart className="h-4 w-4" /></button>
                           <button className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-3xl border border-white/10 flex items-center justify-center hover:bg-white/10 text-white/40 transition-all shadow-2xl"><Mic2 className="h-4 w-4" /></button>
                           <button className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-3xl border border-white/10 flex items-center justify-center hover:bg-white/10 text-white/40 transition-all shadow-2xl"><Share className="h-4 w-4" /></button>
                        </div>
                    </motion.div>

                    <div className="relative z-10 text-center space-y-2 mb-10">
                        <h2 className="text-4xl font-black text-white italic tracking-tighter uppercase">{currentTrack.title}</h2>
                        <span className="text-[11px] font-black text-primary uppercase tracking-[0.4em] block">{currentTrack.artist}</span>
                    </div>

                    {/* Core Controls */}
                    <div className="relative z-10 w-full max-w-xl space-y-10">
                        <div className="space-y-4">
                            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden p-0.5 border border-white/5 cursor-pointer group">
                                <motion.div 
                                    className="h-full bg-primary shadow-2xl shadow-primary/40 rounded-full relative" 
                                    style={{ width: `${progress}%` }}
                                >
                                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full opacity-0 group-hover:opacity-100 shadow-3xl transition-opacity" />
                                </motion.div>
                            </div>
                            <div className="flex justify-between text-[9px] font-black text-zinc-700 uppercase tracking-widest italic">
                                <span>0:{(Math.floor(progress * 2.2)).toString().padStart(2, '0')}</span>
                                <span>{currentTrack.duration}</span>
                            </div>
                        </div>

                        <div className="flex items-center justify-center gap-10">
                           <button className="text-zinc-600 hover:text-white transition-colors"><Shuffle className="h-5 w-5" /></button>
                           <button className="text-white hover:text-primary transition-all active:scale-90"><SkipBack className="h-7 w-7" /></button>
                           <button 
                                onClick={handlePlayPause}
                                className="w-20 h-20 rounded-[32px] bg-primary text-black flex items-center justify-center shadow-4xl hover:scale-105 active:scale-95 transition-all shadow-primary/40"
                           >
                                {isPlaying ? <Pause className="h-8 w-8 fill-current" /> : <Play className="h-8 w-8 fill-current" />}
                           </button>
                           <button className="text-white hover:text-primary transition-all active:scale-90"><SkipForward className="h-7 w-7" /></button>
                           <button className="text-zinc-600 hover:text-white transition-colors"><Repeat className="h-5 w-5" /></button>
                        </div>
                    </div>
                </main>
            </div>

            {/* Bottom Playback Strip */}
            <footer className="h-10 border-t border-white/5 bg-black/40 flex items-center justify-between px-10 relative z-20 shrink-0">
                <div className="flex items-center gap-6">
                    <span className="text-[10px] font-black text-primary tracking-widest uppercase italic">Node_Stream_Live</span>
                    <div className="h-4 w-px bg-white/5" />
                    <span className="text-[9px] font-bold text-zinc-700 uppercase tracking-widest">Symphony Architecture v1.0.2</span>
                </div>
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-4">
                        <Volume2 className="h-4 w-4 text-zinc-600" />
                        <div className="w-24 h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
                            <motion.div animate={{ width: `${volume}%` }} className="h-full bg-white opacity-40 shadow-inner" />
                        </div>
                    </div>
                    <button className="p-2 text-zinc-600 hover:text-white transition-all"><MoreHorizontal className="h-4 w-4" /></button>
                </div>
            </footer>
        </div>
    );
};

export default Music;
