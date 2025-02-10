export interface Tweet {
  id: number;
  author?: {
    handle: string;
    name: string;
    title?: string;
  };
  content: string;
}

export type SwipeDirection = 'left' | 'right';

export interface GameState {
  currentTweetIndex: number;
  selectedAnswers: Record<number, string>;
  showContext: boolean;
  timeLeft: number;
  showTransition: boolean;
}
