import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-black text-gray-400 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-orange-500 text-xl font-bold mb-4">
              Pyro Puff
            </h3>
            <p className="text-sm">
              Grow Your Business – Become an Official Pyro Puff Retailer
            </p>
          </div>
          
          <div>
            <h4 className="text-white font-semibold mb-4">Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="hover:text-orange-500 transition-colors">
                  Home
                </Link>
              </li>

              <li>
                <Link href="/account" className="hover:text-orange-500 transition-colors">
                  My Account
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-white font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/contact" className="hover:text-orange-500 transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="hover:text-orange-500 transition-colors">
                  Shipping
                </Link>
              </li>
              <li>
                <Link href="/returns" className="hover:text-orange-500 transition-colors">
                  Returns
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-white font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/privacy" className="hover:text-orange-500 transition-colors">
                  Privacy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-orange-500 transition-colors">
                  Terms
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-gray-800 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} Pyro Puff. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}


