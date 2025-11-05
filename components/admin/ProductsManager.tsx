"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { AdminTable } from "./AdminTable";
import Image from "next/image";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  PhotoIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

// Componente para mostrar precios en la tabla
function ProductPricesCell({ productId }: { productId: string }) {
  const [prices, setPrices] = useState<Array<{ role: string; price: number }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPrices() {
      try {
        const { data, error } = await supabase
          .from("product_prices")
          .select("role, price")
          .eq("product_id", productId);

        if (error) throw error;
        setPrices(data || []);
      } catch (error) {
        console.error("Error loading prices:", error);
      } finally {
        setLoading(false);
      }
    }
    loadPrices();
  }, [productId]);

  if (loading) {
    return <span className="text-sm text-black">Loading...</span>;
  }

  if (prices.length === 0) {
    return <span className="text-sm text-black italic">No prices</span>;
  }

  return (
    <div className="flex flex-col gap-1">
      {prices.map((price) => (
        <span key={price.role} className="text-sm text-black">
          {price.role === "cliente" || price.role === "customer" ? "Customer" : "Wholesale"}: 
          <span className="font-medium text-pyro-black ml-1">
            R{price.price.toFixed(2)}
          </span>
        </span>
      ))}
    </div>
  );
}

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  category_id: number | null;
  sku: string | null;
  stock: number;
  active: boolean;
  created_at: string;
  category?: { id: number; name: string } | null;
}

export function ProductsManager() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productImages, setProductImages] = useState<Array<{ id?: string; storage_path: string; position: number; file?: File }>>([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [prices, setPrices] = useState({
    cliente: "",
    mayorista: "",
  });
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    category_id: "",
    sku: "",
    stock: 0,
    active: true,
  });

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  async function loadProducts() {
    try {
      const { data, error } = await supabase
        .from("products")
        .select(`
          *,
          category:categories(id, name)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error("Error loading products:", error);
      alert("Error loading products");
    } finally {
      setLoading(false);
    }
  }

  async function loadProductImages(productId: string) {
    try {
      const { data, error } = await supabase
        .from("product_images")
        .select("*")
        .eq("product_id", productId)
        .order("position");

      if (error) throw error;
      setProductImages(data || []);
    } catch (error) {
      console.error("Error loading product images:", error);
    }
  }

  async function loadProductPrices(productId: string) {
    try {
      const { data, error } = await supabase
        .from("product_prices")
        .select("*")
        .eq("product_id", productId);

      if (error) throw error;
      
      // Mapear precios por rol
      const pricesMap: Record<string, string> = {
        cliente: "",
        mayorista: "",
      };
      
      if (data) {
        data.forEach((price) => {
          if (price.role === "cliente" || price.role === "customer") {
            pricesMap.cliente = price.price.toString();
          } else if (price.role === "mayorista" || price.role === "wholesaler") {
            pricesMap.mayorista = price.price.toString();
          }
        });
      }
      
      setPrices(pricesMap);
    } catch (error) {
      console.error("Error loading product prices:", error);
      setPrices({ cliente: "", mayorista: "" });
    }
  }

  async function loadCategories() {
    try {
      const { data, error } = await supabase
        .from("categories")
        .select("id, name")
        .order("name");

      if (error) {
        console.error("Error loading categories:", error);
        console.error("Error details:", {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint,
        });
        alert(`Error loading categories: ${error.message || 'Unknown error'}`);
        return;
      }
      setCategories(data || []);
    } catch (error: any) {
      console.error("Error loading categories:", error);
      const errorMessage = error?.message || error?.toString() || 'Unknown error';
      console.error("Error details:", error);
      alert(`Error loading categories: ${errorMessage}`);
    }
  }

  function generateSlug(name: string) {
    return name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  async function handleEdit(product: Product) {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      slug: product.slug,
      description: product.description || "",
      category_id: product.category_id?.toString() || "",
      sku: product.sku || "",
      stock: product.stock,
      active: product.active,
    });
    await loadProductImages(product.id);
    await loadProductPrices(product.id);
    setShowForm(true);
  }

  function handleNew() {
    setEditingProduct(null);
    setProductImages([]);
    setPrices({ cliente: "", mayorista: "" });
    setFormData({
      name: "",
      slug: "",
      description: "",
      category_id: "",
      sku: "",
      stock: 0,
      active: true,
    });
    setShowForm(true);
  }

  async function uploadImageToStorage(file: File, productId: string, position: number): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `${productId}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('products')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    // Obtener URL pública
    const { data } = supabase.storage
      .from('products')
      .getPublicUrl(filePath);

    return data.publicUrl;
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setUploadingImages(true);
    try {
      const productData: any = {
        name: formData.name,
        slug: formData.slug || generateSlug(formData.name),
        description: formData.description || null,
        category_id: formData.category_id ? parseInt(formData.category_id) : null,
        sku: formData.sku || null,
        stock: parseInt(formData.stock.toString()),
        active: formData.active,
      };

      let productId: string;

      if (editingProduct) {
        const { error } = await supabase
          .from("products")
          .update(productData)
          .eq("id", editingProduct.id);

        if (error) throw error;
        productId = editingProduct.id;
      } else {
        const { data: newProduct, error } = await supabase
          .from("products")
          .insert(productData)
          .select()
          .single();

        if (error) throw error;
        productId = newProduct.id;
      }

      // Procesar imágenes
      if (productImages.length > 0) {
        // Eliminar imágenes existentes si estamos editando
        if (editingProduct) {
          const { error: deleteError } = await supabase
            .from("product_images")
            .delete()
            .eq("product_id", productId);

          if (deleteError) console.error("Error deleting old images:", deleteError);
        }

        // Subir nuevas imágenes y crear registros
        const imagePromises = productImages.map(async (img, index) => {
          if (img.file) {
            // Nueva imagen - subir a storage
            const storagePath = await uploadImageToStorage(img.file, productId, index);
            return {
              product_id: productId,
              storage_path: storagePath,
              position: index,
            };
          } else if (img.storage_path) {
            // Imagen existente - mantener
            return {
              product_id: productId,
              storage_path: img.storage_path,
              position: index,
            };
          }
          return null;
        });

        const imagesToInsert = (await Promise.all(imagePromises)).filter(img => img !== null);

        if (imagesToInsert.length > 0) {
          const { error: imagesError } = await supabase
            .from("product_images")
            .insert(imagesToInsert);

          if (imagesError) throw imagesError;
        }
      }

      // Guardar/actualizar precios
      const pricesToSave = [];
      
      if (prices.cliente) {
        pricesToSave.push({
          product_id: productId,
          role: "cliente",
          price: parseFloat(prices.cliente),
          currency: "ZAR",
        });
      }
      
      if (prices.mayorista) {
        pricesToSave.push({
          product_id: productId,
          role: "mayorista",
          price: parseFloat(prices.mayorista),
          currency: "ZAR",
        });
      }

      if (pricesToSave.length > 0) {
        // Eliminar precios existentes para este producto
        await supabase
          .from("product_prices")
          .delete()
          .eq("product_id", productId);

        // Insertar nuevos precios
        const { error: pricesError } = await supabase
          .from("product_prices")
          .insert(pricesToSave);

        if (pricesError) {
          console.error("Error saving prices:", pricesError);
          // No lanzamos error aquí, solo lo registramos
        }
      }

      alert(editingProduct ? "Product updated successfully" : "Product created successfully");
      setShowForm(false);
      setProductImages([]);
      setPrices({ cliente: "", mayorista: "" });
      loadProducts();
    } catch (error: any) {
      console.error("Error saving product:", error);
      alert(`Error: ${error.message}`);
    } finally {
      setUploadingImages(false);
    }
  }

  function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files) return;

    const newImages = Array.from(files).map((file, index) => ({
      file,
      storage_path: URL.createObjectURL(file),
      position: productImages.length + index,
    }));

    setProductImages([...productImages, ...newImages]);
  }

  function handleRemoveImage(index: number) {
    setProductImages(productImages.filter((_, i) => i !== index).map((img, i) => ({
      ...img,
      position: i,
    })));
  }

  async function handleDelete(product: Product) {
    if (!confirm(`Are you sure you want to delete "${product.name}"?`)) return;

    try {
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", product.id);

      if (error) throw error;
      alert("Product deleted successfully");
      loadProducts();
    } catch (error: any) {
      console.error("Error deleting product:", error);
      alert(`Error: ${error.message}`);
    }
  }

  const columns = [
    {
      key: "name",
      label: "Name",
      render: (value: string, row: Product) => (
        <div className="font-medium text-pyro-black">{value}</div>
      ),
    },
    {
      key: "category",
      label: "Category",
      render: (_: any, row: Product) => (
        <span className="text-black">
          {row.category?.name || "No category"}
        </span>
      ),
    },
    {
      key: "prices",
      label: "Prices",
      render: (_: any, row: Product) => {
        // Cargar precios para mostrar en la tabla
        return <ProductPricesCell productId={row.id} />;
      },
    },
    {
      key: "sku",
      label: "SKU",
      render: (value: string | null) => (
        <span className="text-sm text-black">{value || "-"}</span>
      ),
    },
    {
      key: "stock",
      label: "Stock",
      render: (value: number) => (
        <span className={`font-medium ${value > 0 ? "text-green-600" : "text-red-600"}`}>
          {value}
        </span>
      ),
    },
    {
      key: "active",
      label: "Status",
      render: (value: boolean) => (
        <span className={`px-2 py-1 rounded text-xs ${value ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
          {value ? "Active" : "Inactive"}
        </span>
      ),
    },
  ];

  if (loading) {
    return <p className="text-center text-black">Loading products...</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-pyro-black">Product List</h2>
        <button
          onClick={handleNew}
          className="bg-pyro-gold text-pyro-black px-4 py-2 rounded hover:bg-opacity-90 flex items-center gap-2"
        >
          <PlusIcon className="h-5 w-5" />
          New Product
        </button>
      </div>

      {showForm && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4 text-pyro-black">
            {editingProduct ? "Edit Product" : "New Product"}
          </h3>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-pyro-black mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value });
                    if (!editingProduct) {
                      setFormData(prev => ({ ...prev, slug: generateSlug(e.target.value) }));
                    }
                  }}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pyro-gold"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-pyro-black mb-1">
                  Slug
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pyro-gold"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-pyro-black mb-1">
                  Category
                </label>
                <select
                  value={formData.category_id}
                  onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pyro-gold"
                >
                  <option value="">No category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-pyro-black mb-1">
                  SKU
                </label>
                <input
                  type="text"
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pyro-gold"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-pyro-black mb-1">
                  Stock *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pyro-gold"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-pyro-black mb-1">
                  Status
                </label>
                <select
                  value={formData.active.toString()}
                  onChange={(e) => setFormData({ ...formData, active: e.target.value === "true" })}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pyro-gold"
                >
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-pyro-black mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pyro-gold"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-pyro-black mb-1">
                  Customer Price (R)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={prices.cliente}
                  onChange={(e) => setPrices({ ...prices, cliente: e.target.value })}
                  placeholder="0.00"
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pyro-gold"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-pyro-black mb-1">
                  Wholesale Price (R)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={prices.mayorista}
                  onChange={(e) => setPrices({ ...prices, mayorista: e.target.value })}
                  placeholder="0.00"
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pyro-gold"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-pyro-black mb-1">
                Product Images
              </label>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <label className="cursor-pointer bg-pyro-gray px-4 py-2 rounded hover:bg-opacity-80 transition-colors flex items-center gap-2">
                    <PhotoIcon className="h-5 w-5" />
                    Add Images
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageSelect}
                      className="hidden"
                    />
                  </label>
                </div>
                {productImages.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {productImages.map((img, index) => (
                      <div key={index} className="relative group">
                        <div className="relative aspect-square rounded-lg overflow-hidden border-2 border-gray-200">
                          <Image
                            src={img.storage_path}
                            alt={`Image ${index + 1}`}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(index)}
                          className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <XMarkIcon className="h-4 w-4" />
                        </button>
                        <p className="text-xs text-center mt-1 text-black">
                          Position: {index + 1}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={uploadingImages}
                className="bg-pyro-gold text-pyro-black px-6 py-2 rounded hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploadingImages ? "Saving..." : editingProduct ? "Update" : "Create"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setProductImages([]);
                }}
                className="bg-gray-200 text-gray-700 px-6 py-2 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <AdminTable
        data={products}
        columns={columns}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
}

