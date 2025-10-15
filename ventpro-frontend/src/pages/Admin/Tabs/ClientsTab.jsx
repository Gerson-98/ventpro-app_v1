import { useEffect, useState } from "react";
import { FaPlus, FaTrashAlt, FaEdit } from "react-icons/fa";

export default function ClientsTab() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
  });

  const API_ROOT = (import.meta.env.VITE_API_URL || "").replace(/\/+$/, "");
  const BASE = `${API_ROOT}/clients`;

  const fetchClients = () => {
    setLoading(true);
    fetch(BASE)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setClients(data);
        } else {
          console.warn("⚠️ La API no devolvió un arreglo:", data);
          setClients([]);
        }
      })
      .catch((err) => {
        console.error("❌ Error al obtener clientes:", err);
        setClients([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    const method = editingClient ? "PATCH" : "POST";
    const url = editingClient ? `${BASE}/${editingClient.id}` : BASE;

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error(`Error ${res.status}`);
      await fetchClients();
      closeModal();
    } catch (err) {
      console.error("❌ Error al guardar cliente:", err);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("¿Seguro que deseas eliminar este cliente?")) return;
    const res = await fetch(`${BASE}/${id}`, { method: "DELETE" });
    if (res.ok) fetchClients();
  };

  const handleEdit = (client) => {
    setEditingClient(client);
    setFormData({
      name: client.name,
      phone: client.phone || "",
      email: client.email || "",
      address: client.address || "",
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingClient(null);
    setFormData({ name: "", phone: "", email: "", address: "" });
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md transition">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-gray-800">Clientes</h2>
          <p className="text-gray-500 text-sm">
            Administra los clientes registrados y sus datos de contacto.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-sm hover:bg-blue-700 hover:shadow-md transition-all"
        >
          <FaPlus /> Añadir Cliente
        </button>
      </div>

      {/* Tabla */}
      {loading ? (
        <p className="text-gray-600">Cargando...</p>
      ) : clients.length === 0 ? (
        <p className="text-gray-600">No hay clientes registrados.</p>
      ) : (
        <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden">
          <thead>
            <tr className="bg-gray-100 text-gray-700 text-sm uppercase">
              <th className="py-3 px-4 text-left">Nombre</th>
              <th className="py-3 px-4 text-left">Teléfono</th>
              <th className="py-3 px-4 text-left">Correo</th>
              <th className="py-3 px-4 text-left">Dirección</th>
              <th className="py-3 px-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((client) => (
              <tr key={client.id} className="border-t hover:bg-gray-50">
                <td className="py-2 px-4 font-medium">{client.name}</td>
                <td className="py-2 px-4">{client.phone || "—"}</td>
                <td className="py-2 px-4">{client.email || "—"}</td>
                <td className="py-2 px-4">{client.address || "—"}</td>
                <td className="py-2 px-4 text-right space-x-3">
                  <button
                    onClick={() => handleEdit(client)}
                    className="text-blue-600 hover:text-blue-800 transition"
                    title="Editar"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDelete(client.id)}
                    className="text-red-600 hover:text-red-800 transition"
                    title="Eliminar"
                  >
                    <FaTrashAlt />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
