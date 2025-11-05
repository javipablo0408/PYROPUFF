import Link from "next/link";

export function Hero() {
  return (
    <section className="relative bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700 text-white min-h-[600px] flex items-center justify-center">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-5xl md:text-7xl font-bold mb-6 text-white">
          <span className="text-white">Grow Your Business</span>
          <br />
          Become an Official Pyro Puff Retailer
        </h1>
        <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto">
          Join the network of official Pyro Puff distributors and take your business to the next level.
        </p>
        <Link
          href="/register"
          className="inline-block bg-black text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-opacity-90 transition-all transform hover:scale-105"
        >
          Become a Retailer
        </Link>
      </div>
    </section>
  );
}


