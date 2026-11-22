import { lazy, useEffect, useState } from 'react';
import type { GameKey } from './legacyCatalog';

import { safeStorage } from '@/lib/storage';



import { gamesZoneQuizzes } from '@/data/gamesZoneData';
const CardSheddingGame = lazy(()=>import('@/components/games/CardSheddingGame').then(m=>({default:m.CardSheddingGame})));
const Puzzle2048Game = lazy(()=>import('@/components/games/Puzzle2048Game').then(m=>({default:m.Puzzle2048Game})));
const SudokuMiniGame = lazy(()=>import('@/components/games/SudokuMiniGame').then(m=>({default:m.SudokuMiniGame})));
const CyberAwarenessQuiz = lazy(()=>import('@/components/games/CyberAwarenessQuiz').then(m=>({default:m.CyberAwarenessQuiz})));
const GeneralKnowledgeQuiz = lazy(()=>import('@/components/games/GeneralKnowledgeQuiz').then(m=>({default:m.GeneralKnowledgeQuiz})));
const MemoryPuzzleGame=lazy(()=>import('@/components/games/MemoryPuzzleGame').then(m=>({default:m.MemoryPuzzleGame})));
const MCQQuizEngine=lazy(()=>import('@/components/games/MCQQuizEngine').then(m=>({default:m.MCQQuizEngine})));
const PacmanGame=lazy(()=>import('@/components/games/PacmanGame').then(m=>({default:m.PacmanGame})));
const RetroCarRacingGame=lazy(()=>import('@/components/games/RetroCarRacingGame').then(m=>({default:m.RetroCarRacingGame})));
const readBest = (key: string) => {
  const value = safeStorage.get(key);
  const num = Number(value || 0);
  return Number.isFinite(num) ? num : 0;
};

const saveBest = (key: string, value: number) => safeStorage.set(key, String(value));

export default function LegacyGame({active}: {active:GameKey}) {
  const activeQuiz = gamesZoneQuizzes.find(game => game.slug === active);
  return <>
        {active === 'card-shedding' && <CardSheddingGame/>}
        {active === '2048' && <Puzzle2048Game/>}
        {active === 'sudoku-mini' && <SudokuMiniGame/>}
        {active === 'cyber-awareness' && <CyberAwarenessQuiz/>}
        {active === 'general-knowledge' && <GeneralKnowledgeQuiz/>}
        {activeQuiz && <MCQQuizEngine game={activeQuiz} />}
        {active === 'snake' && <SnakeGame />}
        {active === 'tictactoe' && <TicTacToeGame />}
        {active === 'reaction' && <ReactionGame />}
        {active === 'memory' && <MemoryPuzzleGame />}
        {active === 'rps' && <RPSGame />}
        {active === 'pacman' && <PacmanGame />}
        {active === 'retro-car-racing' && <RetroCarRacingGame />}
        {active === 'hangman-x1' && <HangmanX1 />}
        {active === 'mystery-box' && <MysteryBoxGame />}
        {active === 'truth-or-dare-x1' && <TruthOrDareX1 />}
  </>;
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
      <div className="mb-3 flex items-center justify-between text-sm text-muted"><p>Score: {score} · Best: {best}</p><button onClick={() => setRunning((v) => !v)} className="rounded-lg token-btn px-3 py-1 text-xs">{running ? 'Pause' : 'Start'}</button></div>
      <div className="grid grid-cols-12 gap-1">{Array.from({ length: size * size }).map((_, i) => <div key={i} className={`h-4 rounded ${snake.includes(i) ? 'bg-[color:var(--accent)]' : food === i ? 'bg-[color:var(--accent-secondary)]' : 'bg-[color:var(--surface-soft)]'}`} />)}</div>
    </div>
  );
}

function TicTacToeGame() {
  const [cells, setCells] = useState<Array<'X' | 'O' | null>>(Array(9).fill(null));
  const [xTurn, setXTurn] = useState(true);
  const wins = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
  const winnerLine = wins.find(([a,b,c]) => cells[a] && cells[a] === cells[b] && cells[a] === cells[c]);
  const winner = winnerLine ? cells[winnerLine[0]] : null;
  const status = winner ? `Winner: ${winner}` : cells.every(Boolean) ? 'Draw' : `Turn: ${xTurn ? 'X' : 'O'}`;
  const isWinningCell = (idx: number) => Boolean(winnerLine?.includes(idx));

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-sm text-muted">
        <p>{status}</p>
        <button onClick={() => { setCells(Array(9).fill(null)); setXTurn(true); }} className="rounded-lg token-btn px-3 py-1 text-xs">Restart</button>
      </div>
      <div className="relative grid grid-cols-3 gap-2">
        {cells.map((cell, i) => (
          <button
            key={i}
            className={`h-16 rounded text-xl font-semibold transition ${isWinningCell(i) ? 'bg-[color:var(--accent-soft)] ring-2 ring-[color:var(--active-border)]' : 'token-btn hover:token-chip'}`}
            onClick={() => {
              if (cell || winner) return;
              const next = [...cells];
              next[i] = xTurn ? 'X' : 'O';
              setCells(next);
              setXTurn(!xTurn);
            }}
          >
            {cell}
          </button>
        ))}
      </div>
      {winnerLine && <p className="text-xs status-success">Winning pattern highlighted.</p>}
    </div>
  );
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

  return <div><div className="mb-3 flex items-center justify-between text-sm text-muted"><p>{result ? `Last: ${result} ms` : 'Click to begin'}</p><p>Best: {best ? `${best} ms` : 'Not set'}</p></div><button onClick={onClick} className={`w-full rounded-xl px-4 py-10 text-lg font-semibold ${phase === 'go' ? 'bg-emerald-400/50' : phase === 'wait' ? 'bg-amber-300/40' : 'token-btn hover:token-chip'}`}>{phase === 'idle' ? 'Start' : phase === 'wait' ? 'Wait…' : 'Click!'}</button><p className="mt-2 text-xs text-muted">Clicking too early resets the round.</p></div>;
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
        <p className={`rounded-lg px-3 py-1 transition ${phase === 'reveal' ? 'token-btn' : ''}`}>{result}</p>
        <p className="text-muted">
          You <span className={`inline-block transition ${pulse === 'you' ? 'scale-125 status-info' : ''}`}>{score.you}</span>
          {' · '}CPU <span className={`inline-block transition ${pulse === 'cpu' ? 'scale-125 status-error' : ''}`}>{score.cpu}</span>
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className={`rounded-xl border border-[color:var(--border)] token-card p-4 text-center transition ${phase === 'shake' ? 'animate-pulse' : ''}`}>
          <p className="text-xs uppercase tracking-[0.12em] text-muted">You</p>
          <p className="mt-2 text-xl font-semibold">{playerChoice || 'Not selected'}</p>
        </div>
        <div className={`rounded-xl border border-[color:var(--border)] token-card p-4 text-center transition ${phase === 'shake' ? 'animate-pulse' : ''}`}>
          <p className="text-xs uppercase tracking-[0.12em] text-muted">CPU</p>
          <p className="mt-2 text-xl font-semibold">{cpuChoice || (phase === 'shake' ? '…' : 'Not selected')}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option}
            onClick={() => play(option)}
            disabled={phase === 'shake'}
            className="rounded-xl border border-[color:var(--border)] token-btn px-4 py-2 transition duration-150 hover:-translate-y-1 hover:shadow-[0_14px_28px_var(--glow)] hover:bg-[color:var(--card-hover)] active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}


const HANGMAN_WORDS = [
  { word:'ZERO TRUST', category:'Cybersecurity', hint:'Security model: never trust, always verify.' },
  { word:'ISO 27001', category:'Cybersecurity', hint:'Information security management standard.' },
  { word:'QUANTUM', category:'Science', hint:'Computing paradigm using qubits.' },
  { word:'MONONOKE', category:'Anime', hint:'Studio Ghibli classic with forest spirits.' },
  { word:'PLATO', category:'Philosophy', hint:'Ancient Greek philosopher.' },
  { word:'DUNE', category:'Books', hint:'Epic sci-fi saga by Frank Herbert.' },
  { word:'NEURAL NETWORK', category:'Technology', hint:'Core AI architecture.' },
];
function HangmanX1(){const [idx,setIdx]=useState(()=>Math.floor(Math.random()*HANGMAN_WORDS.length));const [used,setUsed]=useState<string[]>([]);const item=HANGMAN_WORDS[idx];const misses=used.filter(c=>!item.word.includes(c)).length;const won=[...new Set(item.word.replace(/[^A-Z0-9]/g,'').split(''))].every(c=>used.includes(c));const lost=misses>=7;const letters='ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'.split('');const guess=(c:string)=>!won&&!lost&&setUsed(u=>u.includes(c)?u:[...u,c]);useEffect(()=>{const on=(e:KeyboardEvent)=>{const k=e.key.toUpperCase();if(letters.includes(k))guess(k)};window.addEventListener('keydown',on);return()=>window.removeEventListener('keydown',on)},[won,lost]);return <div className='space-y-3'><p className='text-sm text-muted'>Category: {item.category} · Misses: {misses}/7</p><p className='text-xs text-muted'>Hint: {item.hint}</p><p className='text-2xl tracking-[0.4em]'>{item.word.split('').map(ch=>/[A-Z0-9]/.test(ch)?(used.includes(ch)?ch:'_'):ch).join(' ')}</p><div className='grid grid-cols-6 gap-2'>{letters.map(l=><button key={l} onClick={()=>guess(l)} disabled={used.includes(l)||won||lost} className='rounded token-btn px-2 py-1 text-xs disabled:opacity-40'>{l}</button>)}</div><div className='flex gap-2'><button onClick={()=>{setIdx(Math.floor(Math.random()*HANGMAN_WORDS.length));setUsed([])}} className='rounded-lg token-btn px-3 py-1 text-xs'>Restart</button>{won&&<p className='status-success text-sm'>Great job!</p>}{lost&&<p className='text-rose-300 text-sm'>Round over. Word: {item.word}</p>}</div></div>}

const MYSTERY_ITEMS=[
'Fun Fact: Honey never spoils when sealed well.', 'Quote: “The future depends on what you do today.” (Gandhi)', 'Mini Challenge: Name 3 things you learned this week.', 'Riddle: What has keys but cannot open locks? (A keyboard)', 'Curiosity: Which innovation changed your daily life most?', 'Motivation: Small progress daily creates big outcomes.'
];
function MysteryBoxGame(){const [open,setOpen]=useState(false);const [item,setItem]=useState('');const reveal=()=>{setOpen(true);setItem(MYSTERY_ITEMS[Math.floor(Math.random()*MYSTERY_ITEMS.length)])};return <div className='space-y-3 text-center'><button onClick={reveal} className={`mx-auto rounded-2xl px-8 py-8 text-4xl transition ${open?'token-card':'token-btn hover:-translate-y-1 hover:shadow-[0_14px_28px_var(--glow)]'}`}>🎁</button><p className='text-sm text-muted'>{open?item:'Open the mystery box for a premium surprise.'}</p><button onClick={()=>{setOpen(false);setItem('')}} className='rounded-lg token-btn px-3 py-1 text-xs'>Open again</button></div>}

const TRUTHS = Array.from({length:30},(_,i)=>['What is one dream you want to achieve?','What book, movie, or anime influenced you most?','What skill do you want to learn next?','What is your favorite memory with friends?','What motivates you on hard days?'][i%5]);
const DARES = Array.from({length:30},(_,i)=>['Do your best robot voice for 10 seconds.','Describe yourself using only three words.','Say one positive thing about someone nearby.','Act like a movie trailer narrator for 15 seconds.','Create a superhero name for yourself.'][i%5]);
function TruthOrDareX1(){const [mode,setMode]=useState<'truth'|'dare'>('truth');const [text,setText]=useState(TRUTHS[0]);const next=(m?:'truth'|'dare'|'random')=>{const md=m==='random'?(Math.random()>0.5?'truth':'dare'):(m||mode);setMode(md);const pool=md==='truth'?TRUTHS:DARES;setText(pool[Math.floor(Math.random()*pool.length)])};return <div className='space-y-3'><div className='flex flex-wrap gap-2'>{['truth','dare','random'].map(b=><button key={b} onClick={()=>next(b as any)} className='rounded-lg token-btn px-3 py-1 text-xs capitalize'>{b}</button>)}<button onClick={()=>next()} className='rounded-lg token-btn px-3 py-1 text-xs'>Next</button></div><div className='rounded-2xl border border-[color:var(--border)] token-card p-4'><p className='text-xs uppercase text-muted'>{mode}</p><p className='mt-2 text-base'>{text}</p></div></div>}
