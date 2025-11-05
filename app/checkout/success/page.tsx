"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircleIcon } from "@heroicons/react/24/solid";

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const [order, setOrder] = useState<any>(null);

  useEffect(() => {
    if (orderId) {
      // Aquí podrías cargar los detalles de la orden
      // Por ahora solo mostramos el mensaje de éxito
    }
  }, [orderId]);

  return (
    <div className="min-h-screen bg-pyro-white py-16">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="bg-pyro-gray p-8 rounded-lg">
          <div className="flex justify-center mb-6">
            <CheckCircleIcon className="h-20 w-20 text-green-600" />
          </div>
          
          <h1 className="text-4xl font-bold text-pyro-black mb-4">
            ¡Pedido Completado!
          </h1>
          
          <p className="text-lg text-pyro-gray mb-6">
            Gracias por tu compra. Tu pedido ha sido procesado exitosamente.
          </p>
          
          {orderId && (
            <p className="text-sm text-pyro-gray mb-8">
              Número de pedido: <span className="font-semibold text-pyro-black">{orderId}</span>
            </p>
          )}
          
          <div className="space-y-4">
            <Link
              href="/account/orders"
              className="inline-block bg-pyro-gold text-pyro-black px-6 py-3 rounded-lg font-semibold hover:bg-opacity-90 transition-colors"
            >
              Ver Mis Pedidos
            </Link>
            <br />
            <Link
              href="/shop"
              className="inline-block text-pyro-gray hover:text-pyro-gold transition-colors"
            >
              Continuar Comprando
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}


