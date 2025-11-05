"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

interface AuthGuardProps {
  children: React.ReactNode;
  requiredRole?: "admin" | "customer" | "wholesaler";
}

export function AuthGuard({ children, requiredRole }: AuthGuardProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      router.push("/login");
      return;
    }
    
    if (requiredRole) {
      const { data: profile } = await supabase
        .from("users_extension")
        .select("role")
        .eq("id", user.id)
        .single();
      
      if (profile?.role !== requiredRole) {
        router.push("/");
        return;
      }
    }
    
    setAuthorized(true);
    setLoading(false);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-pyro-white flex items-center justify-center">
        <p className="text-pyro-gray">Cargando...</p>
      </div>
    );
  }

  if (!authorized) {
    return null;
  }

  return <>{children}</>;
}

