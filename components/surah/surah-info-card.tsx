"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pencil, RotateCcw } from "lucide-react";
import type { SurahSummary } from "@/lib/types/content";
import type { SurahPersonalValue } from "@/lib/overrides/cascade";
import { GradientPanel, DecorativeCircle } from "@/components/shared/gradient-panel";
import { Numpad } from "@/components/search/numpad";
import { setSurahOverrideAction, removeSurahOverrideAction } from "@/app/overrides/actions";

export function SurahInfoCard({
  surah,
  personalValue,
}: {
  surah: SurahSummary;
  personalValue?: SurahPersonalValue;
}) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [isPending, startTransition] = useTransition();
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isEditing) {
      editorRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [isEditing]);

  // Total par défaut = sans bismillah (cohérent avec les versets affichés
  // sous cette carte). Pour Al-Fatiha, la bismillah est le verset 1 donc
  // seul "avec" existe et devient le total affiché.
  const calculatedTotal = surah.totalValueWithoutBasmala ?? surah.totalValueWithBasmala;
  const showWithBasmala =
    surah.totalValueWithoutBasmala !== null && surah.totalValueWithBasmala !== null;
  const displayTotal = personalValue?.hasOverride ? personalValue.total : calculatedTotal;

  function startEditing() {
    setDraft("");
    setIsEditing(true);
  }

  function confirmEdit() {
    const manualValue = Number(draft || "0");
    startTransition(async () => {
      await setSurahOverrideAction(surah.number, manualValue);
      setIsEditing(false);
      router.refresh();
    });
  }

  function resetOverride() {
    startTransition(async () => {
      await removeSurahOverrideAction(surah.number);
      setIsEditing(false);
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <GradientPanel className="px-5 py-4">
        <DecorativeCircle size={96} className="-right-6 -top-6" />
        <div className="relative flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-white/20 rounded-full w-8 h-8 flex items-center justify-center">
                <span className="text-xs font-bold text-primary-foreground font-body">
                  {surah.number}
                </span>
              </div>
              <div>
                <p className="text-primary-foreground font-headings font-semibold text-base">
                  {surah.nameLatin}
                </p>
                <p className="text-primary-foreground/70 text-xs font-body">
                  {surah.nameTranslated}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-primary-foreground/80 font-body">
                {surah.versesCount} versets
              </span>
              <span className="text-xs text-primary-foreground/80 font-body">·</span>
              <span className="text-xs text-primary-foreground/80 font-body">
                {surah.revelationPlace}
              </span>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center justify-end gap-1.5 mb-1">
              <p className="text-xs text-primary-foreground/70 font-body">Total sourate</p>
              <button
                type="button"
                onClick={startEditing}
                aria-label="Modifier ta valeur pour cette sourate"
                className="w-5 h-5 rounded-full bg-white/15 flex items-center justify-center"
              >
                <Pencil size={9} className="text-primary-foreground" />
              </button>
            </div>
            <p className="text-2xl font-headings font-bold text-gold">
              {displayTotal !== null && displayTotal !== undefined
                ? displayTotal.toLocaleString("fr-FR")
                : "—"}
            </p>
            {personalValue?.hasOverride && calculatedTotal !== null ? (
              <p className="text-primary-foreground/50 text-[11px] font-body line-through mt-0.5">
                Calculé : {calculatedTotal.toLocaleString("fr-FR")}
              </p>
            ) : null}
            {showWithBasmala ? (
              <p className="text-[11px] text-primary-foreground/60 font-body mt-0.5">
                {surah.totalValueWithBasmala!.toLocaleString("fr-FR")} avec bismillah
              </p>
            ) : null}
          </div>
        </div>
      </GradientPanel>

      {isEditing ? (
        <div ref={editorRef} className="bg-card rounded-xl border-2 border-primary overflow-hidden">
          <div className="bg-secondary border-b border-primary px-4 py-3">
            <span className="text-xs font-semibold font-body">
              Modifier ta valeur pour cette sourate
            </span>
          </div>
          <div className="p-4 flex flex-col gap-3">
            <div className="bg-secondary rounded-xl px-4 py-3 flex items-center justify-between">
              <span className="text-xs font-body text-muted-foreground">Valeur saisie</span>
              <span className="text-2xl font-headings font-bold text-primary">{draft || "0"}</span>
            </div>
            <Numpad
              onDigit={(d) => setDraft((prev) => (prev === "0" ? d : prev + d))}
              onDelete={() => setDraft((prev) => prev.slice(0, -1))}
              onReset={() => setDraft(String(calculatedTotal ?? 0))}
            />
            {personalValue?.isExplicit ? (
              <button
                type="button"
                disabled={isPending}
                onClick={resetOverride}
                className="flex items-center gap-1 text-xs text-primary font-body self-center disabled:opacity-50"
              >
                <RotateCcw size={12} /> Réinitialiser (revenir à la valeur calculée)
              </button>
            ) : null}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
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
    </div>
  );
}
