import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/lib/supabaseServer";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
});

export async function POST(request: NextRequest) {
  try {
    const { orderId } = await request.json();
    
    if (!orderId) {
      return NextResponse.json({ error: "Order ID is required" }, { status: 400 });
    }
    
    const supabase = await createClient();
    
    // Obtener la orden
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select(`
        *,
        items:order_items(
          *,
          product:products(*)
        )
      `)
      .eq("id", orderId)
      .single();
    
    if (orderError || !order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    
    // Calcular total
    let total = 0;
    for (const item of order.items || []) {
      const { data: price } = await supabase
        .from("product_prices")
        .select("price")
        .eq("product_id", item.product_id)
        .eq("role", "customer")
        .single();
      
      if (price) {
        total += price.price * item.quantity;
      }
    }
    
    // Aplicar cupón si existe
    if (order.coupon_id) {
      const { data: coupon } = await supabase
        .from("coupons")
        .select("*")
        .eq("id", order.coupon_id)
        .single();
      
      if (coupon && coupon.discount_percentage) {
        total = total * (1 - coupon.discount_percentage / 100);
      }
    }
    
    // Crear sesión de Stripe
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: (order.items || []).map((item: any) => ({
        price_data: {
          currency: "usd",
          product_data: {
            name: item.product?.name || "Producto",
            description: item.product?.description || "",
          },
          unit_amount: Math.round(
            (item.product?.price || 0) * 100
          ),
        },
        quantity: item.quantity,
      })),
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success?orderId=${orderId}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout?error=canceled`,
      metadata: {
        order_id: orderId,
      },
    });
    
    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json(
      { error: error.message || "Error processing checkout" },
      { status: 500 }
    );
  }
}


