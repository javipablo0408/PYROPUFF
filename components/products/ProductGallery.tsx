"use client";

import { useState } from "react";
import Image from "next/image";

interface ProductGalleryProps {
  images: Array<{
    id: string;
    storage_path: string;
    position: number;
  }>;
  productName: string;
}

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const sortedImages = images.sort((a, b) => (a.position || 0) - (b.position || 0));
  const [selectedImage, setSelectedImage] = useState(sortedImages[0]);

  if (images.length === 0) {
    return (
      <div className="bg-pyro-gray rounded-lg aspect-square flex items-center justify-center">
        <span className="text-pyro-gray">Sin imagen</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Imagen principal */}
      <div className="relative aspect-square bg-pyro-gray rounded-lg overflow-hidden">
        {selectedImage && (
          <Image
            src={selectedImage.storage_path}
            alt={productName}
            fill
            className="object-cover"
            priority
          />
        )}
      </div>

      {/* Miniaturas */}
      {sortedImages.length > 1 && (
        <div className="grid grid-cols-4 gap-4">
          {sortedImages.map((image) => (
            <button
              key={image.id}
              onClick={() => setSelectedImage(image)}
              className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-colors ${
                selectedImage?.id === image.id
                  ? "border-pyro-gold"
                  : "border-transparent hover:border-gray-300"
              }`}
            >
              <Image
                src={image.storage_path}
                alt={`${productName} - Vista ${image.id}`}
                fill
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}


