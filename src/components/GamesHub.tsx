import { useMemo, useState } from 'react';

type Cell = 'X' | 'O' | null;

type GameKey = 'memory' | 'tic' | 'reaction' | 'quiz';

const quiz = [
  { q: 'Which category belongs to the Personal hub?', a: 'Philosophy and Anime', opts: ['GRC', 'Philosophy and Anime', 'ISO 27001'] },
  { q: 'A clean UX favors:', a: 'clarity', opts: ['noise', 'clarity', 'clutter'] },
  { q: 'Security-safe auth messaging should be:', a: 'generic', opts: ['revealing', 'generic', 'verbose'] },
];

export function GamesHub() {
  const [active, setActive] = useState<GameKey>('memory');
  return (
    <section>
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">Games</h1>
          <p className="mt-1 text-sm text-muted">Playful mini-games inside the Personal universe.</p>
        </div>
      </div>
      <div className="mb-5 flex flex-wrap gap-2">
        {[
          ['memory', 'Memory'],
          ['tic', 'Tic-Tac-Toe'],
          ['reaction', 'Reaction'],
          ['quiz', 'Quiz'],
        ].map(([k, label]) => (
          <button key={k} onClick={() => setActive(k as GameKey)} className={`rounded-full px-4 py-2 text-sm ${active === k ? 'bg-white/30' : 'bg-white/10 hover:bg-white/20'}`}>{label}</button>
        ))}
      </div>
      <div className="glass rounded-2xl p-4">
        {active === 'memory' && <MemoryGame />}
        {active === 'tic' && <TicTacToe />}
        {active === 'reaction' && <ReactionGame />}
        {active === 'quiz' && <QuizGame />}
      </div>
    </section>
  );
}

function MemoryGame() {
  const symbols = ['◆', '●', '▲', '■', '★', '♥'];
  const makeDeck = () => [...symbols, ...symbols].sort(() => Math.random() - 0.5);
  const [deck, setDeck] = useState<string[]>(() => makeDeck());
  const [open, setOpen] = useState<number[]>([]);
  const [matched, setMatched] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);

  const click = (i: number) => {
    if (open.includes(i) || matched.includes(i) || open.length === 2) return;
    const next = [...open, i];
    setOpen(next);
    if (next.length === 2) {
      setMoves((m) => m + 1);
      const [a, b] = next;
      if (deck[a] === deck[b]) {
        setMatched((m) => [...m, a, b]);
        setOpen([]);
      } else {
        setTimeout(() => setOpen([]), 550);
      }
    }
  };

  const reset = () => { setDeck(makeDeck()); setOpen([]); setMatched([]); setMoves(0); };

  return <div><div className="mb-3 flex items-center justify-between"><p className="text-sm text-muted">Match all pairs · Moves: {moves}</p><button onClick={reset} className="rounded-lg bg-white/10 px-3 py-1 text-xs">Reset</button></div><div className="grid grid-cols-4 gap-2 sm:grid-cols-6">{deck.map((s, i) => { const show = open.includes(i) || matched.includes(i); return <button key={i} onClick={() => click(i)} className={`h-14 rounded-xl text-lg ${show ? 'bg-white/25' : 'bg-white/10 hover:bg-white/15'}`}>{show ? s : '•'}</button>; })}</div></div>;
}

function TicTacToe() {
  const [cells, setCells] = useState<Cell[]>(Array(9).fill(null));
  const [xTurn, setXTurn] = useState(true);
  const wins = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
  const winner = useMemo(() => {
    for (const [a,b,c] of wins) if (cells[a] && cells[a] === cells[b] && cells[a] === cells[c]) return cells[a];
    return null;
  }, [cells]);
  const draw = !winner && cells.every(Boolean);
  const play = (i: number) => { if (cells[i] || winner) return; const n=[...cells]; n[i]=xTurn?'X':'O'; setCells(n); setXTurn(!xTurn); };
  const reset = () => { setCells(Array(9).fill(null)); setXTurn(true); };
  return <div><div className="mb-3 flex items-center justify-between"><p className="text-sm text-muted">{winner ? `Winner: ${winner}` : draw ? 'Draw' : `Turn: ${xTurn ? 'X' : 'O'}`}</p><button onClick={reset} className="rounded-lg bg-white/10 px-3 py-1 text-xs">Reset</button></div><div className="grid w-full max-w-xs grid-cols-3 gap-2">{cells.map((v,i)=><button key={i} onClick={()=>play(i)} className="h-20 rounded-xl bg-white/10 text-2xl hover:bg-white/15">{v ?? ''}</button>)}</div></div>;
}

function ReactionGame() {
  const [state, setState] = useState<'idle' | 'wait' | 'go' | 'done'>('idle');
  const [start, setStart] = useState(0);
  const [result, setResult] = useState<number | null>(null);
  const run = () => {
    setState('wait'); setResult(null);
    const delay = 1000 + Math.random() * 1800;
    setTimeout(() => { setState('go'); setStart(performance.now()); }, delay);
  };
  const tap = () => {
    if (state === 'go') { setResult(Math.round(performance.now() - start)); setState('done'); }
    else if (state === 'wait') { setState('idle'); setResult(null); }
  };
  return <div><p className="mb-3 text-sm text-muted">Click when the panel turns green.</p><button onClick={state === 'idle' || state === 'done' ? run : tap} className={`h-32 w-full rounded-2xl transition ${state==='go' ? 'bg-emerald-400/35' : state==='wait' ? 'bg-rose-400/30' : 'bg-white/10 hover:bg-white/15'}`}>{state==='idle' && 'Start'}{state==='wait' && 'Wait... (too early resets)'}{state==='go' && 'Tap now!'}{state==='done' && `Reaction: ${result}ms • Try again`}</button></div>;
}

function QuizGame() {
  const [i, setI] = useState(0);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const cur = quiz[i];
  const pick = (opt: string) => {
    const nextScore = score + (opt === cur.a ? 1 : 0);
    if (i === quiz.length - 1) { setScore(nextScore); setDone(true); return; }
    setScore(nextScore);
    setI((v) => v + 1);
  };
  const reset = () => { setI(0); setScore(0); setDone(false); };
  if (done) return <div className="space-y-3"><p className="text-lg font-semibold">Score: {score}/{quiz.length}</p><button onClick={reset} className="rounded-lg bg-white/10 px-3 py-1 text-xs">Restart</button></div>;
  return <div><p className="mb-3 text-sm text-muted">{cur.q}</p><div className="grid gap-2">{cur.opts.map((opt)=><button key={opt} onClick={()=>pick(opt)} className="rounded-xl bg-white/10 p-3 text-left hover:bg-white/15">{opt}</button>)}</div></div>;
}
