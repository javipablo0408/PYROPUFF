"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { getCartItems, removeFromCart, updateCartItemQuantity } from "@/lib/cart";
import { PriceDisplay } from "@/components/products/PriceDisplay";
import { TrashIcon } from "@heroicons/react/24/outline";
import { supabase } from "@/lib/supabaseClient";

export default function CartPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [subtotal, setSubtotal] = useState(0);
  const [shipping, setShipping] = useState(0);

  useEffect(() => {
    loadCart();
  }, []);

  async function loadCart() {
    setLoading(true);
    try {
      const cartItems = await getCartItems();
      setItems(cartItems);
      
      // Calcular subtotal
      let total = 0;
      for (const item of cartItems) {
        const { data: { user } } = await supabase.auth.getUser();
        let role = "customer";
        
        if (user) {
          const { data: profile } = await supabase
            .from("users_extension")
            .select("role")
            .eq("user_id", user.id)
            .single();
          
          role = profile?.role || "customer";
        }
        
        const { data: price } = await supabase
          .from("product_prices")
          .select("price")
          .eq("product_id", item.product_id)
          .eq("role", role)
          .single();
        
        if (price) {
          total += price.price * item.quantity;
        }
      }
      setSubtotal(total);
      setShipping(total > 100 ? 0 : 10); // Envío gratis sobre $100
    } catch (error) {
      console.error("Error loading cart:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleRemove(itemId: string) {
    await removeFromCart(itemId);
    loadCart();
  }

  async function handleQuantityChange(itemId: string, newQuantity: number) {
    await updateCartItemQuantity(itemId, newQuantity);
    loadCart();
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-pyro-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-pyro-gray">Loading cart...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-pyro-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold mb-8 text-pyro-black">Shopping Cart</h1>

        {items.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-xl text-pyro-gray mb-4">Your cart is empty</p>
            <Link
              href="/"
              className="inline-block bg-pyro-gold text-pyro-black px-6 py-3 rounded-lg font-semibold hover:bg-opacity-90 transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => {
                const product = item.product;
                // Ordenar imágenes por posición y tomar la primera
                const sortedImages = product?.images?.sort((a: any, b: any) => (a.position || 0) - (b.position || 0));
                const primaryImage = sortedImages?.[0];
                
                return (
                  <div
                    key={item.id}
                    className="flex gap-4 bg-pyro-gray p-4 rounded-lg"
                  >
                    {primaryImage && (
                      <div className="relative h-32 w-32 flex-shrink-0">
                        <Image
                          src={primaryImage.storage_path}
                          alt={product?.name || "Product"}
                          fill
                          className="object-cover rounded"
                        />
                      </div>
                    )}
                    
                    <div className="flex-1">
                      <Link
                        href={`/product/${product?.slug}`}
                        className="text-xl font-semibold text-pyro-black hover:text-pyro-gold"
                      >
                        {product?.name}
                      </Link>
                      <p className="text-sm text-pyro-gray mt-1">
                        {product?.description}
                      </p>
                      
                      <div className="mt-4 flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                            className="w-8 h-8 border border-gray-300 rounded flex items-center justify-center hover:bg-pyro-white"
                          >
                            -
                          </button>
                          <span className="w-12 text-center font-semibold">{item.quantity}</span>
                          <button
                            onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                            className="w-8 h-8 border border-gray-300 rounded flex items-center justify-center hover:bg-pyro-white"
                          >
                            +
                          </button>
                        </div>
                        
                        <div className="ml-auto">
                          {item.unit_price ? (
                            <span className="text-lg font-bold text-pyro-gold">
                              R{parseFloat(item.unit_price.toString()).toFixed(2)}
                            </span>
                          ) : (
                            <PriceDisplay productId={item.product_id} />
                          )}
                        </div>
                        
                        <button
                          onClick={() => handleRemove(item.id)}
                          className="text-red-600 hover:text-red-800 ml-4"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
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

                <Link
                  href="/checkout"
                  className="block w-full bg-pyro-gold text-pyro-black text-center py-3 rounded-lg font-semibold hover:bg-opacity-90 transition-colors"
                >
                  Proceed to Checkout
                </Link>
                
                <Link
                  href="/"
                  className="block w-full text-center py-2 text-pyro-gray hover:text-pyro-gold transition-colors"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

