"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { PlusIcon, TrashIcon } from "@heroicons/react/24/outline";

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    street: "",
    city: "",
    state: "",
    zip_code: "",
    country: "",
    is_default: false,
  });

  useEffect(() => {
    loadAddresses();
  }, []);

  async function loadAddresses() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    const { data } = await supabase
      .from("addresses")
      .select("*")
      .eq("user_id", user.id)
      .order("is_default", { ascending: false });
    
    if (data) setAddresses(data);
    setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    const { error } = await supabase
      .from("addresses")
      .insert({
        ...formData,
        user_id: user.id,
      });
    
    if (error) {
      alert("Error al guardar la dirección");
      return;
    }
    
    loadAddresses();
    setShowForm(false);
    setFormData({
      street: "",
      city: "",
      state: "",
      zip_code: "",
      country: "",
      is_default: false,
    });
  }

  async function handleDelete(addressId: string) {
    if (!confirm("¿Estás seguro de eliminar esta dirección?")) return;
    
    const { error } = await supabase
      .from("addresses")
      .delete()
      .eq("id", addressId);
    
    if (error) {
      alert("Error al eliminar la dirección");
      return;
    }
    
    loadAddresses();
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-pyro-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-pyro-gray">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-pyro-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-pyro-black">Mis Direcciones</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-pyro-gold text-pyro-black px-4 py-2 rounded-lg font-semibold hover:bg-opacity-90 transition-colors flex items-center gap-2"
          >
            <PlusIcon className="h-5 w-5" />
            Agregar Dirección
          </button>
        </div>
        
        {showForm && (
          <form onSubmit={handleSubmit} className="bg-pyro-gray p-6 rounded-lg mb-8 space-y-4">
            <input
              type="text"
              placeholder="Calle"
              value={formData.street}
              onChange={(e) => setFormData({ ...formData, street: e.target.value })}
              required
              className="w-full p-2 border border-gray-300 rounded-md"
            />
            <input
              type="text"
              placeholder="Ciudad"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              required
              className="w-full p-2 border border-gray-300 rounded-md"
            />
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Estado"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                required
                className="w-full p-2 border border-gray-300 rounded-md"
              />
              <input
                type="text"
                placeholder="Código Postal"
                value={formData.zip_code}
                onChange={(e) => setFormData({ ...formData, zip_code: e.target.value })}
                required
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            <input
              type="text"
              placeholder="País"
              value={formData.country}
              onChange={(e) => setFormData({ ...formData, country: e.target.value })}
              required
              className="w-full p-2 border border-gray-300 rounded-md"
            />
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.is_default}
                onChange={(e) => setFormData({ ...formData, is_default: e.target.checked })}
              />
              <span className="text-sm">Marcar como dirección predeterminada</span>
            </label>
            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-pyro-gold text-pyro-black px-6 py-2 rounded-md font-semibold hover:bg-opacity-90"
              >
                Guardar
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="bg-gray-300 text-gray-700 px-6 py-2 rounded-md font-semibold hover:bg-opacity-90"
              >
                Cancelar
              </button>
            </div>
          </form>
        )}
        
        {addresses.length === 0 ? (
          <div className="bg-pyro-gray p-8 rounded-lg text-center">
            <p className="text-pyro-gray mb-4">No tienes direcciones guardadas.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {addresses.map((address) => (
              <div key={address.id} className="bg-pyro-gray p-6 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-pyro-black">
                    {address.is_default && (
                      <span className="bg-pyro-gold text-pyro-black px-2 py-1 rounded text-xs mr-2">
                        Predeterminada
                      </span>
                    )}
                    Dirección
                  </h3>
                  <button
                    onClick={() => handleDelete(address.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
                <p className="text-pyro-gray">{address.street}</p>
                <p className="text-pyro-gray">
                  {address.city}, {address.state} {address.zip_code}
                </p>
                <p className="text-pyro-gray">{address.country}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


