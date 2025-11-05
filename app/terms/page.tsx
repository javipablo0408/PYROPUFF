export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-black">
            Pyro Puff Retailer Terms of Service
          </h1>
          <p className="text-gray-600">
            By becoming an authorized retailer of Pyro Puff, you ("Retailer") agree to the following Terms of Service. These terms govern the wholesale purchase, resale, and representation of Pyro Puff products.
          </p>
        </div>

        <div className="space-y-8 text-gray-700">
          <section>
            <h2 className="text-2xl font-bold mb-4 text-black">
              Authorization & Use of Brand
            </h2>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Retailers must be pre-approved and maintain active account status to sell Pyro Puff products.</li>
              <li>Retailers may use Pyro Puff trademarks, logos, and images solely to market and sell genuine Pyro Puff products.</li>
              <li>All marketing materials must be approved or provided by Pyro Puff.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-black">
              Order Requirements
            </h2>
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-3 text-black">
                Minimum Order Quantity (MOQ):
              </h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>All orders must be paid in full before shipping unless otherwise agreed in writing.</li>
                <li>We reserve the right to update pricing and MOQ with 30 days' written notice.</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-black">
              Payment Terms
            </h2>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Accepted payment methods: Credit card, bank transfer, etc.</li>
              <li>Returned checks or chargebacks may result in account suspension.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-black">
              Shipping & Delivery
            </h2>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Orders are shipped within business days of payment confirmation.</li>
              <li>Risk of loss passes to the Retailer upon delivery to carrier.</li>
              <li>Shipping costs and duties are the Retailer's responsibility unless otherwise agreed.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-black">
              Returns & Damages
            </h2>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>All sales are final unless products are defective or damaged in transit.</li>
              <li>Claims for damaged or defective items must be submitted within 10 days of receipt with photos and proof of purchase.</li>
              <li>Approved returns will receive store credit or replacement, not refunds.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-black">
              Resale Policy
            </h2>
            <p>
              Retailers must not engage in price gouging or significantly undercut MSRP.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-black">
              Account Suspension & Termination
            </h2>
            <p className="mb-4">
              Pyro Puff reserves the right to suspend or terminate retailer accounts for:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Breach of these terms</li>
              <li>Unauthorized resale or brand misuse</li>
              <li>Repeated customer complaints or unprofessional conduct</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-black">
              Intellectual Property
            </h2>
            <p>
              All intellectual property rights remain the sole property of Pyro Puff. No license is granted beyond what is expressly stated in this agreement.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-black">
              Limitation of Liability
            </h2>
            <p>
              Pyro Puff is not liable for any indirect, incidental, or consequential damages related to the use or resale of our products.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-black">
              Amendments
            </h2>
            <p>
              Pyro Puff reserves the right to update these terms at any time. Retailers will be notified of any changes in advance.
            </p>
          </section>

          <section className="bg-gray-50 rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4 text-black">
              Contact Us
            </h2>
            <p className="mb-4">
              If you have any questions about these Terms of Service, please contact us at:
            </p>
            <div className="space-y-2">
              <p><strong>Email:</strong> kevin@pyropuff.com</p>
              <p><strong>Phone:</strong> +27 61 783 0721</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

