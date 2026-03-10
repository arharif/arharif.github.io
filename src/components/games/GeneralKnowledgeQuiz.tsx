import { useMemo, useState } from 'react';

type Question = {
  prompt: string;
  options: string[];
  correct: string;
  explain: string;
};

const questions: Question[] = [
  {
    prompt: 'What is the capital of Canada?',
    options: ['Toronto', 'Vancouver', 'Ottawa'],
    correct: 'Ottawa',
    explain: 'Ottawa is the capital city of Canada.',
  },
  {
    prompt: 'Which planet is known as the Red Planet?',
    options: ['Mars', 'Jupiter', 'Venus'],
    correct: 'Mars',
    explain: 'Mars appears red because of iron oxide on its surface.',
  },
  {
    prompt: 'Who wrote “1984”?',
    options: ['George Orwell', 'Aldous Huxley', 'Ernest Hemingway'],
    correct: 'George Orwell',
    explain: 'George Orwell published “1984” in 1949.',
  },
];

export function GeneralKnowledgeQuiz() {
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState('Choose one answer.');
  const [answered, setAnswered] = useState(false);
  const current = useMemo(() => questions[index], [index]);

  const choose = (option: string) => {
    if (answered) return;
    const isCorrect = option === current.correct;
    if (isCorrect) setScore((s) => s + 1);
    setFeedback(`${isCorrect ? 'Correct.' : 'Not quite.'} ${current.explain}`);
    setAnswered(true);
  };

  const next = () => {
    setAnswered(false);
    setFeedback('Choose one answer.');
    setIndex((v) => (v + 1) % questions.length);
  };

  const restart = () => {
    setIndex(0);
    setScore(0);
    setAnswered(false);
    setFeedback('Choose one answer.');
  };

  return (
    <div>
      <div className="mb-3 flex items-center justify-between text-sm text-muted">
        <p>{feedback}</p>
        <p>Score: {score}</p>
      </div>
      <p className="mb-3 text-lg font-medium">{current.prompt}</p>
      <div className="grid gap-2">
        {current.options.map((option) => (
          <button key={option} onClick={() => choose(option)} className="rounded-xl bg-white/10 px-4 py-2 text-left hover:bg-white/15">
            {option}
          </button>
        ))}
      </div>
      <div className="mt-3 flex gap-2">
        <button className="rounded-lg bg-white/10 px-3 py-1 text-xs hover:bg-white/15" onClick={next}>Next</button>
        <button className="rounded-lg bg-white/10 px-3 py-1 text-xs hover:bg-white/15" onClick={restart}>Restart</button>
      </div>
    </div>
  );
}
