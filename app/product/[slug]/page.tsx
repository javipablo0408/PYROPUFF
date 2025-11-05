import { getProductBySlug } from "@/lib/getProducts";
import { notFound } from "next/navigation";
import Image from "next/image";
import { ProductGallery } from "@/components/products/ProductGallery";
import { PriceDisplay } from "@/components/products/PriceDisplay";
import { AddToCartButton } from "@/components/products/AddToCartButton";

export default async function ProductDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const product = await getProductBySlug(params.slug);

  if (!product) {
    notFound();
  }



  return (
    <div className="min-h-screen bg-pyro-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Galería de imágenes */}
          <div>
            <ProductGallery images={product.images || []} productName={product.name} />
          </div>

          {/* Información del producto */}
          <div className="space-y-6">
            <div>
              <h1 className="text-4xl font-bold text-pyro-black mb-4">
                {product.name}
              </h1>
              <p className="text-lg text-pyro-gray mb-4">
                {product.description}
              </p>
            </div>

            <div className="border-t border-b py-6">
              <PriceDisplay productId={product.id} price={product.price} />
            </div>

            <div className="space-y-4">
              <div>
                <span className="font-semibold text-pyro-black">SKU: </span>
                <span className="text-pyro-gray">{product.sku}</span>
              </div>
              
              <div>
                <span className="font-semibold text-pyro-black">Stock: </span>
                {product.stock > 0 ? (
                  <span className="text-green-600">En stock ({product.stock})</span>
                ) : (
                  <span className="text-red-600">Agotado</span>
                )}
              </div>

              {product.category && (
                <div>
                  <span className="font-semibold text-pyro-black">Categoría: </span>
                  <span className="text-pyro-gray">{product.category.name}</span>
                </div>
              )}
            </div>

            <AddToCartButton product={product} />

            {product.description && (
              <div className="mt-8 pt-8 border-t">
                <h2 className="text-2xl font-bold text-pyro-black mb-4">
                  Descripción
                </h2>
                <p className="text-pyro-gray">
                  {product.description}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


