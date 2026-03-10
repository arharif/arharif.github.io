import { useMemo, useState } from 'react';

type Card = { color: 'red' | 'blue' | 'green' | 'yellow'; value: number };

const colors: Card['color'][] = ['red', 'blue', 'green', 'yellow'];
const deck = () => colors.flatMap((color) => Array.from({ length: 5 }, (_, i) => ({ color, value: i + 1 })));

const draw = (pile: Card[]) => {
  if (!pile.length) return { card: null as Card | null, next: pile };
  const [card, ...next] = pile;
  return { card, next };
};

const canPlay = (candidate: Card, top: Card) => candidate.color === top.color || candidate.value === top.value;

export function CardSheddingGame() {
  const [drawPile, setDrawPile] = useState<Card[]>(() => deck().sort(() => Math.random() - 0.5));
  const [top, setTop] = useState<Card>({ color: 'red', value: 1 });
  const [hand, setHand] = useState<Card[]>(() => deck().sort(() => Math.random() - 0.5).slice(0, 5));
  const [bot, setBot] = useState<Card[]>(() => deck().sort(() => Math.random() - 0.5).slice(0, 5));

  const status = useMemo(() => {
    if (!hand.length) return 'You won this round.';
    if (!bot.length) return 'Computer won this round.';
    return 'Match color or number to shed cards.';
  }, [hand.length, bot.length]);

  const botTurn = (nextTop: Card, nextDraw: Card[]) => {
    const playable = bot.find((c) => canPlay(c, nextTop));
    if (playable) {
      setBot((prev) => prev.filter((c, i) => i !== prev.findIndex((x) => x.color === playable.color && x.value === playable.value)));
      setTop(playable);
      return;
    }
    const drawResult = draw(nextDraw);
    if (!drawResult.card) return;
    setDrawPile(drawResult.next);
    setBot((prev) => [...prev, drawResult.card as Card]);
  };

  const play = (index: number) => {
    const card = hand[index];
    if (!card || !canPlay(card, top) || !hand.length || !bot.length) return;
    const nextHand = hand.filter((_, i) => i !== index);
    setHand(nextHand);
    setTop(card);
    botTurn(card, drawPile);
  };

  const drawCard = () => {
    if (!hand.length || !bot.length) return;
    const result = draw(drawPile);
    if (!result.card) return;
    setDrawPile(result.next);
    setHand((prev) => [...prev, result.card as Card]);
    botTurn(top, result.next);
  };

  const restart = () => {
    setDrawPile(deck().sort(() => Math.random() - 0.5));
    setTop({ color: 'red', value: 1 });
    setHand(deck().sort(() => Math.random() - 0.5).slice(0, 5));
    setBot(deck().sort(() => Math.random() - 0.5).slice(0, 5));
  };

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted">{status}</p>
      <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-sm">Top card: <strong className="uppercase">{top.color}</strong> {top.value}</div>
      <div className="flex flex-wrap gap-2">
        {hand.map((card, i) => (
          <button key={`${card.color}-${card.value}-${i}`} onClick={() => play(i)} className={`rounded-lg border px-3 py-2 text-xs ${canPlay(card, top) ? 'border-cyan-300/50 bg-cyan-200/20' : 'border-white/15 bg-white/10'}`}>
            {card.color} {card.value}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <button onClick={drawCard} className="rounded-lg bg-white/10 px-3 py-1 text-xs hover:bg-white/20">Draw</button>
        <button onClick={restart} className="rounded-lg bg-white/10 px-3 py-1 text-xs hover:bg-white/20">Restart</button>
        <p className="text-xs text-muted">Your cards: {hand.length} · Computer cards: {bot.length} · Draw pile: {drawPile.length}</p>
      </div>
    </div>
  );
}
