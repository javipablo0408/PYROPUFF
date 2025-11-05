"use client";

import Image from "next/image";

export function Certifications() {
  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center items-center">
          <div className="w-full max-w-5xl">
            <div className="relative w-full h-auto">
              <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                <Image
                  src="/certifications.png"
                  alt="Certificaciones Pyro Puff - GMP Certified, Non-GMO, Natural, Organic CBD, Vegan, Kosher, Made in the USA"
                  fill
                  className="object-contain"
                  priority
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

