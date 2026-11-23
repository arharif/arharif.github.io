export interface Progress {
  rounds: number;
  xp: number;
  best: Record<string, number>;
  day: string;
  daily: number;
  completedDays: number;
}
export const emptyProgress: Progress = {
  rounds: 0,
  xp: 0,
  best: {},
  day: "",
  daily: 0,
  completedDays: 0,
};
export const utcDay = () => new Date().toISOString().slice(0, 10);
export function addRound(
  previous: Progress,
  game: string,
  score: number,
  day = utcDay(),
): Progress {
  if (!Number.isSafeInteger(score) || score < 0 || score > 1e8)
    throw new Error("Invalid round score");
  const daily = (day === previous.day ? previous.daily : 0) + 1;
  return {
    rounds: previous.rounds + 1,
    xp: previous.xp + 10 + Math.min(100, Math.floor(score / 10)),
    best: {
      ...previous.best,
      [game]: Math.max(previous.best[game] || 0, score),
    },
    day,
    daily,
    completedDays: previous.completedDays + (daily === 3 ? 1 : 0),
  };
}
// Read and update inside one transaction so simultaneous tabs cannot lose a round.
export function playerProgress(round?: {
  game: string;
  score: number;
}): Promise<Progress> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("x1-arcade-v1", 1);
    request.onupgradeneeded = () => request.result.createObjectStore("player");
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const db = request.result;
      const tx = db.transaction("player", round ? "readwrite" : "readonly");
      const store = tx.objectStore("player");
      let value = emptyProgress;
      const read = store.get("local");
      read.onsuccess = () => {
        value = read.result ?? emptyProgress;
        if (round) {
          try {
            value = addRound(value, round.game, round.score);
            store.put(value, "local");
          } catch {
            tx.abort();
          }
        }
      };
      tx.oncomplete = () => {
        db.close();
        resolve(value);
      };
      tx.onabort = () => {
        db.close();
        reject(tx.error || new Error("Storage unavailable"));
      };
    };
  });
}
