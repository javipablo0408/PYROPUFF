import { requireAuth } from "@/lib/auth";
import Link from "next/link";

export default async function OrdersPage() {
  const user = await requireAuth();
  const { createClient } = await import("@/lib/supabaseServer");
  const supabase = await createClient();
  
  const { data: orders } = await supabase
    .from("orders")
    .select(`
      *,
      items:order_items(
        *,
        product:products(name, slug)
      )
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });
  
  return (
    <div className="min-h-screen bg-pyro-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold mb-8 text-pyro-black">Mis Pedidos</h1>
        
        {!orders || orders.length === 0 ? (
          <div className="bg-pyro-gray p-8 rounded-lg text-center">
            <p className="text-pyro-gray mb-4">No tienes pedidos aún.</p>
            <Link
              href="/shop"
              className="inline-block bg-pyro-gold text-pyro-black px-6 py-3 rounded-lg font-semibold hover:bg-opacity-90 transition-colors"
            >
              Comenzar a Comprar
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order: any) => (
              <div key={order.id} className="bg-pyro-gray p-6 rounded-lg">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-pyro-black">
                      Pedido #{order.id.slice(0, 8)}
                    </h3>
                    <p className="text-sm text-pyro-gray">
                      {new Date(order.created_at).toLocaleDateString("es-ES", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      order.status === "completed" ? "bg-green-100 text-green-800" :
                      order.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                      "bg-gray-100 text-gray-800"
                    }`}>
                      {order.status === "completed" ? "Completado" :
                       order.status === "pending" ? "Pendiente" :
                       order.status === "pending_payment" ? "Pago Pendiente" :
                       order.status}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  {order.items?.map((item: any) => (
                    <div key={item.id} className="flex justify-between text-pyro-gray">
                      <span>
                        {item.product?.name} x {item.quantity}
                      </span>
                      <span>${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-300 flex justify-between items-center">
                  <span className="font-semibold text-pyro-black">Total:</span>
                  <span className="text-xl font-bold text-pyro-gold">
                    ${order.total?.toFixed(2) || "0.00"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


