"use client";

import { Delete, Search, RotateCcw } from "lucide-react";

type NumpadProps = {
  onDigit: (digit: string) => void;
  onDelete: () => void;
  onSubmit?: () => void;
  onReset?: () => void;
  submitLabel?: string;
};

const DIGITS = ["7", "8", "9", "4", "5", "6", "1", "2", "3"];

export function Numpad({ onDigit, onDelete, onSubmit, onReset, submitLabel = "Chercher" }: NumpadProps) {
  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden grid grid-cols-3">
      {DIGITS.map((digit) => (
        <button
          key={digit}
          type="button"
          onClick={() => onDigit(digit)}
          className="py-4 text-lg font-headings font-semibold border-b border-r border-border [&:nth-child(3n)]:border-r-0"
        >
          {digit}
        </button>
      ))}

      <button
        type="button"
        onClick={onReset ?? onDelete}
        className="py-4 flex items-center justify-center border-r border-border"
        aria-label={onReset ? "Réinitialiser" : "Supprimer"}
      >
        {onReset ? <RotateCcw size={15} /> : <Delete size={20} />}
      </button>
      <button
        type="button"
        onClick={() => onDigit("0")}
        className="py-4 text-lg font-headings font-semibold border-r border-border"
      >
        0
      </button>
      {onSubmit ? (
        <button
          type="button"
          onClick={onSubmit}
          className="py-4 flex items-center justify-center gap-1.5 bg-primary text-primary-foreground text-sm font-semibold font-body"
        >
          <Search size={16} /> {submitLabel}
        </button>
      ) : (
        <button
          type="button"
          onClick={onDelete}
          className="py-4 flex items-center justify-center"
          aria-label="Supprimer"
        >
          <Delete size={18} />
        </button>
      )}
    </div>
  );
}
