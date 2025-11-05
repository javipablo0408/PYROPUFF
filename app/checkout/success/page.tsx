"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircleIcon } from "@heroicons/react/24/solid";

function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");

  return (
    <div className="min-h-screen bg-pyro-white py-16">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="bg-pyro-gray p-8 rounded-lg">
          <div className="flex justify-center mb-6">
            <CheckCircleIcon className="h-20 w-20 text-green-600" />
          </div>
          
          <h1 className="text-4xl font-bold text-pyro-black mb-4">
            Order Completed!
          </h1>
          
          <p className="text-lg text-pyro-gray mb-6">
            Thank you for your purchase. Your order has been processed successfully.
          </p>
          
          {orderId && (
            <p className="text-sm text-pyro-gray mb-8">
              Order number: <span className="font-semibold text-pyro-black">{orderId}</span>
            </p>
          )}
          
          <div className="space-y-4">
            <Link
              href="/account/orders"
              className="inline-block bg-pyro-gold text-pyro-black px-6 py-3 rounded-lg font-semibold hover:bg-opacity-90 transition-colors"
            >
              View My Orders
            </Link>
            <br />
            <Link
              href="/"
              className="inline-block text-pyro-gray hover:text-pyro-gold transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-pyro-white py-16 flex items-center justify-center">
        <div className="text-center">
          <p className="text-pyro-gray">Loading...</p>
        </div>
      </div>
    }>
      <CheckoutSuccessContent />
    </Suspense>
  );
}


