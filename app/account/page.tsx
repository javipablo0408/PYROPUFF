import { requireAuth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function AccountPage() {
  const user = await requireAuth();

  return (
    <div className="min-h-screen bg-pyro-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold mb-8 text-pyro-black">My Account</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <aside className="md:col-span-1">
            <nav className="bg-pyro-gray p-6 rounded-lg space-y-2">
              <Link
                href="/account"
                className="block py-2 px-4 bg-pyro-gold text-pyro-black rounded-md font-semibold"
              >
                Profile
              </Link>
              <Link
                href="/account/orders"
                className="block py-2 px-4 text-pyro-black hover:bg-pyro-white rounded-md transition-colors"
              >
                Orders
              </Link>
              <Link
                href="/account/addresses"
                className="block py-2 px-4 text-pyro-black hover:bg-pyro-white rounded-md transition-colors"
              >
                Addresses
              </Link>
            </nav>
          </aside>
          
          <main className="md:col-span-2">
            <div className="bg-pyro-gray p-6 rounded-lg">
              <h2 className="text-2xl font-bold mb-4 text-pyro-black">Profile Information</h2>
              <ProfileInfo userId={user.id} />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

async function ProfileInfo({ userId }: { userId: string }) {
  const { createClient } = await import("@/lib/supabaseServer");
  const supabase = await createClient();
  
  const { data: profile } = await supabase
    .from("users_extension")
    .select("*")
    .eq("id", userId)
    .single();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-pyro-black mb-1">
          Name
        </label>
        <p className="text-pyro-gray">
          {profile?.first_name} {profile?.last_name}
        </p>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-pyro-black mb-1">
          Email
        </label>
        <p className="text-pyro-gray">{user?.email}</p>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-pyro-black mb-1">
          Phone
        </label>
        <p className="text-pyro-gray">{profile?.phone || "Not provided"}</p>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-pyro-black mb-1">
          Role
        </label>
        <p className="text-pyro-gray capitalize">{profile?.role || "customer"}</p>
      </div>
    </div>
  );
}

