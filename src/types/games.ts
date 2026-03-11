export type GamesZoneCategory = 'Security' | 'Culture' | 'Entertainment';

export type GameQuestion = {
  id: string;
  prompt: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
};

export type QuizGameData = {
  id: string;
  slug: string;
  title: string;
  category: GamesZoneCategory;
  shortDescription: string;
  longDescription: string;
  questionCount: number;
  difficulty?: 'Beginner' | 'Intermediate' | 'Advanced';
  type: 'quiz' | 'practice-pack' | 'trivia' | 'awareness';
  questions: GameQuestion[];
  featured?: boolean;
  sortOrder: number;
};
