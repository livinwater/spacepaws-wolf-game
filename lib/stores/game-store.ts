import { create } from 'zustand';

interface GameState {
  // Game progress
  currentStage: 'sentiment' | 'adventure';
  currentLevel: number;
  adventuresCompleted: number;
  tweetsReplied: number;
  lastQuestName: string;
  walletAddress: string;
  
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
  incrementAdventures: () => void;
  incrementTweetsReplied: (count: number) => void;
  setLastQuestName: (name: string) => void;
  setWalletAddress: (address: string) => void;
}

export const useGameStore = create<GameState>((set) => ({
  // Initial state
  currentStage: 'sentiment',
  currentLevel: 1,
  sentimentResults: [],
  health: 3,
  maxHealth: 3,
  lastTweetIndex: 0,
  adventuresCompleted: 0,
  tweetsReplied: 0,
  lastQuestName: '',
  walletAddress: '',
  
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
  setLastTweetIndex: (index) => set({ lastTweetIndex: index }),
  incrementAdventures: () => 
    set((state) => ({
      adventuresCompleted: state.adventuresCompleted + 1
    })),
  incrementTweetsReplied: (count) => 
    set((state) => ({
      tweetsReplied: state.tweetsReplied + count
    })),
  setLastQuestName: (name) => set({ lastQuestName: name }),
  setWalletAddress: (address) => set({ walletAddress: address })
}));