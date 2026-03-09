import { useEffect, useMemo, useState } from 'react';
import { listPublishedContent } from '@/lib/cms';
import { ContentRecord } from '@/content/types';

type Cell = 'X' | 'O' | null;
type GameKey = 'snake' | 'driver' | 'memory' | 'tic' | 'reaction' | 'quiz';

const quiz = [
  { q: 'Which zone is part of Personal?', a: 'Books', opts: ['GRC', 'Books', 'SOC2'] },
  { q: 'A polished UI should be:', a: 'clean', opts: ['chaotic', 'clean', 'heavy'] },
  { q: 'Security-safe error messages are:', a: 'generic', opts: ['specific', 'generic', 'revealing'] },
];

const gameMeta: Record<GameKey, { title: string; desc: string; color: string }> = {
  snake: { title: 'Neon Snake', desc: 'Collect stars, avoid walls, stay sharp.', color: 'from-emerald-400/40 to-cyan-400/30' },
  driver: { title: 'Tokyo Drift Mini', desc: 'Dodge traffic in a tiny endless lane.', color: 'from-rose-400/40 to-orange-400/30' },
  memory: { title: 'Memory Bloom', desc: 'Match symbols in as few moves as possible.', color: 'from-fuchsia-400/40 to-violet-400/30' },
  tic: { title: 'Tic-Tac-Toe', desc: 'Classic duel, modern glow.', color: 'from-sky-400/35 to-indigo-400/30' },
  reaction: { title: 'Reaction Pulse', desc: 'Tap exactly when the pulse turns green.', color: 'from-lime-400/35 to-emerald-400/30' },
  quiz: { title: 'Micro Quiz', desc: 'Three quick picks. Keep it perfect.', color: 'from-amber-400/35 to-pink-400/30' },
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
        <p className="text-xs uppercase tracking-[0.25em] text-pink-200/80">Arcade District</p>
        <h1 className="mt-2 text-3xl font-semibold">Games Store</h1>
        <p className="mt-2 max-w-2xl text-sm text-pink-100/85">Anime-inspired mini arcade: colorful, fast, and lightweight.</p>
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

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {Object.entries(gameMeta).map(([k, meta]) => (
          <button key={k} onClick={() => setActive(k as GameKey)} className={`game-card rounded-2xl bg-gradient-to-br ${meta.color} p-4 text-left transition hover:-translate-y-1 ${active === k ? 'ring-2 ring-pink-200/70' : ''}`}>
            <h3 className="text-lg font-semibold">{meta.title}</h3>
            <p className="mt-1 text-sm text-pink-100/90">{meta.desc}</p>
          </button>
        ))}
      </div>

      <div className="game-panel rounded-2xl p-4">
        {active === 'snake' && <SnakeGame />}
        {active === 'driver' && <DriverGame />}
        {active === 'memory' && <MemoryGame />}
        {active === 'tic' && <TicTacToe />}
        {active === 'reaction' && <ReactionGame />}
        {active === 'quiz' && <QuizGame />}
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
        if (hitWall || hitSelf) { setRunning(false); return [40, 39, 38]; }
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

  return <div><div className="mb-3 flex items-center justify-between"><p className="text-sm text-muted">Score: {snake.length - 3}</p><button onClick={() => setRunning((v) => !v)} className="rounded-lg bg-white/10 px-3 py-1 text-xs">{running ? 'Pause' : 'Start'}</button></div><div className="grid grid-cols-12 gap-1">{Array.from({ length: size * size }).map((_, i) => <div key={i} className={`h-4 rounded ${snake.includes(i) ? 'bg-emerald-300' : food === i ? 'bg-pink-300' : 'bg-white/8'}`} />)}</div></div>;
}

function DriverGame() {
  const lanes = [0, 1, 2];
  const [player, setPlayer] = useState(1);
  const [cars, setCars] = useState<{ lane: number; row: number; id: number }[]>([]);
  const [run, setRun] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') setPlayer((p) => Math.max(0, p - 1));
      if (e.key === 'ArrowRight') setPlayer((p) => Math.min(2, p + 1));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    if (!run) return;
    const t = setInterval(() => {
      setCars((prev) => {
        const moved = prev.map((c) => ({ ...c, row: c.row + 1 })).filter((c) => c.row < 8);
        if (Math.random() > 0.6) moved.push({ lane: lanes[Math.floor(Math.random() * 3)], row: 0, id: Date.now() + Math.random() });
        if (moved.some((c) => c.row >= 6 && c.lane === player)) {
          setRun(false);
          setScore(0);
          return [];
        }
        setScore((s) => s + 1);
        return moved;
      });
    }, 260);
    return () => clearInterval(t);
  }, [run, player]);

  return <div><div className="mb-3 flex items-center justify-between"><p className="text-sm text-muted">Distance: {score}</p><button onClick={() => setRun((v) => !v)} className="rounded-lg bg-white/10 px-3 py-1 text-xs">{run ? 'Pause' : 'Start'}</button></div><div className="grid grid-cols-3 gap-2">{Array.from({ length: 21 }).map((_, i) => { const row = Math.floor(i / 3); const lane = i % 3; const car = cars.find((c) => c.lane === lane && c.row === row); const me = row === 6 && lane === player; return <div key={i} className={`h-10 rounded ${me ? 'bg-cyan-300' : car ? 'bg-rose-300' : 'bg-white/10'}`} />; })}</div></div>;
}

function MemoryGame() { const symbols=['◆','●','▲','■','★','♥']; const makeDeck=()=>[...symbols,...symbols].sort(()=>Math.random()-0.5); const [deck,setDeck]=useState<string[]>(()=>makeDeck()); const [open,setOpen]=useState<number[]>([]); const [matched,setMatched]=useState<number[]>([]); const [moves,setMoves]=useState(0); const click=(i:number)=>{ if(open.includes(i)||matched.includes(i)||open.length===2)return; const next=[...open,i]; setOpen(next); if(next.length===2){ setMoves((m)=>m+1); const [a,b]=next; if(deck[a]===deck[b]){ setMatched((m)=>[...m,a,b]); setOpen([]);} else setTimeout(()=>setOpen([]),550);} }; const reset=()=>{setDeck(makeDeck());setOpen([]);setMatched([]);setMoves(0);}; return <div><div className="mb-3 flex items-center justify-between"><p className="text-sm text-muted">Moves: {moves}</p><button onClick={reset} className="rounded-lg bg-white/10 px-3 py-1 text-xs">Reset</button></div><div className="grid grid-cols-4 gap-2 sm:grid-cols-6">{deck.map((s,i)=>{const show=open.includes(i)||matched.includes(i);return <button key={i} onClick={()=>click(i)} className={`h-14 rounded-xl text-lg ${show?'bg-white/25':'bg-white/10 hover:bg-white/15'}`}>{show?s:'•'}</button>;})}</div></div>; }

function TicTacToe() { const [cells,setCells]=useState<Cell[]>(Array(9).fill(null)); const [xTurn,setXTurn]=useState(true); const wins=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]]; const winner=useMemo(()=>{for(const [a,b,c] of wins) if(cells[a]&&cells[a]===cells[b]&&cells[a]===cells[c]) return cells[a]; return null;},[cells]); const draw=!winner&&cells.every(Boolean); const play=(i:number)=>{if(cells[i]||winner)return; const n=[...cells]; n[i]=xTurn?'X':'O'; setCells(n); setXTurn(!xTurn);}; const reset=()=>{setCells(Array(9).fill(null));setXTurn(true);}; return <div><div className="mb-3 flex items-center justify-between"><p className="text-sm text-muted">{winner?`Winner: ${winner}`:draw?'Draw':`Turn: ${xTurn?'X':'O'}`}</p><button onClick={reset} className="rounded-lg bg-white/10 px-3 py-1 text-xs">Reset</button></div><div className="grid w-full max-w-xs grid-cols-3 gap-2">{cells.map((v,i)=><button key={i} onClick={()=>play(i)} className="h-20 rounded-xl bg-white/10 text-2xl hover:bg-white/15">{v??''}</button>)}</div></div>; }

function ReactionGame() { const [state,setState]=useState<'idle'|'wait'|'go'|'done'>('idle'); const [start,setStart]=useState(0); const [result,setResult]=useState<number|null>(null); const run=()=>{setState('wait');setResult(null); setTimeout(()=>{setState('go');setStart(performance.now());},1000+Math.random()*1800);}; const tap=()=>{ if(state==='go'){setResult(Math.round(performance.now()-start));setState('done');} else if(state==='wait'){setState('idle');setResult(null);} }; return <div><p className="mb-3 text-sm text-muted">Tap when green.</p><button onClick={state==='idle'||state==='done'?run:tap} className={`h-32 w-full rounded-2xl transition ${state==='go'?'bg-emerald-400/35':state==='wait'?'bg-rose-400/30':'bg-white/10 hover:bg-white/15'}`}>{state==='idle'&&'Start'}{state==='wait'&&'Wait...'}{state==='go'&&'Tap now!'}{state==='done'&&`Reaction: ${result}ms • Try again`}</button></div>; }

function QuizGame() { const [i,setI]=useState(0); const [score,setScore]=useState(0); const [done,setDone]=useState(false); const cur=quiz[i]; const pick=(opt:string)=>{ const next=score+(opt===cur.a?1:0); if(i===quiz.length-1){setScore(next);setDone(true);return;} setScore(next); setI((v)=>v+1); }; const reset=()=>{setI(0);setScore(0);setDone(false);}; if(done) return <div className="space-y-3"><p className="text-lg font-semibold">Score: {score}/{quiz.length}</p><button onClick={reset} className="rounded-lg bg-white/10 px-3 py-1 text-xs">Restart</button></div>; return <div><p className="mb-3 text-sm text-muted">{cur.q}</p><div className="grid gap-2">{cur.opts.map((opt)=><button key={opt} onClick={()=>pick(opt)} className="rounded-xl bg-white/10 p-3 text-left hover:bg-white/15">{opt}</button>)}</div></div>; }
