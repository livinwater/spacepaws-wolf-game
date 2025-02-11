'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useGameStore } from '@/lib/stores/game-store';
import { type SwipeDirection } from '@/lib/types';
import { HeartIcon } from '@heroicons/react/24/solid';
import TypeWriter from './TypeWriter';

export default function AdventureScene() {
  const router = useRouter();
  const { health, updateHealth, setCurrentStage, adventuresCompleted, questsCompleted, currentStreak } = useGameStore();
  const [swipeDirection, setSwipeDirection] = useState<SwipeDirection | null>(null);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [prompt, setPrompt] = useState("The wolf stirs, his paws scraping against jagged obsidian rock. The air hums with unfamiliar energies. Before him stretches a choice: the twisted forest or the endless plains.");
  const [showOptions, setShowOptions] = useState(false);
  const [showOutcome, setShowOutcome] = useState(false);
  const [outcomeMessage, setOutcomeMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [hasEvaluated, setHasEvaluated] = useState(false);
  const [questStartTime, setQuestStartTime] = useState(Date.now());
  const [loading, setLoading] = useState(false);

  // Save game state to Walrus and locally
  async function saveGameState() {
    if (!hasEvaluated) return;
    
    try {
      // Fetch evaluation results from API
      const evalResponse = await fetch('/api/evaluation');
      if (!evalResponse.ok) {
        throw new Error('Failed to fetch evaluation results');
      }
      
      const evaluationData = await evalResponse.json();
      const latestEvaluation = evaluationData.evaluations[evaluationData.evaluations.length - 1];
      
      // Save evaluation results and trigger game state saving
      const response = await fetch('/api/save-results', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          results: latestEvaluation.results,
          totalCorrect: latestEvaluation.totalCorrect,
          passed: latestEvaluation.passed,
          health: health
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save game state');
      }
      
      console.log('Game state saved successfully');
    } catch (error) {
      console.error('Error handling game state:', error);
    }
  }

  // Helper functions for messages
  const getSuccessMessage = (path: string) => 
    path === 'forest'
      ? "The twisted branches part before you, revealing a hidden path. Your instincts were right."
      : "The endless plains yield their secrets. A glimmer of hope appears on the horizon.";

  const getFailureMessage = (path: string) =>
    path === 'forest'
      ? "The forest's shadows deceive you. Thorns tear at your fur as you stumble through darkness."
      : "The plains' endless expanse becomes a trap. Your paws sink into quicksand.";

  // Handle evaluation results
  const handleEvaluation = async (path: string) => {
    try {
      setLoading(true); // Show loading state immediately
      
      const evalResponse = await fetch('/api/evaluation');
      if (!evalResponse.ok) throw new Error('Evaluation failed');
      
      const evaluationData = await evalResponse.json();
      const latestEvaluation = evaluationData.evaluations.at(-1);
      
      // Only update state AFTER getting evaluation result
      if (latestEvaluation?.passed) {
        setOutcomeMessage(getSuccessMessage(path));
        updateHealth(prev => prev + 10); // Use functional update
      } else {
        setOutcomeMessage(getFailureMessage(path));
        updateHealth(prev => Math.max(0, prev - 10)); // Functional update
      }

      setShowOutcome(true);
      setHasEvaluated(true);
      await saveGameState();
      
    } catch (error) {
      console.error('Evaluation error:', error);
      setOutcomeMessage("The path shifts unexpectedly...");
    } finally {
      setLoading(false); // Always clear loading state
    }
  };

  const handleChoice = async (direction: SwipeDirection) => {
    const path = direction === 'right' ? 'plains' : 'forest';
    await handleEvaluation(path);
  };

  const handleOutcome = useCallback((path: 'forest' | 'plains') => {
    if (loading) return;
    setIsAnimating(true);
    handleChoice(path === 'forest' ? 'left' : 'right');
    
    // Transition to next stage after delay
    setTimeout(() => {
      setIsAnimating(false);
      setSwipeDirection(null);
    }, 1000);
  }, [loading]);

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
      handleOutcome('forest');
    } else if (isRightSwipe) {
      handleOutcome('plains');
    }
  };

  const handleKeyPress = useCallback((e: KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      handleOutcome('forest');
    } else if (e.key === 'ArrowRight') {
      handleOutcome('plains');
    }
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  const handleSwipe = (direction: SwipeDirection) => {
    if (isAnimating || loading) return;
    
    setSwipeDirection(direction);
    setIsAnimating(true);

    if (direction === 'left') {
      handleOutcome('forest');
    } else {
      handleOutcome('plains');
    }

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
          <TypeWriter 
            text={prompt}
            speed={80}
            className="text-lg mb-4"
            onComplete={() => setShowOptions(true)}
          />
          {showOptions && (
            <div className="flex justify-center gap-8 animate-fade-in">
              <div className="text-emerald-400">
                ← Twisted Forest
              </div>
              <div className="text-amber-400">
                Endless Plains →
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Outcome Popup */}
      {showOutcome && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-black/90 p-8 rounded-lg border-2 border-gray-700 max-w-md text-center">
            <div className={`text-2xl ${isSuccess ? 'text-emerald-400' : 'text-red-500'}`}>
              {isSuccess ? '✨ Success! ' : '❌ Failed! '}
              <span className="text-white">
                {outcomeMessage}
              </span>
            </div>
          </div>
        </div>
      )}

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
        .animate-fade-in {
          animation: fadeIn 1s;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
