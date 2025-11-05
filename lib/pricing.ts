import { createClient } from "./supabaseServer";
import { getUserRole } from "./auth";

// Mapear roles: "customer" -> "cliente", "wholesaler" -> "mayorista"
function mapRole(role: string): string {
  const roleMap: Record<string, string> = {
    customer: "cliente",
    cliente: "cliente",
    wholesaler: "mayorista",
    mayorista: "mayorista",
    admin: "cliente", // Los admins ven precio de cliente por defecto
  };
  return roleMap[role] || "cliente";
}

export async function getProductPrice(productId: string, role: string = "customer") {
  const supabase = await createClient();
  const mappedRole = mapRole(role);
  
  // Primero intentar con el rol mapeado
  const { data: price } = await supabase
    .from("product_prices")
    .select("*")
    .eq("product_id", productId)
    .eq("role", mappedRole)
    .single();
  
  // Si no encuentra precio para ese rol, intentar con "cliente" como fallback
  if (!price && mappedRole !== "cliente") {
    const { data: fallbackPrice } = await supabase
      .from("product_prices")
      .select("*")
      .eq("product_id", productId)
      .eq("role", "cliente")
      .single();
    
    return fallbackPrice || null;
  }
  
  return price || null;
}

export async function getProductPrices(productId: string) {
  const supabase = await createClient();
  
  const { data: prices } = await supabase
    .from("product_prices")
    .select("*")
    .eq("product_id", productId);
  
  return prices || [];
}

export async function getPriceForCurrentUser(productId: string) {
  const role = await getUserRole();
  return getProductPrice(productId, role);
}


