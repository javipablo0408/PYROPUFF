"use client";

import { ProductCard } from "@/components/products/ProductCard";
import { ShopFilters } from "@/components/shop/ShopFilters";
import { Product } from "@/lib/getProducts";
import Link from "next/link";

interface ShopSectionProps {
  products: Product[];
  currentPage: number;
  category?: string;
  subcategory?: string;
}

export function ShopSection({ products, currentPage, category, subcategory }: ShopSectionProps) {
  const limit = 12;

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-4xl font-bold mb-8 text-pyro-black text-center">Our Products</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <aside className="lg:col-span-1">
            <ShopFilters />
          </aside>
          
          <main className="lg:col-span-3">
            {products.length === 0 ? (
              <p className="text-center text-pyro-gray py-12">
                No products found.
              </p>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
                
                {/* Paginación */}
                <div className="mt-8 flex justify-center">
                  <div className="flex gap-2">
                    {currentPage > 1 && (
                      <Link
                        href={`/?page=${currentPage - 1}${category ? `&category=${category}` : ""}${subcategory ? `&subcategory=${subcategory}` : ""}`}
                        className="px-4 py-2 bg-pyro-gold text-pyro-black rounded hover:bg-opacity-90"
                      >
                        Previous
                      </Link>
                    )}
                    <span className="px-4 py-2 bg-pyro-gray rounded">
                      Page {currentPage}
                    </span>
                    {products.length === limit && (
                      <Link
                        href={`/?page=${currentPage + 1}${category ? `&category=${category}` : ""}${subcategory ? `&subcategory=${subcategory}` : ""}`}
                        className="px-4 py-2 bg-pyro-gold text-pyro-black rounded hover:bg-opacity-90"
                      >
                        Next
                      </Link>
                    )}
                  </div>
                </div>
              </>
            )}
          </main>
        </div>
      </div>
    </section>
  );
}
