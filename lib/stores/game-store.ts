import { create } from 'zustand';

interface GameState {
  // Game progress
  currentStage: 'sentiment' | 'adventure';
  currentLevel: number;
  
  // Sentiment game state
  sentimentResults: {
    batchNumber: number;
    answers: string[];
    timestamp: string;
  }[];
  lastTweetIndex: number;
  
  // Adventure game state
  health: number;
  maxHealth: number;
  
  // Actions
  setCurrentStage: (stage: 'sentiment' | 'adventure') => void;
  setCurrentLevel: (level: number) => void;
  addSentimentResults: (results: { batchNumber: number; answers: string[]; timestamp: string }) => void;
  setHealth: (health: number) => void;
  updateHealth: (delta: number) => void;
  setLastTweetIndex: (index: number) => void;
}

export const useGameStore = create<GameState>((set) => ({
  // Initial state
  currentStage: 'sentiment',
  currentLevel: 1,
  sentimentResults: [],
  health: 3,
  maxHealth: 3,
  lastTweetIndex: 0,
  
  // Actions
  setCurrentStage: (stage) => set({ currentStage: stage }),
  setCurrentLevel: (level) => set({ currentLevel: level }),
  addSentimentResults: (results) => 
    set((state) => ({
      sentimentResults: [...state.sentimentResults, results]
    })),
  setHealth: (health) => set({ health: Math.min(health, 3) }),
  updateHealth: (delta) => 
    set((state) => ({
      health: Math.min(Math.max(state.health + delta, 0), state.maxHealth)
    })),
  setLastTweetIndex: (index) => set({ lastTweetIndex: index })
}));