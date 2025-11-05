"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

interface PriceDisplayProps {
  productId: string;
  price?: {
    price: number;
    currency: string;
    role: string;
  } | null | undefined;
}

export function PriceDisplay({ productId, price: initialPrice }: PriceDisplayProps) {
  const [price, setPrice] = useState(initialPrice);
  const [role, setRole] = useState("cliente");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPrice() {
      // Si ya tenemos un precio inicial, usarlo directamente
      if (initialPrice) {
        setPrice(initialPrice);
        setRole(initialPrice.role || "cliente");
        setLoading(false);
        return;
      }

      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        let userRole = "cliente";
        
        if (user) {
          const { data: profile } = await supabase
            .from("users_extension")
            .select("role")
            .eq("id", user.id)
            .single();
          
          userRole = profile?.role || "cliente";
          setRole(userRole);
        }
        
        // Mapear roles: "customer" -> "cliente", "wholesaler" -> "mayorista"
        const roleMap: Record<string, string> = {
          customer: "cliente",
          cliente: "cliente",
          wholesaler: "mayorista",
          mayorista: "mayorista",
        };
        
        const searchRole = roleMap[userRole] || "cliente";
        
        // Buscar precio por el rol mapeado
        const { data: priceData, error } = await supabase
          .from("product_prices")
          .select("*")
          .eq("product_id", productId)
          .eq("role", searchRole)
          .single();
        
        if (error && error.code !== "PGRST116") {
          // PGRST116 = no rows returned, no es un error crítico
          console.error("Error fetching price:", error);
        }
        
        if (priceData) {
          setPrice({
            price: priceData.price,
            currency: priceData.currency || "ZAR",
            role: priceData.role,
          });
          setRole(priceData.role);
        } else {
          // Si no encuentra precio para el rol del usuario, intentar con "cliente"
          if (searchRole !== "cliente") {
            const { data: fallbackPrice } = await supabase
              .from("product_prices")
              .select("*")
              .eq("product_id", productId)
              .eq("role", "cliente")
              .single();
            
            if (fallbackPrice) {
              setPrice({
                price: fallbackPrice.price,
                currency: fallbackPrice.currency || "ZAR",
                role: fallbackPrice.role,
              });
            }
          }
        }
      } catch (error) {
        console.error("Error in fetchPrice:", error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchPrice();
  }, [productId, initialPrice]);

  if (loading) {
    return <span className="text-pyro-gray">Loading price...</span>;
  }

  if (!price) {
    return <span className="text-pyro-gray">Price not available</span>;
  }

  return (
    <div className="flex flex-col">
      <span className="text-2xl font-bold text-pyro-gold">
        R{price.price.toFixed(2)}
      </span>
      {(role === "mayorista" || role === "wholesaler") && (
        <span className="text-xs text-pyro-gray">Wholesale price</span>
      )}
    </div>
  );
}


