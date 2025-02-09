'use client';

import { useState, useEffect } from 'react';
import { useGameStore } from '@/lib/game/state';
import GameTransition from '@/app/components/GameTransition';

type Tweet = {
  id: number;
  author?: {
    handle: string;
    name: string;
    title?: string;
  };
  content: string;
  context?: string;
};

const TIMER_DURATION = 30;

// Sample tweets - we can expand this later
const SAMPLE_TWEETS: Tweet[] = [
  {
    id: 1,
    author: {
      handle: '@klarnaseb',
      name: 'Sebastian Siemiatkowski',
      title: 'Co-founder and CEO of @Klarna'
    },
    content: "Ok. I give up. Klarna and me will embrace crypto! More to come\n\nYes I know! This post will get a huge sigh and 2 views 😂\n\nBut it still feels historic. Last large fintech in the world to embrace it. Someone had to be last. And that's a milestone as well of some sort… 🥳",
    context: "This announcement marks a significant shift as Klarna was one of the last major fintech companies to resist crypto adoption. The company has previously been skeptical of cryptocurrencies."
  },
  {
    id: 2,
    author: {
      handle: '@bigdsenpai',
      name: 'Big D'
    },
    content: "If you told me in 2021 that being generous to IRL friends/family/employees etc. would be my single biggest regret in life by 2025, I'd never have believed it. But sadly the warm proud feelings you get from helping everyone out are nothing compared to the cold lonely jaded feelings you've got coming for you eventually.\n\nOnce you eventually put your foot down and start saying \"no\" to the people who got used to you giving them \"yes yes yes\", have fun being treated like you're Ted Bundy. Pic related.\n\nListen to Mayne guys. TRUST me.",
    context: "Post discussing personal experiences with wealth management and relationships during the crypto bull market. High engagement with similar stories from other community members."
  },
  {
    id: 3,
    author: {
      handle: '@CryptoDonAlt',
      name: 'DonAlt'
    },
    content: "What people on here don't realize is that there are real losers behind the grifts and scams that are run on here\n\nSome random schmuck with $100 to invest getting rinsed by Dave Portnoy for all he has\nA dude trusting Ansem with his last $500 because he portrays himself as genuine\nA Trump fan yeeting his savings into Trump coin to make it\n\nAll I hear on here is \"Yeah but there were winners like XYZ\" brother... these memes are zero sum, the winners took (or will take) from the losers\nIt's a fucked sort of hunger games and the influencers on here have machine guns while you've got dick all",
    context: "A critical commentary on the predatory nature of crypto influencers and meme coins. The thread gained significant traction, sparking discussions about responsibility in crypto promotion."
  }
];

export default function SentimentGame() {
  const [currentTweetIndex, setCurrentTweetIndex] = useState(0);
  const [showContext, setShowContext] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [timeLeft, setTimeLeft] = useState(TIMER_DURATION);
  const [showTransition, setShowTransition] = useState(false);
  
  const currentTweet = SAMPLE_TWEETS[currentTweetIndex];
  const isLastTweet = currentTweetIndex === SAMPLE_TWEETS.length - 1;

  // Timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          // Time's up - move to next tweet
          if (!isLastTweet && !selectedAnswers[currentTweet.id]) {
            setSelectedAnswers(prev => ({
              ...prev,
              [currentTweet.id]: 'timeout'
            }));
            setCurrentTweetIndex(prev => prev + 1);
            setShowContext(false);
            return TIMER_DURATION;
          }
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentTweetIndex, currentTweet.id, isLastTweet, selectedAnswers]);

  // Reset timer when moving to next tweet
  useEffect(() => {
    setTimeLeft(TIMER_DURATION);
  }, [currentTweetIndex]);
  
  const handleAnswer = (sentiment: string) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [currentTweet.id]: sentiment
    }));
    
    if (!isLastTweet) {
      setCurrentTweetIndex(prev => prev + 1);
      setShowContext(false);
    }
  };

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
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg mb-6">
          {/* Author Info */}
          {currentTweet.author && (
            <div className="mb-3">
              <div className="font-semibold text-[#5C4B3B]">{currentTweet.author.name}</div>
              <div className="text-sm text-[#6B5744]/70">
                {currentTweet.author.handle}
                {currentTweet.author.title && (
                  <span className="block text-[#6B5744]/60">{currentTweet.author.title}</span>
                )}
              </div>
            </div>
          )}
          
          {/* Tweet Content */}
          <p className="text-lg text-[#5C4B3B] mb-4 whitespace-pre-wrap">{currentTweet.content}</p>
          
          {/* Context Button */}
          <button
            onClick={() => setShowContext(true)}
            disabled={selectedAnswers[currentTweet.id] !== undefined}
            className="text-sm text-[#6B5744]/70 hover:text-[#6B5744] mb-4 disabled:opacity-50"
          >
            👀 Check community signals
          </button>
          
          {/* Context Information */}
          {showContext && currentTweet.context && (
            <div className="text-sm text-[#6B5744] bg-amber-50/50 p-3 rounded-lg mb-4">
              {currentTweet.context}
            </div>
          )}
        </div>

        {/* Answer Buttons */}
        <div className="grid grid-cols-3 gap-4">
          {['Bullish', 'Bearish', 'Neutral'].map((sentiment) => (
            <button
              key={sentiment}
              onClick={() => handleAnswer(sentiment)}
              disabled={selectedAnswers[currentTweet.id] !== undefined}
              className={`
                px-6 py-3 rounded-lg font-[var(--font-motley-forces)] text-lg
                transition-all duration-200
                ${
                  selectedAnswers[currentTweet.id] === sentiment
                    ? 'bg-[#8B7355] text-white'
                    : 'bg-white/80 text-[#5C4B3B] hover:bg-[#8B7355] hover:text-white'
                }
                disabled:opacity-50 disabled:cursor-not-allowed
              `}
            >
              {sentiment}
            </button>
          ))}
        </div>

        {/* Game Complete State */}
        {(isLastTweet && Object.keys(selectedAnswers).length === SAMPLE_TWEETS.length) && (
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

        {/* Transition Screen */}
        {showTransition && <GameTransition nextGame="/game/projects" />}
      </div>
    </main>
  );
}
