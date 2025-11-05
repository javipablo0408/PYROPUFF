"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { AdminTable } from "./AdminTable";

interface Order {
  id: string;
  user_id: string | null;
  guest_token: string | null;
  total: number;
  subtotal: number;
  shipping_cost: number;
  status: string;
  payment_status: string;
  payment_method: string | null;
  created_at: string;
  updated_at: string;
}

export function OrdersManager() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  async function loadOrders() {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error("Error loading orders:", error);
      alert("Error loading orders");
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusUpdate(orderId: string, newStatus: string) {
    try {
      const { error } = await supabase
        .from("orders")
        .update({ status: newStatus })
        .eq("id", orderId);

      if (error) throw error;
      alert("Order status updated");
      loadOrders();
    } catch (error: any) {
      console.error("Error updating order:", error);
      alert(`Error: ${error.message}`);
    }
  }

  const columns = [
    {
      key: "id",
      label: "Order",
      render: (value: string) => (
        <div className="font-mono text-sm text-pyro-black">
          #{value.slice(0, 8).toUpperCase()}
        </div>
      ),
    },
    {
      key: "total",
      label: "Total",
      render: (value: number) => (
        <div className="font-bold text-pyro-black">R{value.toFixed(2)}</div>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (value: string, row: Order) => (
        <select
          value={value}
          onChange={(e) => handleStatusUpdate(row.id, e.target.value)}
          className={`px-2 py-1 rounded text-xs border-0 ${
            value === "completado" ? "bg-green-100 text-green-800" :
            value === "pendiente" ? "bg-yellow-100 text-yellow-800" :
            value === "cancelado" ? "bg-red-100 text-red-800" :
            "bg-gray-100 text-gray-800"
          }`}
        >
          <option value="pendiente">Pending</option>
          <option value="procesando">Processing</option>
          <option value="enviado">Shipped</option>
          <option value="completado">Completed</option>
          <option value="cancelado">Cancelled</option>
        </select>
      ),
    },
    {
      key: "payment_status",
      label: "Payment",
      render: (value: string) => (
        <span className={`px-2 py-1 rounded text-xs ${
          value === "pagado" ? "bg-green-100 text-green-800" :
          value === "pendiente" ? "bg-yellow-100 text-yellow-800" :
          "bg-red-100 text-red-800"
        }`}>
          {value}
        </span>
      ),
    },
    {
      key: "created_at",
      label: "Date",
      render: (value: string) => (
        <span className="text-sm text-black">
          {new Date(value).toLocaleDateString("es-ES")}
        </span>
      ),
    },
  ];

  if (loading) {
    return <p className="text-center text-black">Loading orders...</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-pyro-black">
          Order List ({orders.length})
        </h2>
      </div>

      {orders.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <p className="text-black">No orders registered</p>
        </div>
      ) : (
        <AdminTable data={orders} columns={columns} />
      )}
    </div>
  );
}

