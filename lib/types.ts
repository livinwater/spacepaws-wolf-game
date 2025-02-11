export type SwipeDirection = 'left' | 'right';

export type GameStage = {
  prompt: string;
  choices: {
    left: {
      label: string;
      consequence: number;
    };
    right: {
      label: string;
      consequence: number;
    };
  };
};
