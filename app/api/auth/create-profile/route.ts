import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabaseServer";

export async function POST(request: NextRequest) {
  try {
    const { userId, first_name, last_name, phone } = await request.json();
    
    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }
    
    const supabase = await createAdminClient();
    
    // Usar service_role para insertar sin problemas de RLS
    const { data, error } = await supabase
      .from("users_extension")
      .upsert({
        id: userId,
        first_name: first_name || null,
        last_name: last_name || null,
        phone: phone || null,
        role: "cliente",
      }, {
        onConflict: "id",
      })
      .select()
      .single();
    
    if (error) {
      console.error("Error creating profile:", error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ data, success: true });
  } catch (error: any) {
    console.error("Error in create-profile API:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

