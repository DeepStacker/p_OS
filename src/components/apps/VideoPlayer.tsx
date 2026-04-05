import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Maximize, 
  Volume2, 
  VolumeX, 
  Settings, 
  Subtitles, 
  Monitor, 
  FileVideo,
  ChevronLeft,
  Search,
  MoreVertical
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSystem } from '@/contexts/SystemContext';

const VideoPlayer = () => {
    const { addLog } = useSystem();
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [volume, setVolume] = useState(100);
    const [isMuted, setIsMuted] = useState(false);
    const [showControls, setShowControls] = useState(true);
    const [videoSrc, setVideoSrc] = useState("https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4");
    const controlsTimeoutRef = useRef<any>(null);

    const togglePlay = () => {
        if (videoRef.current) {
            if (isPlaying) videoRef.current.pause();
            else videoRef.current.play();
            setIsPlaying(!isPlaying);
        }
    };

    const handleTimeUpdate = () => {
        if (videoRef.current) {
            const current = (videoRef.current.currentTime / videoRef.current.duration) * 100;
            setProgress(current);
        }
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        const seekTime = (Number(e.target.value) / 100) * videoRef.current!.duration;
        videoRef.current!.currentTime = seekTime;
        setProgress(Number(e.target.value));
    };

    const handleMouseMove = () => {
        setShowControls(true);
        if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
        controlsTimeoutRef.current = setTimeout(() => setShowControls(false), 3000);
    };

    return (
        <div 
            className="h-full bg-black relative group overflow-hidden font-sans select-none"
            onMouseMove={handleMouseMove}
            onMouseLeave={() => setShowControls(false)}
        >
            {/* Core Neural Engine Video */}
            <video 
                ref={videoRef}
                src={videoSrc}
                className="w-full h-full object-contain"
                onTimeUpdate={handleTimeUpdate}
                onClick={togglePlay}
                playsInline
            />

            {/* Glass Control Layer */}
            <AnimatePresence>
                {showControls && (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="absolute inset-x-0 bottom-0 p-8 bg-gradient-to-t from-black/80 to-transparent flex flex-col gap-6"
                    >
                        {/* Progress Synthesis Bar */}
                        <div className="group/progress relative h-1.5 w-full bg-white/10 rounded-full cursor-pointer hover:h-2 transition-all overflow-hidden p-0.5 border border-white/5">
                            <input 
                                type="range"
                                min="0" max="100"
                                value={progress}
                                onChange={handleSeek}
                                className="absolute inset-0 opacity-0 cursor-pointer z-10"
                            />
                            <motion.div 
                                className="h-full bg-primary shadow-[0_0_15px_rgba(var(--primary),0.5)] rounded-full relative"
                                style={{ width: `${progress}%` }}
                            >
                                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-3xl opacity-0 group-hover/progress:opacity-100 transition-opacity" />
                            </motion.div>
                        </div>

                        {/* Control Deck */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-8">
                                <button onClick={togglePlay} className="text-white hover:text-primary transition-all active:scale-90 p-2">
                                    {isPlaying ? <Pause className="h-6 w-6 fill-current" /> : <Play className="h-6 w-6 fill-current" />}
                                </button>
                                <button className="text-white hover:text-primary transition-all p-2"><RotateCcw className="h-5 w-5" /></button>
                                
                                <div className="flex items-center gap-4 group/vol px-4 py-2 hover:bg-white/5 rounded-2xl transition-all">
                                    <button onClick={() => setIsMuted(!isMuted)} className="text-white/80 hover:text-white">
                                        {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                                    </button>
                                    <div className="w-0 group-hover/vol:w-24 transition-all duration-300 overflow-hidden h-1.5 bg-white/10 rounded-full p-0.5 border border-white/5">
                                        <div className="h-full bg-white opacity-40 rounded-full" style={{ width: `${volume}%` }} />
                                    </div>
                                </div>

                                <div className="h-5 w-px bg-white/10 mx-2" />
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black text-white uppercase tracking-tight">Cinematic Logic</span>
                                    <div className="flex items-center gap-2">
                                       <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_5px_emerald]" />
                                       <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest">Global Feed Active</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-6 text-zinc-400">
                                <button className="hover:text-white transition-all p-2"><Subtitles className="h-5 w-5" /></button>
                                <button className="hover:text-white transition-all p-2"><Settings className="h-5 w-5" /></button>
                                <button className="hover:text-white transition-all p-2"><Maximize className="h-5 w-5" /></button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Neural Overlay: File Ingestion (Pro Feature) */}
            <AnimatePresence>
               {!isPlaying && !showControls && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute top-10 right-10 p-6 rounded-3xl bg-black/40 backdrop-blur-3xl border border-white/5 flex flex-col gap-4 shadow-3xl"
                  >
                     <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 text-primary">
                           <FileVideo className="h-5 w-5" />
                        </div>
                        <div className="flex flex-col">
                           <span className="text-[10px] font-black text-white uppercase tracking-widest">Node VFS</span>
                           <span className="text-[8px] font-bold text-zinc-600 uppercase">Synchronized Volume</span>
                        </div>
                     </div>
                     <button className="px-6 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-[9px] font-black uppercase tracking-widest border border-white/5 transition-all text-white/60">Load External Node</button>
                  </motion.div>
               )}
            </AnimatePresence>

            {/* Empty State / Initial Hub */}
            {!videoSrc && (
               <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-950 px-20 text-center">
                  <div className="w-24 h-24 rounded-[40px] bg-primary/20 flex items-center justify-center border border-primary/20 text-primary mb-8 shadow-4xl animate-pulse">
                     <FileVideo className="h-10 w-10" />
                  </div>
                  <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-4 italic">Cinematic Engine Node</h2>
                  <p className="text-[11px] font-black text-zinc-600 uppercase tracking-[0.5em] max-w-sm mb-12">Universal 4K Deceleration Suite • Integrated VFS • Prime Tier</p>
                  <div className="flex items-center gap-4 bg-white/5 p-4 rounded-3xl border border-white/5 w-full max-w-md">
                     <Search className="h-5 w-5 text-zinc-600 ml-2" />
                     <input 
                        type="text" 
                        placeholder="PROVIDE REMOTE REPO URL" 
                        className="bg-transparent border-none w-full text-xs font-black text-white tracking-widest focus:outline-none placeholder:opacity-20"
                        onKeyDown={(e) => {
                           if (e.key === 'Enter') {
                              const url = (e.target as HTMLInputElement).value;
                              if (url.startsWith('http')) {
                                 setVideoSrc(url);
                                 addLog("Cinematic feed initialized", "success");
                              }
                           }
                        }}
                     />
                  </div>
               </div>
            )}
        </div>
    );
};

export default VideoPlayer;
