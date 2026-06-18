import Link from "next/link";
import {
  Pencil,
  ChevronRight,
  NotebookPen,
  BookOpen,
  BarChart2,
  Bookmark,
  Settings,
  Shield,
  HelpCircle,
  LogOut,
} from "lucide-react";
import { BottomNav } from "@/components/layout/bottom-nav";
import { GradientPanel, DecorativeCircle } from "@/components/shared/gradient-panel";
import { SectionCard } from "@/components/settings/section-card";
import { VerseKeyPill } from "@/components/shared/pills";
import { getSurahs } from "@/lib/supabase/queries";
import { getUserNotes } from "@/lib/supabase/notes";
import { getUserOverrideCount } from "@/lib/supabase/overrides";
import { getSavedSearches } from "@/lib/supabase/saved-searches";
import { logout } from "@/app/actions/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const ACCOUNT_ITEMS = [
  { icon: Settings, label: "Paramètres", href: "/settings" },
  { icon: Shield, label: "Confidentialité", href: "#" },
  { icon: HelpCircle, label: "Aide & support", href: "#" },
];

export default async function ProfilePage() {
  const supabase = await createSupabaseServerClient();
  const [{ data: { user } }, surahs, notes, overridesCount, savedSearches] = await Promise.all([
    supabase.auth.getUser(),
    getSurahs(),
    getUserNotes(),
    getUserOverrideCount(),
    getSavedSearches(),
  ]);
  const fullName = (user?.user_metadata?.full_name as string | undefined) ?? "Utilisateur";
  const email = user?.email ?? "";
  const recentNotes = notes.slice(0, 2);
  const surahsFollowedCount = new Set(notes.map((n) => n.surahNumber).filter(Boolean)).size;

  const CONTENT_ITEMS = [
    { icon: BookOpen, label: "Mes sourates annotées", count: surahsFollowedCount },
    { icon: NotebookPen, label: "Toutes mes notes", count: notes.length },
    { icon: BarChart2, label: "Mes valeurs personnalisées", count: overridesCount },
    { icon: Bookmark, label: "Recherches sauvegardées", count: savedSearches.length },
  ];

  return (
    <div className="bg-background flex flex-col min-h-screen">
      <GradientPanel variant="banner" className="px-5 pt-12 pb-6">
        <DecorativeCircle size={64} className="-right-4 -top-4" />
        <DecorativeCircle size={40} className="-left-4 bottom-0" />
        <div className="relative flex flex-col items-center text-center">
          <div className="relative w-20 h-20 rounded-2xl bg-white/20 border-2 border-gold/60 flex items-center justify-center mb-3">
            <span className="text-3xl font-headings font-bold text-primary-foreground">ا</span>
            <button
              type="button"
              className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-primary border-2 border-white flex items-center justify-center"
              aria-label="Modifier l'avatar"
            >
              <Pencil size={10} className="text-primary-foreground" />
            </button>
          </div>
          <h1 className="text-xl font-headings font-bold text-primary-foreground">{fullName}</h1>
          <p className="text-xs text-primary-foreground/70">{email}</p>

          <div className="flex items-center gap-6 mt-4">
            <Stat value={String(surahsFollowedCount)} label="Sourates" />
            <Stat value={String(notes.length)} label="Notes" />
            <Stat value={String(overridesCount)} label="Valeurs" />
          </div>
        </div>
      </GradientPanel>

      <div className="flex-1 px-4 pt-5 pb-4 flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider font-body">
              Notes récentes
            </h3>
            <Link href="/notes" className="flex items-center gap-0.5 text-xs text-primary font-body">
              Voir tout <ChevronRight size={12} />
            </Link>
          </div>
          <div className="flex flex-col gap-2">
            {recentNotes.map((note) => (
              <div
                key={note.id}
                className="bg-card rounded-xl border border-border px-4 py-3 flex items-start gap-3"
              >
                <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                  <NotebookPen size={14} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {note.verseKey ? <VerseKeyPill>{note.verseKey}</VerseKeyPill> : null}
                    <span className="text-xs text-muted-foreground font-body">
                      {note.surahNumber
                        ? surahs.find((s) => s.number === note.surahNumber)?.nameLatin ?? "Général"
                        : "Général"}
                    </span>
                  </div>
                  <p className="text-xs text-foreground font-body line-clamp-2">{note.content}</p>
                </div>
                <ChevronRight size={16} className="text-muted-foreground flex-shrink-0" />
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider font-body px-1">
            Mon contenu
          </h3>
          <SectionCard>
            {CONTENT_ITEMS.map((item) => (
              <div key={item.label} className="flex items-center gap-3 px-4 py-3.5">
                <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                  <item.icon size={15} />
                </div>
                <span className="flex-1 text-sm text-foreground font-body">{item.label}</span>
                <span className="text-xs font-semibold bg-secondary text-secondary-foreground rounded-full px-2 py-0.5 font-body">
                  {item.count}
                </span>
                <ChevronRight size={16} className="text-muted-foreground" />
              </div>
            ))}
          </SectionCard>
        </div>

        <div className="flex flex-col gap-2">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider font-body px-1">
            Compte
          </h3>
          <SectionCard>
            {ACCOUNT_ITEMS.map((item) => (
              <Link key={item.label} href={item.href} className="flex items-center gap-3 px-4 py-3.5">
                <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                  <item.icon size={15} />
                </div>
                <span className="flex-1 text-sm text-foreground font-body">{item.label}</span>
                <ChevronRight size={16} className="text-muted-foreground" />
              </Link>
            ))}
            <form action={logout}>
              <button type="submit" className="w-full flex items-center gap-3 px-4 py-3.5">
                <div className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center flex-shrink-0">
                  <LogOut size={15} className="text-destructive" />
                </div>
                <span className="flex-1 text-sm text-destructive font-body text-left">
                  Se déconnecter
                </span>
              </button>
            </form>
          </SectionCard>
        </div>

        <p className="text-center text-xs text-muted-foreground font-body">Darul Arqam · v1.0.0</p>
      </div>

      <BottomNav />
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <p className="text-2xl font-headings font-bold text-gold">{value}</p>
      <p className="text-xs text-primary-foreground/70">{label}</p>
    </div>
  );
}
