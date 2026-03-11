import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { listPublishedContent } from '@/lib/cms';
import { ContentRecord } from '@/content/types';
import { MemoryPuzzleGame } from '@/components/games/MemoryPuzzleGame';
import { safeStorage } from '@/lib/storage';
import { MCQQuizEngine } from '@/components/games/MCQQuizEngine';
import { PacmanGame } from '@/components/games/PacmanGame';
import { RetroCarRacingGame } from '@/components/games/RetroCarRacingGame';
import { gamesZoneQuizzes } from '@/data/gamesZoneData';
import { GamesZoneCategory } from '@/types/games';

type GameKey =
  | 'full-ciso-qsa-pack' | 'security-awareness-qsm' | 'ai-topic-qsm' | 'otaku-general-culture-quiz' | 'fc-barcelona-hardcore-fan-quiz'
  | 'snake' | 'tictactoe' | 'reaction' | 'rps' | 'pacman' | 'retro-car-racing'
  | 'memory';

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
  { key: 'memory', title: 'Memory Puzzle', desc: 'Pattern recall challenge with calm pacing.', color: 'from-cyan-500/35 to-sky-500/25', icon: '🧠', category: 'Entertainment', typeLabel: 'Puzzle', sortOrder: 23 },
  { key: 'rps', title: 'Rock Paper Scissors', desc: 'Classic duel versus computer.', color: 'from-violet-500/35 to-fuchsia-400/25', icon: '🪨', category: 'Entertainment', typeLabel: 'Classic', sortOrder: 24 },
  { key: 'snake', title: 'Snake', desc: 'Precision movement with increasing pressure.', color: 'from-emerald-400/35 to-cyan-400/25', icon: '🐍', category: 'Entertainment', typeLabel: 'Arcade', sortOrder: 25 },
  { key: 'tictactoe', title: 'Tic Tac Toe', desc: 'Fast strategic duels.', color: 'from-slate-400/35 to-indigo-400/25', icon: '✖️', category: 'Entertainment', typeLabel: 'Classic', sortOrder: 27 },
  { key: 'reaction', title: 'Reaction Time', desc: 'Measure and improve your response speed.', color: 'from-amber-400/35 to-orange-400/25', icon: '⚡', category: 'Entertainment', typeLabel: 'Arcade', sortOrder: 28 },
  { key: 'pacman', title: 'Pac-Man Arcade', desc: 'Navigate the maze, collect pellets, and avoid ghosts.', color: 'from-yellow-400/35 to-orange-400/25', icon: '🟡', category: 'Entertainment', typeLabel: 'Arcade', sortOrder: 30 },
  { key: 'retro-car-racing', title: 'Retro Car Racing', desc: 'Nokia-style lane dodging challenge with arcade pacing.', color: 'from-emerald-500/35 to-lime-400/25', icon: '🏎️', category: 'Entertainment', typeLabel: 'Arcade', sortOrder: 31 },
];

const quizEntries: GameEntry[] = gamesZoneQuizzes.map((quiz) => ({
  key: quiz.slug as GameKey,
  title: quiz.title,
  desc: quiz.shortDescription,
  color: quiz.category === 'Security' ? 'from-emerald-500/40 to-teal-500/25' : 'from-indigo-500/35 to-sky-400/25',
  icon: quiz.category === 'Security' ? '🛡️' : '🎌',
  category: quiz.category,
  typeLabel: quiz.type,
  questionCount: quiz.questionCount,
  difficulty: quiz.difficulty,
  sortOrder: quiz.sortOrder,
}));

const catalog: GameEntry[] = [...quizEntries, ...staticGames].sort((a, b) => a.sortOrder - b.sortOrder);

const readBest = (key: string) => {
  const value = safeStorage.get(key);
  const num = Number(value || 0);
  return Number.isFinite(num) ? num : 0;
};

const saveBest = (key: string, value: number) => safeStorage.set(key, String(value));

export function GamesHub() {
  const [active, setActive] = useState<GameKey>('full-ciso-qsa-pack');
  const [games, setGames] = useState<ContentRecord[]>([]);
  const [category, setCategory] = useState<'All' | GamesZoneCategory>('All');
  const [search, setSearch] = useState('');
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

  const filteredCatalog = useMemo(() => {
    return catalog.filter((game) => {
      const categoryMatch = category === 'All' || game.category === category;
      const searchMatch = game.title.toLowerCase().includes(search.toLowerCase());
      return categoryMatch && searchMatch;
    });
  }, [category, search]);

  const selectGame = (key: GameKey) => {
    setActive(key);
    window.requestAnimationFrame(() => gamesZoneRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  };

  const activeQuiz = gamesZoneQuizzes.find((game) => game.slug === active);

  return (
    <section className="space-y-5">
      <header className="game-store rounded-3xl p-6">
        <p className="text-xs uppercase tracking-[0.25em] text-muted">Games Zone</p>
        <h1 className="mt-2 text-3xl font-semibold">Games</h1>
        <p className="mt-2 text-sm text-muted">Explore professional security practice packs and fun culture or entertainment quizzes with polished filtering and discovery.</p>
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

      <div className="flex flex-wrap gap-2">
        {(['All', 'Security', 'Culture', 'Entertainment'] as const).map((chip) => (
          <button key={chip} onClick={() => setCategory(chip)} className={`rounded-full px-4 py-2 text-sm ${category === chip ? 'bg-cyan-500/25 ring-1 ring-cyan-300/60' : 'bg-white/5 hover:bg-white/10'}`}>
            {chip}
          </button>
        ))}
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search games" className="ml-auto rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm" />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filteredCatalog.map((game) => (
          <button key={game.key} onClick={() => selectGame(game.key)} aria-pressed={active === game.key} className={`game-card rounded-2xl bg-gradient-to-br ${game.color} p-5 text-left transition hover:-translate-y-0.5 ${active === game.key ? 'ring-2 ring-cyan-300/60' : ''}`}>
            <div className="flex items-center justify-between">
              <p className="text-xl">{game.icon}</p>
              <span className="rounded-full bg-black/20 px-2 py-1 text-[11px] uppercase tracking-wide">{game.category}</span>
            </div>
            <h3 className="mt-2 text-lg font-semibold">{game.title}</h3>
            <p className="mt-1 text-sm text-muted">{game.desc}</p>
            <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted">
              <span>{game.typeLabel}</span>
              {game.questionCount && <span>{game.questionCount} questions</span>}
              {game.difficulty && <span>{game.difficulty}</span>}
            </div>
            <span className="mt-3 inline-block rounded-lg bg-white/15 px-3 py-1 text-xs">Open Quiz</span>
          </button>
        ))}
      </div>

      <div className="glass rounded-2xl p-4">
        <p className="text-sm text-muted">Looking for the strategic cybersecurity landscape?</p>
        <Link to="/Security_Mindmap" className="mt-2 inline-block rounded-xl bg-white/15 px-4 py-2 text-sm hover:bg-white/25">Explore Security Map</Link>
      </div>

      <section id="games-zone" ref={gamesZoneRef} tabIndex={-1} className="game-panel rounded-2xl p-4" aria-label="Interactive games zone">
        {activeQuiz && <MCQQuizEngine game={activeQuiz} />}
        {active === 'snake' && <SnakeGame />}
        {active === 'tictactoe' && <TicTacToeGame />}
        {active === 'reaction' && <ReactionGame />}
        {active === 'memory' && <MemoryPuzzleGame />}
        {active === 'rps' && <RPSGame />}
        {active === 'pacman' && <PacmanGame />}
        {active === 'retro-car-racing' && <RetroCarRacingGame />}
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
  const [phase, setPhase] = useState<'idle' | 'shake' | 'reveal'>('idle');
  const [playerChoice, setPlayerChoice] = useState<typeof options[number] | null>(null);
  const [cpuChoice, setCpuChoice] = useState<typeof options[number] | null>(null);
  const [result, setResult] = useState('Choose your move to start.');
  const [score, setScore] = useState({ you: 0, cpu: 0 });
  const [pulse, setPulse] = useState<'you' | 'cpu' | null>(null);

  const play = (choice: typeof options[number]) => {
    if (phase === 'shake') return;
    const cpu = options[Math.floor(Math.random() * options.length)];
    setPlayerChoice(choice);
    setCpuChoice(null);
    setResult('Ready…');
    setPhase('shake');

    window.setTimeout(() => {
      setCpuChoice(cpu);
      setPhase('reveal');
      if (cpu === choice) {
        setResult(`Draw · both chose ${choice}`);
        setPulse(null);
        return;
      }
      const win = (choice === 'Rock' && cpu === 'Scissors') || (choice === 'Paper' && cpu === 'Rock') || (choice === 'Scissors' && cpu === 'Paper');
      if (win) {
        setScore((prev) => ({ ...prev, you: prev.you + 1 }));
        setResult(`You win · ${choice} beats ${cpu}`);
        setPulse('you');
      } else {
        setScore((prev) => ({ ...prev, cpu: prev.cpu + 1 }));
        setResult(`CPU wins · ${cpu} beats ${choice}`);
        setPulse('cpu');
      }

      window.setTimeout(() => setPhase('idle'), 380);
      window.setTimeout(() => setPulse(null), 550);
    }, 420);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm">
        <p className={`rounded-lg px-3 py-1 transition ${phase === 'reveal' ? 'bg-white/10' : ''}`}>{result}</p>
        <p className="text-muted">
          You <span className={`inline-block transition ${pulse === 'you' ? 'scale-125 text-cyan-200' : ''}`}>{score.you}</span>
          {' · '}CPU <span className={`inline-block transition ${pulse === 'cpu' ? 'scale-125 text-rose-200' : ''}`}>{score.cpu}</span>
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className={`rounded-xl border border-white/10 bg-white/5 p-4 text-center transition ${phase === 'shake' ? 'animate-pulse' : ''}`}>
          <p className="text-xs uppercase tracking-[0.12em] text-muted">You</p>
          <p className="mt-2 text-xl font-semibold">{playerChoice || '—'}</p>
        </div>
        <div className={`rounded-xl border border-white/10 bg-white/5 p-4 text-center transition ${phase === 'shake' ? 'animate-pulse' : ''}`}>
          <p className="text-xs uppercase tracking-[0.12em] text-muted">CPU</p>
          <p className="mt-2 text-xl font-semibold">{cpuChoice || (phase === 'shake' ? '…' : '—')}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option}
            onClick={() => play(option)}
            disabled={phase === 'shake'}
            className="rounded-xl border border-white/15 bg-white/10 px-4 py-2 transition duration-150 hover:-translate-y-0.5 hover:bg-white/20 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}
