import { useEffect, useState } from "react";
import { gamesZoneQuizzes } from "@/data/gamesZoneData";
import type { GameQuestion } from "@/types/games";
import { shuffle, type PlayProps } from "./catalog";

export default function QuizGame({ onFinish }: PlayProps) {
  const [topic, setTopic] = useState(gamesZoneQuizzes[0].slug);
  const [seconds, setSeconds] = useState(20),
    [time, setTime] = useState(20);
  const [questions, setQuestions] = useState<GameQuestion[]>([]),
    [index, setIndex] = useState(0);
  const [score, setScore] = useState(0),
    [answer, setAnswer] = useState<string | null>(null);
  useEffect(() => {
    if (!questions.length || answer !== null) return;
    const end = Date.now() + seconds * 1000;
    const id = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((end - Date.now()) / 1000));
      setTime(remaining);
      if (!remaining) setAnswer("");
    }, 100);
    return () => clearInterval(id);
  }, [index, questions, seconds, answer]);
  if (!questions.length)
    return (
      <div className="game-controls">
        <label>
          Topic{" "}
          <select value={topic} onChange={(e) => setTopic(e.target.value)}>
            {gamesZoneQuizzes.map((q) => (
              <option key={q.slug} value={q.slug}>
                {q.title}
              </option>
            ))}
          </select>
        </label>
        <label>
          Difficulty{" "}
          <select value={seconds} onChange={(e) => setSeconds(+e.target.value)}>
            <option value={20}>Easy · 20s</option>
            <option value={12}>Medium · 12s</option>
            <option value={6}>Hard · 6s</option>
          </select>
        </label>
        <button
          onClick={() => {
            setTime(seconds);
            setQuestions(
              shuffle(
                gamesZoneQuizzes.find((q) => q.slug === topic)!.questions,
              ).slice(0, 5),
            );
          }}
        >
          Start quiz
        </button>
      </div>
    );
  const question = questions[index];
  return (
    <div className="chaos-quiz">
      <p className="play-status">
        Question {index + 1}/{questions.length} · {time}s · Score {score}
      </p>
      <h3>{question.prompt}</h3>
      {question.options.map((option, i) => (
        <button
          key={i}
          disabled={answer !== null}
          onClick={() => {
            setAnswer(option);
            if (option === question.correctAnswer) setScore(score + 100 + time);
          }}
        >
          {option}
        </button>
      ))}
      {answer !== null && (
        <div role="status">
          {answer === question.correctAnswer
            ? "Correct."
            : "Answer: " + question.correctAnswer}{" "}
          <button
            onClick={() => {
              if (index + 1 === questions.length) {
                onFinish(score);
                return;
              }
              setIndex(index + 1);
              setTime(seconds);
              setAnswer(null);
            }}
          >
            {index + 1 === questions.length ? "Finish round" : "Next question"}
          </button>
        </div>
      )}
    </div>
  );
}
