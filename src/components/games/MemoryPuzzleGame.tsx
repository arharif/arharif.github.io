import { useMemo, useState } from 'react';

const icons = ['◆', '●', '■', '▲', '✦', '⬢'];

type Card = { id: string; icon: string; open: boolean; solved: boolean };

const makeDeck = () => {
  const deck = [...icons, ...icons]
    .map((icon, i) => ({ id: `${icon}-${i}`, icon, open: false, solved: false }))
    .sort(() => Math.random() - 0.5);
  return deck;
};

export function MemoryPuzzleGame() {
  const [deck, setDeck] = useState<Card[]>(() => makeDeck());
  const [moves, setMoves] = useState(0);

  const openCards = useMemo(() => deck.filter((c) => c.open && !c.solved), [deck]);
  const solvedAll = deck.every((c) => c.solved);

  const flip = (id: string) => {
    setDeck((prev) => {
      const current = prev.find((c) => c.id === id);
      if (!current || current.open || current.solved || openCards.length >= 2) return prev;
      const next = prev.map((c) => (c.id === id ? { ...c, open: true } : c));
      const nowOpen = next.filter((c) => c.open && !c.solved);
      if (nowOpen.length === 2) {
        setMoves((m) => m + 1);
        const [a, b] = nowOpen;
        if (a?.icon && b?.icon && a.icon === b.icon) {
          return next.map((c) => (c.id === a.id || c.id === b.id ? { ...c, solved: true } : c));
        }
        setTimeout(() => {
          setDeck((state) => state.map((c) => (c.id === a?.id || c.id === b?.id ? { ...c, open: false } : c)));
        }, 550);
      }
      return next;
    });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-sm text-muted">
        <p>Moves: {moves}</p>
        <button className="rounded-lg bg-white/10 px-3 py-1 text-xs hover:bg-white/20" onClick={() => { setDeck(makeDeck()); setMoves(0); }}>Restart</button>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {deck.map((card) => (
          <button
            key={card.id}
            onClick={() => flip(card.id)}
            className={`h-14 rounded-lg border text-lg ${card.open || card.solved ? 'border-cyan-300/50 bg-cyan-200/20' : 'border-white/10 bg-white/10 hover:bg-white/20'}`}
            aria-label="Flip memory card"
          >
            {card.open || card.solved ? card.icon : '•'}
          </button>
        ))}
      </div>
      {solvedAll && <p className="text-sm text-emerald-300">Puzzle completed in {moves} moves.</p>}
    </div>
  );
}
