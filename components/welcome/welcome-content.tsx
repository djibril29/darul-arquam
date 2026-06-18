"use client";

import { useRef } from "react";
import Link from "next/link";
import { Hash, Layers, NotebookPen, UserPlus, LogIn } from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { GradientPanel, DecorativeCircle } from "@/components/shared/gradient-panel";
import { BASMALA_TEXT_UTHMANI } from "@/lib/gematria";

const FEATURES = [
  { icon: Hash, text: "Calcul Abjad mot par mot, verset par verset" },
  { icon: Layers, text: "Sourates annotées avec totaux numériques" },
  { icon: NotebookPen, text: "Notes et observations personnelles" },
];

export function WelcomeContent({ basmalaValue }: { basmalaValue: number }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      gsap.from("[data-animate]", {
        opacity: 0,
        y: 16,
        duration: 0.6,
        stagger: 0.08,
        ease: "power2.out",
      });
    },
    { scope: containerRef }
  );

  return (
    <div ref={containerRef} className="bg-background flex flex-col min-h-screen bg-dot-pattern">
      <GradientPanel
        variant="banner"
        className="flex flex-col items-center px-6 pt-16 pb-10 gap-5"
      >
        <DecorativeCircle size={192} className="-right-12 -top-12" />
        <DecorativeCircle size={112} className="-left-8 bottom-8" />
        <DecorativeCircle size={40} className="right-6 bottom-16" />

        <div data-animate className="relative flex flex-col items-center gap-2">
          <div className="w-16 h-16 rounded-2xl bg-white/15 border-[1.5px] border-gold/50 flex items-center justify-center">
            <span
              className="text-3xl text-gold"
              style={{ fontFamily: "var(--font-arabic)", lineHeight: 1 }}
            >
              ب
            </span>
          </div>
          <p className="text-xs tracking-widest uppercase font-body font-semibold text-gold/80">
            Darul Arqam
          </p>
        </div>

        <div data-animate className="relative text-center">
          <p
            className="text-xl text-gold/85"
            style={{ fontFamily: "var(--font-arabic)", direction: "rtl", lineHeight: 2 }}
          >
            {BASMALA_TEXT_UTHMANI}
          </p>
          <p className="text-xs text-primary-foreground/45 font-body italic">
            {basmalaValue} — Au nom d&apos;Allah, le Tout Miséricordieux
          </p>
        </div>

        <div data-animate className="relative text-center flex flex-col gap-1">
          <p
            className="text-base text-primary-foreground/55"
            style={{ fontFamily: "var(--font-arabic)", direction: "rtl", lineHeight: 1.9 }}
          >
            مَنْ عَرَفَ حُرُوفَ ذَاتِهِ عَرَفَ حُرُوفَ رَبِّهِ
          </p>
          <p className="text-xs text-primary-foreground/45 font-body italic">
            Celui qui connaît les lettres de son être connaît les lettres de son Seigneur
          </p>
        </div>

        <div data-animate className="relative text-center flex flex-col gap-4">
          <h1 className="text-3xl font-headings font-bold text-primary-foreground leading-tight whitespace-pre-line">
            {"Le chiffre est\nune lumière\nsur le sens"}
          </h1>

          <div className="rounded-xl px-4 py-3 flex flex-col gap-1 bg-gold/10 border border-gold/30">
            <p
              className="text-lg text-gold-soft"
              style={{ fontFamily: "var(--font-arabic)", direction: "rtl", lineHeight: 2 }}
            >
              وَأَحۡصَىٰ كُلَّ شَيۡءٍ عَدَدَۢا
            </p>
            <p className="text-xs font-body italic text-gold-soft/70">
              &quot;Il a dénombré toutes choses en nombre.&quot; — Al-Jinn 72:28
            </p>
          </div>
        </div>
      </GradientPanel>

      <div className="px-5 pt-6 pb-6 flex flex-col gap-6">
        <div data-animate className="text-center flex flex-col gap-2">
          <h2 className="text-base font-headings font-semibold text-foreground">
            Une voie de connaissance
          </h2>
          <p className="text-sm text-muted-foreground font-body leading-relaxed">
            Le ʿIlm al-Ḥurûf — la science des lettres — est l&apos;une des clés les plus
            profondes de la tradition coranique. Darul Arqam t&apos;invite à explorer chaque
            sourate, verset et mot à travers leurs valeurs Abjad.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          {FEATURES.map((feature) => (
            <div key={feature.text} data-animate className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-secondary border border-primary/15 flex items-center justify-center flex-shrink-0">
                <feature.icon size={16} className="text-primary" />
              </div>
              <p className="text-sm text-foreground font-body">{feature.text}</p>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <div className="flex-1 border-t border-border" />
          <span className="text-xs text-muted-foreground font-body">Commence ton voyage</span>
          <div className="flex-1 border-t border-border" />
        </div>

        <div data-animate className="flex flex-col gap-3">
          <Link
            href="/register"
            className="w-full py-4 rounded-xl font-headings font-semibold text-base text-primary-foreground bg-gradient-primary flex items-center justify-center gap-2"
          >
            <UserPlus size={18} /> Créer mon compte
          </Link>
          <Link
            href="/login"
            className="w-full py-3.5 rounded-xl font-body font-semibold text-sm text-foreground bg-card border border-border flex items-center justify-center gap-2"
          >
            <LogIn size={16} /> J&apos;ai déjà un compte
          </Link>
        </div>

        <div data-animate className="rounded-xl px-4 py-4 flex flex-col gap-1.5 bg-gold/10 border border-gold/25">
          <p className="text-sm text-foreground font-body leading-relaxed italic text-center">
            &quot;Celui qui connaît les lettres connaît les choses, et celui qui connaît les
            choses connaît leur Seigneur.&quot;
          </p>
          <p className="text-xs text-muted-foreground font-body text-center">— Tradition soufie</p>
        </div>

        <p className="text-center text-xs text-muted-foreground font-body leading-relaxed">
          En créant un compte, tu acceptes les{" "}
          <Link href="/terms" className="text-primary underline">
            conditions d&apos;utilisation
          </Link>
        </p>
      </div>
    </div>
  );
}
