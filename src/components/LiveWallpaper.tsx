import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface LiveWallpaperProps {
  scene: string;
}

const LiveWallpaper: React.FC<LiveWallpaperProps> = ({ scene }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (scene === 'live:matrix') {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789$+-*/=%"\'#&_(),.;:?!\\|{}<>[]^~';
      const fontSize = 16;
      const columns = canvas.width / fontSize;
      const drops: number[] = [];

      for (let i = 0; i < columns; i++) {
        drops[i] = 1;
      }

      const draw = () => {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = '#0F0';
        ctx.font = fontSize + 'px monospace';

        for (let i = 0; i < drops.length; i++) {
          const text = characters.charAt(Math.floor(Math.random() * characters.length));
          ctx.fillText(text, i * fontSize, drops[i] * fontSize);

          if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
            drops[i] = 0;
          }
          drops[i]++;
        }
      };

      const interval = setInterval(draw, 33);
      const handleResize = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      };
      window.addEventListener('resize', handleResize);

      return () => {
        clearInterval(interval);
        window.removeEventListener('resize', handleResize);
      };
    }
  }, [scene]);

  if (scene === 'live:celestial') {
    return (
      <div className="absolute inset-0 bg-[#050505] overflow-hidden">
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
            backgroundColor: ['#007AFF', '#AF52DE', '#007AFF']
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-[50%] -left-[50%] w-[200%] h-[200%] opacity-20 blur-[120px] rounded-full"
        />
        <motion.div 
          animate={{ 
            scale: [1.2, 1, 1.2],
            rotate: [0, -120, 0],
            backgroundColor: ['#FF2D55', '#FF9500', '#FF2D55']
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-[50%] -right-[50%] w-[200%] h-[200%] opacity-20 blur-[120px] rounded-full"
        />
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
      </div>
    );
  }

  if (scene === 'live:cyber') {
     return (
        <div className="absolute inset-0 bg-black overflow-hidden">
           <div className="absolute inset-0 opacity-20" 
                style={{ 
                   backgroundImage: `linear-gradient(rgba(0, 122, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 122, 255, 0.1) 1px, transparent 1px)`,
                   backgroundSize: '40px 40px',
                   transform: 'perspective(500px) rotateX(60deg) translateY(-100px)',
                   transformOrigin: 'top'
                }} 
           />
           <motion.div 
              animate={{ opacity: [0.1, 0.3, 0.1] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent"
           />
        </div>
     );
  }

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />;
};

export default LiveWallpaper;
