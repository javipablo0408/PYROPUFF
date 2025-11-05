"use client";

import Image from "next/image";
import Link from "next/link";
import { Product } from "@/lib/getProducts";
import { PriceDisplay } from "@/components/products/PriceDisplay";
import { ShoppingCartIcon } from "@heroicons/react/24/outline";
import { addToCart } from "@/lib/cart";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  // Ordenar imágenes por posición y tomar la primera
  const sortedImages = product.images?.sort((a, b) => (a.position || 0) - (b.position || 0));
  const primaryImage = sortedImages?.[0];

  async function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    try {
      await addToCart(product.id, 1);
      // Disparar evento personalizado para actualizar el carrito
      window.dispatchEvent(new Event("cartUpdated"));
      // Opcional: mostrar notificación
      alert("Product added to cart");
    } catch (error: any) {
      alert(`Error: ${error.message || "Could not add product"}`);
    }
  }

  return (
    <Link
      href={`/product/${product.slug}`}
      className="group block bg-pyro-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow"
    >
      {primaryImage && (
        <div className="relative h-64 w-full overflow-hidden">
          <Image
            src={primaryImage.storage_path}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}
      <div className="p-6">
        <h3 className="text-xl font-semibold mb-2 text-pyro-black group-hover:text-pyro-gold transition-colors">
          {product.name}
        </h3>
        {product.description && (
          <p className="text-pyro-gray text-sm mb-4 line-clamp-2">
            {product.description}
          </p>
        )}
        
        <div className="flex items-center justify-between">
          <PriceDisplay productId={product.id} price={product.price} />
          
          <button
            onClick={handleAddToCart}
            className="bg-pyro-gold text-pyro-black px-4 py-2 rounded-md font-semibold hover:bg-opacity-90 transition-colors flex items-center gap-2"
          >
            <ShoppingCartIcon className="h-5 w-5" />
            Add
          </button>
        </div>
        
        {product.stock > 0 ? (
          <p className="text-sm text-green-600 mt-2">In stock ({product.stock})</p>
        ) : (
          <p className="text-sm text-red-600 mt-2">Out of stock</p>
        )}
      </div>
    </Link>
  );
}


