import { BackHeader } from "@/components/layout/back-header";
import { BottomNav } from "@/components/layout/bottom-nav";
import { SectionCard } from "@/components/settings/section-card";
import { SettingRow } from "@/components/settings/setting-row";
import { LETTER_VALUES } from "@/lib/gematria/letterValues";
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
  LogOut,
} from "lucide-react";

export default function SettingsPage() {
  const letters = Object.entries(LETTER_VALUES);

  return (
    <div className="bg-background flex flex-col min-h-screen bg-dot-pattern">
      <BackHeader href="/profile" title="Paramètres" />

      <div className="flex-1 px-4 pt-5 pb-4 flex flex-col gap-5">
        <div className="bg-card rounded-xl border border-border px-4 py-4 flex items-center gap-3">
          <div className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center text-lg font-headings font-bold text-primary">
            IA
          </div>
          <div className="flex-1">
            <p className="text-base font-headings font-semibold text-foreground">
              Ibrahim Al-Farsi
            </p>
            <p className="text-xs text-muted-foreground font-body">ibrahim@example.com</p>
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
            <SettingRow icon={Type} label="Taille du texte arabe" value="Grande" />
            <SettingRow icon={BookOpen} label="Traduction" value="Français" />
            <SettingRow icon={Moon} label="Mode sombre" value="Désactivé" />
          </SectionCard>
        </div>

        <div className="flex flex-col gap-2">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider font-body px-1">
            Système de calcul
          </h3>
          <SectionCard>
            <SettingRow icon={Calculator} label="Méthode de calcul" value="Guématrie Darul Arqam" />
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
            <SettingRow icon={Bell} label="Notifications" value="Activées" />
            <SettingRow icon={Download} label="Exporter mes notes" />
            <SettingRow icon={Trash2} label="Supprimer mon compte" chevron={false} danger />
          </SectionCard>
        </div>

        <div className="flex flex-col gap-2">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider font-body px-1">
            Application
          </h3>
          <SectionCard>
            <SettingRow icon={Info} label="Version" value="1.0.0" chevron={false} />
            <SettingRow icon={Shield} label="Politique de confidentialité" />
            <SettingRow icon={LogOut} label="Se déconnecter" chevron={false} danger />
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
