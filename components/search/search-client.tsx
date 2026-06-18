"use client";

import { useEffect, useState, useTransition } from "react";
import { BookOpen, Type, Layers, Bookmark, X } from "lucide-react";
import { Numpad } from "@/components/search/numpad";
import { VerseKeyPill, ValuePill } from "@/components/shared/pills";
import { searchByNumberAction, saveSearchAction, deleteSavedSearchAction } from "@/app/search/actions";
import type { SearchResults } from "@/lib/supabase/queries";
import type { SavedSearch } from "@/lib/supabase/saved-searches";

const SUGGESTIONS = ["786", "1026", "9184", "3425"];

export function SearchClient({
  initialValue,
  initialSavedSearches,
}: {
  initialValue: string;
  initialSavedSearches: SavedSearch[];
}) {
  const [value, setValue] = useState(initialValue);
  const [resultsFor, setResultsFor] = useState<{ value: string; results: SearchResults } | null>(
    null
  );
  const [savedSearches, setSavedSearches] = useState(initialSavedSearches);
  const [isSaving, startSaving] = useTransition();

  useEffect(() => {
    const n = Number(value);
    if (!value || Number.isNaN(n)) return;

    let cancelled = false;
    searchByNumberAction(n).then((r) => {
      if (!cancelled) setResultsFor({ value, results: r });
    });
    return () => {
      cancelled = true;
    };
  }, [value]);

  const results = resultsFor?.value === value ? resultsFor.results : null;

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-card border-2 border-primary rounded-xl px-4 py-4 flex items-center gap-3">
        <span className="text-2xl font-headings font-bold flex-1">
          {value || <span className="text-muted-foreground">0</span>}
        </span>
        {value ? (
          <button
            type="button"
            onClick={() => setValue("")}
            className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center"
            aria-label="Effacer"
          >
            <X size={14} />
          </button>
        ) : null}
      </div>

      <div className="flex gap-2 flex-wrap">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setValue(s)}
            className="bg-card border border-border rounded-lg px-3 py-1.5 text-xs font-semibold font-body"
          >
            {s}
          </button>
        ))}
      </div>

      {savedSearches.length > 0 ? (
        <div className="flex flex-col gap-2">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider font-body">
            Recherches sauvegardées
          </h3>
          <div className="flex gap-2 flex-wrap">
            {savedSearches.map((s) => (
              <span
                key={s.id}
                className="bg-secondary text-secondary-foreground rounded-full pl-3 pr-1.5 py-1 text-xs font-semibold font-body flex items-center gap-1.5"
              >
                <button type="button" onClick={() => setValue(String(s.searchNumber))}>
                  {s.searchNumber}
                </button>
                <button
                  type="button"
                  aria-label="Supprimer cette recherche sauvegardée"
                  onClick={() =>
                    startSaving(async () => {
                      setSavedSearches(await deleteSavedSearchAction(s.id));
                    })
                  }
                  className="w-4 h-4 rounded-full bg-background/60 flex items-center justify-center"
                >
                  <X size={9} />
                </button>
              </span>
            ))}
          </div>
        </div>
      ) : null}

      <Numpad
        onDigit={(d) => setValue((prev) => (prev === "0" ? d : prev + d))}
        onDelete={() => setValue((prev) => prev.slice(0, -1))}
        onSubmit={() => {}}
      />

      {results ? (
        <>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase text-muted-foreground font-body">
              Résultats pour
            </span>
            <span className="text-xs font-semibold bg-secondary text-secondary-foreground rounded-full px-3 py-0.5 font-body">
              {value}
            </span>
          </div>

          <section className="flex flex-col gap-2">
            <h3 className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider font-body">
              <BookOpen size={13} /> Versets ({results.verses.length})
            </h3>
            {results.verses.map((v) => (
              <div key={v.verseKey} className="bg-card border border-border rounded-xl px-4 py-3">
                <div className="flex items-center justify-between mb-1.5">
                  <VerseKeyPill>{v.verseKey}</VerseKeyPill>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground font-body">{v.surahName}</span>
                    <ValuePill>{v.totalValue}</ValuePill>
                  </div>
                </div>
                <p
                  className="text-lg text-foreground"
                  style={{ fontFamily: "var(--font-arabic)", direction: "rtl", lineHeight: 1.9 }}
                >
                  {v.textUthmani}
                </p>
              </div>
            ))}
            {results.verses.length === 0 ? <EmptyState label="Aucun verset pour ce nombre." /> : null}
          </section>

          <section className="flex flex-col gap-2">
            <h3 className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider font-body">
              <Type size={13} /> Mots ({results.words.length})
            </h3>
            {results.words.map((w, i) => (
              <div
                key={i}
                className="bg-card border border-border rounded-xl px-4 py-3 flex items-center justify-between"
              >
                <div>
                  <p className="text-xs text-muted-foreground font-body">
                    {w.surahName} · {w.verseKey}
                  </p>
                  <p
                    className="text-xl text-foreground mt-0.5"
                    style={{ fontFamily: "var(--font-arabic)", direction: "rtl" }}
                  >
                    {w.word}
                  </p>
                </div>
                <span className="text-sm font-bold text-primary font-body">{w.value}</span>
              </div>
            ))}
            {results.words.length === 0 ? <EmptyState label="Aucun mot pour ce nombre." /> : null}
          </section>

          <section className="flex flex-col gap-2">
            <h3 className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider font-body">
              <Layers size={13} /> Sourates ({results.surahs.length})
            </h3>
            {results.surahs.map((s) => {
              const searched = Number(value);
              // Le total par défaut affiché ailleurs est "sans bismillah" ;
              // si ce n'est pas lui qui a matché la recherche, on affiche la
              // valeur réellement trouvée (avec bismillah) avec une mention,
              // pour ne pas montrer un nombre différent de celui recherché.
              const matchedWithBasmala =
                s.totalValueWithBasmala === searched && s.totalValueWithoutBasmala !== searched;
              const displayValue = matchedWithBasmala
                ? s.totalValueWithBasmala
                : s.totalValueWithoutBasmala ?? s.totalValueWithBasmala;

              return (
                <div
                  key={s.number}
                  className="bg-card border border-border rounded-xl px-4 py-3 flex items-center justify-between"
                >
                  <div>
                    <span className="text-sm font-semibold font-body">{s.nameLatin}</span>
                    {matchedWithBasmala ? (
                      <span className="block text-[10px] text-muted-foreground font-body">
                        avec bismillah
                      </span>
                    ) : null}
                  </div>
                  <ValuePill>{displayValue}</ValuePill>
                </div>
              );
            })}
            {results.surahs.length === 0 ? <EmptyState label="Aucune sourate pour ce nombre." /> : null}
          </section>

          <button
            type="button"
            disabled={isSaving}
            onClick={() =>
              startSaving(async () => {
                setSavedSearches(await saveSearchAction(Number(value)));
              })
            }
            className="w-full bg-secondary text-secondary-foreground rounded-xl py-3 flex items-center justify-center gap-2 text-sm font-semibold font-body disabled:opacity-50"
          >
            <Bookmark size={15} /> Sauvegarder cette recherche
          </button>
        </>
      ) : null}
    </div>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="bg-card border border-border rounded-xl px-4 py-5 text-center">
      <p className="text-xs text-muted-foreground font-body">{label}</p>
    </div>
  );
}
