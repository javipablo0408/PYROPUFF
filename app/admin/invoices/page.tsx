import { requireAdmin } from "@/lib/auth";
import { InvoicesManager } from "@/components/admin/InvoicesManager";

export default async function AdminInvoicesPage() {
  await requireAdmin();

  return (
    <div className="min-h-screen bg-pyro-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-4xl font-bold text-pyro-black mb-2">Invoice Management</h1>
          <p className="text-black">View and manage issued invoices</p>
        </div>
        <InvoicesManager />
      </div>
    </div>
  );
}

