"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { AdminTable } from "./AdminTable";
import { PlusIcon } from "@heroicons/react/24/outline";

interface Category {
  id: number;
  name: string;
  slug: string | null;
  parent_id: number | null;
  description: string | null;
  parent?: { id: number; name: string } | null;
}

export function CategoriesManager() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    parent_id: "",
    description: "",
  });

  useEffect(() => {
    loadCategories();
  }, []);

  async function loadCategories() {
    try {
      // Primero intentamos cargar sin el join para evitar problemas con foreign keys
      const { data, error } = await supabase
        .from("categories")
        .select("*")
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
        setLoading(false);
        return;
      }

      // Si tenemos datos, intentamos cargar los padres para cada categoría
      if (data && data.length > 0) {
        // Obtener todos los IDs de padres únicos
        const parentIds = [...new Set(data.map(cat => cat.parent_id).filter(Boolean))];
        
        // Cargar todos los padres de una vez
        let parentsMap: Record<number, { id: number; name: string }> = {};
        if (parentIds.length > 0) {
          const { data: parentsData } = await supabase
            .from("categories")
            .select("id, name")
            .in("id", parentIds);
          
          if (parentsData) {
            parentsMap = parentsData.reduce((acc, parent) => {
              acc[parent.id] = parent;
              return acc;
            }, {} as Record<number, { id: number; name: string }>);
          }
        }
        
        // Combinar categorías con sus padres
        const categoriesWithParents = data.map((category) => ({
          ...category,
          parent: category.parent_id ? (parentsMap[category.parent_id] || null) : null,
        }));
        
        setCategories(categoriesWithParents);
      } else {
        setCategories([]);
      }
    } catch (error: any) {
      console.error("Error loading categories:", error);
      const errorMessage = error?.message || error?.toString() || 'Error desconocido';
      console.error("Error details:", error);
      alert(`Error loading categories: ${errorMessage}`);
    } finally {
      setLoading(false);
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

  function handleEdit(category: Category) {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      slug: category.slug || "",
      parent_id: category.parent_id?.toString() || "",
      description: category.description || "",
    });
    setShowForm(true);
  }

  function handleNew() {
    setEditingCategory(null);
    setFormData({
      name: "",
      slug: "",
      parent_id: "",
      description: "",
    });
    setShowForm(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    try {
      const categoryData: any = {
        name: formData.name,
        slug: formData.slug || generateSlug(formData.name),
        parent_id: formData.parent_id ? parseInt(formData.parent_id) : null,
        description: formData.description || null,
      };

      if (editingCategory) {
        const { error } = await supabase
          .from("categories")
          .update(categoryData)
          .eq("id", editingCategory.id);

        if (error) throw error;
        alert("Category updated successfully");
      } else {
        const { error } = await supabase
          .from("categories")
          .insert(categoryData);

        if (error) throw error;
        alert("Category created successfully");
      }

      setShowForm(false);
      loadCategories();
    } catch (error: any) {
      console.error("Error saving category:", error);
      alert(`Error: ${error.message}`);
    }
  }

  async function handleDelete(category: Category) {
    if (!confirm(`Are you sure you want to delete "${category.name}"?`)) return;

    try {
      const { error } = await supabase
        .from("categories")
        .delete()
        .eq("id", category.id);

      if (error) throw error;
      alert("Category deleted successfully");
      loadCategories();
    } catch (error: any) {
      console.error("Error deleting category:", error);
      alert(`Error: ${error.message}`);
    }
  }

  const columns = [
    {
      key: "name",
      label: "Name",
      render: (value: string, row: Category) => (
        <div className="font-medium text-pyro-black">{value}</div>
      ),
    },
    {
      key: "parent",
      label: "Parent Category",
      render: (_: any, row: Category) => (
        <span className="text-black">
          {row.parent?.name || "No parent category"}
        </span>
      ),
    },
    {
      key: "slug",
      label: "Slug",
      render: (value: string | null) => (
        <span className="text-sm text-black font-mono">{value || "-"}</span>
      ),
    },
  ];

  // Filtrar categorías principales (sin padre) para el selector
  const parentCategories = categories.filter(cat => !cat.parent_id || cat.id === editingCategory?.id);

  if (loading) {
    return <p className="text-center text-black">Loading categories...</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-pyro-black">Category List</h2>
        <button
          onClick={handleNew}
          className="bg-pyro-gold text-pyro-black px-4 py-2 rounded hover:bg-opacity-90 flex items-center gap-2"
        >
          <PlusIcon className="h-5 w-5" />
          New Category
        </button>
      </div>

      {showForm && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4 text-pyro-black">
            {editingCategory ? "Edit Category" : "New Category"}
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
                    if (!editingCategory) {
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
                  Parent Category
                </label>
                <select
                  value={formData.parent_id}
                  onChange={(e) => setFormData({ ...formData, parent_id: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pyro-gold"
                >
                  <option value="">No parent category</option>
                  {parentCategories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
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
                rows={3}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pyro-gold"
              />
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                className="bg-pyro-gold text-pyro-black px-6 py-2 rounded hover:bg-opacity-90"
              >
                {editingCategory ? "Update" : "Create"}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="bg-gray-200 text-gray-700 px-6 py-2 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <AdminTable
        data={categories}
        columns={columns}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
}

