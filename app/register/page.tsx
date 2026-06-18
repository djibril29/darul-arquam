import Link from "next/link";
import { MoonStar, User, Mail, Lock, UserPlus } from "lucide-react";
import { GradientPanel, DecorativeCircle } from "@/components/shared/gradient-panel";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";
import { register } from "./actions";

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="bg-background flex flex-col min-h-screen bg-dot-pattern">
      <GradientPanel
        variant="banner"
        className="flex flex-col items-center justify-end pb-7 pt-14 px-6"
      >
        <DecorativeCircle size={120} className="-right-8 -top-8" />
        <DecorativeCircle size={88} className="-left-8 bottom-0" />
        <div className="relative flex flex-col items-center">
          <div className="w-12 h-12 rounded-xl bg-white/15 border-[1.5px] border-gold/50 flex items-center justify-center mb-3">
            <MoonStar size={22} className="text-primary-foreground" />
          </div>
          <h1 className="text-xl font-headings font-bold text-primary-foreground">
            Darul Arqam
          </h1>
          <p className="text-xs text-primary-foreground/70 mt-1 text-center">
            Explorez les lettres, les mots et les nombres du Coran.
          </p>
        </div>
      </GradientPanel>

      <div className="flex-1 px-5 pt-7 pb-6 flex flex-col gap-4">
        <div>
          <h2 className="text-xl font-headings font-semibold text-foreground">
            Créer un compte
          </h2>
          <p className="text-xs text-muted-foreground font-body mt-1">
            Rejoignez Darul Arqam et commencez votre exploration.
          </p>
        </div>

        {error ? (
          <p className="bg-destructive/10 text-destructive text-xs font-body rounded-xl px-4 py-3">
            {error}
          </p>
        ) : null}

        <form className="flex flex-col gap-4" action={register}>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold font-body" htmlFor="name">
              Nom complet
            </label>
            <div className="bg-card border border-border rounded-xl px-4 py-3 flex items-center gap-3">
              <User size={16} className="text-muted-foreground" />
              <input
                id="name"
                name="name"
                type="text"
                required
                placeholder="Ibrahim Al-Farsi"
                className="flex-1 bg-transparent text-sm font-body outline-none placeholder:text-muted-foreground"
              />
            </div>
          </div>

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
                minLength={6}
                placeholder="••••••••"
                className="flex-1 bg-transparent text-sm font-body outline-none placeholder:text-muted-foreground"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold font-body" htmlFor="confirm-password">
              Confirmer le mot de passe
            </label>
            <div className="bg-card border border-primary rounded-xl px-4 py-3 flex items-center gap-3">
              <Lock size={16} className="text-muted-foreground" />
              <input
                id="confirm-password"
                name="confirm-password"
                type="password"
                required
                minLength={6}
                placeholder="••••••••"
                className="flex-1 bg-transparent text-sm font-body outline-none placeholder:text-muted-foreground"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-primary text-primary-foreground rounded-xl py-3.5 flex items-center justify-center gap-2 text-sm font-semibold font-body"
          >
            <UserPlus size={16} /> Créer mon compte
          </button>
        </form>

        <div className="flex items-center gap-3">
          <div className="h-px bg-border flex-1" />
          <span className="text-xs text-muted-foreground font-body">ou</span>
          <div className="h-px bg-border flex-1" />
        </div>

        <GoogleSignInButton />

        <p className="text-center text-xs text-muted-foreground font-body">
          Déjà un compte ?{" "}
          <Link href="/login" className="font-semibold text-primary">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}
