"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { AdminTable } from "./AdminTable";

interface Invoice {
  id: string;
  order_id: string | null;
  invoice_number: string | null;
  issued_at: string;
  pdf_path: string | null;
  order?: {
    id: string;
    total: number;
    status: string;
    user?: {
      email: string;
    };
  } | null;
}

export function InvoicesManager() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInvoices();
  }, []);

  async function loadInvoices() {
    try {
      const { data, error } = await supabase
        .from("invoices")
        .select(`
          *,
          order:orders(
            id,
            total,
            status
          )
        `)
        .order("issued_at", { ascending: false });

      if (error) throw error;
      setInvoices(data || []);
    } catch (error) {
      console.error("Error loading invoices:", error);
      alert("Error loading invoices");
    } finally {
      setLoading(false);
    }
  }

  const columns = [
    {
      key: "invoice_number",
      label: "Invoice Number",
      render: (value: string | null, row: Invoice) => (
        <div className="font-mono font-medium text-pyro-black">
          {value || `INV-${row.id.slice(0, 8).toUpperCase()}`}
        </div>
      ),
    },
    {
      key: "order",
      label: "Order",
      render: (_: any, row: Invoice) => (
        <div>
          <div className="text-sm text-black">
            Order: {row.order_id ? row.order_id.slice(0, 8) : "N/A"}
          </div>
          {row.order && (
            <div className="text-xs text-black">
              Total: R{row.order.total?.toFixed(2) || "0.00"}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "issued_at",
      label: "Issue Date",
      render: (value: string) => (
        <span className="text-black">
          {new Date(value).toLocaleDateString("es-ES", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </span>
      ),
    },
    {
      key: "pdf_path",
      label: "PDF",
      render: (value: string | null) => (
        <div>
          {value ? (
            <a
              href={value}
              target="_blank"
              rel="noopener noreferrer"
              className="text-pyro-gold hover:underline text-sm"
            >
              View PDF
            </a>
          ) : (
            <span className="text-gray-400 text-sm">Not available</span>
          )}
        </div>
      ),
    },
  ];

  if (loading) {
    return <p className="text-center text-black">Loading invoices...</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-pyro-black">
          Invoice List ({invoices.length})
        </h2>
      </div>

      {invoices.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <p className="text-black">No invoices registered</p>
        </div>
      ) : (
        <AdminTable data={invoices} columns={columns} />
      )}
    </div>
  );
}
