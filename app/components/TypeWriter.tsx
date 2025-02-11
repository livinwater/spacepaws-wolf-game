'use client';

import { useState, useEffect } from 'react';

interface TypeWriterProps {
  text: string;
  speed?: number;
  className?: string;
  onComplete?: () => void;
}

export default function TypeWriter({ 
  text, 
  speed = 500,
  className = '',
  onComplete
}: TypeWriterProps) {
  const [displayText, setDisplayText] = useState('');
  const [index, setIndex] = useState(0);
  
  // Reset when text changes
  useEffect(() => {
    setDisplayText('');
    setIndex(0);
  }, [text]);

  useEffect(() => {
    if (index < text.length) {
      const timer = setTimeout(() => {
        setDisplayText(text.substring(0, index + 1));
        setIndex(index + 1);
      }, speed);

      return () => clearTimeout(timer);
    } else if (onComplete) {
      const timer = setTimeout(onComplete, 1000);
      return () => clearTimeout(timer);
    }
  }, [text, index, speed, onComplete]);

  return (
    <span className={className}>
      {displayText}
      <span className="animate-blink">|</span>
    </span>
  );
}
