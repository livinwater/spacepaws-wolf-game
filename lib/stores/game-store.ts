import { create } from 'zustand';

interface GameState {
  health: number;
  currentStage: string;
  position: 'forest' | 'plains' | null;
  actions: {
    setHealth: (value: number) => void;
    setStage: (stage: string) => void;
    setPosition: (pos: 'forest' | 'plains' | null) => void;
    handleSwipe: (direction: 'left' | 'right') => void;
  };
}

export const useGameStore = create<GameState>((set) => ({
  health: 3,
  currentStage: 'stage1',
  position: null,
  actions: {
    setHealth: (value) => set({ health: value }),
    setStage: (stage) => set({ currentStage: stage }),
    setPosition: (pos) => set({ position: pos }),
    handleSwipe: (direction) => {
      set((state) => {
        const newHealth = direction === 'left' ? state.health - 0 : state.health;
        return {
          position: direction === 'left' ? 'forest' : 'plains',
          health: newHealth
        };
      });
    }
  }
}));
