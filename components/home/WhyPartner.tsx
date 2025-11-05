import {
  ChartBarIcon,
  ShieldCheckIcon,
  TruckIcon,
  CurrencyDollarIcon,
} from "@heroicons/react/24/outline";

const benefits = [
  {
    icon: ChartBarIcon,
    title: "Guaranteed Growth",
    description: "Increase your sales with high-demand products and premium quality.",
  },
  {
    icon: ShieldCheckIcon,
    title: "Official Support",
    description: "Access to marketing materials and dedicated support for retailers.",
  },
  {
    icon: TruckIcon,
    title: "Fast Shipping",
    description: "Optimized logistics to ensure you receive your products on time.",
  },
  {
    icon: CurrencyDollarIcon,
    title: "Competitive Prices",
    description: "Attractive profit margins for your business.",
  },
];

export function WhyPartner() {
  return (
    <section className="py-16 bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-4xl font-bold text-center mb-12 text-white">
          Why Partner with Pyro Puff?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="bg-gray-900 p-6 rounded-lg shadow-lg text-center hover:shadow-xl transition-shadow"
            >
              <div className="flex justify-center mb-4">
                <div className="bg-orange-500 p-3 rounded-full">
                  <benefit.icon className="h-8 w-8 text-white" />
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-white">
                {benefit.title}
              </h3>
              <p className="text-gray-300">{benefit.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}


