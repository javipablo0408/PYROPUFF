import { requireAdmin } from "@/lib/auth";
import { AdminDashboard } from "@/components/admin/AdminDashboard";

export default async function AdminPage() {
  try {
    await requireAdmin();
  } catch (error) {
    // Si hay un error, redirigir a la página de diagnóstico
    return (
      <div className="min-h-screen bg-pyro-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-yellow-800 mb-2">You don't have access to the admin panel</h2>
            <p className="text-yellow-700 mb-4">
              Your user does not have administrator permissions. If you believe you should have access, verify your role in the database.
            </p>
            <a 
              href="/admin/debug" 
              className="inline-block bg-pyro-gold text-pyro-black px-4 py-2 rounded hover:bg-opacity-90"
            >
              View Diagnosis
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-pyro-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold mb-8 text-pyro-black">Admin Panel</h1>
        <AdminDashboard />
      </div>
    </div>
  );
}
