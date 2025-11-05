"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getCartItems } from "@/lib/cart";
import { supabase } from "@/lib/supabaseClient";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";

export default function CheckoutPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [subtotal, setSubtotal] = useState(0);
  const [shipping, setShipping] = useState(0);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    checkUser();
    loadCart();
  }, []);

  async function checkUser() {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
    
    if (user) {
      loadAddresses(user.id);
    }
  }

  async function loadAddresses(userId: string) {
    const { data } = await supabase
      .from("addresses")
      .select("*")
      .eq("user_id", userId)
      .order("is_default", { ascending: false });
    
    if (data) setAddresses(data);
  }

  async function loadCart() {
    setLoading(true);
    try {
      const cartItems = await getCartItems();
      setItems(cartItems);
      
      if (cartItems.length === 0) {
        router.push("/cart");
        return;
      }
      
      // Calcular subtotal
      let total = 0;
      for (const item of cartItems) {
        const { data: { user } } = await supabase.auth.getUser();
        let role = "customer";
        
        if (user) {
          const { data: profile } = await supabase
            .from("users_extension")
            .select("role")
            .eq("id", user.id)
            .maybeSingle();
          
          role = profile?.role || "cliente";
        }
        
        // Mapear roles
        const roleMap: Record<string, string> = {
          customer: "cliente",
          cliente: "cliente",
          wholesaler: "mayorista",
          mayorista: "mayorista",
        };
        
        const searchRole = roleMap[role] || "cliente";
        
        const { data: price } = await supabase
          .from("product_prices")
          .select("price")
          .eq("product_id", item.product_id)
          .eq("role", searchRole)
          .maybeSingle();
        
        // Si no encuentra precio para ese rol, buscar precio de cliente
        if (!price) {
          const { data: fallbackPrice } = await supabase
            .from("product_prices")
            .select("price")
            .eq("product_id", item.product_id)
            .eq("role", "cliente")
            .maybeSingle();
          
          if (fallbackPrice) {
            total += fallbackPrice.price * item.quantity;
          }
        } else {
          total += price.price * item.quantity;
        }
        
      }
      setSubtotal(total);
      setShipping(total > 100 ? 0 : 10);
    } catch (error) {
      console.error("Error loading cart:", error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-pyro-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-pyro-gray">Loading...</p>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="min-h-screen bg-pyro-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold mb-8 text-pyro-black">Checkout</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <CheckoutForm
              addresses={addresses}
              user={user}
              onAddressAdded={() => {
                if (user) loadAddresses(user.id);
              }}
            />
          </div>
          
          <div className="lg:col-span-1">
            <div className="bg-pyro-gray p-6 rounded-lg space-y-4 sticky top-4">
              <h2 className="text-2xl font-bold text-pyro-black">Summary</h2>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-pyro-gray">Subtotal:</span>
                  <span className="font-semibold">R{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-pyro-gray">Shipping:</span>
                  <span className="font-semibold">
                    {shipping === 0 ? "Free" : `R${shipping.toFixed(2)}`}
                  </span>
                </div>
                <div className="border-t pt-2 flex justify-between text-lg">
                  <span className="font-bold text-pyro-black">Total:</span>
                  <span className="font-bold text-pyro-gold">
                    R{(subtotal + shipping).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

