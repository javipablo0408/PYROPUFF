"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { CartDrawer } from "@/components/cart/CartDrawer";
import {
  Bars3Icon,
  XMarkIcon,
  ShoppingCartIcon,
  UserIcon,
} from "@heroicons/react/24/outline";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [cartCount, setCartCount] = useState(0);
  const pathname = usePathname();

  useEffect(() => {
    checkUser();
    checkCart();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      checkUser();
      checkCart();
    });

    // Escuchar eventos de actualización del carrito
    const handleCartUpdate = () => {
      checkCart();
    };
    
    window.addEventListener("cartUpdated", handleCartUpdate);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener("cartUpdated", handleCartUpdate);
    };
  }, []);

  async function checkUser() {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
    
    // Si hay usuario, verificar su rol
    if (user) {
      const { data: profile } = await supabase
        .from("users_extension")
        .select("role")
        .eq("id", user.id)
        .single();
      
      setUserRole(profile?.role || null);
    } else {
      setUserRole(null);
    }
  }

  async function checkCart() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        const { data: cart } = await supabase
          .from("carts")
          .select("id")
          .eq("user_id", session.user.id)
          .maybeSingle();
        
        if (cart) {
          const { count } = await supabase
            .from("cart_items")
            .select("*", { count: "exact", head: true })
            .eq("cart_id", cart.id);
          
          setCartCount(count || 0);
        } else {
          setCartCount(0);
        }
      } else {
        const guestToken = localStorage.getItem("guest_token");
        if (guestToken) {
          const { data: cart } = await supabase
            .from("carts")
            .select("id")
            .eq("guest_token", guestToken)
            .maybeSingle();
          
          if (cart) {
            const { count } = await supabase
              .from("cart_items")
              .select("*", { count: "exact", head: true })
              .eq("cart_id", cart.id);
            
            setCartCount(count || 0);
          } else {
            setCartCount(0);
          }
        } else {
          setCartCount(0);
        }
      }
    } catch (error) {
      console.error("Error checking cart:", error);
      setCartCount(0);
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    setUser(null);
    window.location.href = "/";
  }

  const navLinks: Array<{ href: string; label: string }> = [];

  return (
    <>
      <nav className="bg-black text-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center">
              <Link href="/" className="flex items-center h-16">
                <Image
                  src="/logo.png"
                  alt="Pyro Puff"
                  width={200}
                  height={64}
                  className="h-16 w-auto object-contain"
                  priority
                  unoptimized={false}
                />
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`${
                    pathname === link.href
                      ? "text-orange-500"
                      : "text-gray-300 hover:text-orange-500"
                  } transition-colors`}
                >
                  {link.label}
                </Link>
              ))}
              {userRole === "admin" && (
                <Link
                  href="/admin"
                  className={`${
                    pathname === "/admin"
                      ? "text-orange-500"
                      : "text-gray-300 hover:text-orange-500"
                  } transition-colors font-medium`}
                >
                  Admin
                </Link>
              )}
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 text-gray-300 hover:text-orange-500 transition-colors"
              >
                <ShoppingCartIcon className="h-6 w-6" />
                {cartCount > 0 && (
                  <span className="absolute top-0 right-0 bg-orange-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </button>

              {user ? (
                <div className="hidden md:flex items-center space-x-4">
                  <Link
                    href={userRole === "admin" ? "/admin" : "/account"}
                    className="p-2 text-gray-300 hover:text-orange-500 transition-colors"
                    title={userRole === "admin" ? "Admin Panel" : "My Account"}
                  >
                    <UserIcon className="h-6 w-6" />
                  </Link>
                  {user && (
                    <button
                      onClick={handleLogout}
                      className="text-gray-300 hover:text-orange-500 transition-colors"
                    >
                      Sign Out
                    </button>
                  )}
                </div>
              ) : (
                <div className="hidden md:flex items-center space-x-4">
                  <Link
                    href="/login"
                    className="text-pyro-gray hover:text-pyro-gold transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    className="bg-orange-500 text-white px-4 py-2 rounded-md font-semibold hover:bg-opacity-90 transition-colors"
                  >
                    Sign Up
                  </Link>
                </div>
              )}

              {/* Mobile menu button */}
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="md:hidden p-2 text-gray-300 hover:text-orange-500"
              >
                {isOpen ? (
                  <XMarkIcon className="h-6 w-6" />
                ) : (
                  <Bars3Icon className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden bg-black border-t border-gray-800">
            <div className="px-4 pt-2 pb-3 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    pathname === link.href
                      ? "text-orange-500 bg-gray-900"
                      : "text-gray-300 hover:text-orange-500 hover:bg-gray-900"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              {user ? (
                <>
                  {userRole === "admin" && (
                    <Link
                      href="/admin"
                      onClick={() => setIsOpen(false)}
                      className={`block px-3 py-2 rounded-md text-base font-medium ${
                        pathname === "/admin"
                          ? "text-orange-500 bg-gray-900"
                          : "text-gray-300 hover:text-orange-500 hover:bg-gray-900"
                      }`}
                    >
                      Admin
                    </Link>
                  )}
                  <Link
                    href={userRole === "admin" ? "/admin" : "/account"}
                    onClick={() => setIsOpen(false)}
                    className={`block px-3 py-2 rounded-md text-base font-medium ${
                      pathname === "/account" || (userRole === "admin" && pathname === "/admin")
                        ? "text-orange-500 bg-gray-900"
                        : "text-gray-300 hover:text-orange-500 hover:bg-gray-900"
                    }`}
                  >
                    {userRole === "admin" ? "Panel Admin" : "Mi Cuenta"}
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-orange-500 hover:bg-gray-900"
                  >
                    Salir
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => setIsOpen(false)}
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-orange-500 hover:bg-gray-900"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setIsOpen(false)}
                    className="block px-3 py-2 rounded-md text-base font-medium bg-orange-500 text-white"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}


