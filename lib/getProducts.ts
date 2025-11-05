import { createClient } from "./supabaseServer";
import { getProductPrice } from "./pricing";
import { getUserRole } from "./auth";

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  category_id: number | null;
  sku: string | null;
  stock: number;
  active: boolean;
  created_at: string;
  category?: {
    id: number;
    name: string;
  } | null;
  images?: Array<{
    id: string;
    storage_path: string;
    position: number;
  }>;
  price?: {
    price: number;
    currency: string;
    role: string;
  };
}

export async function getProducts(filters?: {
  category?: string;
  subcategory?: string;
  featured?: boolean;
  limit?: number;
  offset?: number;
}) {
  const supabase = await createClient();
  const role = await getUserRole();
  
  let query = supabase
    .from("products")
    .select(`
      *,
      category:categories(id, name),
      images:product_images(id, storage_path, position)
    `)
    .eq("active", true);
  
  if (filters?.category) {
    query = query.eq("category_id", filters.category);
  }
  
  // Si hay subcategoría, filtrar por ella (las subcategorías son categorías con parent_id)
  if (filters?.subcategory) {
    query = query.eq("category_id", filters.subcategory);
  }
  
  if (filters?.featured) {
    // Nota: El esquema real no tiene is_featured, esto se puede implementar después
    // query = query.eq("is_featured", true);
  }
  
  if (filters?.limit) {
    query = query.limit(filters.limit);
  }
  
  if (filters?.offset) {
    query = query.offset(filters.offset);
  }
  
  const { data: products, error } = await query;
  
  if (error) {
    console.error("Error fetching products:", error);
    return [];
  }
  
  // Obtener precios para cada producto
  const productsWithPrices = await Promise.all(
    (products || []).map(async (product) => {
      const price = await getProductPrice(product.id, role);
      return {
        ...product,
        price: price ? {
          price: price.price,
          currency: price.currency,
          role: price.role,
        } : undefined,
      };
    })
  );
  
  return productsWithPrices as Product[];
}

export async function getProductBySlug(slug: string) {
  const supabase = await createClient();
  const role = await getUserRole();
  
  const { data: product, error } = await supabase
    .from("products")
    .select(`
      *,
      category:categories(id, name),
      images:product_images(id, storage_path, position)
    `)
    .eq("slug", slug)
    .eq("active", true)
    .single();
  
  if (error || !product) {
    return null;
  }
  
  const price = await getProductPrice(product.id, role);
  
  return {
    ...product,
    price: price ? {
      price: price.price,
      currency: price.currency,
      role: price.role,
    } : undefined,
  } as Product;
}


