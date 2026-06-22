import { GradientPanel, DecorativeCircle } from "@/components/shared/gradient-panel";

export function WelcomeCard({
  name,
  surahsCount,
  versesCount,
  notesCount,
}: {
  name: string;
  surahsCount: number;
  versesCount: number;
  notesCount: number;
}) {
  return (
    <GradientPanel className="px-5 py-5">
      <DecorativeCircle size={80} className="-right-4 -top-4" />
      <DecorativeCircle size={56} className="-left-4 bottom-0" />
      <div className="relative">
        <p className="text-primary-foreground/80 text-xs font-body mb-1">Bienvenue</p>
        <p className="text-primary-foreground font-headings font-semibold text-lg mb-3">
          {name}
        </p>
        <div className="flex items-center gap-4">
          <div>
            <p className="text-gold font-headings font-bold text-xl">{surahsCount}</p>
            <p className="text-primary-foreground/70 text-xs font-body">Sourates</p>
          </div>
          <div>
            <p className="text-gold font-headings font-bold text-xl">{versesCount}</p>
            <p className="text-primary-foreground/70 text-xs font-body">Versets calculés</p>
          </div>
          <div>
            <p className="text-gold font-headings font-bold text-xl">{notesCount}</p>
            <p className="text-primary-foreground/70 text-xs font-body">Notes</p>
          </div>
        </div>
      </div>
    </GradientPanel>
  );
}
