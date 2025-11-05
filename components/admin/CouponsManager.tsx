"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { AdminTable } from "./AdminTable";
import { PlusIcon } from "@heroicons/react/24/outline";

interface Coupon {
  id: string;
  code: string;
  type: "porcentaje" | "fijo";
  value: number;
  min_order: number | null;
  max_uses: number | null;
  used_count: number;
  starts_at: string;
  expires_at: string | null;
  active: boolean;
  created_at: string;
}

export function CouponsManager() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [formData, setFormData] = useState({
    code: "",
    type: "porcentaje" as "porcentaje" | "fijo",
    value: 0,
    min_order: "",
    max_uses: "",
    starts_at: new Date().toISOString().split("T")[0],
    expires_at: "",
    active: true,
  });

  useEffect(() => {
    loadCoupons();
  }, []);

  async function loadCoupons() {
    try {
      const { data, error } = await supabase
        .from("coupons")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setCoupons(data || []);
    } catch (error) {
      console.error("Error loading coupons:", error);
      alert("Error loading coupons");
    } finally {
      setLoading(false);
    }
  }

  function handleEdit(coupon: Coupon) {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
      min_order: coupon.min_order?.toString() || "",
      max_uses: coupon.max_uses?.toString() || "",
      starts_at: coupon.starts_at ? new Date(coupon.starts_at).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
      expires_at: coupon.expires_at ? new Date(coupon.expires_at).toISOString().split("T")[0] : "",
      active: coupon.active,
    });
    setShowForm(true);
  }

  function handleNew() {
    setEditingCoupon(null);
    setFormData({
      code: "",
      type: "porcentaje",
      value: 0,
      min_order: "",
      max_uses: "",
      starts_at: new Date().toISOString().split("T")[0],
      expires_at: "",
      active: true,
    });
    setShowForm(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    try {
      const couponData: any = {
        code: formData.code.toUpperCase(),
        type: formData.type,
        value: parseFloat(formData.value.toString()),
        min_order: formData.min_order ? parseFloat(formData.min_order) : 0,
        max_uses: formData.max_uses ? parseInt(formData.max_uses) : null,
        starts_at: formData.starts_at ? new Date(formData.starts_at).toISOString() : new Date().toISOString(),
        expires_at: formData.expires_at ? new Date(formData.expires_at).toISOString() : null,
        active: formData.active,
      };

      if (editingCoupon) {
        const { error } = await supabase
          .from("coupons")
          .update(couponData)
          .eq("id", editingCoupon.id);

        if (error) throw error;
        alert("Coupon updated successfully");
      } else {
        couponData.used_count = 0;
        const { error } = await supabase
          .from("coupons")
          .insert(couponData);

        if (error) throw error;
        alert("Coupon created successfully");
      }

      setShowForm(false);
      loadCoupons();
    } catch (error: any) {
      console.error("Error saving coupon:", error);
      alert(`Error: ${error.message}`);
    }
  }

  async function handleDelete(coupon: Coupon) {
    if (!confirm(`Are you sure you want to delete coupon "${coupon.code}"?`)) return;

    try {
      const { error } = await supabase
        .from("coupons")
        .delete()
        .eq("id", coupon.id);

      if (error) throw error;
      alert("Coupon deleted successfully");
      loadCoupons();
    } catch (error: any) {
      console.error("Error deleting coupon:", error);
      alert(`Error: ${error.message}`);
    }
  }

  const columns = [
    {
      key: "code",
      label: "Code",
      render: (value: string) => (
        <div className="font-mono font-bold text-pyro-black">{value}</div>
      ),
    },
    {
      key: "type",
      label: "Type",
      render: (value: string, row: Coupon) => (
        <span className="text-black">
          {value === "porcentaje" ? `${row.value}%` : `$${row.value.toFixed(2)}`}
        </span>
      ),
    },
    {
      key: "used_count",
      label: "Uses",
      render: (value: number, row: Coupon) => (
        <span className="text-black">
          {value} / {row.max_uses || "∞"}
        </span>
      ),
    },
    {
      key: "expires_at",
      label: "Expires",
      render: (value: string | null) => (
        <span className="text-sm text-black">
          {value ? new Date(value).toLocaleDateString() : "No expiration"}
        </span>
      ),
    },
    {
      key: "active",
      label: "Status",
      render: (value: boolean) => (
        <span className={`px-2 py-1 rounded text-xs ${value ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
          {value ? "Active" : "Inactive"}
        </span>
      ),
    },
  ];

  if (loading) {
    return <p className="text-center text-black">Loading coupons...</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-pyro-black">Coupon List</h2>
        <button
          onClick={handleNew}
          className="bg-pyro-gold text-pyro-black px-4 py-2 rounded hover:bg-opacity-90 flex items-center gap-2"
        >
          <PlusIcon className="h-5 w-5" />
          New Coupon
        </button>
      </div>

      {showForm && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4 text-pyro-black">
            {editingCoupon ? "Edit Coupon" : "New Coupon"}
          </h3>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-pyro-black mb-1">
                  Code *
                </label>
                <input
                  type="text"
                  required
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pyro-gold font-mono"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-pyro-black mb-1">
                  Type *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as "porcentaje" | "fijo" })}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pyro-gold"
                >
                  <option value="porcentaje">Percentage</option>
                  <option value="fijo">Fixed</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-pyro-black mb-1">
                  Value *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: parseFloat(e.target.value) || 0 })}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pyro-gold"
                />
                <p className="text-xs text-black mt-1">
                  {formData.type === "porcentaje" ? "Discount percentage (0-100)" : "Fixed discount in R"}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-pyro-black mb-1">
                  Min Order (R)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.min_order}
                  onChange={(e) => setFormData({ ...formData, min_order: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pyro-gold"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-pyro-black mb-1">
                  Max Uses
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.max_uses}
                  onChange={(e) => setFormData({ ...formData, max_uses: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pyro-gold"
                  placeholder="No limit"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-pyro-black mb-1">
                  Start Date *
                </label>
                <input
                  type="date"
                  required
                  value={formData.starts_at}
                  onChange={(e) => setFormData({ ...formData, starts_at: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pyro-gold"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-pyro-black mb-1">
                  Expiration Date
                </label>
                <input
                  type="date"
                  value={formData.expires_at}
                  onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pyro-gold"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-pyro-black mb-1">
                  Status
                </label>
                <select
                  value={formData.active.toString()}
                  onChange={(e) => setFormData({ ...formData, active: e.target.value === "true" })}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pyro-gold"
                >
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                className="bg-pyro-gold text-pyro-black px-6 py-2 rounded hover:bg-opacity-90"
              >
                {editingCoupon ? "Update" : "Create"}
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
        data={coupons}
        columns={columns}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
}

