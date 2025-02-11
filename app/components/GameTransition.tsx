'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import TypeWriter from './TypeWriter';

interface GameTransitionProps {
  nextGame: string;
  onComplete?: () => void;
}

export default function GameTransition({ nextGame, onComplete }: GameTransitionProps) {
  const router = useRouter();
  const [phase, setPhase] = useState(1);

  const transitionTexts = [
    "The wolf stirs...",
    "A choice approaches...",
    "Prepare yourself..."
  ];

  useEffect(() => {
    if (phase > transitionTexts.length) {
      router.push(nextGame);
      if (onComplete) onComplete();
    }
  }, [phase, nextGame, router, onComplete]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
      <div className="text-center">
        <TypeWriter
          text={transitionTexts[phase - 1]}
          speed={150}  
          className="text-4xl text-white font-[var(--font-motley-forces)]"
          onComplete={() => {
            setTimeout(() => setPhase(prev => prev + 1), 2000);
          }}
        />
      </div>
    </div>
  );
}
