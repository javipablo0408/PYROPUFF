"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Product } from "@/lib/getProducts";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

interface ProductCarouselProps {
  products: Product[];
}

export function ProductCarousel({ products }: ProductCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % products.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + products.length) % products.length);
  };

  if (products.length === 0) return null;

  return (
    <section className="py-16 bg-pyro-black text-pyro-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-4xl font-bold text-center mb-12">
          Nuestros Productos
        </h2>
        <div className="relative">
          <div className="overflow-hidden rounded-lg">
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {products.map((product) => {
                const sortedImages = product.images?.sort((a, b) => (a.position || 0) - (b.position || 0));
                const primaryImage = sortedImages?.[0];
                return (
                  <div
                    key={product.id}
                    className="min-w-full flex-shrink-0 px-4"
                  >
                    <Link
                      href={`/product/${product.slug}`}
                      className="block bg-gray-900 rounded-lg overflow-hidden hover:opacity-90 transition-opacity"
                    >
                      {primaryImage && (
                        <div className="relative h-96 w-full">
                          <Image
                            src={primaryImage.storage_path}
                            alt={product.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}
                      <div className="p-6">
                        <h3 className="text-2xl font-semibold mb-2">{product.name}</h3>
                        {product.price && (
                          <p className="text-pyro-gold text-xl font-bold">
                            €{product.price.price.toFixed(2)} {product.price.currency}
                          </p>
                        )}
                      </div>
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
          
          <button
            onClick={prevSlide}
            className="absolute left-0 top-1/2 -translate-y-1/2 bg-pyro-gold text-pyro-black p-2 rounded-full hover:bg-opacity-90 transition-colors"
            aria-label="Anterior"
          >
            <ChevronLeftIcon className="h-6 w-6" />
          </button>
          
          <button
            onClick={nextSlide}
            className="absolute right-0 top-1/2 -translate-y-1/2 bg-pyro-gold text-pyro-black p-2 rounded-full hover:bg-opacity-90 transition-colors"
            aria-label="Siguiente"
          >
            <ChevronRightIcon className="h-6 w-6" />
          </button>
        </div>
        
        <div className="flex justify-center mt-4 space-x-2">
          {products.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-2 w-2 rounded-full transition-colors ${
                index === currentIndex ? "bg-pyro-gold" : "bg-gray-600"
              }`}
              aria-label={`Ir a slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

