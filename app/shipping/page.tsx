export default function ShippingPage() {
  return (
    <div className="min-h-screen bg-white py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-black">
            Shipping Information
          </h1>
        </div>

        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-bold mb-4 text-black">
              Nationwide Delivery – Fast, Reliable, and Secure
            </h2>
            <p className="text-gray-700 mb-6">
              At Pyro Puff, we offer nationwide shipping across South Africa to ensure that your favorite vape products get to you quickly and safely.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-black">
              Delivery Options & Timeframes
            </h2>
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h3 className="text-xl font-semibold mb-3 text-black">
                Standard Courier Delivery (2–4 business days)
              </h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>Delivery to all major cities and towns within South Africa</li>
                <li>Rural or outlying areas may take an additional 1–2 business days</li>
                <li>Courier partners: The Courier Guy, Fastway, Aramex</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-black">
              Shipping Rates
            </h2>
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start">
                  <span className="font-semibold text-black mr-2">Flat Rate:</span>
                  <span>R99 nationwide</span>
                </li>
                <li className="flex items-start">
                  <span className="font-semibold text-black mr-2">Free Shipping:</span>
                  <span>On all orders over R1000</span>
                </li>
                <li className="text-sm text-gray-600">
                  Shipping cost is calculated and displayed at checkout
                </li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-black">
              Tracking Your Order
            </h2>
            <p className="text-gray-700">
              Once your order has been packed and shipped, you'll receive a tracking number via email or SMS. You can use this to monitor the status of your delivery in real time.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-black">
              Age Verification
            </h2>
            <p className="text-gray-700">
              We are committed to responsible vaping. All customers must be 18 years or older. Age verification may be required before delivery.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-black">
              Order Processing
            </h2>
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <ul className="space-y-2 text-gray-700">
                <li>Orders placed before 1 PM on business days are usually dispatched the same day</li>
                <li>Orders placed after 1 PM, on weekends, or public holidays will be processed the next business day</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-black">
              Important Notes
            </h2>
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
              <ul className="space-y-2 text-gray-700">
                <li>Please ensure your address and contact details are correct to avoid delays</li>
                <li>We do not ship internationally at this time</li>
                <li>Vape products will not be left unattended—someone must be present to receive and sign for delivery.</li>
              </ul>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

