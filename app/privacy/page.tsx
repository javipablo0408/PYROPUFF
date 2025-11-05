export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-black">
            Privacy Policy
          </h1>
          <p className="text-gray-600">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        <div className="space-y-8 text-gray-700">
          <section>
            <p className="mb-4">
              This Privacy Policy describes how Pyro Puff collects, uses, shares, and protects your personal information when you visit our store, make a purchase, or interact with us online or offline.
            </p>
            <p>
              By using our services, you agree to the practices outlined below.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-black">
              Information We Collect
            </h2>
            <p className="mb-4">We collect the following types of personal information:</p>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold mb-2 text-black">
                  Information You Provide to Us:
                </h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Name</li>
                  <li>Email address</li>
                  <li>Phone number</li>
                  <li>Billing and shipping address</li>
                  <li>Date of birth (for age verification)</li>
                  <li>Payment information (processed securely by third-party providers)</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-2 text-black">
                  Information We Collect Automatically:
                </h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>IP address</li>
                  <li>Device and browser type</li>
                  <li>Pages visited and time spent on site (via cookies or analytics tools)</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-2 text-black">
                  Age Verification:
                </h3>
                <p>
                  We are committed to preventing underage sales. You must be at least 18 years old to purchase from us. We may use third-party tools to verify your age.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-black">
              How We Use Your Information
            </h2>
            <p className="mb-4">We use your personal information to:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Process and fulfill orders</li>
              <li>Verify your age and identity</li>
              <li>Provide customer service</li>
              <li>Send order updates and marketing communications (if you opt in)</li>
              <li>Improve our website and services</li>
              <li>Comply with legal requirements</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-black">
              How We Share Your Information
            </h2>
            <p className="mb-4">
              We do not sell your personal information.
            </p>
            <p className="mb-4">We may share your data with:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Payment processors (e.g., Stripe, Square)</li>
              <li>Shipping carriers (e.g., USPS, FedEx)</li>
              <li>Age verification services</li>
            </ul>
            <p className="mt-4">
              All third parties are required to handle your data securely and in compliance with applicable laws.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-black">
              Your Choices
            </h2>
            <p className="mb-4">You may:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Opt out of marketing emails at any time by clicking "unsubscribe"</li>
              <li>Access, update, or delete your personal data by contacting us</li>
              <li>Disable cookies through your browser settings (may affect site performance)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-black">
              Security
            </h2>
            <p>
              We implement appropriate technical and organizational measures to protect your information. However, no system is 100% secure. You are responsible for keeping your passwords and account information confidential.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-black">
              Data Retention
            </h2>
            <p>
              We retain your data only as long as necessary to fulfill the purposes outlined in this policy, comply with legal obligations, and enforce our agreements.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-black">
              Compliance with Laws
            </h2>
            <p className="mb-4">We comply with all applicable privacy laws, including:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>GDPR</li>
              <li>Age-restriction and tobacco/vape sales laws</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-black">
              Updates to This Policy
            </h2>
            <p>
              We may update this Privacy Policy at any time. The revised version will be posted here with the updated effective date. Continued use of our services means you accept any changes.
            </p>
          </section>

          <section className="bg-gray-50 rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4 text-black">
              Contact Us
            </h2>
            <p className="mb-4">
              If you have any questions or concerns about this Privacy Policy, please contact us at:
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

