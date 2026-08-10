import { useState } from "react";
import { Check, X, RotateCcw } from "lucide-react";
import type { QuizQuestion } from "@/data/courses";
import { Button } from "@/components/ui/button";

export function LessonQuiz({ questions }: { questions: QuizQuestion[] }) {
  const [answers, setAnswers] = useState<(number | null)[]>(() => questions.map(() => null));
  const [submitted, setSubmitted] = useState(false);

  const score = answers.reduce<number>(
    (acc, a, i) => acc + (a === questions[i].answer ? 1 : 0),
    0,
  );
  const allAnswered = answers.every((a) => a !== null);

  const reset = () => {
    setAnswers(questions.map(() => null));
    setSubmitted(false);
  };

  return (
    <div className="mt-4 rounded-lg border border-border bg-muted/20 p-4">
      <div className="mb-3 flex items-center justify-between">
        <h4 className="text-sm font-semibold text-foreground">Quick knowledge check</h4>
        {submitted && (
          <span className="text-xs font-medium text-muted-foreground">
            Score: {score}/{questions.length}
          </span>
        )}
      </div>

      <ol className="space-y-4">
        {questions.map((q, qi) => {
          const chosen = answers[qi];
          return (
            <li key={qi} className="space-y-2">
              <p className="text-sm font-medium text-foreground">
                {qi + 1}. {q.q}
              </p>
              <div className="grid gap-1.5">
                {q.options.map((opt, oi) => {
                  const isChosen = chosen === oi;
                  const isCorrect = q.answer === oi;
                  let cls = "border-border bg-background hover:bg-accent";
                  if (submitted) {
                    if (isCorrect) cls = "border-emerald-500/60 bg-emerald-500/10 text-foreground";
                    else if (isChosen) cls = "border-destructive/60 bg-destructive/10 text-foreground";
                    else cls = "border-border bg-background/60 text-muted-foreground";
                  } else if (isChosen) {
                    cls = "border-primary bg-primary/5 text-foreground";
                  }
                  return (
                    <label
                      key={oi}
                      className={`flex cursor-pointer items-start gap-2 rounded-md border px-3 py-2 text-sm transition-colors ${cls}`}
                    >
                      <input
                        type="radio"
                        name={`q-${qi}`}
                        className="mt-0.5"
                        checked={isChosen}
                        disabled={submitted}
                        onChange={() => {
                          const next = [...answers];
                          next[qi] = oi;
                          setAnswers(next);
                        }}
                      />
                      <span className="flex-1">{opt}</span>
                      {submitted && isCorrect && <Check className="h-4 w-4 text-emerald-600" />}
                      {submitted && isChosen && !isCorrect && (
                        <X className="h-4 w-4 text-destructive" />
                      )}
                    </label>
                  );
                })}
              </div>
              {submitted && q.explain && (
                <p className="text-xs text-muted-foreground">{q.explain}</p>
              )}
            </li>
          );
        })}
      </ol>

      <div className="mt-4 flex items-center gap-2">
        {!submitted ? (
          <Button size="sm" disabled={!allAnswered} onClick={() => setSubmitted(true)}>
            Check answers
          </Button>
        ) : (
          <Button size="sm" variant="outline" onClick={reset}>
            <RotateCcw className="h-4 w-4" /> Try again
          </Button>
        )}
        {!allAnswered && !submitted && (
          <span className="text-xs text-muted-foreground">Answer all questions to check.</span>
        )}
      </div>
    </div>
  );
}
