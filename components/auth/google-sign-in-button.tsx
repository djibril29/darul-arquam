"use client";

import { useState } from "react";
import { Globe } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function GoogleSignInButton() {
  const [isPending, setIsPending] = useState(false);

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
    <button
      type="button"
      disabled={isPending}
      onClick={signInWithGoogle}
      className="bg-card border border-border rounded-xl py-3.5 flex items-center justify-center gap-2 text-sm font-medium font-body disabled:opacity-50"
    >
      <Globe size={16} /> {isPending ? "Redirection..." : "Continuer avec Google"}
    </button>
  );
}
