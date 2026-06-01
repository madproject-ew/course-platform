"use client";

import { useState } from "react";
import { Check, X } from "lucide-react";

type QuizQuestion = {
    question: string;
    type: "single" | "multiple";
    options: string[];
    answer?: number;
    answers?: number[];
};

export function Quiz({ questions }: { questions: QuizQuestion[] }) {
    return (
        <div className="mt-12 border-t pt-8">
            <h2 className="text-xl font-semibold mb-6">Проверьте себя</h2>
            <div className="space-y-8">
                {questions.map((q, i) => (
                    <QuizQuestion key={i} question={q} index={i} />
                ))}
            </div>
        </div>
    );
}

function QuizQuestion({ question, index }: { question: QuizQuestion; index: number }) {
    const [selected, setSelected] = useState<Set<number>>(new Set());
    const [checked, setChecked] = useState(false);

    const isSingle = question.type === "single";
    const correctSet = new Set(
        isSingle ? [question.answer ?? 0] : (question.answers ?? [])
    );

    const isCorrect = checked &&
        selected.size === correctSet.size &&
        [...selected].every((i) => correctSet.has(i));

    const toggle = (optionIndex: number) => {
        if (checked) return;
        if (isSingle) {
            setSelected(new Set([optionIndex]));
        } else {
            const next = new Set(selected);
            if (next.has(optionIndex)) next.delete(optionIndex);
            else next.add(optionIndex);
            setSelected(next);
        }
    };

    const handleCheck = () => {
        if (selected.size === 0) return;
        setChecked(true);
    };

    const handleReset = () => {
        setSelected(new Set());
        setChecked(false);
    };

    return (
        <div className="rounded-lg border p-5">
            <p className="font-medium mb-1">
                <span className="text-muted-foreground mr-2">{index + 1}.</span>
                {question.question}
            </p>
            {!isSingle && (
                <p className="text-xs text-muted-foreground mb-3">Несколько вариантов</p>
            )}
            <div className="space-y-2 mt-3">
                {question.options.map((option, oi) => {
                    const isSelected = selected.has(oi);
                    const isRight = correctSet.has(oi);

                    let cls = "flex items-center gap-3 rounded-md border px-4 py-2.5 text-sm text-left w-full cursor-pointer transition-colors ";
                    if (!checked) {
                        cls += isSelected
                            ? "border-primary bg-primary/10"
                            : "hover:border-muted-foreground/40";
                    } else if (isRight) {
                        cls += "border-green-600 bg-green-600/10 text-green-700 dark:text-green-400";
                    } else if (isSelected && !isRight) {
                        cls += "border-red-500 bg-red-500/10 text-red-600 dark:text-red-400";
                    } else {
                        cls += "opacity-50";
                    }

                    return (
                        <button
                            key={oi}
                            onClick={() => toggle(oi)}
                            className={cls}
                            disabled={checked}
                        >
                            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-xs">
                                {checked && isRight && <Check className="h-3 w-3" />}
                                {checked && isSelected && !isRight && <X className="h-3 w-3" />}
                                {!checked && (isSingle
                                    ? (isSelected ? "●" : "")
                                    : (isSelected ? "✓" : "")
                                )}
                            </span>
                            {option}
                        </button>
                    );
                })}
            </div>
            <div className="mt-4 flex items-center gap-3">
                {!checked ? (
                    <button
                        onClick={handleCheck}
                        disabled={selected.size === 0}
                        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-40"
                    >
                        Проверить
                    </button>
                ) : (
                    <>
                        <span className={`text-sm font-medium ${isCorrect ? "text-green-600 dark:text-green-400" : "text-red-500 dark:text-red-400"}`}>
                            {isCorrect ? "Верно!" : "Неверно"}
                        </span>
                        <button
                            onClick={handleReset}
                            className="rounded-md border px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                        >
                            Ещё раз
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}
