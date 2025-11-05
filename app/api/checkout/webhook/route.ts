import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createAdminClient } from "@/lib/supabaseServer";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-11-20.acacia",
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature")!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const supabase = await createAdminClient();

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const orderId = session.metadata?.order_id;

        if (orderId) {
          // Actualizar orden
          await supabase
            .from("orders")
            .update({ status: "processing" })
            .eq("id", orderId);

          // Crear transacción
          await supabase.from("transactions").insert({
            order_id: orderId,
            payment_method: "stripe",
            amount: (session.amount_total || 0) / 100,
            currency: session.currency || "usd",
            status: "completed",
            stripe_payment_intent_id: session.payment_intent as string,
          });

          // Cerrar carrito
          const { data: order } = await supabase
            .from("orders")
            .select("user_id, guest_token")
            .eq("id", orderId)
            .single();

          if (order?.user_id) {
            await supabase
              .from("carts")
              .update({ status: "completed" })
              .eq("user_id", order.user_id)
              .eq("status", "active");
          } else if (order?.guest_token) {
            await supabase
              .from("carts")
              .update({ status: "completed" })
              .eq("guest_token", order.guest_token)
              .eq("status", "active");
          }
        }
        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        // Actualizar transacción si existe
        await supabase
          .from("transactions")
          .update({ status: "failed" })
          .eq("stripe_payment_intent_id", paymentIntent.id);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}


