import React from 'react';
import { diffChars } from 'diff';

interface DiffHighlightProps {
  expected: string;
  actual: string;
}

export default function DiffHighlight({ expected, actual }: DiffHighlightProps) {
  const diff = diffChars(actual, expected);

  return (
    <div className="flex flex-wrap text-lg font-mono bg-slate-100 dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700 mt-2">
      {diff.map((part, index) => {
        if (part.added) {
          return (
            <span key={index} className="text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30 font-bold px-0.5 rounded">
              {part.value}
            </span>
          );
        }
        if (part.removed) {
          return (
            <span key={index} className="text-rose-500 dark:text-rose-400 bg-rose-100 dark:bg-rose-900/30 line-through px-0.5 rounded opacity-70">
              {part.value}
            </span>
          );
        }
        return (
          <span key={index} className="text-slate-700 dark:text-slate-300">
            {part.value}
          </span>
        );
      })}
    </div>
  );
}
