"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getSiteUrl } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function register(formData: FormData) {
  const fullName = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirm-password") ?? "");

  if (!fullName || !email || !password) {
    redirect(`/register?error=${encodeURIComponent("Tous les champs sont requis.")}`);
  }

  if (password !== confirmPassword) {
    redirect(`/register?error=${encodeURIComponent("Les mots de passe ne correspondent pas.")}`);
  }

  const supabase = await createSupabaseServerClient();
  // Sans `emailRedirectTo`, Supabase construit le lien de confirmation à partir
  // du « Site URL » de son dashboard — qui pointait encore sur l'ancien domaine
  // Vercel après la migration du 2026-09-07, envoyant les nouveaux inscrits sur
  // un déploiement suspendu. On impose l'origine réelle de la requête.
  const origin = (await headers()).get("origin") ?? getSiteUrl();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
      emailRedirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) {
    redirect(`/register?error=${encodeURIComponent(error.message)}`);
  }

  if (!data.session) {
    redirect(
      `/login?info=${encodeURIComponent("Compte créé : vérifiez votre email pour confirmer avant de vous connecter.")}`
    );
  }

  redirect("/");
}
