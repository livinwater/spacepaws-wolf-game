import { create } from 'zustand';

type GameState = {
  currentStage: number;
  scores: number[];
  contextDecisions: Array<{
    miniGame: number;
    contextUsed: boolean;
  }>;
  initialize: () => void;
  setScore: (stage: number, score: number) => void;
  addContextDecision: (miniGame: number, used: boolean) => void;
};

export const useGameStore = create<GameState>((set) => ({
  currentStage: 0,
  scores: [],
  contextDecisions: [],
  initialize: () => {
    set({ 
      currentStage: 0,
      scores: [],
      contextDecisions: []
    });
    // Redirect to first mini-game
    window.location.href = '/game/sentiment';
  },
  setScore: (stage: number, score: number) => 
    set((state) => ({
      scores: [
        ...state.scores.slice(0, stage),
        score,
        ...state.scores.slice(stage + 1)
      ]
    })),
  addContextDecision: (miniGame: number, used: boolean) =>
    set((state) => ({
      contextDecisions: [
        ...state.contextDecisions,
        { miniGame, contextUsed: used }
      ]
    }))
}));
