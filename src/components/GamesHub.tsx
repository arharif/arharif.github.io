import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  Award,
  BarChart3,
  BookOpen,
  CalendarDays,
  Dice5,
  Flame,
  Gamepad2,
  GraduationCap,
  Heart,
  Home,
  Play,
  Search,
  Star,
  Trophy,
  UserRound,
  X,
  Zap,
} from "lucide-react";
import { listPublishedContent } from "@/lib/cms";
import type { ContentRecord } from "@/content/types";
import { safeStorage } from "@/lib/storage";
import { originals, type OriginalKey } from "./arcade/catalog";
import { legacyCatalog, type GameKey } from "./arcade/legacyCatalog";
import {
  addRound,
  emptyProgress,
  playerProgress,
  utcDay,
  type Progress,
} from "./arcade/progress";
import "./arcade/arcade.css";

const Action = lazy(() => import("./arcade/ActionGame")),
  Memory = lazy(() => import("./arcade/MemoryGame"));
const Maze = lazy(() => import("./arcade/MazeGame")),
  Quiz = lazy(() => import("./arcade/QuizGame")),
  Legacy = lazy(() => import("./arcade/LegacyGame"));
const library = [
  ...originals.map((g) => ({
    ...g,
    original: true,
    category: "Entertainment",
  })),
  ...legacyCatalog.map((g) => ({
    ...g,
    type: g.typeLabel,
    original: false,
    instructions: g.desc,
  })),
];
type Game = (typeof library)[number];
const sections = [
  ["Arcade", Gamepad2],
  ["Games", Flame],
  ["Challenges", CalendarDays],
  ["Achievements", Trophy],
  ["My Stats", BarChart3],
  ["Favorites", Heart],
] as const;
const favKey = (id: string) => "x1-arcade-favorite:" + id;
function PlayRoom({
  game,
  close,
  finish,
}: {
  game: Game;
  close: () => void;
  finish: (id: string, score: number) => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [round, setRound] = useState(0),
    [result, setResult] = useState<number | null>(null);
  const ended = useRef(false);
  const gameHeading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    const node = dialog.current;
    node?.showModal();
    gameHeading.current?.focus();
    return () => node?.close();
  }, []);
  const complete = useCallback(
    (score: number) => {
      if (ended.current) return;
      ended.current = true;
      setResult(score);
      finish(game.key, score);
    },
    [game.key, finish],
  );
  const id = game.key as OriginalKey;
  return (
    <dialog
      className="play-room"
      ref={dialog}
      aria-labelledby="play-title"
      onCancel={(e) => {
        e.preventDefault();
        close();
      }}
    >
      <header>
        <div>
          <small>{game.type}</small>
          <h2 ref={gameHeading} tabIndex={-1} id="play-title">
            {game.title}
          </h2>
        </div>
        <button aria-label="Close game" onClick={close}>
          <X />
        </button>
      </header>
      <p>{game.instructions}</p>
      {game.original && (
        <div className="game-controls">
          {result !== null && (
            <strong role="status">Round complete · Score {result}</strong>
          )}
          <button
            onClick={() => {
              ended.current = false;
              setResult(null);
              setRound((r) => r + 1);
            }}
          >
            {round ? "Restart" : "Start game"}
          </button>
        </div>
      )}
      <Suspense fallback={<p role="status">Loading game…</p>}>
        {!game.original ? (
          <Legacy active={game.key as GameKey} />
        ) : (
          round > 0 &&
          result === null && (
            <div key={round}>
              {id === "haunted-memory" ? (
                <Memory onFinish={complete} />
              ) : id === "neon-maze-escape" ? (
                <Maze onFinish={complete} />
              ) : id === "quiz-chaos" ? (
                <Quiz onFinish={complete} />
              ) : (
                <Action mode={id} onFinish={complete} />
              )}
            </div>
          )
        )}
      </Suspense>
    </dialog>
  );
}
export function GamesHub() {
  const [params, setParams] = useSearchParams();
  const game = library.find((g) => g.key === params.get("game"));
  const [section, setSection] = useState("Arcade"),
    [query, setQuery] = useState(""),
    [category, setCategory] = useState("All");
  const [favorites, setFavorites] = useState(() =>
    library
      .filter((g) => safeStorage.get(favKey(g.key)) === "1")
      .map((g) => g.key as string),
  );
  const [progress, setProgress] = useState<Progress>(emptyProgress),
    [session, setSession] = useState(0),
    [warning, setWarning] = useState("");
  const [cms, setCms] = useState<ContentRecord[]>([]),
    [cmsError, setCmsError] = useState(false);
  function fetchPicks() {
    setCmsError(false);
    listPublishedContent()
      .then((rows) => setCms(rows.filter((r) => r.contentType === "game")))
      .catch(() => setCmsError(true));
  }
  useEffect(() => {
    fetchPicks();
    let live = true;
    function refresh() {
      playerProgress()
        .then((p) => {
          if (live) setProgress(p);
        })
        .catch(() => {
          if (live)
            setWarning("Progress storage is unavailable on this device.");
        });
    }
    refresh();
    window.addEventListener("focus", refresh);
    return () => {
      live = false;
      window.removeEventListener("focus", refresh);
    };
  }, []);
  const finish = useCallback((id: string, score: number) => {
    setSession((n) => n + 1);
    playerProgress({ game: id, score })
      .then(setProgress)
      .catch(() => {
        setProgress((p) => addRound(p, id, score));
        setWarning(
          "This round is available for this visit. Device storage is unavailable.",
        );
      });
  }, []);
  function play(id: string) {
    setParams((next) => {
      next.set("game", id);
      return next;
    });
  }
  function toggle(id: string) {
    if (favorites.includes(id)) {
      safeStorage.remove(favKey(id));
      setFavorites(favorites.filter((k) => k !== id));
    } else {
      safeStorage.set(favKey(id), "1");
      setFavorites([...favorites, id]);
    }
  }
  const dashboard = section === "Arcade" && !query;
  const showGames =
    dashboard || section === "Games" || section === "Favorites" || !!query;
  const visible = library.filter(
    (g) =>
      (!dashboard || g.original) &&
      (section !== "Favorites" || favorites.includes(g.key)) &&
      (category === "All" || category === g.category) &&
      (g.title + " " + g.type + " " + g.desc)
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  const daily = progress.day === utcDay() ? Math.min(progress.daily, 3) : 0;
  const badges = [
    ["First flight", progress.rounds >= 1],
    ["Arcade regular", progress.rounds >= 5],
    ["Explorer", Object.keys(progress.best).length >= 3],
    ["Daily champion", progress.completedDays > 0],
  ] as const;
  return (
    <div className="arcade-layout" id="games-zone">
      <aside className="arcade-sidebar">
        <Link to="/" aria-label="X1 home" className="arcade-logo">
          X1
        </Link>
        <nav aria-label="Arcade navigation">
          {sections.map(([name, Icon]) => (
            <button
              key={name}
              aria-pressed={section === name}
              onClick={() => {
                setSection(name);
                setQuery("");
                setCategory("All");
              }}
            >
              <Icon size={17} />
              {name}
            </button>
          ))}
        </nav>
        <nav aria-label="Other universes">
          <Link to="/">
            <Home />
            Home
          </Link>
          <Link to="/insights-innovation">
            <BookOpen />
            X1 Insights
          </Link>
          <Link to="/x1-academic">
            <GraduationCap />
            X1 Academic
          </Link>
        </nav>
      </aside>
      <div className="arcade-main">
        <header className="arcade-top">
          <span>
            <Gamepad2 /> X1 Arcade
          </span>
          <label>
            <Search size={15} />
            <input
              type="search"
              aria-label="Search games"
              placeholder="Search games..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSection("Games");
              }}
            />
          </label>
          <Link aria-label="Account" to="/admin">
            <UserRound size={18} />
          </Link>
        </header>
        {dashboard && (
          <header className="arcade-hero">
            <img
              className="arcade-mascot"
              src="/art/mascot.webp"
              width="260"
              height="220"
              alt=""
            />
            <h1>X1 Arcade</h1>
            <p>Play • Challenge • Unlock • Have Fun</p>
            <div>
              <button onClick={() => play(originals[0].key)}>
                <Play size={16} fill="currentColor" /> Play Now
              </button>
              <button
                onClick={() =>
                  play(library[Math.floor(Math.random() * library.length)].key)
                }
              >
                <Dice5 size={17} /> Random Game
              </button>
            </div>
          </header>
        )}
        <div className="arcade-content">
          {params.has("game") && !game && (
            <p role="status">
              This game is unavailable. Choose a game from the library.
            </p>
          )}
          {showGames && (
            <section>
              <header className="games-heading">
                <h2>
                  <Gamepad2 />
                  {dashboard
                    ? "Featured Games"
                    : section === "Favorites"
                      ? "Favorites"
                      : "All Games"}
                </h2>
                {dashboard ? (
                  <button onClick={() => setSection("Games")}>
                    All games →
                  </button>
                ) : (
                  <select
                    value={category}
                    aria-label="Game category"
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    {["All", "Security", "Culture", "Entertainment"].map(
                      (c) => (
                        <option key={c}>{c}</option>
                      ),
                    )}
                  </select>
                )}
              </header>
              <div className="arcade-cards">
                {visible.map((g, i) => (
                  <article
                    key={g.key}
                    className={"arcade-card neon-" + (i % 6)}
                  >
                    <button
                      className="favorite-game"
                      aria-label={
                        (favorites.includes(g.key)
                          ? "Unfavorite "
                          : "Favorite ") + g.title
                      }
                      aria-pressed={favorites.includes(g.key)}
                      onClick={() => toggle(g.key)}
                    >
                      <Heart
                        size={16}
                        fill={
                          favorites.includes(g.key) ? "currentColor" : "none"
                        }
                      />
                    </button>
                    {g.original ? (
                      <img
                        src={"/art/" + g.key + ".webp"}
                        alt=""
                        loading="lazy"
                        width={256}
                        height={160}
                      />
                    ) : (
                      <div className="legacy-icon">
                        {legacyCatalog.find((l) => l.key === g.key)?.icon}
                      </div>
                    )}
                    <div>
                      <h3>{g.title}</h3>
                      <p>{g.desc}</p>
                      <small>{g.type}</small>
                      <button
                        aria-label={"Play " + g.title}
                        onClick={() => play(g.key)}
                      >
                        <Play size={13} fill="currentColor" /> Play
                      </button>
                    </div>
                  </article>
                ))}
              </div>
              {!visible.length && (
                <p role="status">
                  {section === "Favorites"
                    ? "Use the heart on a game to save it here."
                    : "No games match this search and category."}
                </p>
              )}
              {section === "Games" &&
                cms
                  .filter((p) =>
                    p.title.toLowerCase().includes(query.toLowerCase()),
                  )
                  .map((p) => (
                    <article className="arcade-widget" key={p.id}>
                      <small>CMS Pick</small>
                      <h3>{p.title}</h3>
                      <p>{p.excerpt}</p>
                    </article>
                  ))}
              {cmsError && section === "Games" && (
                <button onClick={fetchPicks}>Retry loading CMS picks</button>
              )}
            </section>
          )}
          <div className="arcade-widgets">
            {(dashboard || section === "Challenges") && (
              <section className="arcade-widget">
                <h2>
                  <CalendarDays /> Daily Challenge
                </h2>
                <h3>Arcade triple play</h3>
                <p>Finish three X1 Original rounds today.</p>
                <progress max={3} value={daily} />
                <small>{daily} / 3 rounds · Resets at 00:00 UTC</small>
              </section>
            )}
            {(dashboard || section === "Achievements") && (
              <section className="arcade-widget">
                <h2>
                  <Award /> Achievements
                </h2>
                <div className="badge-row">
                  {badges.map(([name, earned]) => (
                    <span
                      key={name}
                      data-earned={earned}
                      title={earned ? "Earned" : "Locked"}
                    >
                      <Star />
                      <small>{name}</small>
                      <small>{earned ? "Earned" : "Locked"}</small>
                    </span>
                  ))}
                </div>
              </section>
            )}
            {(dashboard || section === "My Stats") && (
              <section className="arcade-widget">
                <h2>
                  <BarChart3 /> My Arcade Stats
                </h2>
                <div className="stats-row">
                  <strong>Lv. {1 + Math.floor(progress.xp / 250)}</strong>
                  <dl>
                    <dt>Total XP</dt>
                    <dd>{progress.xp}</dd>
                    <dt>Original rounds</dt>
                    <dd>{progress.rounds}</dd>
                    <dt>Daily challenges</dt>
                    <dd>{progress.completedDays}</dd>
                    <dt>This visit</dt>
                    <dd>{session}</dd>
                  </dl>
                </div>
              </section>
            )}
          </div>
          {section === "My Stats" && (
            <section className="arcade-widget">
              <h2>
                <Zap /> High scores
              </h2>
              <p>
                Each completed Original awards 10 XP plus 1 XP per 10 points, up
                to 110 XP. Every 250 XP earns a level. Scores are saved on this
                device.
              </p>
              {originals.map((g) => (
                <p key={g.key}>
                  {g.title} · {progress.best[g.key] ?? "Unplayed"}
                </p>
              ))}
            </section>
          )}
          {warning && <p role="status">{warning}</p>}
          {section === "Games" && (
            <Link to="/Security_Mindmap">Explore Security Map →</Link>
          )}
        </div>
      </div>
      {game && (
        <PlayRoom
          key={game.key}
          game={game}
          finish={finish}
          close={() =>
            setParams(
              (next) => {
                next.delete("game");
                return next;
              },
              { replace: true },
            )
          }
        />
      )}
    </div>
  );
}
