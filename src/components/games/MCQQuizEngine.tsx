import { useMemo, useState } from 'react';
import { QuizGameData } from '@/types/games';

type Props = { game: QuizGameData };

export function MCQQuizEngine({ game }: Props) {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [locked, setLocked] = useState(false);
  const [score, setScore] = useState(0);
  const [complete, setComplete] = useState(false);

  const current = game.questions[index];
  const progress = Math.round(((index + 1) / game.questions.length) * 100);

  const isCorrect = useMemo(() => {
    if (!selected) return false;
    return selected === current?.correctAnswer;
  }, [selected, current]);

  const submit = () => {
    if (!selected || locked || !current) return;
    if (isCorrect) setScore((prev) => prev + 1);
    setLocked(true);
  };

  const next = () => {
    if (index >= game.questions.length - 1) {
      setComplete(true);
      return;
    }
    setIndex((prev) => prev + 1);
    setSelected(null);
    setLocked(false);
  };

  const restart = () => {
    setIndex(0);
    setSelected(null);
    setLocked(false);
    setScore(0);
    setComplete(false);
  };

  if (!game.questions.length) {
    return <p className="text-sm text-muted">This quiz has no questions configured yet.</p>;
  }

  if (complete) {
    const pct = Math.round((score / game.questions.length) * 100);
    return (
      <div className="space-y-4">
        <h3 className="text-2xl font-semibold">Quiz Complete</h3>
        <p className="text-sm text-muted">{game.title}</p>
        <p className="text-lg">Score: <span className="font-semibold">{score}</span> / {game.questions.length} ({pct}%)</p>
        <button onClick={restart} className="rounded-xl bg-white/10 px-4 py-2 text-sm transition hover:bg-white/20">Restart Quiz</button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <header className="space-y-2">
        <div className="flex items-center justify-between text-xs text-muted">
          <span>Question {index + 1} / {game.questions.length}</span>
          <span>Score {score}</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-white/10">
          <div className="h-full bg-cyan-300 transition-all" style={{ width: `${progress}%` }} />
        </div>
      </header>

      <h3 className="text-lg font-semibold">{current.prompt}</h3>

      <div className="grid gap-2">
        {current.options.map((option) => {
          const isSelected = selected === option;
          const showCorrect = locked && option === current.correctAnswer;
          const showIncorrect = locked && isSelected && option !== current.correctAnswer;
          return (
            <button
              key={option}
              onClick={() => !locked && setSelected(option)}
              className={`rounded-xl border px-4 py-3 text-left transition ${isSelected ? 'border-cyan-300 bg-cyan-500/10' : 'border-white/10 bg-white/5 hover:bg-white/10'} ${showCorrect ? 'border-emerald-300 bg-emerald-500/15' : ''} ${showIncorrect ? 'border-rose-300 bg-rose-500/15' : ''}`}
            >
              {option}
            </button>
          );
        })}
      </div>

      {locked && (
        <div className={`rounded-xl border px-4 py-3 text-sm ${isCorrect ? 'border-emerald-300/60 bg-emerald-500/10' : 'border-rose-300/60 bg-rose-500/10'}`}>
          <p className="font-medium">{isCorrect ? 'Correct' : 'Incorrect'}</p>
          {current.explanation && <p className="mt-1 text-muted">{current.explanation}</p>}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {!locked ? (
          <button onClick={submit} disabled={!selected} className="rounded-xl bg-cyan-500/20 px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50">Check Answer</button>
        ) : (
          <button onClick={next} className="rounded-xl bg-white/10 px-4 py-2 text-sm hover:bg-white/20">{index === game.questions.length - 1 ? 'View Results' : 'Next Question'}</button>
        )}
        <button onClick={restart} className="rounded-xl bg-white/10 px-4 py-2 text-sm hover:bg-white/20">Restart</button>
      </div>
    </div>
  );
}
