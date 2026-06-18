"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pencil, ArrowDown, ArrowUp, RotateCcw } from "lucide-react";
import type { VerseContent } from "@/lib/types/content";
import type { VersePersonalValue } from "@/lib/overrides/cascade";
import { GradientPanel } from "@/components/shared/gradient-panel";
import { Numpad } from "@/components/search/numpad";
import {
  setWordOverrideAction,
  removeWordOverrideAction,
  setVerseOverrideAction,
  removeVerseOverrideAction,
} from "@/app/overrides/actions";

type EditingTarget = { type: "word"; index: number } | { type: "verse" };

export function VerseDetailClient({
  verse,
  versePersonalValue,
}: {
  verse: VerseContent;
  versePersonalValue: VersePersonalValue;
}) {
  const router = useRouter();
  const [editingTarget, setEditingTarget] = useState<EditingTarget | null>(null);
  const [draft, setDraft] = useState("");
  const [isPending, startTransition] = useTransition();
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editingTarget) {
      editorRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [editingTarget]);

  const delta = versePersonalValue.total - verse.totalValue;
  const hasAnyWordOverride = versePersonalValue.words.some((w) => w.hasOverride);

  function startEditingWord(index: number) {
    setEditingTarget({ type: "word", index });
    setDraft("");
  }

  function startEditingVerse() {
    setEditingTarget({ type: "verse" });
    setDraft("");
  }

  function confirmEdit() {
    if (!editingTarget) return;
    const manualValue = Number(draft || "0");
    startTransition(async () => {
      if (editingTarget.type === "word") {
        await setWordOverrideAction(verse.verseKey, editingTarget.index, manualValue);
      } else {
        await setVerseOverrideAction(verse.verseKey, manualValue);
      }
      setEditingTarget(null);
      router.refresh();
    });
  }

  function resetCurrent() {
    if (!editingTarget) return;
    startTransition(async () => {
      if (editingTarget.type === "word") {
        await removeWordOverrideAction(verse.verseKey, editingTarget.index);
      } else {
        await removeVerseOverrideAction(verse.verseKey);
      }
      setEditingTarget(null);
      router.refresh();
    });
  }

  const canResetCurrent =
    editingTarget?.type === "word"
      ? versePersonalValue.words[editingTarget.index].hasOverride
      : editingTarget?.type === "verse"
        ? versePersonalValue.isExplicit
        : false;

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-gold-soft rounded-xl border border-gold/30 px-4 py-4">
        <p
          className="text-2xl text-foreground mb-2"
          style={{ fontFamily: "var(--font-arabic)", direction: "rtl", textAlign: "right", lineHeight: 2 }}
        >
          {verse.textUthmani}
        </p>
        {verse.frenchTranslation ? (
          <p className="text-xs text-muted-foreground font-body italic">{verse.frenchTranslation}</p>
        ) : null}
      </div>

      <GradientPanel className="px-5 py-4">
        <div className="relative flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <p className="text-primary-foreground/70 text-xs font-body">Total du verset</p>
              <button
                type="button"
                onClick={startEditingVerse}
                aria-label="Modifier ta valeur pour ce verset"
                className="w-5 h-5 rounded-full bg-white/15 flex items-center justify-center"
              >
                <Pencil size={9} className="text-primary-foreground" />
              </button>
            </div>
            <div className="flex items-center gap-2">
              <p className="text-4xl font-headings font-bold text-gold">
                {versePersonalValue.total.toLocaleString("fr-FR")}
              </p>
              {versePersonalValue.hasOverride && delta !== 0 ? (
                <span className="bg-white/15 rounded-lg px-2 py-1 flex items-center gap-1 text-xs text-primary-foreground font-body">
                  {delta < 0 ? <ArrowDown size={11} /> : <ArrowUp size={11} />}
                  {delta > 0 ? "+" : ""}
                  {delta}
                </span>
              ) : null}
            </div>
            {versePersonalValue.hasOverride ? (
              <p className="text-primary-foreground/50 text-xs font-body line-through mt-1">
                Calculé : {verse.totalValue.toLocaleString("fr-FR")}
              </p>
            ) : null}
            {versePersonalValue.isExplicit ? (
              <p className="text-primary-foreground/50 text-[10px] font-body mt-0.5">
                Valeur fixée directement, indépendante des mots
              </p>
            ) : null}
          </div>
          <div className="text-right">
            <p className="text-primary-foreground/70 text-xs font-body mb-1">Formule</p>
            <p className="text-sm font-body text-primary-foreground">
              {versePersonalValue.words.map((w, i) => (
                <span key={i} className={w.hasOverride ? "text-gold" : undefined}>
                  {i > 0 ? " + " : ""}
                  {w.value}
                </span>
              ))}
            </p>
            {hasAnyWordOverride ? (
              <p className="text-primary-foreground/40 text-xs font-body line-through mt-1">
                {verse.words.map((w) => w.value).join(" + ")}
              </p>
            ) : null}
          </div>
        </div>
      </GradientPanel>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider font-body">
            Valeur par mot
          </h3>
        </div>
        <div className="divide-y divide-border">
          {verse.words.map((w, i) => {
            const personal = versePersonalValue.words[i];
            return (
              <div
                key={i}
                className={`flex items-center justify-between px-4 py-3.5 ${personal.hasOverride ? "bg-secondary" : ""}`}
              >
                <span
                  className="text-xl text-foreground"
                  style={{ fontFamily: "var(--font-arabic)", direction: "rtl" }}
                >
                  {w.word}
                </span>
                <div className="flex items-center gap-2">
                  {personal.hasOverride ? (
                    <span className="text-xs text-muted-foreground font-body line-through">
                      {w.value}
                    </span>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => startEditingWord(i)}
                    className={`flex items-center gap-1 rounded-full px-3 py-1 text-sm font-semibold font-body ${
                      personal.hasOverride
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary border border-border text-foreground"
                    }`}
                  >
                    {personal.value}
                    <Pencil size={11} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
        <div className="bg-secondary flex items-center justify-between px-4 py-3">
          <span className="text-xs uppercase text-muted-foreground font-body">Total</span>
          <div className="flex items-center gap-2">
            {versePersonalValue.hasOverride ? (
              <span className="text-xs text-muted-foreground font-body line-through">
                {verse.totalValue}
              </span>
            ) : null}
            <span className="text-sm font-bold text-primary font-body">{versePersonalValue.total}</span>
          </div>
        </div>
      </div>

      {editingTarget ? (
        <div ref={editorRef} className="bg-card rounded-xl border-2 border-primary overflow-hidden">
          <div className="bg-secondary border-b border-primary px-4 py-3 flex items-center gap-2">
            <span className="text-xs font-semibold font-body">
              {editingTarget.type === "word"
                ? "Modifier la valeur de"
                : "Modifier ta valeur pour ce verset"}
            </span>
            {editingTarget.type === "word" ? (
              <span
                className="text-xl text-foreground"
                style={{ fontFamily: "var(--font-arabic)", direction: "rtl" }}
              >
                {verse.words[editingTarget.index].word}
              </span>
            ) : null}
          </div>
          <div className="p-4 flex flex-col gap-3">
            <div className="bg-secondary rounded-xl px-4 py-3 flex items-center justify-between">
              <span className="text-xs font-body text-muted-foreground">Valeur saisie</span>
              <span className="text-2xl font-headings font-bold text-primary">{draft || "0"}</span>
            </div>
            <Numpad
              onDigit={(d) => setDraft((prev) => (prev === "0" ? d : prev + d))}
              onDelete={() => setDraft((prev) => prev.slice(0, -1))}
              onReset={() =>
                setDraft(
                  String(
                    editingTarget.type === "word"
                      ? verse.words[editingTarget.index].value
                      : verse.totalValue
                  )
                )
              }
            />
            {canResetCurrent ? (
              <button
                type="button"
                disabled={isPending}
                onClick={resetCurrent}
                className="flex items-center gap-1 text-xs text-primary font-body self-center disabled:opacity-50"
              >
                <RotateCcw size={12} /> Réinitialiser (revenir à la valeur calculée)
              </button>
            ) : null}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setEditingTarget(null)}
                className="flex-1 bg-card border border-border rounded-xl py-2.5 text-sm font-medium text-muted-foreground font-body"
              >
                Annuler
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={confirmEdit}
                className="flex-1 bg-primary text-primary-foreground rounded-xl py-2.5 text-sm font-semibold font-body disabled:opacity-50"
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <p className="text-xs text-muted-foreground font-body leading-relaxed">
        Les voyelles, la shadda et les symboles coraniques ne sont pas calculés. La shadda ne
        double pas la lettre. Ta valeur personnelle ne remplace jamais la valeur calculée par le
        moteur — elle reste visible juste à côté, barrée.
      </p>
    </div>
  );
}
