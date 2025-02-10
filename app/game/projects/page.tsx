'use client';

import { useState, useEffect } from 'react';
import { useGameStore } from '@/lib/game/state';
import { Tweet, SwipeDirection, GameState } from '@/types/tweet';
import TweetCard from '@/components/TweetCard';
import AdventureGame from '@/components/AdventureGame';

type NFT = {
  id: number;
  imageUrl: string;
  title: string;
  collection: string;
};

const SAMPLE_NFTS: NFT[] = [
  {
    id: 1,
    imageUrl: '/images/nfts/nft1.png',
    title: '#6027',
    collection: 'Fuddies'
  },
  {
    id: 2,
    imageUrl: '/images/nfts/nft2.png',
    title: 'Charming Goofy #3462',
    collection: 'Cosmocadia'
  },
  {
    id: 3,
    imageUrl: '/images/nfts/nft3.png',
    title: '#8255',
    collection: 'Karrier Pigeons'
  }
];

const TIMER_DURATION = 10; // 10 seconds per NFT

const GAME_MODE_TWEETS = 'tweets';
const GAME_MODE_ADVENTURE = 'adventure';

export default function ProjectsGame() {
  const [currentNftIndex, setCurrentNftIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [timeLeft, setTimeLeft] = useState(TIMER_DURATION);
  const [gameState, setGameState] = useState<GameState>({
    tweets: [],
    currentIndex: 0,
    swipes: [],
    gameMode: GAME_MODE_TWEETS
  });
  const [loading, setLoading] = useState(true);

  const currentNft = SAMPLE_NFTS[currentNftIndex];
  const isLastNft = currentNftIndex === SAMPLE_NFTS.length - 1;

  // Timer effect
  useEffect(() => {
    if (timeLeft <= 0) {
      if (!isLastNft) {
        setCurrentNftIndex(prev => prev + 1);
        setTimeLeft(TIMER_DURATION);
      }
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, isLastNft]);

  useEffect(() => {
    fetchTweets();
  }, []);

  const fetchTweets = async () => {
    try {
      const response = await fetch('/api/tweets');
      const data = await response.json();
      setGameState(prev => ({ ...prev, tweets: data.tweets }));
      setLoading(false);
    } catch (error) {
      console.error('Error fetching tweets:', error);
      setLoading(false);
    }
  };

  const handleAnswer = (answer: string) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [currentNft.id]: answer
    }));

    if (!isLastNft) {
      setCurrentNftIndex(prev => prev + 1);
      setTimeLeft(TIMER_DURATION);
    }
  };

  const handleSwipe = (direction: SwipeDirection) => {
    const newSwipes = [...gameState.swipes, direction];
    const newIndex = gameState.currentIndex + 1;
    
    if (newSwipes.length % 3 === 0) {
      // Switch to adventure mode after every 3 swipes
      setGameState(prev => ({
        ...prev,
        swipes: newSwipes,
        currentIndex: newIndex,
        gameMode: GAME_MODE_ADVENTURE
      }));
    } else {
      setGameState(prev => ({
        ...prev,
        swipes: newSwipes,
        currentIndex: newIndex
      }));
    }
  };

  const handleAdventureComplete = () => {
    setGameState(prev => ({
      ...prev,
      gameMode: GAME_MODE_TWEETS
    }));
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-2xl">Loading...</div>
      </div>
    );
  }

  if (gameState.gameMode === GAME_MODE_ADVENTURE) {
    return (
      <AdventureGame
        swipeHistory={gameState.swipes.slice(-3)}
        onComplete={handleAdventureComplete}
      />
    );
  }

  const currentTweet = gameState.tweets[gameState.currentIndex];

  if (!currentTweet) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-2xl">No more tweets! Come back later.</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#8B7355] to-[#6B5744] text-white p-8">
      <div className="max-w-2xl mx-auto">
        {/* Timer Bar */}
        <div className="w-full h-3 bg-[#5C4B3B]/30 rounded-full mb-8 p-0.5">
          <div
            className={`h-full rounded-full transition-all duration-1000 ${
              timeLeft <= 5 ? 'bg-red-500' : 'bg-[#A8E6CF]'
            }`}
            style={{ width: `${(timeLeft / TIMER_DURATION) * 100}%` }}
          />
        </div>

        {/* NFT Display */}
        <div className="bg-[#5C4B3B] rounded-2xl p-8 mb-8 shadow-lg border-2 border-[#8B7355]">
          <div className="aspect-square w-full mb-6 rounded-xl overflow-hidden shadow-md">
            <img
              src={currentNft.imageUrl}
              alt={currentNft.title}
              className="w-full h-full object-cover"
            />
          </div>
          <h3 className="font-[var(--font-motley-forces)] text-2xl mb-2 text-[#DFD3C3]">
            {currentNft.title}
          </h3>
          <p className="text-[#A89F91]">{currentNft.collection}</p>
        </div>

        {(!isLastNft || Object.keys(selectedAnswers).length < SAMPLE_NFTS.length) ? (
          /* Answer Buttons */
          <div className="grid grid-cols-2 gap-6">
            <button
              onClick={() => handleAnswer('rare')}
              className="bg-[#8B7355] hover:bg-[#7A6548] text-[#DFD3C3] font-[var(--font-motley-forces)] 
                       py-4 px-6 rounded-xl text-xl transition-colors border-2 border-[#A89F91]/20
                       shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              Looks Rare
            </button>
            <button
              onClick={() => handleAnswer('floor')}
              className="bg-[#5C4B3B] hover:bg-[#4B3C2F] text-[#DFD3C3] font-[var(--font-motley-forces)]
                       py-4 px-6 rounded-xl text-xl transition-colors border-2 border-[#A89F91]/20
                       shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              Floor
            </button>
          </div>
        ) : (
          /* Game Complete State */
          <div className="mt-8 text-center">
            <h2 className="font-[var(--font-motley-forces)] text-3xl mb-4 text-[#DFD3C3]">
              Mini-game Complete!
            </h2>
            <p className="text-[#A89F91] mb-6">
              Your answers have been recorded
            </p>
            <button
              onClick={() => window.location.href = '/game/map'}
              className="bg-[#8B7355] hover:bg-[#7A6548] text-[#DFD3C3] px-8 py-4 rounded-xl 
                       font-[var(--font-motley-forces)] text-xl transition-all
                       border-2 border-[#A89F91]/20 shadow-md hover:shadow-lg
                       transform hover:-translate-y-0.5"
            >
              Continue Journey
            </button>
          </div>
        )}
        <div className="relative w-full h-[70vh] flex justify-center">
          <TweetCard
            key={currentTweet.id}
            tweet={currentTweet}
            onSwipe={handleSwipe}
          />
        </div>
        <div className="mt-8 text-center text-gray-600">
          Swipe right for bullish, left for bearish
        </div>
      </div>
    </main>
  );
}
