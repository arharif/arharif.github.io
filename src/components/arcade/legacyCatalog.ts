import { gamesZoneQuizzes } from "@/data/gamesZoneData";
import type { GamesZoneCategory } from "@/types/games";
export type GameKey =
  | "full-ciso-qsa-pack"
  | "security-awareness-qsm"
  | "ai-topic-qsm"
  | "otaku-general-culture-quiz"
  | "countries-capitals-locations-quiz"
  | "fc-barcelona-hardcore-fan-quiz"
  | "card-shedding"
  | "2048"
  | "sudoku-mini"
  | "cyber-awareness"
  | "general-knowledge"
  | "snake"
  | "tictactoe"
  | "reaction"
  | "rps"
  | "pacman"
  | "retro-car-racing"
  | "memory"
  | "hangman-x1"
  | "mystery-box"
  | "truth-or-dare-x1";

type GameEntry = {
  key: GameKey;
  title: string;
  desc: string;
  color: string;
  icon: string;
  category: GamesZoneCategory;
  typeLabel: string;
  questionCount?: number;
  difficulty?: string;
  sortOrder: number;
};

const staticGames: GameEntry[] = [
  {
    key: "general-knowledge",
    title: "General Knowledge Quiz",
    desc: "Test your general knowledge.",
    color: "token",
    icon: "🌎",
    category: "Entertainment",
    typeLabel: "Quiz",
    sortOrder: 39,
  },
  {
    key: "cyber-awareness",
    title: "Cyber Awareness Quiz",
    desc: "Practice everyday security awareness.",
    color: "token",
    icon: "🛡",
    category: "Security",
    typeLabel: "Quiz",
    sortOrder: 38,
  },
  {
    key: "sudoku-mini",
    title: "Mini Sudoku",
    desc: "Complete the number grid.",
    color: "token",
    icon: "▦",
    category: "Entertainment",
    typeLabel: "Puzzle",
    sortOrder: 37,
  },
  {
    key: "2048",
    title: "2048",
    desc: "Merge matching numbered tiles.",
    color: "token",
    icon: "🔢",
    category: "Entertainment",
    typeLabel: "Puzzle",
    sortOrder: 36,
  },
  {
    key: "card-shedding",
    title: "Card Shedding",
    desc: "Play matching cards to empty your hand.",
    color: "token",
    icon: "♣",
    category: "Entertainment",
    typeLabel: "Classic",
    sortOrder: 35,
  },
  {
    key: "memory",
    title: "Memory Puzzle",
    desc: "Pattern recall challenge with calm pacing.",
    color: "token",
    icon: "🧠",
    category: "Entertainment",
    typeLabel: "Puzzle",
    sortOrder: 23,
  },
  {
    key: "rps",
    title: "Rock Paper Scissors",
    desc: "Classic duel versus computer.",
    color: "token",
    icon: "🪨",
    category: "Entertainment",
    typeLabel: "Classic",
    sortOrder: 24,
  },
  {
    key: "snake",
    title: "Snake",
    desc: "Precision movement with increasing pressure.",
    color: "token",
    icon: "🐍",
    category: "Entertainment",
    typeLabel: "Arcade",
    sortOrder: 25,
  },
  {
    key: "tictactoe",
    title: "Tic Tac Toe",
    desc: "Fast strategic duels.",
    color: "token",
    icon: "✖️",
    category: "Entertainment",
    typeLabel: "Classic",
    sortOrder: 27,
  },
  {
    key: "reaction",
    title: "Reaction Time",
    desc: "Measure and improve your response speed.",
    color: "token",
    icon: "⚡",
    category: "Entertainment",
    typeLabel: "Arcade",
    sortOrder: 28,
  },
  {
    key: "pacman",
    title: "Pac-Man Arcade",
    desc: "Navigate the maze, collect pellets, and avoid ghosts.",
    color: "token",
    icon: "🟡",
    category: "Entertainment",
    typeLabel: "Arcade",
    sortOrder: 30,
  },
  {
    key: "retro-car-racing",
    title: "Retro Car Racing",
    desc: "Nokia-style lane dodging challenge with arcade pacing.",
    color: "token",
    icon: "🏎️",
    category: "Entertainment",
    typeLabel: "Arcade",
    sortOrder: 31,
  },
  {
    key: "hangman-x1",
    title: "Hangman X1",
    desc: "Premium word-guessing with categories and hints.",
    color: "token",
    icon: "🔤",
    category: "Entertainment",
    typeLabel: "Word Game",
    sortOrder: 32,
  },
  {
    key: "mystery-box",
    title: "Mystery Box",
    desc: "Open the glowing box to reveal facts, riddles, and mini challenges.",
    color: "token",
    icon: "🎁",
    category: "Entertainment",
    typeLabel: "Surprise",
    sortOrder: 33,
  },
  {
    key: "truth-or-dare-x1",
    title: "Truth or Dare X1",
    desc: "Safe, friendly prompts for everyone.",
    color: "token",
    icon: "🎭",
    category: "Entertainment",
    typeLabel: "Party",
    sortOrder: 34,
  },
];

const quizEntries: GameEntry[] = gamesZoneQuizzes.map((quiz) => ({
  key: quiz.slug as GameKey,
  title: quiz.title,
  desc: quiz.shortDescription,
  color: "token",
  icon:
    quiz.slug === "countries-capitals-locations-quiz"
      ? "🧭"
      : quiz.slug === "fc-barcelona-hardcore-fan-quiz"
        ? "⚽"
        : quiz.category === "Security"
          ? "🛡️"
          : "🎌",
  category: quiz.category,
  typeLabel: quiz.type,
  questionCount: quiz.questionCount,
  difficulty: quiz.difficulty,
  sortOrder: quiz.sortOrder,
}));

export const legacyCatalog: GameEntry[] = [...quizEntries, ...staticGames].sort(
  (a, b) => a.sortOrder - b.sortOrder,
);
