'use client';

import React, { useEffect, useState } from 'react';
import TinderCard from 'react-tinder-card';
import { animated, useSpring } from '@react-spring/web';
import { Tweet, SwipeDirection } from '@/types/tweet';

interface TweetCardProps {
  tweet: Tweet;
  onSwipe: (direction: SwipeDirection) => void;
  disabled?: boolean;
}

const TweetCard: React.FC<TweetCardProps> = ({ 
  tweet, 
  onSwipe,
  disabled = false 
}) => {
  const [swipeDirection, setSwipeDirection] = useState<SwipeDirection | null>(null);

  // Flash animation spring
  const [styles, api] = useSpring(() => ({
    from: { backgroundColor: 'rgba(255, 255, 255, 0.8)' },
  }));

  // Handle swipe animation
  const handleSwipeAnimation = (direction: SwipeDirection) => {
    console.log('🎯 TweetCard - Swipe detected:', direction);
    if (disabled) {
      console.log('TweetCard - Swipe ignored (disabled)');
      return;
    }

    setSwipeDirection(direction);
    const color = direction === 'right' 
      ? 'rgba(34, 197, 94, 0.4)' // Stronger green flash (40% opacity)
      : 'rgba(239, 68, 68, 0.4)'; // Stronger red flash (40% opacity)

    // Animate background color with more dramatic effect
    api.start({
      to: [
        { backgroundColor: color },
        { backgroundColor: 'rgba(255, 255, 255, 0.8)' }
      ],
      config: { duration: 400 }, // Slightly longer duration for more visible effect
    });

    // Call the original onSwipe after animation
    console.log('TweetCard - Starting swipe animation');
    setTimeout(() => {
      console.log('TweetCard - Animation complete, calling onSwipe');
      onSwipe(direction);
      setSwipeDirection(null);
    }, 400);
  };

  // Add keyboard support
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (disabled) return;
      
      if (e.key === 'ArrowLeft') {
        handleSwipeAnimation('left');
      } else if (e.key === 'ArrowRight') {
        handleSwipeAnimation('right');
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [disabled]);

  return (
    <TinderCard
      className="w-full rounded-xl shadow-lg overflow-hidden"
      onSwipe={(dir) => handleSwipeAnimation(dir as SwipeDirection)}
      preventSwipe={['up', 'down']}
    >
      <animated.div 
        style={{
          ...styles,
          padding: '1.5rem',
        }}
        className="backdrop-blur-sm transition-colors duration-300"
      >
        {/* Author Info */}
        {tweet.author && (
          <div className="mb-3">
            <div className="font-semibold text-[#5C4B3B]">{tweet.author.name}</div>
            <div className="text-sm text-[#6B5744]/70">
              {tweet.author.handle}
              {tweet.author.title && (
                <span className="block text-[#6B5744]/60">{tweet.author.title}</span>
              )}
            </div>
          </div>
        )}
        
        {/* Tweet Content */}
        <p className="text-lg text-[#5C4B3B] mb-4 whitespace-pre-wrap">{tweet.content}</p>

        {/* Swipe Instructions */}
        <div className="flex justify-between mt-4 text-sm">
          <div className={`transition-colors ${swipeDirection === 'left' ? 'text-red-600 font-bold scale-110' : 'text-[#6B5744]/70'}`}>
            ← Swipe left for Bearish
          </div>
          <div className={`transition-colors ${swipeDirection === 'right' ? 'text-green-600 font-bold scale-110' : 'text-[#6B5744]/70'}`}>
            Swipe right for Bullish →
          </div>
        </div>
      </animated.div>
    </TinderCard>
  );
};

export default TweetCard;
