import { useEffect, useState } from 'react';
import { listPublishedContent } from '@/lib/cms';
import { ContentRecord } from '@/content/types';

type GameKey = 'snake' | 'battleship' | 'chess' | 'samurai' | 'qsm';

const gameMeta: Record<GameKey, { title: string; desc: string; color: string; icon: string }> = {
  snake: { title: 'Snake', desc: 'Precise movement and flow.', color: 'from-emerald-400/40 to-cyan-400/30', icon: '🐍' },
  battleship: { title: 'Battleship', desc: 'Tactical grid precision.', color: 'from-blue-500/35 to-cyan-400/30', icon: '🚢' },
  chess: { title: 'Chess', desc: 'Compact strategic board.', color: 'from-slate-400/40 to-zinc-400/30', icon: '♟️' },
  samurai: { title: 'Samurai Fight', desc: 'Timing and control.', color: 'from-red-500/35 to-amber-400/30', icon: '⚔️' },
  qsm: { title: 'General QSM', desc: 'Quick strategy matrix.', color: 'from-violet-500/35 to-indigo-400/35', icon: '🎯' },
};

export function GamesHub() {
  const [active, setActive] = useState<GameKey>('snake');
  const [games, setGames] = useState<ContentRecord[]>([]);

  useEffect(() => {
    listPublishedContent().then((rows) => setGames(rows.filter((r) => r.contentType === 'game'))).catch(() => setGames([]));
  }, []);

  return (
    <section className="space-y-5">
      <header className="game-store rounded-3xl p-6">
        <p className="text-xs uppercase tracking-[0.25em] text-pink-200/80">🎮 Curated Lounge</p>
        <h1 className="mt-2 text-3xl font-semibold">Games</h1>
        <p className="mt-2 text-sm text-pink-100/85">A focused set of polished, lightweight games.</p>
      </header>

      {games.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {games.map((g) => (
            <article key={g.id} className="game-card rounded-2xl p-4">
              <p className="text-xs text-pink-100/80">CMS Pick</p>
              <h3 className="mt-1 text-lg font-semibold">{g.title}</h3>
              <p className="mt-1 text-sm text-pink-100/85">{g.excerpt || 'No description yet.'}</p>
            </article>
          ))}
        </div>
      )}

      <div className="mb-1 flex flex-wrap gap-2 text-xs text-pink-100/80">
        <span className="rounded-full bg-white/10 px-3 py-1">⭐ Featured</span>
        <span className="rounded-full bg-white/10 px-3 py-1">🕹️ Playable</span>
        <span className="rounded-full bg-white/10 px-3 py-1">🔥 Refined</span>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {Object.entries(gameMeta).map(([k, meta]) => (
          <button key={k} onClick={() => setActive(k as GameKey)} className={`game-card rounded-2xl bg-gradient-to-br ${meta.color} p-5 text-left transition duration-200 hover:-translate-y-1 hover:shadow-2xl ${active === k ? 'ring-2 ring-pink-200/70' : ''}`}>
            <p className="text-xl">{meta.icon}</p>
            <h3 className="text-lg font-semibold">{meta.title}</h3>
            <p className="mt-1 text-sm text-pink-100/90">{meta.desc}</p>
          </button>
        ))}
      </div>

      <div className="game-panel rounded-2xl p-4">
        {active === 'snake' && <SnakeGame />}
        {active === 'battleship' && <BattleshipGame />}
        {active === 'chess' && <MiniChessGame />}
        {active === 'samurai' && <SamuraiFightGame />}
        {active === 'qsm' && <GeneralQSMGame />}
      </div>
    </section>
  );
}

function SnakeGame() {
  const size = 12;
  const [snake, setSnake] = useState<number[]>([40, 39, 38]);
  const [dir, setDir] = useState(1);
  const [food, setFood] = useState(80);
  const [running, setRunning] = useState(false);
  useEffect(() => { const onKey = (e: KeyboardEvent) => { if (e.key === 'ArrowUp' && dir !== size) setDir(-size); if (e.key === 'ArrowDown' && dir !== -size) setDir(size); if (e.key === 'ArrowLeft' && dir !== 1) setDir(-1); if (e.key === 'ArrowRight' && dir !== -1) setDir(1); }; window.addEventListener('keydown', onKey); return () => window.removeEventListener('keydown', onKey); }, [dir]);
  useEffect(() => { if (!running) return; const t = setInterval(() => { setSnake((prev) => { const head = prev[0]; const next = head + dir; const hitWall = next < 0 || next >= size * size || (dir === 1 && head % size === size - 1) || (dir === -1 && head % size === 0); const hitSelf = prev.includes(next); if (hitWall || hitSelf) { setRunning(false); return [40, 39, 38]; } const grown = next === food; const updated = [next, ...prev.slice(0, grown ? prev.length : prev.length - 1)]; if (grown) { let f = Math.floor(Math.random() * size * size); while (updated.includes(f)) f = Math.floor(Math.random() * size * size); setFood(f); } return updated; }); }, 170); return () => clearInterval(t); }, [running, dir, food]);
  return <div><div className="mb-3 flex items-center justify-between"><p className="text-sm text-muted">Score: {snake.length - 3}</p><button onClick={() => setRunning((v) => !v)} className="rounded-lg bg-white/10 px-3 py-1 text-xs">{running ? 'Pause' : 'Start'}</button></div><div className="grid grid-cols-12 gap-1">{Array.from({ length: size * size }).map((_, i) => <div key={i} className={`h-4 rounded ${snake.includes(i) ? 'bg-emerald-300' : food === i ? 'bg-pink-300' : 'bg-white/8'}`} />)}</div></div>;
}

function BattleshipGame() {
  const size = 6;
  const [ships, setShips] = useState<number[]>([]);
  const [hits, setHits] = useState<number[]>([]);
  const [misses, setMisses] = useState<number[]>([]);
  useEffect(() => { reset(); }, []);
  const reset = () => {
    const picks = new Set<number>();
    while (picks.size < 6) picks.add(Math.floor(Math.random() * size * size));
    setShips([...picks]); setHits([]); setMisses([]);
  };
  const fire = (i: number) => {
    if (hits.includes(i) || misses.includes(i)) return;
    if (ships.includes(i)) setHits((h) => [...h, i]);
    else setMisses((m) => [...m, i]);
  };
  return <div><div className="mb-3 flex items-center justify-between"><p className="text-sm text-muted">Hits: {hits.length}/6</p><button onClick={reset} className="rounded-lg bg-white/10 px-3 py-1 text-xs">Reset</button></div><div className="grid grid-cols-6 gap-1">{Array.from({ length: size * size }).map((_, i) => <button key={i} onClick={() => fire(i)} className={`h-9 rounded ${hits.includes(i) ? 'bg-emerald-300' : misses.includes(i) ? 'bg-slate-500/50' : 'bg-white/10 hover:bg-white/15'}`}>{hits.includes(i) ? '💥' : ''}</button>)}</div></div>;
}

function MiniChessGame() {
  const [turn, setTurn] = useState<'white' | 'black'>('white');
  const [selected, setSelected] = useState<number | null>(null);
  const [pieces, setPieces] = useState<Record<number, string>>({ 56: '♖', 57: '♘', 58: '♗', 59: '♕', 60: '♔', 1: '♞', 4: '♚', 7: '♜' });
  const move = (i: number) => {
    if (selected === null) { if (pieces[i]) setSelected(i); return; }
    if (selected === i) return setSelected(null);
    setPieces((prev) => { const next = { ...prev }; if (selected !== null) { next[i] = next[selected]; delete next[selected]; } return next; });
    setSelected(null); setTurn((t) => (t === 'white' ? 'black' : 'white'));
  };
  return <div><p className="mb-3 text-sm text-muted">Board vision practice · Turn: {turn}</p><div className="grid grid-cols-8 gap-1">{Array.from({ length: 64 }).map((_, i) => <button key={i} onClick={() => move(i)} className={`h-10 rounded text-lg ${(Math.floor(i / 8) + i) % 2 ? 'bg-zinc-700/50' : 'bg-zinc-200/15'} ${selected === i ? 'ring-2 ring-cyan-300' : ''}`}>{pieces[i] || ''}</button>)}</div></div>;
}

function SamuraiFightGame() {
  const [focus, setFocus] = useState(100);
  const [enemy, setEnemy] = useState(100);
  const [msg, setMsg] = useState('Ready');
  const strike = () => {
    if (enemy <= 0) return;
    const dmg = 8 + Math.floor(Math.random() * 18);
    const counter = 4 + Math.floor(Math.random() * 10);
    setEnemy((v) => Math.max(0, v - dmg));
    setFocus((v) => Math.max(0, v - counter));
    setMsg(`Strike ${dmg}, counter ${counter}`);
  };
  const meditate = () => setFocus((v) => Math.min(100, v + 14));
  const reset = () => { setFocus(100); setEnemy(100); setMsg('Ready'); };
  return <div className="space-y-3"><p className="text-sm text-muted">Focus {focus} · Opponent {enemy}</p><div className="flex gap-2"><button onClick={strike} className="rounded-lg bg-rose-400/25 px-3 py-1 text-xs">Strike</button><button onClick={meditate} className="rounded-lg bg-cyan-400/25 px-3 py-1 text-xs">Meditate</button><button onClick={reset} className="rounded-lg bg-white/10 px-3 py-1 text-xs">Reset</button></div><p className="text-xs text-muted">{msg}</p></div>;
}

function GeneralQSMGame() {
  const prompts = [
    { q: 'High urgency + high impact?', a: 'Do now' },
    { q: 'Low urgency + high impact?', a: 'Schedule' },
    { q: 'High urgency + low impact?', a: 'Delegate' },
    { q: 'Low urgency + low impact?', a: 'Drop' },
  ];
  const [i, setI] = useState(0);
  return <div className="space-y-3"><p className="text-sm text-muted">{prompts[i].q}</p><p className="rounded-xl bg-white/10 p-3 text-sm">{prompts[i].a}</p><button onClick={() => setI((v) => (v + 1) % prompts.length)} className="rounded-lg bg-white/10 px-3 py-1 text-xs">Next scenario</button></div>;
}
