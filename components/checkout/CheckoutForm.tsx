"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

interface CheckoutFormProps {
  addresses: any[];
  user: any;
  onAddressAdded: () => void;
}

export function CheckoutForm({ addresses, user, onAddressAdded }: CheckoutFormProps) {
  const router = useRouter();
  const [selectedAddress, setSelectedAddress] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<"stripe" | "transfer">("stripe");
  const [couponCode, setCouponCode] = useState("");
  const [coupon, setCoupon] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [showNewAddress, setShowNewAddress] = useState(false);
  
  const [newAddress, setNewAddress] = useState({
    full_name: "",
    address_line: "",
    city: "",
    province: "",
    postal_code: "",
    country: "",
    phone: "",
    type: "envio" as "envio" | "facturacion",
    is_default: false,
  });

  async function handleApplyCoupon() {
    if (!couponCode) return;
    
    const { data, error } = await supabase
      .from("coupons")
      .select("*")
      .eq("code", couponCode.toUpperCase())
      .eq("active", true)
      .maybeSingle();
    
    if (error || !data) {
      alert("Invalid coupon");
      return;
    }
    
    const now = new Date();
    if (data.starts_at && new Date(data.starts_at) > now) {
      alert("This coupon is not yet valid");
      return;
    }
    
    if (data.expires_at && new Date(data.expires_at) < now) {
      alert("This coupon has expired");
      return;
    }
    
    // Verificar si se ha alcanzado el límite de usos
    if (data.max_uses && data.used_count && data.used_count >= data.max_uses) {
      alert("This coupon has reached its usage limit");
      return;
    }
    
    setCoupon(data);
  }

  async function handleSaveAddress() {
    if (!user) return;
    
    const { error } = await supabase
      .from("addresses")
      .insert({
        user_id: user.id,
        type: newAddress.type,
        full_name: newAddress.full_name,
        address_line: newAddress.address_line,
        city: newAddress.city,
        province: newAddress.province || "",
        postal_code: newAddress.postal_code,
        country: newAddress.country || "",
        phone: newAddress.phone || "",
        is_default: newAddress.is_default,
      });
    
    if (error) {
      alert("Error saving address");
      return;
    }
    
    onAddressAdded();
    setShowNewAddress(false);
    setNewAddress({
      full_name: "",
      address_line: "",
      city: "",
      province: "",
      postal_code: "",
      country: "",
      phone: "",
      type: "envio",
      is_default: false,
    });
  }

  async function handleCheckout() {
    // Validar que se haya ingresado una dirección
    if (!user && (!newAddress.full_name || !newAddress.address_line || !newAddress.city || !newAddress.postal_code)) {
      alert("Please complete all address fields");
      return;
    }
    
    if (user && !selectedAddress && !showNewAddress) {
      alert("Please select or add an address");
      return;
    }
    
    if (user && showNewAddress && (!newAddress.full_name || !newAddress.address_line || !newAddress.city || !newAddress.postal_code)) {
      alert("Please complete all address fields");
      return;
    }
    
    setLoading(true);
    
    try {
      // Obtener el carrito
      const { data: { session } } = await supabase.auth.getSession();
      let cart;
      
      if (session?.user) {
        const { data } = await supabase
          .from("carts")
          .select("id")
          .eq("user_id", session.user.id)
          .maybeSingle();
        cart = data;
      } else {
        const guestToken = localStorage.getItem("guest_token");
        if (guestToken) {
          const { data } = await supabase
            .from("carts")
            .select("id")
            .eq("guest_token", guestToken)
            .maybeSingle();
          cart = data;
        }
      }
      
      if (!cart) {
        alert("Cart not found");
        return;
      }
      
      // Obtener items del carrito
      const { data: items, error: itemsFetchError } = await supabase
        .from("cart_items")
        .select("*")
        .eq("cart_id", cart.id);
      
      if (itemsFetchError) {
        console.error("Error fetching cart items:", itemsFetchError);
        alert("Error fetching cart items");
        return;
      }
      
      if (!items || items.length === 0) {
        alert("Cart is empty");
        return;
      }
      
      console.log("Cart items:", items);
      
      // Guardar dirección si es nueva o si es invitado
      let shippingAddressId: string | null = null;
      let billingAddressId: string | null = null;
      
      if (selectedAddress) {
        // Usar dirección guardada
        shippingAddressId = selectedAddress;
        billingAddressId = selectedAddress;
      } else if (showNewAddress || !user) {
        // Crear nueva dirección (para usuarios autenticados o invitados)
        const addressData = {
          user_id: user?.id || null,
          type: newAddress.type || "envio",
          full_name: newAddress.full_name,
          address_line: newAddress.address_line,
          city: newAddress.city,
          province: newAddress.province || "",
          postal_code: newAddress.postal_code,
          country: newAddress.country || "",
          phone: newAddress.phone || "",
          is_default: user ? newAddress.is_default : false,
        };
        
        const { data: newAddr, error: addrError } = await supabase
          .from("addresses")
          .insert(addressData)
          .select()
          .single();
        
        if (addrError) {
          console.error("Error creating address:", addrError);
          alert("Error saving address");
          return;
        }
        
        if (newAddr) {
          shippingAddressId = newAddr.id;
          billingAddressId = newAddr.id;
        }
      }
      
      // Calcular subtotal y total
      let subtotal = 0;
      for (const item of items || []) {
        subtotal += (item.unit_price || 0) * (item.quantity || 0);
      }
      
      // Calcular envío (ejemplo: gratis si subtotal > 100, sino 10€)
      const shippingCost = subtotal > 100 ? 0 : 10;
      const total = subtotal + shippingCost;
      
      // Obtener o crear shipping_rate_id (por ahora null si no hay tasas configuradas)
      // TODO: Implementar selección de tasa de envío según el costo calculado
      let shippingRateId: number | null = null;
      
      // Intentar obtener una tasa de envío basada en el costo
      if (shippingCost > 0) {
        const { data: shippingRate, error: shippingRateError } = await supabase
          .from("shipping_rates")
          .select("id")
          .eq("cost", shippingCost)
          .eq("active", true)
          .maybeSingle();
        
        if (shippingRateError) {
          console.warn("Error fetching shipping rate:", shippingRateError);
        }
        
        if (shippingRate) {
          shippingRateId = shippingRate.id;
        }
      }
      
      console.log("Creating order with data:", {
        user_id: user?.id || null,
        guest_token: !user ? localStorage.getItem("guest_token") : null,
        shipping_address_id: shippingAddressId,
        billing_address_id: billingAddressId,
        shipping_rate_id: shippingRateId,
        status: "pendiente",
        payment_status: "pendiente",
        payment_method: paymentMethod,
        coupon_id: coupon?.id || null,
        subtotal: subtotal,
        shipping_cost: shippingCost,
        total: total,
      });
      
      // Crear orden
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          user_id: user?.id || null,
          guest_token: !user ? localStorage.getItem("guest_token") : null,
          shipping_address_id: shippingAddressId,
          billing_address_id: billingAddressId,
          shipping_rate_id: shippingRateId,
          status: "pendiente",
          payment_status: "pendiente",
          payment_method: paymentMethod,
          coupon_id: coupon?.id || null,
          subtotal: subtotal,
          shipping_cost: shippingCost,
          total: total,
        })
        .select()
        .single();
      
      if (orderError) {
        console.error("Error creating order:", orderError);
        console.error("Error details:", {
          message: orderError.message,
          code: orderError.code,
          details: orderError.details,
          hint: orderError.hint,
        });
        alert(`Error creating order: ${orderError.message || JSON.stringify(orderError)}`);
        return;
      }
      
      console.log("Order created successfully:", order);
      
      // Crear order_items
      // Validar que todos los items tengan unit_price
      const validItems = items.filter((item: any) => {
        if (!item.unit_price || item.unit_price <= 0) {
          console.error("Item sin precio válido:", item);
          return false;
        }
        return true;
      });
      
      if (validItems.length === 0) {
        alert("No valid items in cart");
        return;
      }
      
      const orderItems = validItems.map((item: any) => {
        // Asegurar que unit_price sea un número
        const unitPrice = typeof item.unit_price === 'string' 
          ? parseFloat(item.unit_price) 
          : item.unit_price;
        
        return {
          order_id: order.id,
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: unitPrice,
          // subtotal se calcula automáticamente en la base de datos
        };
      });
      
      console.log("Order items to insert:", orderItems);
      
      const { error: itemsError, data: insertedItems } = await supabase
        .from("order_items")
        .insert(orderItems)
        .select();
      
      if (itemsError) {
        console.error("Error inserting order items:", itemsError);
        console.error("Error details:", {
          message: itemsError.message,
          code: itemsError.code,
          details: itemsError.details,
          hint: itemsError.hint,
        });
        alert(`Error creating order items: ${itemsError.message || JSON.stringify(itemsError)}`);
        return;
      }
      
      console.log("Order items inserted successfully:", insertedItems);
      
      // Procesar pago
      if (paymentMethod === "stripe") {
        // Redirigir a Stripe Checkout
        const response = await fetch("/api/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId: order.id }),
        });
        
        const data = await response.json();
        
        if (data.url) {
          window.location.href = data.url;
        } else {
          alert("Error processing payment");
        }
      } else {
        // Transferencia - marcar como pendiente de pago
        await supabase
          .from("orders")
          .update({ 
            status: "pendiente",
            payment_status: "pendiente"
          })
          .eq("id", order.id);
        
        router.push(`/checkout/success?orderId=${order.id}`);
      }
    } catch (error) {
      console.error("Error en checkout:", error);
      alert("Error processing order");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8 bg-pyro-gray p-6 rounded-lg">
      {/* Dirección */}
      <div>
        <h2 className="text-2xl font-bold text-pyro-black mb-4">Shipping Address</h2>
        
        {user && addresses.length > 0 && (
          <div className="space-y-2 mb-4">
            {addresses.map((addr) => (
              <label
                key={addr.id}
                className="flex items-start p-4 border border-gray-300 rounded-lg cursor-pointer hover:border-pyro-gold"
              >
                <input
                  type="radio"
                  name="address"
                  value={addr.id}
                  checked={selectedAddress === addr.id}
                  onChange={(e) => setSelectedAddress(e.target.value)}
                  className="mt-1 mr-3"
                />
                <div>
                  <p className="font-semibold">{addr.full_name}</p>
                  <p className="text-sm text-pyro-gray">{addr.address_line}</p>
                  <p className="text-sm text-pyro-gray">
                    {addr.city}, {addr.province} {addr.postal_code}
                  </p>
                  <p className="text-sm text-pyro-gray">{addr.country}</p>
                  {addr.phone && (
                    <p className="text-sm text-pyro-gray">Tel: {addr.phone}</p>
                  )}
                </div>
              </label>
            ))}
          </div>
        )}
        
        {(user || !user) && (
          <button
            onClick={() => setShowNewAddress(!showNewAddress)}
            className="text-pyro-gold hover:underline mb-4"
          >
            {showNewAddress ? "Cancel" : (user ? "Add new address" : "Enter shipping address")}
          </button>
        )}
        
        {showNewAddress && (
          <div className="space-y-4 p-4 bg-pyro-white rounded-lg">
            <input
              type="text"
              placeholder="Full name *"
              value={newAddress.full_name}
              onChange={(e) => setNewAddress({ ...newAddress, full_name: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-md"
              required
            />
            <input
              type="text"
              placeholder="Address (street and number) *"
              value={newAddress.address_line}
              onChange={(e) => setNewAddress({ ...newAddress, address_line: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-md"
              required
            />
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="City *"
                value={newAddress.city}
                onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-md"
                required
              />
              <input
                type="text"
                placeholder="Postal Code *"
                value={newAddress.postal_code}
                onChange={(e) => setNewAddress({ ...newAddress, postal_code: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-md"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Province/State"
                value={newAddress.province}
                onChange={(e) => setNewAddress({ ...newAddress, province: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
              <input
                type="text"
                placeholder="Country"
                value={newAddress.country}
                onChange={(e) => setNewAddress({ ...newAddress, country: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            <input
              type="tel"
              placeholder="Phone"
              value={newAddress.phone}
              onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
            {user && (
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={newAddress.is_default}
                  onChange={(e) => setNewAddress({ ...newAddress, is_default: e.target.checked })}
                  className="mr-2"
                />
                <span className="text-sm text-pyro-gray">Set as default address</span>
              </label>
            )}
            {user && (
              <button
                onClick={handleSaveAddress}
                className="w-full bg-pyro-gold text-pyro-black py-2 rounded-md font-semibold hover:bg-opacity-90"
              >
                Save Address
              </button>
            )}
            {!user && (
              <p className="text-sm text-pyro-gray">
                This address will only be used for this order. Sign in to save addresses.
              </p>
            )}
          </div>
        )}
        
        {!user && !showNewAddress && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              You can place your order without signing in. Click "Enter shipping address" to continue.
            </p>
          </div>
        )}
      </div>

      {/* Método de Pago */}
      <div>
        <h2 className="text-2xl font-bold text-pyro-black mb-4">Payment Method</h2>
        <div className="space-y-2">
          <label className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:border-pyro-gold">
            <input
              type="radio"
              name="payment"
              value="stripe"
              checked={paymentMethod === "stripe"}
              onChange={(e) => setPaymentMethod(e.target.value as "stripe")}
              className="mr-3"
            />
            <span className="font-semibold">Credit/Debit Card (Stripe)</span>
          </label>
          <label className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:border-pyro-gold">
            <input
              type="radio"
              name="payment"
              value="transfer"
              checked={paymentMethod === "transfer"}
              onChange={(e) => setPaymentMethod(e.target.value as "transfer")}
              className="mr-3"
            />
            <span className="font-semibold">Bank Transfer</span>
          </label>
        </div>
      </div>

      {/* Cupón */}
      <div>
        <h2 className="text-2xl font-bold text-pyro-black mb-4">Discount Coupon</h2>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Coupon code"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
            className="flex-1 p-2 border border-gray-300 rounded-md"
          />
          <button
            onClick={handleApplyCoupon}
            className="bg-pyro-black text-pyro-white px-6 py-2 rounded-md font-semibold hover:bg-opacity-90"
          >
            Apply
          </button>
        </div>
        {coupon && (
          <p className="mt-2 text-green-600">
            Coupon applied: {coupon.type === "porcentaje" 
              ? `${coupon.value}% discount` 
              : `R${coupon.value} discount`}
          </p>
        )}
      </div>

      {/* Botón de Checkout */}
      <button
        onClick={handleCheckout}
        disabled={loading}
        className="w-full bg-pyro-gold text-pyro-black py-4 rounded-lg font-semibold text-lg hover:bg-opacity-90 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        {loading ? "Processing..." : "Complete Order"}
      </button>
    </div>
  );
}




