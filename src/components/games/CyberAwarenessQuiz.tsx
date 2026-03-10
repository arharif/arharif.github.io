import { useMemo, useState } from 'react';

type Question = {
  prompt: string;
  options: string[];
  correct: string;
  explain: string;
};

const questions: Question[] = [
  {
    prompt: 'You receive an urgent email asking you to verify your account through a link. What is the safest first step?',
    options: ['Click quickly before the account expires', 'Check sender details and open the official site directly', 'Forward your password to IT'],
    correct: 'Check sender details and open the official site directly',
    explain: 'Avoid direct links in urgent emails. Verify through trusted channels.',
  },
  {
    prompt: 'Which behavior best supports a strong security culture?',
    options: ['Reusing one complex password everywhere', 'Reporting suspicious messages quickly', 'Ignoring unusual popups if work is busy'],
    correct: 'Reporting suspicious messages quickly',
    explain: 'Early reporting reduces exposure and helps incident response.',
  },
  {
    prompt: 'A coworker asks for your MFA code to fix a login issue. You should:',
    options: ['Share it if they are from your team', 'Never share it and direct them to official support', 'Share it once and rotate later'],
    correct: 'Never share it and direct them to official support',
    explain: 'MFA codes are personal credentials and should never be shared.',
  },
];

export function CyberAwarenessQuiz() {
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState('Pick the safest option.');
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
    setFeedback('Pick the safest option.');
    setIndex((v) => (v + 1) % questions.length);
  };

  const restart = () => {
    setIndex(0);
    setScore(0);
    setAnswered(false);
    setFeedback('Pick the safest option.');
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
