import { createClient } from "./supabaseServer";
import { redirect } from "next/navigation";

export async function getCurrentUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function getCurrentSession() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  return user;
}

export async function requireAdmin() {
  const user = await requireAuth();
  const supabase = await createClient();
  
  const { data: profile, error } = await supabase
    .from("users_extension")
    .select("role")
    .eq("id", user.id)
    .single();
  
  // Si hay error o no hay perfil, redirigir a login
  if (error || !profile) {
    console.error("Error fetching admin profile:", error);
    console.error("User ID:", user.id);
    redirect("/login?error=no_profile");
  }
  
  // Si el rol no es admin, redirigir a home
  if (profile.role !== "admin") {
    console.error("User role is not admin:", profile.role);
    redirect("/");
  }
  
  return user;
}

export async function getUserRole() {
  const user = await getCurrentUser();
  if (!user) return "guest";
  
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("users_extension")
    .select("role")
    .eq("id", user.id)
    .single();
  
  return profile?.role || "cliente";
}
