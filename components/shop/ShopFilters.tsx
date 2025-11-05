"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export function ShopFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [categories, setCategories] = useState<any[]>([]);
  const [subcategories, setSubcategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get("category") || ""
  );

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      loadSubcategories(selectedCategory);
    } else {
      setSubcategories([]);
    }
  }, [selectedCategory]);

  async function loadCategories() {
    const { data } = await supabase
      .from("categories")
      .select("*")
      .is("parent_id", null)
      .order("name");
    
    if (data) setCategories(data);
  }

  async function loadSubcategories(categoryId: string) {
    const { data } = await supabase
      .from("categories")
      .select("*")
      .eq("parent_id", categoryId)
      .order("name");
    
    if (data) setSubcategories(data || []);
  }

  function handleCategoryChange(categoryId: string) {
    setSelectedCategory(categoryId);
    const params = new URLSearchParams(searchParams.toString());
    
    if (categoryId) {
      params.set("category", categoryId);
    } else {
      params.delete("category");
    }
    params.delete("subcategory");
    params.set("page", "1");
    
    router.push(`/?${params.toString()}`);
  }

  function handleSubcategoryChange(subcategoryId: string) {
    const params = new URLSearchParams(searchParams.toString());
    
    if (subcategoryId) {
      params.set("subcategory", subcategoryId);
    } else {
      params.delete("subcategory");
    }
    params.set("page", "1");
    
    router.push(`/?${params.toString()}`);
  }

  function clearFilters() {
    setSelectedCategory("");
    router.push("/");
  }

  return (
    <div className="bg-pyro-gray p-6 rounded-lg space-y-6">
      <h2 className="text-xl font-bold text-pyro-black mb-4">Filtros</h2>
      
      <div>
        <label className="block text-sm font-medium text-pyro-black mb-2">
          Categoría
        </label>
        <select
          value={selectedCategory}
          onChange={(e) => handleCategoryChange(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md bg-pyro-white"
        >
          <option value="">Todas las categorías</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {selectedCategory && subcategories.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-pyro-black mb-2">
            Subcategoría
          </label>
          <select
            value={searchParams.get("subcategory") || ""}
            onChange={(e) => handleSubcategoryChange(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md bg-pyro-white"
          >
            <option value="">Todas las subcategorías</option>
            {subcategories.map((subcat) => (
              <option key={subcat.id} value={subcat.id}>
                {subcat.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <button
        onClick={clearFilters}
        className="w-full bg-pyro-black text-pyro-white py-2 rounded-md hover:bg-opacity-90 transition-colors"
      >
        Limpiar Filtros
      </button>
    </div>
  );
}


