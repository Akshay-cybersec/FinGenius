// types/game.ts
export type Scenario = {
  id: number;
  title: string;
  description: string;
  options: {
    label: string;
    impact: { score: number; cash: number };
    feedback: string;
  }[];
};