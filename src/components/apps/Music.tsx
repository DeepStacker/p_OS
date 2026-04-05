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
  MoreHorizontal,
  Upload,
  Radio
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSystem } from '@/contexts/SystemContext';

// Real, royalty-free audio tracks from the web
const PLAYLIST = [
  { id: 1, title: "Inspiring Cinematic", artist: "Ambient Studio", duration: 130, color: "from-indigo-500/20 to-purple-500/20", src: "https://www.bensound.com/bensound-music/bensound-inspire.mp3" },
  { id: 2, title: "Creative Minds", artist: "Bensound", duration: 148, color: "from-rose-500/20 to-orange-500/20", src: "https://www.bensound.com/bensound-music/bensound-creativeminds.mp3" },
  { id: 3, title: "Acoustic Breeze", artist: "Bensound", duration: 217, color: "from-emerald-500/20 to-teal-500/20", src: "https://www.bensound.com/bensound-music/bensound-acousticbreeze.mp3" },
  { id: 4, title: "Happy Rock", artist: "Bensound", duration: 105, color: "from-blue-500/20 to-cyan-500/20", src: "https://www.bensound.com/bensound-music/bensound-happyrock.mp3" },
  { id: 5, title: "Jazzy Frenchy", artist: "Bensound", duration: 125, color: "from-amber-500/20 to-yellow-500/20", src: "https://www.bensound.com/bensound-music/bensound-jazzyfrenchy.mp3" },
];

const formatTime = (seconds: number): string => {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
};

const Music = () => {
    const { addLog } = useSystem();
    const audioRef = useRef<HTMLAudioElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTrack, setCurrentTrack] = useState(PLAYLIST[0]);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(0.8);
    const [isShuffled, setIsShuffled] = useState(false);
    const [isRepeating, setIsRepeating] = useState(false);
    const [liked, setLiked] = useState<number[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Sync audio element with state
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;
        audio.volume = volume;
    }, [volume]);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;
        
        const updateTime = () => setCurrentTime(audio.currentTime);
        const updateDuration = () => setDuration(audio.duration);
        const handleEnded = () => {
            if (isRepeating) {
                audio.currentTime = 0;
                audio.play();
            } else {
                handleNext();
            }
        };

        audio.addEventListener("timeupdate", updateTime);
        audio.addEventListener("loadedmetadata", updateDuration);
        audio.addEventListener("ended", handleEnded);
        return () => {
            audio.removeEventListener("timeupdate", updateTime);
            audio.removeEventListener("loadedmetadata", updateDuration);
            audio.removeEventListener("ended", handleEnded);
        };
    }, [currentTrack, isRepeating]);

    const playTrack = (track: typeof PLAYLIST[0]) => {
        setCurrentTrack(track);
        setCurrentTime(0);
        setTimeout(() => {
            if (audioRef.current) {
                audioRef.current.play().catch(() => {});
                setIsPlaying(true);
            }
        }, 100);
        addLog(`Now playing: ${track.title}`, "success");
    };

    const togglePlayPause = () => {
        const audio = audioRef.current;
        if (!audio) return;
        if (isPlaying) {
            audio.pause();
        } else {
            audio.play().catch(() => {});
        }
        setIsPlaying(!isPlaying);
    };

    const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!audioRef.current || !duration) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const ratio = (e.clientX - rect.left) / rect.width;
        audioRef.current.currentTime = ratio * duration;
    };

    const handleNext = () => {
        const idx = PLAYLIST.findIndex(t => t.id === currentTrack.id);
        const next = isShuffled
            ? PLAYLIST[Math.floor(Math.random() * PLAYLIST.length)]
            : PLAYLIST[(idx + 1) % PLAYLIST.length];
        playTrack(next);
    };

    const handlePrev = () => {
        if (currentTime > 3 && audioRef.current) {
            audioRef.current.currentTime = 0;
            return;
        }
        const idx = PLAYLIST.findIndex(t => t.id === currentTrack.id);
        const prev = PLAYLIST[(idx - 1 + PLAYLIST.length) % PLAYLIST.length];
        playTrack(prev);
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const url = URL.createObjectURL(file);
        const newTrack = {
            id: Date.now(),
            title: file.name.replace(/\.[^/.]+$/, ""),
            artist: "Local File",
            duration: 0,
            color: "from-violet-500/20 to-pink-500/20",
            src: url,
        };
        PLAYLIST.push(newTrack);
        playTrack(newTrack);
    };

    const progress = duration ? (currentTime / duration) * 100 : 0;

    return (
        <div className="h-full flex flex-col bg-[#0A0A0A] text-white font-sans overflow-hidden">
            {/* Hidden audio element - the real engine */}
            <audio ref={audioRef} src={currentTrack.src} preload="metadata" />
            <input ref={fileInputRef} type="file" accept="audio/*" className="hidden" onChange={handleFileUpload} />

            <div className="flex-1 flex overflow-hidden">
                {/* Playlist Sidebar */}
                <aside className="w-64 bg-black/40 border-r border-white/5 flex flex-col overflow-hidden">
                    <div className="p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-9 h-9 rounded-xl bg-violet-500/20 flex items-center justify-center border border-violet-500/20 text-violet-400">
                                <Radio className="h-4 w-4" />
                            </div>
                            <div>
                                <div className="text-xs font-semibold text-white">Symphony</div>
                                <div className="text-[10px] text-zinc-500">{PLAYLIST.length} tracks</div>
                            </div>
                        </div>
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-xs text-zinc-400 hover:text-white transition-all mb-4"
                        >
                            <Upload className="h-3.5 w-3.5" /> Add local file
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-0.5">
                        {PLAYLIST.map(track => (
                            <button 
                                key={track.id}
                                onClick={() => playTrack(track)}
                                className={cn(
                                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group text-left",
                                    currentTrack.id === track.id ? "bg-white/10 border border-white/10" : "hover:bg-white/5 border border-transparent"
                                )}
                            >
                                <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center bg-gradient-to-br shrink-0", track.color)}>
                                    {currentTrack.id === track.id && isPlaying ? (
                                        <div className="flex gap-0.5 items-end">
                                            {[1,2,3].map(i => (
                                                <motion.div key={i} animate={{ height: [4, 12, 4] }} transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.1 }} className="w-[2px] bg-white rounded-full" />
                                            ))}
                                        </div>
                                    ) : (
                                        <MusicIcon className="h-3.5 w-3.5 text-white/40" />
                                    )}
                                </div>
                                <div className="overflow-hidden">
                                    <div className={cn("text-xs font-medium truncate", currentTrack.id === track.id ? "text-white" : "text-zinc-300")}>{track.title}</div>
                                    <div className="text-[10px] text-zinc-600 truncate">{track.artist}</div>
                                </div>
                                {liked.includes(track.id) && <Heart className="h-3 w-3 text-rose-500 fill-rose-500 ml-auto shrink-0" />}
                            </button>
                        ))}
                    </div>
                </aside>

                {/* Main Player */}
                <main className="flex-1 relative flex flex-col items-center justify-center p-12 overflow-hidden">
                    {/* Background glow */}
                    <div className="absolute inset-0 pointer-events-none">
                        <div className={cn("absolute inset-0 bg-gradient-to-br opacity-20 blur-[120px] transition-all duration-1000", currentTrack.color)} />
                        <AnimatePresence>
                           {isPlaying && (
                              <div className="absolute inset-x-0 bottom-0 top-1/2 flex items-end justify-center gap-1 px-20 pb-40 opacity-15">
                                 {[...Array(32)].map((_, i) => (
                                    <motion.div 
                                       key={i}
                                       animate={{ height: [Math.random()*60 + 8, Math.random()*100 + 20, Math.random()*60 + 8] }}
                                       transition={{ repeat: Infinity, duration: 0.8 + Math.random() * 0.6, delay: i * 0.03 }}
                                       className="w-1.5 bg-white/30 rounded-full"
                                    />
                                 ))}
                              </div>
                           )}
                        </AnimatePresence>
                    </div>

                    {/* Album Art */}
                    <motion.div 
                        key={currentTrack.id}
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="relative z-10 w-64 h-64 mb-10"
                    >
                        <div className={cn(
                            "absolute inset-0 rounded-[40px] bg-gradient-to-br border border-white/10 flex items-center justify-center transition-all",
                            currentTrack.color
                        )}>
                            <MusicIcon className={cn("h-20 w-20 text-white/10", isPlaying && "animate-spin-slow")} />
                        </div>
                        <button 
                            onClick={() => setLiked(prev => prev.includes(currentTrack.id) ? prev.filter(id => id !== currentTrack.id) : [...prev, currentTrack.id])}
                            className="absolute -right-4 top-4 w-10 h-10 rounded-full bg-black/60 backdrop-blur border border-white/10 flex items-center justify-center hover:bg-rose-500/20 transition-all"
                        >
                            <Heart className={cn("h-4 w-4", liked.includes(currentTrack.id) ? "text-rose-500 fill-rose-500" : "text-white/40")} />
                        </button>
                    </motion.div>

                    {/* Track Info */}
                    <div className="relative z-10 text-center space-y-1 mb-8">
                        <h2 className="text-2xl font-bold text-white">{currentTrack.title}</h2>
                        <p className="text-sm text-zinc-500">{currentTrack.artist}</p>
                    </div>

                    {/* Progress & Controls */}
                    <div className="relative z-10 w-full max-w-md space-y-6">
                        <div className="space-y-2">
                            <div 
                                onClick={handleSeek}
                                className="h-1.5 w-full bg-white/10 rounded-full cursor-pointer group hover:h-2 transition-all overflow-hidden"
                            >
                                <div 
                                    className="h-full bg-white rounded-full relative transition-all"
                                    style={{ width: `${progress}%` }}
                                >
                                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                            </div>
                            <div className="flex justify-between text-[11px] text-zinc-600">
                                <span>{formatTime(currentTime)}</span>
                                <span>{duration ? formatTime(duration) : "--:--"}</span>
                            </div>
                        </div>

                        <div className="flex items-center justify-center gap-8">
                           <button onClick={() => setIsShuffled(!isShuffled)} className={cn("transition-colors", isShuffled ? "text-violet-400" : "text-zinc-600 hover:text-white")}><Shuffle className="h-4 w-4" /></button>
                           <button onClick={handlePrev} className="text-white hover:text-violet-400 transition-all active:scale-90"><SkipBack className="h-6 w-6" /></button>
                           <button 
                                onClick={togglePlayPause}
                                className="w-16 h-16 rounded-full bg-white text-black flex items-center justify-center shadow-xl hover:scale-105 active:scale-95 transition-all"
                           >
                                {isPlaying ? <Pause className="h-6 w-6 fill-current" /> : <Play className="h-6 w-6 fill-current ml-0.5" />}
                           </button>
                           <button onClick={handleNext} className="text-white hover:text-violet-400 transition-all active:scale-90"><SkipForward className="h-6 w-6" /></button>
                           <button onClick={() => setIsRepeating(!isRepeating)} className={cn("transition-colors", isRepeating ? "text-violet-400" : "text-zinc-600 hover:text-white")}><Repeat className="h-4 w-4" /></button>
                        </div>
                    </div>
                </main>
            </div>

            {/* Volume Bar */}
            <footer className="h-12 border-t border-white/5 bg-black/40 flex items-center justify-between px-8 shrink-0">
                <div className="flex items-center gap-3">
                    <div className={cn("w-1.5 h-1.5 rounded-full", isPlaying ? "bg-green-500 animate-pulse" : "bg-zinc-700")} />
                    <span className="text-[11px] text-zinc-500">{isPlaying ? "Playing" : "Paused"}</span>
                </div>
                <div className="flex items-center gap-3">
                    <Volume2 className="h-3.5 w-3.5 text-zinc-500" />
                    <input 
                        type="range" min="0" max="1" step="0.01" value={volume}
                        onChange={(e) => setVolume(Number(e.target.value))}
                        className="w-24 h-1 accent-white appearance-none bg-white/10 rounded-full cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full"
                    />
                </div>
            </footer>
        </div>
    );
};

export default Music;
