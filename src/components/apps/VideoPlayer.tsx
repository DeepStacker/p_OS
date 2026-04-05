import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, Pause, RotateCcw, Maximize, Volume2, VolumeX, 
  Settings, Subtitles, FileVideo, Search, SkipForward,
  SkipBack, Upload, Link, MonitorPlay
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSystem } from '@/contexts/SystemContext';

const SAMPLE_VIDEOS = [
  { name: "Big Buck Bunny", url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4", duration: "9:56" },
  { name: "Elephant Dream", url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4", duration: "10:53" },
  { name: "Sintel Trailer", url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4", duration: "14:48" },
  { name: "Tears of Steel", url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4", duration: "12:14" },
];

const formatTime = (s: number): string => {
  if (!s || isNaN(s)) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
};

const VideoPlayer = () => {
    const { addLog } = useSystem();
    const videoRef = useRef<HTMLVideoElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);
    const [showControls, setShowControls] = useState(true);
    const [showLibrary, setShowLibrary] = useState(false);
    const [videoSrc, setVideoSrc] = useState(SAMPLE_VIDEOS[0].url);
    const [videoTitle, setVideoTitle] = useState(SAMPLE_VIDEOS[0].name);
    const [urlInput, setUrlInput] = useState("");
    const controlsTimeoutRef = useRef<any>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const togglePlay = () => {
        const v = videoRef.current;
        if (!v) return;
        if (isPlaying) { v.pause(); } 
        else { v.play().catch(() => {}); }
        setIsPlaying(!isPlaying);
    };

    const handleTimeUpdate = () => {
        if (videoRef.current) {
            setCurrentTime(videoRef.current.currentTime);
        }
    };

    const handleLoadedMetadata = () => {
        if (videoRef.current) {
            setDuration(videoRef.current.duration);
        }
    };

    const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!videoRef.current || !duration) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const ratio = (e.clientX - rect.left) / rect.width;
        videoRef.current.currentTime = ratio * duration;
    };

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = Number(e.target.value);
        setVolume(val);
        if (videoRef.current) videoRef.current.volume = val;
        setIsMuted(val === 0);
    };

    const toggleMute = () => {
        if (videoRef.current) {
            videoRef.current.muted = !isMuted;
            setIsMuted(!isMuted);
        }
    };

    const skip = (seconds: number) => {
        if (videoRef.current) {
            videoRef.current.currentTime = Math.max(0, Math.min(duration, videoRef.current.currentTime + seconds));
        }
    };

    const loadVideo = (url: string, title: string) => {
        setVideoSrc(url);
        setVideoTitle(title);
        setIsPlaying(false);
        setCurrentTime(0);
        setShowLibrary(false);
        setTimeout(() => {
            videoRef.current?.play().catch(() => {});
            setIsPlaying(true);
        }, 200);
        addLog(`Playing: ${title}`, "success");
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const url = URL.createObjectURL(file);
        loadVideo(url, file.name.replace(/\.[^/.]+$/, ""));
    };

    const handleUrlLoad = () => {
        if (urlInput.trim().startsWith("http")) {
            loadVideo(urlInput.trim(), "External Video");
            setUrlInput("");
        }
    };

    const toggleFullscreen = () => {
        if (containerRef.current) {
            if (document.fullscreenElement) document.exitFullscreen();
            else containerRef.current.requestFullscreen();
        }
    };

    const handleMouseMove = () => {
        setShowControls(true);
        if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
        controlsTimeoutRef.current = setTimeout(() => {
            if (isPlaying) setShowControls(false);
        }, 3000);
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.code === "Space") { e.preventDefault(); togglePlay(); }
            if (e.code === "ArrowLeft") skip(-10);
            if (e.code === "ArrowRight") skip(10);
            if (e.code === "KeyM") toggleMute();
            if (e.code === "KeyF") toggleFullscreen();
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isPlaying, duration, isMuted]);

    const progress = duration ? (currentTime / duration) * 100 : 0;

    return (
        <div 
            ref={containerRef}
            className="h-full bg-black relative group overflow-hidden font-sans select-none"
            onMouseMove={handleMouseMove}
            onMouseLeave={() => isPlaying && setShowControls(false)}
        >
            <input ref={fileInputRef} type="file" accept="video/*" className="hidden" onChange={handleFileUpload} />

            {/* Video Element */}
            <video 
                ref={videoRef}
                src={videoSrc}
                className="w-full h-full object-contain"
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onClick={togglePlay}
                onEnded={() => setIsPlaying(false)}
                playsInline
            />

            {/* Play overlay */}
            {!isPlaying && currentTime === 0 && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 cursor-pointer" onClick={togglePlay}>
                    <div className="w-20 h-20 rounded-full bg-white/10 backdrop-blur flex items-center justify-center hover:bg-white/20 transition-all">
                        <Play className="h-8 w-8 text-white ml-1" />
                    </div>
                </div>
            )}

            {/* Controls */}
            <AnimatePresence>
                {showControls && (
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent pt-20 pb-4 px-6 flex flex-col gap-3"
                    >
                        {/* Title */}
                        <div className="text-sm font-medium text-white/80 mb-1">{videoTitle}</div>

                        {/* Seek bar */}
                        <div onClick={handleSeek} className="h-1 w-full bg-white/20 rounded-full cursor-pointer group/seek hover:h-1.5 transition-all">
                            <div className="h-full bg-white rounded-full relative" style={{ width: `${progress}%` }}>
                                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg opacity-0 group-hover/seek:opacity-100 transition-opacity" />
                            </div>
                        </div>

                        {/* Controls row */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <button onClick={togglePlay} className="text-white hover:text-blue-400 transition-all">
                                    {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                                </button>
                                <button onClick={() => skip(-10)} className="text-white/60 hover:text-white transition-all"><SkipBack className="h-4 w-4" /></button>
                                <button onClick={() => skip(10)} className="text-white/60 hover:text-white transition-all"><SkipForward className="h-4 w-4" /></button>

                                <div className="flex items-center gap-2 group/vol">
                                    <button onClick={toggleMute} className="text-white/60 hover:text-white">
                                        {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                                    </button>
                                    <input 
                                        type="range" min="0" max="1" step="0.01" value={isMuted ? 0 : volume}
                                        onChange={handleVolumeChange}
                                        className="w-0 group-hover/vol:w-20 transition-all h-1 accent-white bg-white/20 rounded-full cursor-pointer appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2.5 [&::-webkit-slider-thumb]:h-2.5 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full"
                                    />
                                </div>

                                <span className="text-xs text-white/40">{formatTime(currentTime)} / {formatTime(duration)}</span>
                            </div>

                            <div className="flex items-center gap-3">
                                <button onClick={() => setShowLibrary(!showLibrary)} className="text-white/50 hover:text-white transition-all" title="Library">
                                    <MonitorPlay className="h-4 w-4" />
                                </button>
                                <button onClick={() => fileInputRef.current?.click()} className="text-white/50 hover:text-white transition-all" title="Upload video">
                                    <Upload className="h-4 w-4" />
                                </button>
                                <button onClick={toggleFullscreen} className="text-white/50 hover:text-white transition-all">
                                    <Maximize className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Library Overlay */}
            <AnimatePresence>
                {showLibrary && (
                    <motion.div 
                        initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                        className="absolute top-4 right-4 bottom-20 w-72 bg-black/90 backdrop-blur-xl border border-white/10 rounded-2xl p-5 flex flex-col gap-4 overflow-hidden"
                    >
                        <div className="text-xs font-semibold text-white">Video Library</div>
                        
                        {/* URL input */}
                        <div className="flex gap-2">
                            <input 
                                value={urlInput} onChange={e => setUrlInput(e.target.value)}
                                placeholder="Paste video URL..."
                                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder:text-zinc-600 focus:outline-none"
                                onKeyDown={e => e.key === "Enter" && handleUrlLoad()}
                            />
                            <button onClick={handleUrlLoad} className="p-2 bg-blue-500 rounded-lg text-white"><Link className="h-3 w-3" /></button>
                        </div>

                        {/* Sample videos */}
                        <div className="flex-1 overflow-y-auto space-y-1">
                            {SAMPLE_VIDEOS.map((v, i) => (
                                <button 
                                    key={i}
                                    onClick={() => loadVideo(v.url, v.name)}
                                    className={cn(
                                        "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all",
                                        videoSrc === v.url ? "bg-white/10 text-white" : "hover:bg-white/5 text-zinc-400"
                                    )}
                                >
                                    <FileVideo className="h-4 w-4 shrink-0" />
                                    <div>
                                        <div className="text-xs font-medium">{v.name}</div>
                                        <div className="text-[10px] text-zinc-600">{v.duration}</div>
                                    </div>
                                </button>
                            ))}
                        </div>

                        <button onClick={() => fileInputRef.current?.click()} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 rounded-lg text-xs text-zinc-400 hover:text-white border border-white/5 transition-all">
                            <Upload className="h-3 w-3" /> Upload from device
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default VideoPlayer;
