"use client";

import { useState, useEffect } from "react";
import { XMarkIcon, TrashIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import Link from "next/link";
import { getCartItems, removeFromCart, updateCartItemQuantity } from "@/lib/cart";
import { PriceDisplay } from "@/components/products/PriceDisplay";
import { supabase } from "@/lib/supabaseClient";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [subtotal, setSubtotal] = useState(0);

  useEffect(() => {
    if (isOpen) {
      loadCart();
    }
  }, [isOpen]);

  useEffect(() => {
    // Escuchar eventos de actualización del carrito
    const handleCartUpdate = () => {
      if (isOpen) {
        loadCart();
      }
    };
    
    window.addEventListener("cartUpdated", handleCartUpdate);

    return () => {
      window.removeEventListener("cartUpdated", handleCartUpdate);
    };
  }, [isOpen]);

  async function loadCart() {
    setLoading(true);
    try {
      const cartItems = await getCartItems();
      setItems(cartItems);
      
      // Calcular subtotal usando unit_price y subtotal de los items
      // Si subtotal no está disponible, calcularlo manualmente
      let total = 0;
      
      for (const item of cartItems) {
        if (item.subtotal) {
          // Usar subtotal calculado por la base de datos
          total += parseFloat(item.subtotal.toString());
        } else if (item.unit_price) {
          // Calcular subtotal manualmente si no está disponible
          total += parseFloat(item.unit_price.toString()) * item.quantity;
        }
      }
      
      setSubtotal(total);
    } catch (error) {
      console.error("Error loading cart:", error);
      console.error("Error details:", {
        message: (error as any)?.message,
        code: (error as any)?.code,
        details: (error as any)?.details,
      });
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
      
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-pyro-white shadow-xl">
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-2xl font-bold text-pyro-black">Carrito</h2>
            <button
              onClick={onClose}
              className="text-pyro-gray hover:text-pyro-black"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Items */}
          <div className="flex-1 overflow-y-auto p-6">
            {loading ? (
              <p className="text-center text-pyro-gray">Cargando...</p>
            ) : items.length === 0 ? (
              <p className="text-center text-pyro-gray">Tu carrito está vacío</p>
            ) : (
              <div className="space-y-4">
                {items.map((item) => {
                  const product = item.product;
                  // Ordenar imágenes por posición y tomar la primera
                  const sortedImages = product?.images?.sort((a: any, b: any) => (a.position || 0) - (b.position || 0));
                  const primaryImage = sortedImages?.[0];
                  
                  return (
                    <div key={item.id} className="flex gap-4 border-b pb-4">
                      {primaryImage && (
                        <div className="relative h-20 w-20 flex-shrink-0">
                          <Image
                            src={primaryImage.storage_path}
                            alt={product?.name || "Producto"}
                            fill
                            className="object-cover rounded"
                          />
                        </div>
                      )}
                      
                      <div className="flex-1">
                        <Link
                          href={`/product/${product?.slug}`}
                          className="font-semibold text-pyro-black hover:text-pyro-gold"
                        >
                          {product?.name}
                        </Link>
                        <div className="mt-2">
                          {item.unit_price ? (
                            <span className="text-lg font-bold text-pyro-gold">
                              R{parseFloat(item.unit_price.toString()).toFixed(2)}
                            </span>
                          ) : (
                            <PriceDisplay productId={item.product_id} />
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                            className="w-8 h-8 border border-pyro-gray rounded flex items-center justify-center hover:bg-pyro-gray"
                          >
                            -
                          </button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <button
                            onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                            className="w-8 h-8 border border-pyro-gray rounded flex items-center justify-center hover:bg-pyro-gray"
                          >
                            +
                          </button>
                          <button
                            onClick={() => handleRemove(item.id)}
                            className="ml-auto text-red-600 hover:text-red-800"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="border-t p-6 space-y-4">
              <div className="flex justify-between text-lg">
                <span className="text-pyro-gray">Subtotal:</span>
                <span className="font-bold text-pyro-black">R{subtotal.toFixed(2)}</span>
              </div>
              <Link
                href="/checkout"
                onClick={onClose}
                className="block w-full bg-pyro-gold text-pyro-black text-center py-3 rounded-lg font-semibold hover:bg-opacity-90 transition-colors"
              >
                Proceder al Checkout
              </Link>
              <Link
                href="/cart"
                onClick={onClose}
                className="block w-full text-center py-2 text-pyro-gray hover:text-pyro-gold transition-colors"
              >
                Ver carrito completo
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

