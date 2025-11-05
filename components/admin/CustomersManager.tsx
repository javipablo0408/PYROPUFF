"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { AdminTable } from "./AdminTable";
import { PencilIcon } from "@heroicons/react/24/outline";

interface Customer {
  id: string;
  role: "cliente" | "mayorista" | "admin";
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  birth_date: string | null;
  created_at: string;
  email?: string;
}

export function CustomersManager() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    phone: "",
    role: "cliente" as "cliente" | "mayorista" | "admin",
    birth_date: "",
  });

  useEffect(() => {
    loadCustomers();
  }, []);

  async function loadCustomers() {
    try {
      // Usar API route para obtener clientes con emails
      const response = await fetch("/api/admin/customers");
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`);
      }

      const { customers } = await response.json();
      setCustomers(customers || []);
    } catch (error: any) {
      console.error("Error loading customers:", error);
      console.error("Error details:", {
        message: error.message,
        stack: error.stack,
      });
      
      // Fallback: solo cargar desde users_extension sin email
      try {
        const { data: profiles, error: fallbackError } = await supabase
          .from("users_extension")
          .select("*")
          .order("created_at", { ascending: false });

        if (fallbackError) throw fallbackError;
        setCustomers(profiles || []);
        alert("Error loading emails. Showing profiles only.");
      } catch (fallbackError: any) {
        console.error("Fallback error:", fallbackError);
        alert(`Error loading customers: ${fallbackError.message || 'Unknown error'}`);
      }
    } finally {
      setLoading(false);
    }
  }

  function handleEdit(customer: Customer) {
    setEditingCustomer(customer);
    setFormData({
      first_name: customer.first_name || "",
      last_name: customer.last_name || "",
      phone: customer.phone || "",
      role: customer.role,
      birth_date: customer.birth_date || "",
    });
    setShowForm(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!editingCustomer) return;

    try {
      const updateData: any = {
        first_name: formData.first_name || null,
        last_name: formData.last_name || null,
        phone: formData.phone || null,
        role: formData.role,
        birth_date: formData.birth_date || null,
      };

      const { error } = await supabase
        .from("users_extension")
        .update(updateData)
        .eq("id", editingCustomer.id);

      if (error) throw error;
      alert("Customer updated successfully");
      setShowForm(false);
      loadCustomers();
    } catch (error: any) {
      console.error("Error saving customer:", error);
      alert(`Error: ${error.message}`);
    }
  }

  const columns = [
    {
      key: "email",
      label: "Email",
      render: (value: string | undefined, row: Customer) => (
        <div className="font-medium text-pyro-black">
          {value || (
            <span className="text-black italic">
              {row.id.slice(0, 8)}...
            </span>
          )}
        </div>
      ),
    },
    {
      key: "name",
      label: "Name",
      render: (_: any, row: Customer) => (
        <div className="text-black">
          {row.first_name || row.last_name
            ? `${row.first_name || ""} ${row.last_name || ""}`.trim()
            : "No name"}
        </div>
      ),
    },
    {
      key: "phone",
      label: "Phone",
      render: (value: string | null) => (
        <span className="text-sm text-black">{value || "-"}</span>
      ),
    },
    {
      key: "role",
      label: "Role",
      render: (value: string) => (
        <span className={`px-2 py-1 rounded text-xs capitalize ${
          value === "admin" ? "bg-red-100 text-red-800" :
          value === "mayorista" ? "bg-blue-100 text-blue-800" :
          "bg-gray-100 text-gray-800"
        }`}>
          {value}
        </span>
      ),
    },
    {
      key: "created_at",
      label: "Registration Date",
      render: (value: string) => (
        <span className="text-sm text-black">
          {new Date(value).toLocaleDateString("es-ES")}
        </span>
      ),
    },
  ];

  if (loading) {
    return <p className="text-center text-black">Loading customers...</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-pyro-black">
          Customer List ({customers.length})
        </h2>
      </div>

      {showForm && editingCustomer && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4 text-pyro-black">
            Edit Customer
          </h3>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-pyro-black mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pyro-gold"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-pyro-black mb-1">
                  Apellido
                </label>
                <input
                  type="text"
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pyro-gold"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-pyro-black mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pyro-gold"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-pyro-black mb-1">
                  Role *
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as "cliente" | "mayorista" | "admin" })}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pyro-gold"
                >
                  <option value="cliente">Customer</option>
                  <option value="mayorista">Wholesaler</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-pyro-black mb-1">
                  Birth Date
                </label>
                <input
                  type="date"
                  value={formData.birth_date}
                  onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pyro-gold"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                className="bg-pyro-gold text-pyro-black px-6 py-2 rounded hover:bg-opacity-90"
              >
                Update
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="bg-gray-200 text-gray-700 px-6 py-2 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <AdminTable
        data={customers}
        columns={columns}
        onEdit={handleEdit}
      />
    </div>
  );
}

