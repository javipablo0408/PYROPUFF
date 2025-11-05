import { requireAdmin } from "@/lib/auth";
import { CouponsManager } from "@/components/admin/CouponsManager";

export default async function AdminCouponsPage() {
  await requireAdmin();

  return (
    <div className="min-h-screen bg-pyro-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-4xl font-bold text-pyro-black mb-2">Coupon Management</h1>
          <p className="text-black">Manage discount coupons</p>
        </div>
        <CouponsManager />
      </div>
    </div>
  );
}

