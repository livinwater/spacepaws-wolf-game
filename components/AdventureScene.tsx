"use client";
import { useEffect, useState } from 'react';
import { useGameStore } from '@/lib/stores/game-store';
import { type SwipeDirection } from '@/lib/types';
import { HeartIcon } from '@heroicons/react/24/solid';
import TypeWriter from '@/app/components/TypeWriter';

export default function AdventureScene() {
  const { health, currentStage, position, actions } = useGameStore();
  const [swipeDirection, setSwipeDirection] = useState<SwipeDirection | null>(null);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [showText, setShowText] = useState(false);

  // Fetch initial prompt
  useEffect(() => {
    async function fetchPrompt() {
      try {
        const response = await fetch('/api/walrus/to_walrus', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messages: [{
              role: "user",
              content: "Generate stage1 prompt"
            }]
          })
        });
        
        const data = await response.json();
        setPrompt(data.prompt || data.fallback);
      } catch (error) {
        setPrompt("The wolf stirs, his paws scraping against jagged obsidian rock. The air hums with unfamiliar energies. Before him stretches a choice: the twisted forest or the endless plains.");
      }
    }
    
    fetchPrompt();
  }, []);

  useEffect(() => {
    // Start showing text after a brief delay
    const timer = setTimeout(() => {
      setShowText(true);
    }, 500);

    return () => clearTimeout(timer);
  }, [prompt]);

  // Swipe handling
  const minSwipeDistance = 50;
  
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(0);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      handleSwipe('left');
    } else if (isRightSwipe) {
      handleSwipe('right');
    }
  };

  const handleSwipe = (direction: SwipeDirection) => {
    if (isAnimating) return;
    
    setSwipeDirection(direction);
    setIsAnimating(true);
    actions.handleSwipe(direction);

    setTimeout(() => {
      setIsAnimating(false);
      setSwipeDirection(null);
    }, 1000);
  };

  return (
    <div 
      className="h-screen w-screen bg-black flex flex-col items-center justify-center relative overflow-hidden"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Main Content Container */}
      <div className="w-full max-w-lg mx-auto px-4">
        {/* Game UI Container */}
        <div className="flex flex-col items-center mb-8">
          {/* Wolf Character */}
          <div className={`relative mb-4 ${isAnimating ? 'animate-shake' : ''}`}>
            <video 
              className="w-40 h-40 transition-transform duration-300"
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
              onError={(e) => {
                console.error('Video loading error:', e);
                const video = e.currentTarget;
                console.log('Video source:', video.currentSrc);
                console.log('Video ready state:', video.readyState);
                console.log('Network state:', video.networkState);
              }}
              onLoadedData={() => console.log('Video loaded successfully')}
            >
              <source 
                src={`${process.env.NEXT_PUBLIC_BASE_URL || ''}/videos/wolf.mp4`} 
                type="video/mp4" 
              />
              Your browser does not support the video tag.
            </video>
          </div>

          {/* Stats Container */}
          <div className="flex flex-col items-center gap-3">
            {/* Health Section */}
            <div className="flex flex-col items-center">
              <span className="text-white text-sm mb-1 font-medium tracking-wide uppercase">Health</span>
              <div className="flex gap-1">
                {[...Array(3)].map((_, i) => (
                  <HeartIcon
                    key={i}
                    className={`w-6 h-6 ${
                      i < health 
                        ? 'text-red-500 drop-shadow-glow' 
                        : 'text-gray-700'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Inventory Section */}
            <div className="flex flex-col items-center">
              <span className="text-white text-sm font-medium tracking-wide uppercase">Inventory</span>
              <div className="w-48 h-12 mt-1 border-2 border-gray-700 rounded-lg bg-gray-900/50 backdrop-blur-sm flex items-center justify-center">
                <span className="text-gray-500 text-xs italic">Empty</span>
              </div>
            </div>
          </div>
        </div>

        {/* Narrative Text */}
        <div className="text-center text-white mt-4">
          {showText && (
            <TypeWriter
              text={prompt}
              speed={100}
              className="text-lg font-[var(--font-motley-forces)]"
            />
          )}
          <div className="flex justify-center gap-8">
            <div className="text-emerald-400">
              ← Twisted Forest
            </div>
            <div className="text-amber-400">
              Endless Plains →
            </div>
          </div>
        </div>
      </div>

      {/* Swipe Visual Feedback */}
      {swipeDirection && (
        <div className="absolute inset-0 flex items-center justify-center text-6xl text-white bg-black/50">
          {swipeDirection === 'left' ? '←' : '→'}
        </div>
      )}

      <style jsx>{`
        .drop-shadow-glow {
          filter: drop-shadow(0 0 4px rgba(239, 68, 68, 0.5));
        }
      `}</style>
    </div>
  );
}
