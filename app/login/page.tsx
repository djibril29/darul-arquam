import Link from "next/link";
import { MoonStar, Mail, Lock, EyeOff, LogIn, Globe } from "lucide-react";
import { GradientPanel, DecorativeCircle } from "@/components/shared/gradient-panel";
import { BASMALA_TEXT_UTHMANI } from "@/lib/gematria/basmala";
import { login } from "./actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; info?: string }>;
}) {
  const { error, info } = await searchParams;

  return (
    <div className="bg-background flex flex-col min-h-screen bg-dot-pattern">
      <GradientPanel
        variant="banner"
        className="flex flex-col items-center justify-end pb-8 pt-16 px-6"
      >
        <DecorativeCircle size={160} className="-right-10 -top-10" />
        <DecorativeCircle size={96} className="right-4 -top-8" />
        <DecorativeCircle size={112} className="-left-10 bottom-0" />
        <div className="relative flex flex-col items-center">
          <div className="w-14 h-14 rounded-2xl bg-white/15 border-[1.5px] border-gold/50 flex items-center justify-center mb-3">
            <MoonStar size={28} className="text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-headings font-bold text-primary-foreground">
            Darul Arqam
          </h1>
          <p className="text-xs text-primary-foreground/70 mt-1">
            Lecture &amp; analyse numérique du Coran
          </p>
        </div>
      </GradientPanel>

      <div className="flex-1 px-5 pt-8 pb-6 flex flex-col gap-5">
        <div>
          <h2 className="text-xl font-headings font-semibold text-foreground">Connexion</h2>
          <p className="text-xs text-muted-foreground font-body mt-1">
            Bienvenue. Entrez vos identifiants pour continuer.
          </p>
        </div>

        {error ? (
          <p className="bg-destructive/10 text-destructive text-xs font-body rounded-xl px-4 py-3">
            {error}
          </p>
        ) : null}
        {info ? (
          <p className="bg-secondary text-secondary-foreground text-xs font-body rounded-xl px-4 py-3">
            {info}
          </p>
        ) : null}

        <form className="flex flex-col gap-4" action={login}>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold font-body" htmlFor="email">
              Adresse email
            </label>
            <div className="bg-card border border-border rounded-xl px-4 py-3 flex items-center gap-3">
              <Mail size={16} className="text-muted-foreground" />
              <input
                id="email"
                name="email"
                type="email"
                required
                placeholder="ibrahim@example.com"
                className="flex-1 bg-transparent text-sm font-body outline-none placeholder:text-muted-foreground"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold font-body" htmlFor="password">
              Mot de passe
            </label>
            <div className="bg-card border border-border rounded-xl px-4 py-3 flex items-center gap-3">
              <Lock size={16} className="text-muted-foreground" />
              <input
                id="password"
                name="password"
                type="password"
                required
                placeholder="••••••••"
                className="flex-1 bg-transparent text-sm font-body outline-none placeholder:text-muted-foreground"
              />
              <EyeOff size={15} className="text-muted-foreground" />
            </div>
            <Link href="#" className="self-end text-xs text-primary font-body">
              Mot de passe oublié ?
            </Link>
          </div>

          <button
            type="submit"
            className="w-full bg-primary text-primary-foreground rounded-xl py-3.5 flex items-center justify-center gap-2 text-sm font-semibold font-body"
          >
            <LogIn size={16} /> Se connecter
          </button>
        </form>

        <div className="flex items-center gap-3">
          <div className="h-px bg-border flex-1" />
          <span className="text-xs text-muted-foreground font-body">ou</span>
          <div className="h-px bg-border flex-1" />
        </div>

        <button
          type="button"
          className="bg-card border border-border rounded-xl py-3.5 flex items-center justify-center gap-2 text-sm font-medium font-body"
        >
          <Globe size={16} /> Continuer avec Google
        </button>

        <p className="text-center text-xs text-muted-foreground font-body">
          Pas encore de compte ?{" "}
          <Link href="/register" className="font-semibold text-primary">
            Créer un compte
          </Link>
        </p>

        <p
          className="text-center text-lg text-muted-foreground mt-4"
          style={{ fontFamily: "var(--font-arabic)", direction: "rtl", lineHeight: 2 }}
        >
          {BASMALA_TEXT_UTHMANI}
        </p>
      </div>
    </div>
  );
}
