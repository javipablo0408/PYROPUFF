"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import {
  ChartBarIcon,
  ShoppingBagIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
} from "@heroicons/react/24/outline";

export function AdminDashboard() {
  const [stats, setStats] = useState({
    products: 0,
    orders: 0,
    customers: 0,
    revenue: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    try {
      // Contar productos
      const { count: productsCount } = await supabase
        .from("products")
        .select("*", { count: "exact", head: true });
      
      // Contar pedidos
      const { count: ordersCount } = await supabase
        .from("orders")
        .select("*", { count: "exact", head: true });
      
      // Contar clientes
      const { count: customersCount } = await supabase
        .from("users_extension")
        .select("*", { count: "exact", head: true });
      
      // Calcular ingresos (simplificado)
      const { data: orders } = await supabase
        .from("orders")
        .select("total")
        .eq("status", "completed");
      
      const revenue = orders?.reduce((sum, order) => sum + (order.total || 0), 0) || 0;
      
      setStats({
        products: productsCount || 0,
        orders: ordersCount || 0,
        customers: customersCount || 0,
        revenue,
      });
    } catch (error) {
      console.error("Error loading stats:", error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <p className="text-center text-black">Loading statistics...</p>;
  }

  const statCards = [
    {
      title: "Products",
      value: stats.products,
      icon: ShoppingBagIcon,
      href: "/admin/products",
      color: "bg-blue-500",
    },
    {
      title: "Orders",
      value: stats.orders,
      icon: ChartBarIcon,
      href: "/admin/orders",
      color: "bg-green-500",
    },
    {
      title: "Customers",
      value: stats.customers,
      icon: UserGroupIcon,
      href: "/admin/customers",
      color: "bg-purple-500",
    },
    {
      title: "Revenue",
      value: `R${stats.revenue.toFixed(2)}`,
      icon: CurrencyDollarIcon,
      href: "/admin/orders",
      color: "bg-yellow-500",
    },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <Link
            key={stat.title}
            href={stat.href}
            className="bg-pyro-gray p-6 rounded-lg hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-black">{stat.title}</p>
                <p className="text-3xl font-bold text-pyro-black mt-2">{stat.value}</p>
              </div>
              <div className={`${stat.color} p-3 rounded-full`}>
                <stat.icon className="h-8 w-8 text-white" />
              </div>
            </div>
          </Link>
        ))}
      </div>
      
      <div className="bg-pyro-gray p-6 rounded-lg">
        <h2 className="text-xl font-semibold text-pyro-black mb-4">Quick Access</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link
            href="/admin/products"
            className="bg-white p-4 rounded-lg hover:shadow-md transition-shadow border border-gray-200"
          >
            <h3 className="font-semibold text-pyro-black mb-1">Products</h3>
            <p className="text-sm text-black">Manage products, stock and prices</p>
          </Link>
          <Link
            href="/admin/categories"
            className="bg-white p-4 rounded-lg hover:shadow-md transition-shadow border border-gray-200"
          >
            <h3 className="font-semibold text-pyro-black mb-1">Categories</h3>
            <p className="text-sm text-black">Organize products by categories</p>
          </Link>
          <Link
            href="/admin/coupons"
            className="bg-white p-4 rounded-lg hover:shadow-md transition-shadow border border-gray-200"
          >
            <h3 className="font-semibold text-pyro-black mb-1">Coupons</h3>
            <p className="text-sm text-black">Create and manage discount codes</p>
          </Link>
          <Link
            href="/admin/orders"
            className="bg-white p-4 rounded-lg hover:shadow-md transition-shadow border border-gray-200"
          >
            <h3 className="font-semibold text-pyro-black mb-1">Orders</h3>
            <p className="text-sm text-black">Manage and update orders</p>
          </Link>
          <Link
            href="/admin/customers"
            className="bg-white p-4 rounded-lg hover:shadow-md transition-shadow border border-gray-200"
          >
            <h3 className="font-semibold text-pyro-black mb-1">Customers</h3>
            <p className="text-sm text-black">Manage customers and their roles</p>
          </Link>
          <Link
            href="/admin/invoices"
            className="bg-white p-4 rounded-lg hover:shadow-md transition-shadow border border-gray-200"
          >
            <h3 className="font-semibold text-pyro-black mb-1">Invoices</h3>
            <p className="text-sm text-black">View and manage invoices</p>
          </Link>
        </div>
      </div>
    </div>
  );
}

