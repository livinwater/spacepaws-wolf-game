'use client';

import { useState, useEffect } from 'react';
import { useGameStore } from '@/lib/game/state';
import GameTransition from '@/app/components/GameTransition';
import TweetCard from '@/components/TweetCard';
import type { Tweet, SwipeDirection } from '@/types/tweet';

const TIMER_DURATION = 30;

export default function SentimentGame() {
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [currentTweetIndex, setCurrentTweetIndex] = useState(0);
  const [showContext, setShowContext] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [timeLeft, setTimeLeft] = useState(TIMER_DURATION);
  const [showTransition, setShowTransition] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Fetch tweets from API
  useEffect(() => {
    const fetchTweets = async () => {
      try {
        const response = await fetch('/api/tweets');
        const data = await response.json();
        setTweets(data.tweets);
        setLoading(false);
      } catch (error) {
        console.error('Error loading tweets:', error);
        setLoading(false);
      }
    };

    fetchTweets();
  }, []);

  const currentTweet = tweets[currentTweetIndex];
  const isLastTweet = currentTweetIndex === tweets.length - 1;

  // Timer effect
  useEffect(() => {
    if (!currentTweet) return;

    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          if (!isLastTweet && !selectedAnswers[currentTweet.id]) {
            handleSwipe('timeout');
            return TIMER_DURATION;
          }
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentTweetIndex, currentTweet?.id, isLastTweet, selectedAnswers]);

  // Reset timer when moving to next tweet
  useEffect(() => {
    setTimeLeft(TIMER_DURATION);
  }, [currentTweetIndex]);
  
  const handleSwipe = (direction: SwipeDirection | 'timeout') => {
    if (!currentTweet) return;

    const sentiment = direction === 'right' ? 'Bullish' : 
                     direction === 'left' ? 'Bearish' : 
                     'Neutral';
    
    setSelectedAnswers(prev => ({
      ...prev,
      [currentTweet.id]: sentiment
    }));
    
    if (!isLastTweet) {
      setCurrentTweetIndex(prev => prev + 1);
      setShowContext(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-sky-200 via-green-50 to-green-100 flex items-center justify-center">
        <div className="text-2xl text-[#5C4B3B] font-[var(--font-motley-forces)]">
          Loading tweets...
        </div>
      </div>
    );
  }

  if (!currentTweet) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-sky-200 via-green-50 to-green-100 flex items-center justify-center">
        <div className="text-2xl text-[#5C4B3B] font-[var(--font-motley-forces)]">
          No tweets available
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-sky-200 via-green-50 to-green-100 p-8">
      <div className="max-w-2xl mx-auto">
        {/* Timer Display */}
        <div className="flex justify-end items-center mb-4">
          <div className={`font-[var(--font-motley-forces)] ${
            timeLeft <= 10 ? 'text-red-600' : 'text-[#5C4B3B]'
          }`}>
            Time: {timeLeft}s
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2 bg-white/30 rounded-full mb-4">
          <div 
            className="h-full bg-[#8B7355] rounded-full transition-all duration-1000"
            style={{ 
              width: `${(timeLeft / TIMER_DURATION) * 100}%`,
              backgroundColor: timeLeft <= 10 ? '#ef4444' : '#8B7355'
            }}
          />
        </div>

        {/* Tweet Card */}
        <div className="relative mb-6">
          <TweetCard
            tweet={currentTweet}
            onSwipe={handleSwipe}
            showContext={showContext}
            onContextToggle={() => setShowContext(!showContext)}
            disabled={selectedAnswers[currentTweet.id] !== undefined}
          />
        </div>

        {/* Game Complete State */}
        {(isLastTweet && Object.keys(selectedAnswers).length === tweets.length) && (
          <div className="mt-8 text-center">
            <h2 className="font-[var(--font-motley-forces)] text-2xl text-[#5C4B3B] mb-4">
              Mini-game Complete!
            </h2>
            <p className="text-[#6B5744] mb-4">
              Your answers have been recorded
            </p>
            <button
              onClick={() => setShowTransition(true)}
              className="bg-[#8B7355] text-white px-6 py-3 rounded-lg font-[var(--font-motley-forces)]
                       hover:bg-[#6B5744] transition-colors duration-200"
            >
              Continue Journey
            </button>
          </div>
        )}
      </div>

      {showTransition && (
        <GameTransition />
      )}
    </main>
  );
}
