"use server";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export type LoginState = {
  ok: boolean;
  email: string;
  error?: string;
};

/**
 * Login con correo + contraseña (Supabase Auth signInWithPassword). Las
 * credenciales de cada usuario las crea un admin (Admin API,
 * service_role) — no hay signup público.
 */
export async function loginAction(
  prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { ok: false, email, error: "Ingresá tu correo y contraseña." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    return { ok: false, email, error: "Correo o contraseña incorrectos." };
  }

  redirect("/despacho");
}
