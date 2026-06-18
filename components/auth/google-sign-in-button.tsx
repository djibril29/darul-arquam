"use client";

import { useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { GoogleLogo } from "@/components/auth/google-logo";

export function GoogleSignInButton() {
  const [isPending, setIsPending] = useState(false);
  const glowRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    gsap.to(glowRef.current, {
      opacity: 0.45,
      duration: 1.6,
      ease: "sine.inOut",
      repeat: -1,
      yoyo: true,
    });
  });

  async function signInWithGoogle() {
    setIsPending(true);
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) {
      setIsPending(false);
      window.alert(error.message);
    }
    // En cas de succès, le navigateur est redirigé vers Google — pas besoin
    // de remettre isPending à false, la page va se quitter.
  }

  return (
    <div className="relative">
      <div
        ref={glowRef}
        className="absolute -inset-1 rounded-2xl bg-linear-to-r from-[#4285F4] via-[#34A853] to-[#FBBC05] opacity-20 blur-md"
        aria-hidden="true"
      />
      <button
        type="button"
        disabled={isPending}
        onClick={signInWithGoogle}
        className="relative w-full bg-white border border-border rounded-xl py-4 flex items-center justify-center gap-3 text-base font-semibold font-body text-foreground shadow-sm disabled:opacity-50"
      >
        <GoogleLogo size={20} />
        {isPending ? "Redirection..." : "Continuer avec Google"}
      </button>
    </div>
  );
}
