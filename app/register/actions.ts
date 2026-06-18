"use server";

import { redirect } from "next/navigation";
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
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } },
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
