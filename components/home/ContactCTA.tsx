"use client";

import Link from "next/link";

export function ContactCTA() {
  return (
    <section className="py-16 bg-black text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
          Ready to get started?
        </h2>
        <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-2xl mx-auto">
          Reach out to us to learn more about how to become an authorized Pyro Puff retailer.
        </p>
        <p className="text-2xl md:text-3xl font-semibold text-orange-500 mb-8">
          Let's grow together.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/contact"
            className="inline-block bg-orange-500 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-orange-600 transition-colors transform hover:scale-105"
          >
            Contact Us
          </Link>
          <Link
            href="/register"
            className="inline-block bg-white text-black px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors transform hover:scale-105"
          >
            Become a Retailer
          </Link>
        </div>
      </div>
    </section>
  );
}

