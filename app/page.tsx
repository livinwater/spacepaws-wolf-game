'use client';

import { useGameStore } from '@/lib/game/state';

export default function Home() {
  const initializeGame = useGameStore(state => state.initialize);
  
  return (
    <main className="min-h-screen relative overflow-hidden bg-gradient-to-b from-sky-200 via-green-50 to-green-100">
      {/* Background decorative elements */}
      <div className="absolute inset-0 w-full h-full">
        <div className="absolute top-10 left-10 w-72 h-72 bg-green-200/30 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-72 h-72 bg-amber-100/30 rounded-full filter blur-3xl"></div>
      </div>
      
      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-8 text-center">
        {/* Wolf Video */}
        <div className="w-48 h-48 mb-8 relative group">
          {/* Card effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/80 to-green-50/80 rounded-2xl backdrop-blur-sm 
                        transform group-hover:scale-105 transition-transform duration-300 shadow-lg"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-amber-100/20 to-green-100/20 rounded-2xl opacity-0 
                        group-hover:opacity-100 transition-opacity duration-300"></div>
          
          {/* Video */}
          <video 
            autoPlay 
            loop 
            muted 
            playsInline
            className="relative z-10 w-full h-full object-contain p-3"
          >
            <source src="/videos/wolf.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>

          {/* Subtle border glow */}
          <div className="absolute inset-0 rounded-2xl ring-1 ring-green-200/30 group-hover:ring-amber-200/50 
                        transition-all duration-300 shadow-lg"></div>
        </div>

        <h1 className="font-[var(--font-motley-forces)] text-7xl mb-6 text-[#5C4B3B]">
          Wolf's Journey Home
        </h1>
        
        <p className="font-[var(--font-motley-forces)] text-xl mb-12 max-w-2xl text-[#6B5744] leading-relaxed tracking-wide">
          Guide our lost wolf through a series of challenges as he navigates his way back home. 
          Each decision brings him closer to his destination.
        </p>
        
        <button 
          onClick={() => {
            initializeGame();
          }}
          className="group relative px-8 py-4 bg-gradient-to-r from-[#8B7355] to-[#6B5744] rounded-lg 
                   transform transition-all duration-200 ease-out hover:scale-105 hover:shadow-xl
                   hover:shadow-amber-200/20 active:scale-95"
        >
          <span className="relative z-10 text-2xl font-[var(--font-motley-forces)] text-amber-50 group-hover:text-white/90">
            Begin Adventure
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-[#6B5744] to-[#5C4B3B] rounded-lg opacity-0 
                        group-hover:opacity-100 transition-opacity duration-200 ease-out"></div>
        </button>
        
        {/* Decorative footer text */}
        <p className="font-[var(--font-motley-forces)] absolute bottom-8 text-sm text-[#6B5744]/70">
          A journey of a thousand miles begins with a single click
        </p>
      </div>
    </main>
  );
}
