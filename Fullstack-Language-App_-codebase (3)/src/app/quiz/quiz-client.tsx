"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";
import type { Vocab } from "@/components/VocabCard";

type QuestionKind = "hanzi_to_translation" | "translation_to_hanzi";

type Question = {
  kind: QuestionKind;
  prompt: string; // what is shown to the user
  options: string[]; // 4 options
  correctIndex: number; // 0..3
  sourceId: number; // vocab id (for potential future tracking)
};

function shuffle<T>(arr: T[]): T[] {
  const res = [...arr];
  for (let i = res.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [res[i], res[j]] = [res[j], res[i]];
  }
  return res;
}

function pickDistinct<T>(items: T[], count: number, exclude?: (x: T) => boolean): T[] {
  const pool = exclude ? items.filter((x) => !exclude(x)) : [...items];
  const res: T[] = [];
  const used = new Set<number>();
  const max = Math.min(count, pool.length);
  while (res.length < max) {
    const idx = Math.floor(Math.random() * pool.length);
    if (used.has(idx)) continue;
    used.add(idx);
    res.push(pool[idx]);
  }
  return res;
}

export default function QuizClient() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [vocab, setVocab] = useState<Vocab[]>([]);

  const [questions, setQuestions] = useState<Question[]>([]);
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(null);
  const [finished, setFinished] = useState(false);

  // Ensure hooks are called unconditionally in the same order on every render
  const progress = useMemo(
    () => (questions.length ? Math.round((current / questions.length) * 100) : 0),
    [current, questions.length]
  );

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const list = (await api.getVocab()) as Vocab[];
        if (!Array.isArray(list) || list.length === 0) {
          setError("No vocabulary available for quiz.");
          return;
        }
        setVocab(list);
      } catch (e: any) {
        if (e?.status === 401) {
          router.push("/login?redirect=/quiz");
          return;
        }
        setError(e?.message || "Failed to load quiz data");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [router]);

  const buildQuestions = (data: Vocab[]): Question[] => {
    // Ensure we have at least 4 items to form 4-options questions
    if (data.length < 4) {
      // Duplicate pool to still form distractors, as a fallback
      const expanded = [...data, ...data, ...data, ...data];
      data = expanded;
    }

    const chosen = pickDistinct(data, 5);

    const qs: Question[] = chosen.map((item, idx) => {
      // Alternate kinds for variety
      const kind: QuestionKind = idx % 2 === 0 ? "hanzi_to_translation" : "translation_to_hanzi";

      if (kind === "hanzi_to_translation") {
        const correct = item.translation;
        const distractors = pickDistinct(
          data.map((d) => d.translation),
          3,
          (x) => x === correct
        );
        const options = shuffle([correct, ...distractors]);
        const correctIndex = options.indexOf(correct);
        return {
          kind,
          prompt: `What is the meaning of: ${item.hanzi}?`,
          options,
          correctIndex,
          sourceId: item.id,
        };
      } else {
        const correct = item.hanzi;
        const distractors = pickDistinct(
          data.map((d) => d.hanzi),
          3,
          (x) => x === correct
        );
        const options = shuffle([correct, ...distractors]);
        const correctIndex = options.indexOf(correct);
        return {
          kind,
          prompt: `Which Mandarin word matches: ${item.translation}?`,
          options,
          correctIndex,
          sourceId: item.id,
        };
      }
    });

    return qs;
  };

  useEffect(() => {
    if (vocab.length) {
      setQuestions(buildQuestions(vocab));
      setCurrent(0);
      setScore(0);
      setSelected(null);
      setFeedback(null);
      setFinished(false);
    }
  }, [vocab]);

  const handleAnswer = (idx: number) => {
    if (finished || selected !== null) return; // prevent multi-clicks
    setSelected(idx);
    const q = questions[current];
    const correct = idx === q.correctIndex;
    setFeedback(correct ? "correct" : "incorrect");
    if (correct) setScore((s) => s + 20);

    // Move to next after short delay
    setTimeout(() => {
      if (current + 1 >= questions.length) {
        setFinished(true);
      } else {
        setCurrent((c) => c + 1);
        setSelected(null);
        setFeedback(null);
      }
    }, 800);
  };

  const restart = () => {
    // Rebuild fresh questions
    setQuestions(buildQuestions(vocab));
    setCurrent(0);
    setScore(0);
    setSelected(null);
    setFeedback(null);
    setFinished(false);
  };

  if (loading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  if (error) {
    return <div className="text-red-600" role="alert">{error}</div>;
  }

  if (!questions.length) {
    return <div>No quiz questions available.</div>;
  }

  if (finished) {
    return (
      <div className="space-y-4">
        <div className="text-xl font-semibold">Your Score: {score} / 100</div>
        {score === 100 ? (
          <div className="text-green-600 font-medium">Congratulations! You passed with a perfect score! 🎉</div>
        ) : (
          <div className="text-amber-600 font-medium">You did not pass. Try again!</div>
        )}
        <div className="flex gap-2">
          <Button onClick={restart}>Retry Quiz</Button>
          <Button variant="secondary" onClick={() => router.push("/vocabulary")}>Back to Vocabulary</Button>
        </div>
      </div>
    );
  }

  const q = questions[current];
  const currentItem = vocab.find((v) => v.id === q.sourceId);

  return (
    <div className="space-y-6">
      <div className="text-sm text-muted-foreground">Question {current + 1} of {questions.length} • {progress}% completed</div>
      <div className="space-y-3">
        {currentItem && (
          <div className="space-y-2">
            <Link href={`/vocabulary/${currentItem.id}`} aria-label={`Open ${currentItem.hanzi} details`}>
              <h2 className="text-2xl font-semibold hover:underline inline-block">
                {currentItem.hanzi}
              </h2>
            </Link>
            {currentItem.imageUrl && (
              <Link href={`/vocabulary/${currentItem.id}`} aria-label={`Open ${currentItem.hanzi} details`}>
                <img
                  src={currentItem.imageUrl}
                  alt={currentItem.hanzi}
                  className="w-full max-h-56 object-cover rounded-md border"
                  loading="lazy"
                />
              </Link>
            )}
          </div>
        )}
        <div className="text-lg font-medium">{q.prompt}</div>
      </div>
      <div className="grid gap-3">
        {q.options.map((opt, i) => {
          const isSelected = selected === i;
          const isCorrect = feedback && q.correctIndex === i;
          const isIncorrect = isSelected && feedback === "incorrect";
          return (
            <Button
              key={i}
              variant={isCorrect ? "default" : isIncorrect ? "destructive" : "outline"}
              className={"justify-start h-auto py-3 px-4 text-left"}
              disabled={selected !== null}
              onClick={() => handleAnswer(i)}
            >
              {opt}
            </Button>
          );
        })}
      </div>
      {feedback && (
        <div
          className={
            feedback === "correct" ? "text-green-600" : "text-red-600"
          }
        >
          {feedback === "correct" ? "Correct answer." : "Incorrect."}
        </div>
      )}
    </div>
  );
}