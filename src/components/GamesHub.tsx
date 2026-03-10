import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { listPublishedContent } from '@/lib/cms';
import { ContentRecord } from '@/content/types';
import { CyberAwarenessQuiz } from '@/components/games/CyberAwarenessQuiz';
import { GeneralKnowledgeQuiz } from '@/components/games/GeneralKnowledgeQuiz';
import { CardSheddingGame } from '@/components/games/CardSheddingGame';
import { Puzzle2048Game } from '@/components/games/Puzzle2048Game';
import { SudokuMiniGame } from '@/components/games/SudokuMiniGame';
import { MemoryPuzzleGame } from '@/components/games/MemoryPuzzleGame';

type GameCategory = 'Card Games' | 'Puzzle Games' | 'Classic Games' | 'Arcade & Skills' | 'Knowledge';
type GameKey =
  | 'snake' | 'battleship' | 'tictactoe' | 'reaction' | 'rps' | 'math' | 'geo'
  | 'cyber-awareness' | 'general-knowledge'
  | 'card-shedding' | 'puzzle-2048' | 'sudoku' | 'memory';

const gameMeta: Record<GameKey, { title: string; desc: string; color: string; icon: string; category: GameCategory }> = {
  'card-shedding': { title: 'Card Shedding Duel', desc: 'A mature shedding-card strategy round against computer AI.', color: 'from-indigo-500/35 to-blue-500/25', icon: '🂡', category: 'Card Games' },
  'puzzle-2048': { title: '2048', desc: 'Merge tiles and plan your board progression.', color: 'from-amber-500/35 to-orange-500/25', icon: '🔢', category: 'Puzzle Games' },
  sudoku: { title: 'Sudoku', desc: 'Compact logic grid challenge focused on deduction.', color: 'from-slate-500/35 to-slate-400/25', icon: '🧩', category: 'Puzzle Games' },
  memory: { title: 'Memory Puzzle', desc: 'Pattern recall challenge with calm pacing.', color: 'from-cyan-500/35 to-sky-500/25', icon: '🧠', category: 'Puzzle Games' },
  rps: { title: 'Rock Paper Scissors', desc: 'Classic duel versus computer.', color: 'from-violet-500/35 to-fuchsia-400/25', icon: '🪨', category: 'Classic Games' },
  snake: { title: 'Snake', desc: 'Precision movement with increasing pressure.', color: 'from-emerald-400/35 to-cyan-400/25', icon: '🐍', category: 'Arcade & Skills' },
  battleship: { title: 'Battleship Lite', desc: 'Tactical grid targeting in compact rounds.', color: 'from-blue-500/35 to-cyan-400/25', icon: '🚢', category: 'Arcade & Skills' },
  tictactoe: { title: 'Tic Tac Toe', desc: 'Fast strategic duels.', color: 'from-slate-400/35 to-indigo-400/25', icon: '✖️', category: 'Classic Games' },
  reaction: { title: 'Reaction Time', desc: 'Measure and improve your response speed.', color: 'from-amber-400/35 to-orange-400/25', icon: '⚡', category: 'Arcade & Skills' },
  math: { title: 'Quick Math', desc: 'Solve rapidly under a short timer.', color: 'from-rose-500/35 to-pink-400/25', icon: '➗', category: 'Arcade & Skills' },
  geo: { title: 'Country Locator', desc: 'Region-based world challenge.', color: 'from-cyan-500/35 to-sky-400/25', icon: '🌍', category: 'Knowledge' },
  'cyber-awareness': { title: 'Cyber Culture Quiz', desc: 'Practice phishing awareness and secure habits.', color: 'from-emerald-500/35 to-teal-400/25', icon: '🛡️', category: 'Knowledge' },
  'general-knowledge': { title: 'General Knowledge Quiz', desc: 'Quick mixed culture trivia in lightweight rounds.', color: 'from-indigo-500/35 to-sky-400/25', icon: '📚', category: 'Knowledge' },
};

const readBest = (key: string) => {
  if (typeof window === 'undefined') return 0;
  try {
    const value = window.localStorage.getItem(key);
    const num = Number(value || 0);
    return Number.isFinite(num) ? num : 0;
  } catch {
    return 0;
  }
};

const saveBest = (key: string, value: number) => {
  if (typeof window === 'undefined') return;
  try { window.localStorage.setItem(key, String(value)); } catch { /* ignore storage failures */ }
};

export function GamesHub() {
  const [active, setActive] = useState<GameKey>('card-shedding');
  const [games, setGames] = useState<ContentRecord[]>([]);
  const location = useLocation();
  const gamesZoneRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    listPublishedContent().then((rows) => setGames(rows.filter((r) => r.contentType === 'game'))).catch(() => setGames([]));
  }, []);

  useEffect(() => {
    if (location.pathname !== '/games') return;
    const shouldScroll = !location.hash || location.hash === '#games-zone';
    if (!shouldScroll) return;
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const frame = window.requestAnimationFrame(() => {
      gamesZoneRef.current?.scrollIntoView({ behavior: prefersReduced ? 'auto' : 'smooth', block: 'start' });
      gamesZoneRef.current?.focus({ preventScroll: true });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [location.pathname, location.hash]);

  const categories: GameCategory[] = ['Card Games', 'Puzzle Games', 'Classic Games', 'Arcade & Skills', 'Knowledge'];

  const scrollToGamesZone = () => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    gamesZoneRef.current?.scrollIntoView({ behavior: prefersReduced ? 'auto' : 'smooth', block: 'start' });
    gamesZoneRef.current?.focus({ preventScroll: true });
  };

  const selectGame = (key: GameKey) => {
    setActive(key);
    window.requestAnimationFrame(scrollToGamesZone);
  };

  return (
    <section className="space-y-5">
      <header className="game-store rounded-3xl p-6">
        <p className="text-xs uppercase tracking-[0.25em] text-muted">Game Studio</p>
        <h1 className="mt-2 text-3xl font-semibold">Games</h1>
        <p className="mt-2 text-sm text-muted">A curated collection of strategy, puzzle, classic, and learning games designed for thoughtful play.</p>
      </header>

      {games.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {games.map((g) => (
            <article key={g.id} className="game-card rounded-2xl p-4">
              <p className="text-xs text-muted">CMS Pick</p>
              <h3 className="mt-1 text-lg font-semibold">{g.title}</h3>
              <p className="mt-1 text-sm text-muted">{g.excerpt || 'No description yet.'}</p>
            </article>
          ))}
        </div>
      )}

      <div className="space-y-4">
        {categories.map((category) => {
          const entries = Object.entries(gameMeta).filter(([, meta]) => meta.category === category);
          if (!entries.length) return null;
          return (
            <section key={category}>
              <h2 className="mb-2 text-sm font-semibold uppercase tracking-[0.16em] text-muted">{category}</h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {entries.map(([k, meta]) => (
                  <button
                    key={k}
                    onClick={() => selectGame(k as GameKey)}
                    className={`game-card rounded-2xl bg-gradient-to-br ${meta.color} p-5 text-left transition duration-200 hover:-translate-y-0.5 ${active === k ? 'ring-2 ring-cyan-300/60' : ''}`}
                    aria-pressed={active === k}
                  >
                    <p className="text-xl">{meta.icon}</p>
                    <h3 className="text-lg font-semibold">{meta.title}</h3>
                    <p className="mt-1 text-sm text-muted">{meta.desc}</p>
                  </button>
                ))}
              </div>
            </section>
          );
        })}
      </div>

      <div className="glass rounded-2xl p-4">
        <p className="text-sm text-muted">Looking for the strategic cybersecurity landscape?</p>
        <Link to="/Security_Mindmap" className="mt-2 inline-block rounded-xl bg-white/15 px-4 py-2 text-sm hover:bg-white/25">Explore Security Map</Link>
      </div>

      <section id="games-zone" ref={gamesZoneRef} tabIndex={-1} className="game-panel rounded-2xl p-4" aria-label="Interactive games zone">
        {active === 'snake' && <SnakeGame />}
        {active === 'battleship' && <BattleshipGame />}
        {active === 'tictactoe' && <TicTacToeGame />}
        {active === 'reaction' && <ReactionGame />}
        {active === 'card-shedding' && <CardSheddingGame />}
        {active === 'puzzle-2048' && <Puzzle2048Game />}
        {active === 'sudoku' && <SudokuMiniGame />}
        {active === 'memory' && <MemoryPuzzleGame />}
        {active === 'rps' && <RPSGame />}
        {active === 'math' && <QuickMathGame />}
        {active === 'geo' && <CountryLocatorGame />}
        {active === 'cyber-awareness' && <CyberAwarenessQuiz />}
        {active === 'general-knowledge' && <GeneralKnowledgeQuiz />}
      </section>
    </section>
  );
}
function SnakeGame() {
  const size = 12;
  const [snake, setSnake] = useState<number[]>([40, 39, 38]);
  const [dir, setDir] = useState(1);
  const [food, setFood] = useState(80);
  const [running, setRunning] = useState(false);
  const score = snake.length - 3;
  const [best, setBest] = useState(() => readBest('game-best-snake'));

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp' && dir !== size) setDir(-size);
      if (e.key === 'ArrowDown' && dir !== -size) setDir(size);
      if (e.key === 'ArrowLeft' && dir !== 1) setDir(-1);
      if (e.key === 'ArrowRight' && dir !== -1) setDir(1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [dir]);

  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => {
      setSnake((prev) => {
        const head = prev[0];
        const next = head + dir;
        const hitWall = next < 0 || next >= size * size || (dir === 1 && head % size === size - 1) || (dir === -1 && head % size === 0);
        const hitSelf = prev.includes(next);
        if (hitWall || hitSelf) {
          setRunning(false);
          return [40, 39, 38];
        }
        const grown = next === food;
        const updated = [next, ...prev.slice(0, grown ? prev.length : prev.length - 1)];
        if (grown) {
          let f = Math.floor(Math.random() * size * size);
          while (updated.includes(f)) f = Math.floor(Math.random() * size * size);
          setFood(f);
        }
        return updated;
      });
    }, 170);
    return () => clearInterval(t);
  }, [running, dir, food]);

  useEffect(() => {
    if (score > best) {
      setBest(score);
      saveBest('game-best-snake', score);
    }
  }, [score, best]);

  return (
    <div>
      <div className="mb-3 flex items-center justify-between text-sm text-muted"><p>Score: {score} · Best: {best}</p><button onClick={() => setRunning((v) => !v)} className="rounded-lg bg-white/10 px-3 py-1 text-xs">{running ? 'Pause' : 'Start'}</button></div>
      <div className="grid grid-cols-12 gap-1">{Array.from({ length: size * size }).map((_, i) => <div key={i} className={`h-4 rounded ${snake.includes(i) ? 'bg-emerald-300' : food === i ? 'bg-pink-300' : 'bg-white/8'}`} />)}</div>
    </div>
  );
}

function BattleshipGame() {
  const size = 6;
  const [ships] = useState(() => new Set([3, 9, 18, 29, 31]));
  const [hits, setHits] = useState<Set<number>>(new Set());
  const [misses, setMisses] = useState<Set<number>>(new Set());
  const won = hits.size === ships.size;
  const shoot = (i: number) => {
    if (won || hits.has(i) || misses.has(i)) return;
    if (ships.has(i)) setHits(new Set([...hits, i]));
    else setMisses(new Set([...misses, i]));
  };
  return <div><p className="mb-3 text-sm text-muted">Hit all hidden ships. Hits: {hits.size}/{ships.size}</p><div className="grid grid-cols-6 gap-2">{Array.from({ length: size * size }).map((_, i) => <button key={i} onClick={() => shoot(i)} className={`h-10 rounded ${hits.has(i) ? 'bg-emerald-300' : misses.has(i) ? 'bg-rose-300/70' : 'bg-white/8 hover:bg-white/15'}`} />)}</div>{won && <p className="mt-3 text-sm text-emerald-300">Mission complete.</p>}</div>;
}

function TicTacToeGame() {
  const [cells, setCells] = useState<Array<'X' | 'O' | null>>(Array(9).fill(null));
  const [xTurn, setXTurn] = useState(true);
  const wins = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
  const winner = wins.find(([a,b,c]) => cells[a] && cells[a] === cells[b] && cells[a] === cells[c]);
  const status = winner ? `Winner: ${cells[winner[0]]}` : cells.every(Boolean) ? 'Draw' : `Turn: ${xTurn ? 'X' : 'O'}`;
  return <div><div className="mb-3 flex items-center justify-between text-sm text-muted"><p>{status}</p><button onClick={() => { setCells(Array(9).fill(null)); setXTurn(true); }} className="rounded-lg bg-white/10 px-3 py-1 text-xs">Restart</button></div><div className="grid grid-cols-3 gap-2">{cells.map((cell, i) => <button key={i} className="h-16 rounded bg-white/10 text-xl font-semibold hover:bg-white/15" onClick={() => { if (cell || winner) return; const next = [...cells]; next[i] = xTurn ? 'X' : 'O'; setCells(next); setXTurn(!xTurn); }}>{cell}</button>)}</div></div>;
}

function ReactionGame() {
  const [phase, setPhase] = useState<'idle' | 'wait' | 'go'>('idle');
  const [start, setStart] = useState(0);
  const [result, setResult] = useState<number | null>(null);
  const [best, setBest] = useState(() => readBest('game-best-reaction'));

  useEffect(() => {
    if (phase !== 'wait') return;
    const t = setTimeout(() => { setPhase('go'); setStart(performance.now()); }, 900 + Math.random() * 1800);
    return () => clearTimeout(t);
  }, [phase]);

  const onClick = () => {
    if (phase === 'idle') { setResult(null); setPhase('wait'); return; }
    if (phase === 'wait') { setPhase('idle'); setResult(null); return; }
    const ms = Math.round(performance.now() - start);
    setResult(ms);
    if (!best || ms < best) { setBest(ms); saveBest('game-best-reaction', ms); }
    setPhase('idle');
  };

  return <div><div className="mb-3 flex items-center justify-between text-sm text-muted"><p>{result ? `Last: ${result} ms` : 'Click to begin'}</p><p>Best: {best ? `${best} ms` : '—'}</p></div><button onClick={onClick} className={`w-full rounded-xl px-4 py-10 text-lg font-semibold ${phase === 'go' ? 'bg-emerald-400/50' : phase === 'wait' ? 'bg-amber-300/40' : 'bg-white/10 hover:bg-white/15'}`}>{phase === 'idle' ? 'Start' : phase === 'wait' ? 'Wait…' : 'Click!'}</button><p className="mt-2 text-xs text-muted">Clicking too early resets the round.</p></div>;
}

function RPSGame() {
  const options = ['Rock', 'Paper', 'Scissors'] as const;
  const [msg, setMsg] = useState('Pick your move.');
  const [score, setScore] = useState({ you: 0, cpu: 0 });
  const play = (choice: typeof options[number]) => {
    const cpu = options[Math.floor(Math.random() * options.length)];
    if (cpu === choice) { setMsg(`Draw · both chose ${choice}`); return; }
    const win = (choice === 'Rock' && cpu === 'Scissors') || (choice === 'Paper' && cpu === 'Rock') || (choice === 'Scissors' && cpu === 'Paper');
    if (win) { setScore((s) => ({ ...s, you: s.you + 1 })); setMsg(`You win · ${choice} beats ${cpu}`); }
    else { setScore((s) => ({ ...s, cpu: s.cpu + 1 })); setMsg(`CPU wins · ${cpu} beats ${choice}`); }
  };
  return <div><div className="mb-3 flex items-center justify-between text-sm text-muted"><p>{msg}</p><p>You {score.you} · CPU {score.cpu}</p></div><div className="flex flex-wrap gap-2">{options.map((o) => <button key={o} onClick={() => play(o)} className="rounded-xl bg-white/10 px-4 py-2 hover:bg-white/15">{o}</button>)}</div></div>;
}

function QuickMathGame() {
  const newRound = () => {
    const a = Math.floor(Math.random() * 20) + 1;
    const b = Math.floor(Math.random() * 20) + 1;
    return { a, b, answer: a + b };
  };
  const [round, setRound] = useState(newRound);
  const [value, setValue] = useState('');
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(() => readBest('game-best-math'));
  const [time, setTime] = useState(30);

  useEffect(() => {
    if (time <= 0) return;
    const t = setTimeout(() => setTime((v) => v - 1), 1000);
    return () => clearTimeout(t);
  }, [time]);

  const submit = () => {
    if (time <= 0) return;
    if (Number(value) === round.answer) {
      const next = score + 1;
      setScore(next);
      if (next > best) { setBest(next); saveBest('game-best-math', next); }
    }
    setValue('');
    setRound(newRound());
  };

  const restart = () => { setScore(0); setTime(30); setValue(''); setRound(newRound()); };

  return <div><div className="mb-3 flex items-center justify-between text-sm text-muted"><p>Time: {time}s · Score: {score}</p><p>Best: {best}</p></div><p className="mb-2 text-lg">{round.a} + {round.b} = ?</p><div className="flex flex-wrap gap-2"><input className="rounded-lg bg-white/10 px-3 py-2" value={value} onChange={(e) => setValue(e.target.value.replace(/[^0-9-]/g, ''))} /><button onClick={submit} className="rounded-lg bg-white/10 px-3 py-2 hover:bg-white/15">Submit</button><button onClick={restart} className="rounded-lg bg-white/10 px-3 py-2 hover:bg-white/15">Restart</button></div>{time <= 0 && <p className="mt-2 text-amber-300">Time over — restart to play again.</p>}</div>;
}


function CountryLocatorGame() {
  const rounds = [
    { country: 'Spain', answer: 'Europe', options: ['Europe', 'Asia', 'Africa', 'South America'] },
    { country: 'Japan', answer: 'Asia', options: ['North America', 'Asia', 'Africa', 'Europe'] },
    { country: 'Brazil', answer: 'South America', options: ['South America', 'Europe', 'Oceania', 'Asia'] },
    { country: 'Kenya', answer: 'Africa', options: ['Africa', 'Europe', 'North America', 'Asia'] },
    { country: 'Canada', answer: 'North America', options: ['North America', 'Europe', 'Asia', 'Africa'] },
    { country: 'Australia', answer: 'Oceania', options: ['Oceania', 'Europe', 'South America', 'Asia'] },
  ];
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(() => readBest('game-best-geo'));
  const [note, setNote] = useState('Select the region.');
  const current = rounds[index % rounds.length];

  const choose = (option: string) => {
    const ok = option === current.answer;
    const nextScore = ok ? score + 1 : score;
    setScore(nextScore);
    if (nextScore > best) {
      setBest(nextScore);
      saveBest('game-best-geo', nextScore);
    }
    setNote(ok ? `Correct: ${current.country} is in ${current.answer}.` : `Not quite. ${current.country} is in ${current.answer}.`);
    setIndex((v) => v + 1);
  };

  return <div><div className="mb-3 flex items-center justify-between text-sm text-muted"><p>{note}</p><p>Score: {score} · Best: {best}</p></div><p className="mb-3 text-lg">Where is <span className="font-semibold">{current.country}</span>?</p><div className="grid gap-2 sm:grid-cols-2">{current.options.map((o) => <button key={o} className="rounded-xl bg-white/10 px-4 py-2 text-left hover:bg-white/15" onClick={() => choose(o)}>{o}</button>)}</div><button className="mt-3 rounded-lg bg-white/10 px-3 py-1 text-xs hover:bg-white/15" onClick={() => { setIndex(0); setScore(0); setNote('Select the region.'); }}>Restart</button></div>;
}
