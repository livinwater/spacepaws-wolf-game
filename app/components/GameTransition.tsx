'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function GameTransition({ nextGame }: { nextGame: string }) {
  const router = useRouter();
  const [wolfProgress, setWolfProgress] = useState(0);

  useEffect(() => {
    const wolfTimer = setInterval(() => {
      setWolfProgress(prev => {
        if (prev >= 100) {
          clearInterval(wolfTimer);
          setTimeout(() => {
            router.push(nextGame);
          }, 500);
          return 100;
        }
        return prev + 2;
      });
    }, 50); // 2.5 seconds for wolf animation

    return () => clearInterval(wolfTimer);
  }, [router, nextGame]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Centered container */}
      <div className="w-[600px] h-32 bg-[#cbc5d7] relative overflow-hidden rounded-lg">
        {/* Text that appears near the start */}
        <div className="absolute left-8 top-1/2 -translate-y-1/2 text-white">
          <h2 className="font-[var(--font-motley-forces)] text-2xl">
            Mini-game #2 is next
          </h2>
          <p className="font-[var(--font-motley-forces)] text-lg">
            What&apos;s the vibes of these projects?
          </p>
        </div>

        {/* Wolf that walks a short distance */}
        <div 
          className="absolute top-1/2 -translate-y-1/2 transition-all duration-500 ease-linear"
          style={{ 
            // Start further right (70%) and move a bit right
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
              <source src="/videos/wolf-walking.mp4" type="video/mp4" />
            </video>
          </div>
        </div>
      </div>
    </div>
  );
}
