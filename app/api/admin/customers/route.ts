import { createAdminClient } from "@/lib/supabaseServer";
import { requireAdmin } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await requireAdmin();

    const supabase = await createAdminClient();

    // Obtener usuarios de auth.users usando service_role
    const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers();

    if (usersError) {
      console.error("Error fetching users:", usersError);
      return NextResponse.json(
        { error: "Error al obtener usuarios", details: usersError.message },
        { status: 500 }
      );
    }

    // Obtener perfiles de users_extension
    const { data: profiles, error: profilesError } = await supabase
      .from("users_extension")
      .select("*")
      .order("created_at", { ascending: false });

    if (profilesError) {
      console.error("Error fetching profiles:", profilesError);
      return NextResponse.json(
        { error: "Error al obtener perfiles", details: profilesError.message },
        { status: 500 }
      );
    }

    // Combinar usuarios con sus perfiles
    const customers = (profiles || []).map((profile) => {
      const user = users.find((u) => u.id === profile.id);
      return {
        ...profile,
        email: user?.email || null,
      };
    });

    return NextResponse.json({ customers });
  } catch (error: any) {
    console.error("Error in GET /api/admin/customers:", error);
    return NextResponse.json(
      { error: "Error al cargar clientes", details: error.message },
      { status: 500 }
    );
  }
}

