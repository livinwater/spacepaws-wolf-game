'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface GameTransitionProps {
  nextGame: string;
  onComplete?: () => void;
}

export default function GameTransition({ nextGame, onComplete }: GameTransitionProps) {
  const router = useRouter();
  const [wolfProgress, setWolfProgress] = useState(0);

  useEffect(() => {
    const wolfTimer = setInterval(() => {
      setWolfProgress(prev => {
        if (prev >= 100) {
          clearInterval(wolfTimer);
          setTimeout(() => {
            router.push(nextGame);
            onComplete?.();
          }, 500);
          return 100;
        }
        return prev + 2;
      });
    }, 50); // 2.5 seconds for wolf animation

    return () => clearInterval(wolfTimer);
  }, [router, nextGame, onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      {/* Centered container */}
      <div className="w-[600px] h-32 bg-[#1a1a1a] relative overflow-hidden rounded-lg border border-gray-700">
        {/* Text that appears near the start */}
        <div className="absolute left-8 top-1/2 -translate-y-1/2 text-white">
          <h2 className="font-[var(--font-motley-forces)] text-2xl mb-1">
            Time for an Adventure!
          </h2>
          <p className="font-[var(--font-motley-forces)] text-lg text-gray-400">
            Make your choice wisely...
          </p>
        </div>

        {/* Wolf that walks across */}
        <div 
          className="absolute top-1/2 -translate-y-1/2 transition-all duration-500 ease-linear"
          style={{ 
            left: `${70 + (wolfProgress * 0.15)}%`,
            transform: `translate(-50%, -50%)`
          }}
        >
          <div className="w-24 h-24">
            <video 
              autoPlay 
              loop 
              muted 
              playsInline
              className="w-full h-full object-contain"
            >
              <source src="/videos/wolf.mp4" type="video/mp4" />
            </video>
          </div>
        </div>
      </div>
    </div>
  );
}
