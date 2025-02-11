'use client';

import { useState, useEffect } from 'react';
import { useGameStore } from '@/lib/stores/game-store';
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

  // Save batch results and trigger evaluation
  async function saveBatchResults(batchNumber: number, startIndex: number, endIndex: number, answers: string[]) {
    try {
      const { health } = useGameStore.getState(); // Get current health from store
      console.log('Saving batch', batchNumber, 'results:', { batchNumber, startIndex, endIndex, answers });
      
      // Save tweets response first
      const response = await fetch('/api/save-results', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          batchNumber,
          startIndex,
          endIndex,
          answers,
          health
        })
      });

      const data = await response.json();
      if (data.success) {
        console.log('Results saved successfully:', { batchNumber, startIndex, endIndex, answers });
        
        // If this is batch 0, trigger evaluation
        if (batchNumber === 0) {
          const evalResponse = await fetch('/api/evaluate', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              batchNumber: 0,
              answers
            })
          });

          const evalData = await evalResponse.json();
          console.log('Evaluation results:', evalData);

          if (evalData.success) {
            // Update game state after evaluation
            try {
              const health = useGameStore.getState().health;
              console.log('Updating game state after evaluation with health:', health);
              const gameStateResponse = await fetch('/api/game-state', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  health
                })
              });

              if (!gameStateResponse.ok) {
                console.error('Failed to update game state:', await gameStateResponse.text());
              } else {
                const gameStateData = await gameStateResponse.json();
                console.log('Game state updated successfully:', gameStateData);
              }
            } catch (error) {
              console.error('Error updating game state:', error);
            }

            // Update health if evaluation failed
            if (!evalData.passed) {
              useGameStore.getState().updateHealth(-1);
            }
          }
        }
      } else {
        console.error('Failed to save results:', data.error);
      }
    } catch (error) {
      console.error('Error saving results:', error);
    }
  };

  const currentTweet = tweets[currentTweetIndex];
  const isLastTweet = currentTweetIndex === tweets.length - 1;

  // Store tweet index before transition
  useEffect(() => {
    if (currentBatch.length === TWEETS_PER_INTERVAL && !showTransition) {
      // Get current number of batches from store
      const existingBatches = useGameStore.getState().sentimentResults;
      const batchNumber = existingBatches.length;
      
      const startIndex = currentTweetIndex - TWEETS_PER_INTERVAL;
      const results = {
        batchNumber,
        startIndex,
        endIndex: startIndex + TWEETS_PER_INTERVAL - 1,
        answers: currentBatch
      };
      
      console.log(`Saving batch ${batchNumber} results:`, results);
      saveBatchResults(batchNumber, startIndex, startIndex + TWEETS_PER_INTERVAL - 1, currentBatch);
      setCurrentBatch([]); // Reset batch
      
      // Store current tweet index in game store
      useGameStore.getState().setLastTweetIndex(currentTweetIndex);
      setShowTransition(true);
    }
  }, [currentBatch, currentTweetIndex, showTransition]);

  // Restore tweet index on mount
  useEffect(() => {
    const lastIndex = useGameStore.getState().lastTweetIndex;
    if (lastIndex > 0) {
      setCurrentTweetIndex(lastIndex);
    }
  }, []);

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
