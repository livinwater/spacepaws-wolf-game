import React from 'react';
import { SwipeDirection } from '@/types/tweet';

interface AdventureGameProps {
  swipeHistory: SwipeDirection[];
  onComplete: () => void;
}

const AdventureGame: React.FC<AdventureGameProps> = ({ swipeHistory, onComplete }) => {
  // Calculate market sentiment based on swipes
  const bullishCount = swipeHistory.filter(dir => dir === 'right').length;
  const sentiment = bullishCount > (swipeHistory.length / 2) ? 'bullish' : 'bearish';

  return (
    <div className="h-screen w-full flex flex-col items-center justify-center p-6 bg-gray-900 text-white">
      <h2 className="text-2xl mb-6">Market Adventure</h2>
      <div className="text-xl mb-8">
        Based on your market sentiment ({sentiment}), you encounter:
      </div>
      <div className="bg-gray-800 p-6 rounded-lg max-w-md w-full">
        {sentiment === 'bullish' ? (
          <div>
            <p>You find yourself in a bustling crypto trading hub. The screens are showing green candles everywhere!</p>
            <p className="mt-4">A mysterious trader offers you a chance to multiply your gains...</p>
          </div>
        ) : (
          <div>
            <p>You're in a quiet trading den. The markets are showing signs of a downturn.</p>
            <p className="mt-4">A wise old trader suggests defensive strategies...</p>
          </div>
        )}
      </div>
      <button
        onClick={onComplete}
        className="mt-8 px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg"
      >
        Continue Trading
      </button>
    </div>
  );
};

export default AdventureGame;
