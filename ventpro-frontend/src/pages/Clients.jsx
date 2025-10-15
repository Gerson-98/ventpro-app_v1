import React, { useEffect, useState } from "react";
import axios from "axios";

const Clients = () => {
  const [clients, setClients] = useState([]);
  const [formData, setFormData] = useState({ name: "", phone: "", address: "", email: "" });
  const [editingId, setEditingId] = useState(null);

  const API_ROOT = (import.meta.env.VITE_API_URL || "").replace(/\/+$/, "");
  const BASE = `${API_ROOT}/clients`;

  const fetchClients = async () => {
    try {
      const res = await axios.get(BASE);
      const data = res.data;
      setClients(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("❌ Error al obtener clientes:", e);
      setClients([]);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.patch(`${BASE}/${editingId}`, formData);
      } else {
        await axios.post(BASE, formData);
      }
      setFormData({ name: "", phone: "", address: "", email: "" });
      setEditingId(null);
      fetchClients();
    } catch (e) {
      console.error("❌ Error al guardar cliente:", e);
    }
  };

  const handleEdit = (client) => {
    setFormData({
      name: client.name,
      phone: client.phone || "",
      address: client.address || "",
      email: client.email || "",
    });
    setEditingId(client.id);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${BASE}/${id}`);
      fetchClients();
    } catch (e) {
      console.error("❌ Error al eliminar cliente:", e);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Clientes</h1>

      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded p-4 mb-6">
        <div className="grid grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Nombre"
            className="border p-2 rounded"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <input
            type="text"
            placeholder="Teléfono"
            className="border p-2 rounded"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />
          <input
            type="text"
            placeholder="Dirección"
            className="border p-2 rounded col-span-2"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          />
          <input
            type="email"
            placeholder="Correo"
            className="border p-2 rounded col-span-2"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 mt-4 rounded hover:bg-blue-700">
          {editingId ? "Actualizar Cliente" : "Agregar Cliente"}
        </button>
      </form>

      <table className="w-full border-collapse bg-white rounded shadow-md">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="p-3">Nombre</th>
            <th className="p-3">Teléfono</th>
            <th className="p-3">Correo</th>
            <th className="p-3">Dirección</th>
            <th className="p-3">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {clients.map((client) => (
            <tr key={client.id} className="border-t">
              <td className="p-3">{client.name}</td>
              <td className="p-3">{client.phone || "-"}</td>
              <td className="p-3">{client.email || "-"}</td>
              <td className="p-3">{client.address || "-"}</td>
              <td className="p-3">
                <button
                  className="bg-yellow-500 text-white px-3 py-1 rounded mr-2"
                  onClick={() => handleEdit(client)}
                >
                  Editar
                </button>
                <button
                  className="bg-red-600 text-white px-3 py-1 rounded"
                  onClick={() => handleDelete(client.id)}
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Clients;
