"use client";

import { useState } from "react";
import { Product } from "@/lib/getProducts";
import { addToCart } from "@/lib/cart";
import { ShoppingCartIcon } from "@heroicons/react/24/outline";

interface AddToCartButtonProps {
  product: Product;
}

export function AddToCartButton({ product }: AddToCartButtonProps) {
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleAddToCart() {
    if (product.stock < quantity) {
      setMessage("Insufficient stock available");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      await addToCart(product.id, quantity);
      setMessage("Product added to cart");
      setTimeout(() => setMessage(""), 3000);
      
      // Disparar evento personalizado para actualizar el carrito en otros componentes
      window.dispatchEvent(new Event("cartUpdated"));
    } catch (error: any) {
      const errorMessage = error?.message || error?.toString() || "Error adding product";
      setMessage(errorMessage);
      console.error("Error adding to cart:", error);
      console.error("Error details:", {
        message: error?.message,
        code: error?.code,
        details: error?.details,
        hint: error?.hint,
      });
      setTimeout(() => setMessage(""), 5000);
    } finally {
      setLoading(false);
    }
  }

  if (product.stock === 0) {
    return (
      <button
        disabled
        className="w-full bg-gray-400 text-white py-3 rounded-lg font-semibold cursor-not-allowed"
      >
        Out of Stock
      </button>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <label className="font-semibold text-pyro-black">Quantity:</label>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="w-10 h-10 border border-gray-300 rounded flex items-center justify-center hover:bg-pyro-gray"
          >
            -
          </button>
          <span className="w-12 text-center font-semibold">{quantity}</span>
          <button
            onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
            className="w-10 h-10 border border-gray-300 rounded flex items-center justify-center hover:bg-pyro-gray"
          >
            +
          </button>
        </div>
        <span className="text-sm text-pyro-gray">
          (Max: {product.stock})
        </span>
      </div>

      <button
        onClick={handleAddToCart}
        disabled={loading || product.stock < quantity}
        className="w-full bg-pyro-gold text-pyro-black py-3 rounded-lg font-semibold hover:bg-opacity-90 transition-colors flex items-center justify-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        {loading ? (
          "Adding..."
        ) : (
          <>
            <ShoppingCartIcon className="h-5 w-5" />
            Add to Cart
          </>
        )}
      </button>

      {message && (
        <p
          className={`text-sm text-center ${
            message.includes("Error") ? "text-red-600" : "text-green-600"
          }`}
        >
          {message}
        </p>
      )}
    </div>
  );
}


