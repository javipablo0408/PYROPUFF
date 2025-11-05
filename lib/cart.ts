"use client";

import { supabase } from "./supabaseClient";

export async function getOrCreateCart() {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (session?.user) {
    // Usuario autenticado - verificar que existe en users_extension
    const { data: profile } = await supabase
      .from("users_extension")
      .select("id")
      .eq("id", session.user.id)
      .maybeSingle();
    
    if (!profile) {
      console.warn("Usuario no encontrado en users_extension, creando perfil...");
      // Intentar crear el perfil si no existe
      const { error: createError } = await supabase
        .from("users_extension")
        .insert({
          id: session.user.id,
          role: "cliente",
        })
        .select()
        .single();
      
      if (createError) {
        console.error("Error creating profile:", createError);
        // No lanzar error, continuar con el carrito
      }
    }
    
    let { data: cart, error: cartError } = await supabase
      .from("carts")
      .select("*")
      .eq("user_id", session.user.id)
      .maybeSingle();
    
    console.log("Cart for user:", cart, "Error:", cartError);
    
    // Si no existe cart, crear uno nuevo
    if (!cart) {
      const { data: newCart, error } = await supabase
        .from("carts")
        .insert({
          user_id: session.user.id,
        })
        .select()
        .single();
      
      if (error) {
        console.error("Error creating cart:", error);
        console.error("Error details:", {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint,
        });
        throw error;
      }
      cart = newCart;
      console.log("New cart created:", cart);
    }
    
    return cart;
  } else {
    // Usuario invitado
    let guestToken = localStorage.getItem("guest_token");
    
    if (!guestToken) {
      guestToken = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem("guest_token", guestToken);
    }
    
    let { data: cart, error: cartError } = await supabase
      .from("carts")
      .select("*")
      .eq("guest_token", guestToken)
      .maybeSingle();
    
    console.log("Cart for guest:", cart, "Error:", cartError);
    
    if (!cart) {
      const { data: newCart, error } = await supabase
        .from("carts")
        .insert({
          guest_token: guestToken,
        })
        .select()
        .single();
      
      if (error) {
        console.error("Error creating guest cart:", error);
        console.error("Error details:", {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint,
        });
        throw error;
      }
      cart = newCart;
      console.log("New guest cart created:", cart);
    }
    
    return cart;
  }
}

export async function addToCart(productId: string, quantity: number = 1) {
  const cart = await getOrCreateCart();
  
  // Obtener el precio del producto según el rol del usuario
  const { data: { session } } = await supabase.auth.getSession();
  let userRole = "cliente";
  
  if (session?.user) {
    const { data: profile } = await supabase
      .from("users_extension")
      .select("role")
      .eq("id", session.user.id)
      .single();
    
    userRole = profile?.role || "cliente";
  }
  
  // Mapear roles
  const roleMap: Record<string, string> = {
    customer: "cliente",
    cliente: "cliente",
    wholesaler: "mayorista",
    mayorista: "mayorista",
  };
  
  const searchRole = roleMap[userRole] || "cliente";
  
  // Obtener precio del producto
  const { data: priceData, error: priceError } = await supabase
    .from("product_prices")
    .select("price")
    .eq("product_id", productId)
    .eq("role", searchRole)
    .maybeSingle();
  
  if (priceError && priceError.code !== "PGRST116") {
    console.error("Error fetching price:", priceError);
  }
  
  // Si no encuentra precio para ese rol, buscar precio de cliente
  let unitPrice = priceData?.price;
  if (!unitPrice) {
    const { data: fallbackPrice, error: fallbackError } = await supabase
      .from("product_prices")
      .select("price")
      .eq("product_id", productId)
      .eq("role", "cliente")
      .maybeSingle();
    
    if (fallbackError && fallbackError.code !== "PGRST116") {
      console.error("Error fetching fallback price:", fallbackError);
    }
    
    unitPrice = fallbackPrice?.price;
  }
  
  if (!unitPrice || unitPrice === null || unitPrice === undefined) {
    throw new Error("No se encontró precio para este producto. Por favor, configura un precio en el panel de administración.");
  }
  
  // Asegurar que unitPrice sea un número
  unitPrice = typeof unitPrice === 'string' ? parseFloat(unitPrice) : unitPrice;
  
  if (isNaN(unitPrice) || unitPrice <= 0) {
    throw new Error("El precio del producto no es válido");
  }
  
  // Verificar si el producto ya está en el carrito
  const { data: existingItem, error: checkError } = await supabase
    .from("cart_items")
    .select("*")
    .eq("cart_id", cart.id)
    .eq("product_id", productId)
    .maybeSingle();
  
  if (checkError && checkError.code !== "PGRST116") {
    throw checkError;
  }
  
  if (existingItem) {
    // Actualizar cantidad y unit_price
    // subtotal se recalcula automáticamente por la base de datos
    const newQuantity = existingItem.quantity + quantity;
    
    const { error } = await supabase
      .from("cart_items")
      .update({ 
        quantity: newQuantity,
        unit_price: unitPrice,
        // subtotal se calcula automáticamente por la base de datos
      })
      .eq("id", existingItem.id);
    
    if (error) {
      console.error("Error updating cart item:", error);
      throw error;
    }
  } else {
    // Agregar nuevo item
    // No incluimos subtotal porque es una columna calculada (DEFAULT o GENERATED)
    const cartItemData = {
      cart_id: cart.id,
      product_id: productId,
      quantity: quantity,
      unit_price: unitPrice,
      // subtotal se calcula automáticamente por la base de datos
    };
    
    console.log("Inserting cart item with data:", cartItemData);
    
    const { data, error } = await supabase
      .from("cart_items")
      .insert(cartItemData)
      .select()
      .single();
    
    if (error) {
      console.error("Error inserting cart item:", error);
      console.error("Error details:", {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      });
      throw new Error(`Error al agregar al carrito: ${error.message || JSON.stringify(error)}`);
    }
    
    console.log("Cart item inserted successfully:", data);
  }
}

export async function removeFromCart(cartItemId: string) {
  const { error } = await supabase
    .from("cart_items")
    .delete()
    .eq("id", cartItemId);
  
  if (error) throw error;
}

export async function updateCartItemQuantity(cartItemId: string, quantity: number) {
  if (quantity <= 0) {
    await removeFromCart(cartItemId);
    return;
  }
  
  const { error } = await supabase
    .from("cart_items")
    .update({ quantity })
    .eq("id", cartItemId);
  
  if (error) throw error;
}

export async function getCartItems() {
  try {
    const cart = await getOrCreateCart();
    console.log("Cart ID:", cart?.id);
    
    if (!cart || !cart.id) {
      console.error("No cart found or cart has no ID");
      return [];
    }
    
    // Primero intentar obtener solo los items sin relaciones para verificar RLS
    console.log("Fetching cart items for cart_id:", cart.id);
    const { data: simpleItems, error: simpleError } = await supabase
      .from("cart_items")
      .select("*")
      .eq("cart_id", cart.id);
    
    if (simpleError) {
      console.error("Error fetching simple cart items:", simpleError);
      console.error("Error details:", {
        message: simpleError.message,
        code: simpleError.code,
        details: simpleError.details,
        hint: simpleError.hint,
      });
      
      // Si es un error de RLS, intentar verificar si el carrito existe
      const { data: cartCheck } = await supabase
        .from("carts")
        .select("id")
        .eq("id", cart.id)
        .maybeSingle();
      
      console.log("Cart exists check:", cartCheck);
      
      throw new Error(`Error al cargar items del carrito: ${simpleError.message || JSON.stringify(simpleError)}`);
    }
    
    console.log("Cart items (simple):", simpleItems);
    
    if (!simpleItems || simpleItems.length === 0) {
      console.log("No items found in cart");
      return [];
    }
    
    // Si tenemos items, cargar productos manualmente
    const itemsWithProducts = await Promise.all(
      simpleItems.map(async (item) => {
        try {
          const { data: product, error: productError } = await supabase
            .from("products")
            .select(`
              id,
              name,
              slug,
              description,
              stock
            `)
            .eq("id", item.product_id)
            .maybeSingle();
          
          if (productError) {
            console.error(`Error fetching product ${item.product_id}:`, productError);
          }
          
          const { data: images, error: imagesError } = await supabase
            .from("product_images")
            .select("id, storage_path, position")
            .eq("product_id", item.product_id)
            .order("position");
          
          if (imagesError) {
            console.error(`Error fetching images for product ${item.product_id}:`, imagesError);
          }
          
          return {
            ...item,
            product: product ? {
              ...product,
              images: images || [],
            } : null,
          };
        } catch (error) {
          console.error(`Error processing item ${item.id}:`, error);
          return {
            ...item,
            product: null,
          };
        }
      })
    );
    
    console.log("Cart items with products:", itemsWithProducts);
    return itemsWithProducts;
  } catch (error: any) {
    console.error("Error in getCartItems:", error);
    console.error("Error details:", {
      message: error?.message,
      code: error?.code,
      details: error?.details,
      hint: error?.hint,
      stack: error?.stack,
    });
    throw error;
  }
}


