import Link from "next/link";
import { BackHeader } from "@/components/layout/back-header";
import { BottomNav } from "@/components/layout/bottom-nav";
import { SectionCard } from "@/components/settings/section-card";
import { SettingRow } from "@/components/settings/setting-row";
import { LETTER_VALUES } from "@/lib/gematria/letterValues";
import { logout } from "@/app/actions/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  Pencil,
  Type,
  BookOpen,
  Moon,
  Calculator,
  Info,
  Bell,
  Download,
  Trash2,
  Shield,
  ScrollText,
  LogOut,
} from "lucide-react";

function getInitials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export default async function SettingsPage() {
  const letters = Object.entries(LETTER_VALUES);
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  const fullName = (user?.user_metadata?.full_name as string | undefined) ?? "Utilisateur";
  const email = user?.email ?? "";

  return (
    <div className="bg-background flex flex-col min-h-screen bg-dot-pattern">
      <BackHeader href="/profile" title="Paramètres" />

      <div className="flex-1 px-4 pt-5 pb-4 flex flex-col gap-5">
        <div className="bg-card rounded-xl border border-border px-4 py-4 flex items-center gap-3">
          <div className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center text-lg font-headings font-bold text-primary">
            {getInitials(fullName)}
          </div>
          <div className="flex-1">
            <p className="text-base font-headings font-semibold text-foreground">
              {fullName}
            </p>
            <p className="text-xs text-muted-foreground font-body">{email}</p>
          </div>
          <button
            type="button"
            className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center"
            aria-label="Modifier le profil"
          >
            <Pencil size={14} />
          </button>
        </div>

        <div className="flex flex-col gap-2">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider font-body px-1">
            Lecture
          </h3>
          <SectionCard>
            <SettingRow icon={Type} label="Taille du texte arabe" value="Grande" chevron={false} />
            <SettingRow icon={BookOpen} label="Traduction" value="Français" chevron={false} />
            <SettingRow icon={Moon} label="Mode sombre" value="Désactivé" chevron={false} />
          </SectionCard>
        </div>

        <div className="flex flex-col gap-2">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider font-body px-1">
            Système de calcul
          </h3>
          <SectionCard>
            <SettingRow icon={Calculator} label="Méthode de calcul" value="Guématrie Darul Arqam" chevron={false} />
            <SettingRow icon={Info} label="Table des valeurs" chevron={false} />
          </SectionCard>

          <div className="bg-card rounded-xl border border-border px-4 py-4 flex flex-col gap-3">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider font-body">
              Table des valeurs
            </h4>
            <div className="grid grid-cols-4 gap-y-2 gap-x-2">
              {letters.map(([letter, value]) => (
                <div
                  key={letter}
                  className="bg-secondary rounded-lg px-2 py-1.5 flex items-center justify-between"
                >
                  <span style={{ fontFamily: "var(--font-arabic)" }} className="text-base">
                    {letter}
                  </span>
                  <span className="text-xs font-semibold text-primary font-body">{value}</span>
                </div>
              ))}
            </div>
            <div className="flex items-start gap-2">
              <Info size={12} className="text-muted-foreground mt-0.5 flex-shrink-0" />
              <p className="text-xs text-muted-foreground font-body leading-relaxed">
                Les voyelles, la shadda et les symboles coraniques ne sont pas calculés. La shadda
                ne double pas la lettre. La lettre آ vaut 2 dans ce système, distincte des autres
                formes d&apos;alif qui valent 1.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider font-body px-1">
            Compte
          </h3>
          <SectionCard>
            <SettingRow icon={Bell} label="Notifications" value="Activées" chevron={false} />
            <SettingRow icon={Download} label="Exporter mes notes" chevron={false} />
            <SettingRow icon={Trash2} label="Supprimer mon compte" chevron={false} danger />
          </SectionCard>
        </div>

        <div className="flex flex-col gap-2">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider font-body px-1">
            Application
          </h3>
          <SectionCard>
            <SettingRow icon={Info} label="Version" value="1.0.0" chevron={false} />
            <Link href="/terms">
              <SettingRow icon={ScrollText} label="Conditions d'utilisation" />
            </Link>
            <SettingRow icon={Shield} label="Politique de confidentialité" chevron={false} />
            <form action={logout}>
              <button type="submit" className="w-full text-left">
                <SettingRow icon={LogOut} label="Se déconnecter" chevron={false} danger />
              </button>
            </form>
          </SectionCard>
        </div>

        <p className="text-center text-xs text-muted-foreground font-body">
          Darul Arqam · Lecture &amp; analyse numérique du Coran
        </p>
      </div>

      <BottomNav />
    </div>
  );
}
