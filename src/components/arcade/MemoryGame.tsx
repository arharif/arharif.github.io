import { useEffect, useState } from "react";
import { shuffle, type PlayProps } from "./catalog";

const symbols = ["☽", "✦", "♜", "♞", "♛", "☼", "◆", "♣"];
export default function MemoryGame({ onFinish }: PlayProps) {
  const [pairs, setPairs] = useState(4);
  const [deck, setDeck] = useState<string[]>([]);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<string[]>([]);
  const [moves, setMoves] = useState(0);
  const [start, setStart] = useState(0);
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    if (!start) return;
    const timer = window.setInterval(
      () => setSeconds(Math.floor((Date.now() - start) / 1000)),
      250,
    );
    return () => clearInterval(timer);
  }, [start]);
  useEffect(() => {
    if (flipped.length !== 2) return;
    const timer = window.setTimeout(() => setFlipped([]), 600);
    return () => clearTimeout(timer);
  }, [flipped]);
  function flip(i: number) {
    if (
      flipped.length === 2 ||
      matched.includes(deck[i]) ||
      flipped.includes(i)
    )
      return;
    if (!flipped.length) {
      setFlipped([i]);
      return;
    }
    const turns = moves + 1;
    setMoves(turns);
    if (deck[i] === deck[flipped[0]]) {
      setMatched([...matched, deck[i]]);
      setFlipped([]);
      if (matched.length + 1 === pairs)
        onFinish(
          Math.max(
            10,
            pairs * 150 - turns * 5 - Math.floor((Date.now() - start) / 1000),
          ),
        );
    } else setFlipped([...flipped, i]);
  }
  if (!start)
    return (
      <div className="game-controls">
        <label>
          Difficulty{" "}
          <select value={pairs} onChange={(e) => setPairs(+e.target.value)}>
            <option value={4}>Easy · 4 pairs</option>
            <option value={6}>Medium · 6 pairs</option>
            <option value={8}>Hard · 8 pairs</option>
          </select>
        </label>
        <button
          onClick={() => {
            const half = symbols.slice(0, pairs);
            setDeck(shuffle([...half, ...half]));
            setStart(Date.now());
          }}
        >
          Deal cards
        </button>
      </div>
    );
  return (
    <>
      <p className="play-status">
        Pairs {matched.length}/{pairs} · Moves {moves} · Time {seconds}s
      </p>
      <div className="haunted-board">
        {deck.map((symbol, i) => {
          const revealed = flipped.includes(i) || matched.includes(symbol);
          return (
            <button
              key={i}
              aria-label={
                revealed
                  ? "Card " + (i + 1) + " " + symbol
                  : "Turn card " + (i + 1)
              }
              data-revealed={revealed}
              disabled={matched.includes(symbol)}
              onClick={() => flip(i)}
            >
              {revealed ? symbol : "?"}
            </button>
          );
        })}
      </div>
    </>
  );
}
