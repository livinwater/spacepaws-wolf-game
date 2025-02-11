'use client';

import { useState, useEffect } from 'react';
import { useGameStore } from '@/lib/game/state';
import GameTransition from '@/app/components/GameTransition';
import TweetCard from '@/components/TweetCard';
import type { Tweet, SwipeDirection } from '@/types/tweet';

const TIMER_DURATION = 30;
const TWEETS_PER_INTERVAL = 4; // Show adventure after every 4 tweets

export default function SentimentGame() {
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [currentTweetIndex, setCurrentTweetIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [timeLeft, setTimeLeft] = useState(TIMER_DURATION);
  const [showTransition, setShowTransition] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentBatch, setCurrentBatch] = useState<string[]>([]);

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

  // Save batch results to file and store
  const saveBatchResults = async (results: any) => {
    try {
      const response = await fetch('/api/save-results', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(results)
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to save results');
      }

      if (data.success) {
        console.log('Results saved successfully:', results);
        // Add results to game store
        useGameStore.getState().addSentimentResults({
          batchNumber: results.batchNumber,
          answers: results.answers,
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Error saving results:', error);
    }
  };

  const currentTweet = tweets[currentTweetIndex];
  const isLastTweet = currentTweetIndex === tweets.length - 1;

  // Check if we should show transition based on batch size
  useEffect(() => {
    if (currentBatch.length === TWEETS_PER_INTERVAL && !showTransition) {
      const batchNumber = Math.floor((currentTweetIndex - 1) / TWEETS_PER_INTERVAL);
      const startIndex = batchNumber * TWEETS_PER_INTERVAL;
      const results = {
        batchNumber,
        startIndex,
        endIndex: startIndex + TWEETS_PER_INTERVAL - 1,
        answers: currentBatch
      };
      
      console.log(`Saving batch ${batchNumber} results:`, results);
      saveBatchResults(results);
      setCurrentBatch([]); // Reset batch
      setShowTransition(true);
    }
  }, [currentBatch, currentTweetIndex, showTransition]);

  // Timer effect
  useEffect(() => {
    if (!currentTweet) return;

    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          handleSwipe('timeout');
          return TIMER_DURATION;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentTweetIndex, currentTweet?.id]);

  // Reset timer when moving to next tweet
  useEffect(() => {
    setTimeLeft(TIMER_DURATION);
  }, [currentTweetIndex]);

  const handleSwipe = (direction: SwipeDirection | 'timeout') => {
    if (!currentTweet) return;

    // Save the answer
    const sentiment = direction === 'right' ? 'Bullish' : 
                     direction === 'left' ? 'Bearish' : 
                     'None';

    console.log(`Tweet ${currentTweetIndex + 1}: ${sentiment}`);
    
    // Add to current batch
    setCurrentBatch(prev => [...prev, sentiment]);

    // Always move to next tweet unless showing transition
    if (!showTransition && !isLastTweet) {
      setCurrentTweetIndex(prev => prev + 1);
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
        {/* Progress Display */}
        <div className="flex justify-between items-center mb-4">
          <div className="font-[var(--font-motley-forces)] text-[#5C4B3B]">
            Tweet {currentTweetIndex + 1} of {tweets.length} ({currentBatch.length}/4 in current batch)
          </div>
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
            disabled={false}
          />
        </div>

        {/* Game Complete State */}
        {isLastTweet && (
          <div className="mt-8 text-center">
            <h2 className="font-[var(--font-motley-forces)] text-2xl text-[#5C4B3B] mb-4">
              All Tweets Complete!
            </h2>
            <p className="text-[#6B5744] mb-4">
              Your journey is complete
            </p>
          </div>
        )}
      </div>

      {showTransition && (
        <GameTransition 
          nextGame="/game/adventure" 
          onComplete={() => {
            setShowTransition(false);
            if (!isLastTweet) {
              setCurrentTweetIndex(prev => prev + 1);
            }
          }}
        />
      )}
    </main>
  );
}
