import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-pyro-white flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center">
        <h1 className="text-6xl font-bold text-pyro-black mb-4">404</h1>
        <h2 className="text-3xl font-semibold text-pyro-black mb-4">
          Página no encontrada
        </h2>
        <p className="text-pyro-gray mb-8">
          Lo sentimos, la página que buscas no existe.
        </p>
        <Link
          href="/"
          className="inline-block bg-pyro-gold text-pyro-black px-6 py-3 rounded-lg font-semibold hover:bg-opacity-90 transition-colors"
        >
          Volver al Inicio
        </Link>
      </div>
    </div>
  );
}


