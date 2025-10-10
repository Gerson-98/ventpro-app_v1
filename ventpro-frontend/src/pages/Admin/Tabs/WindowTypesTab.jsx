import { useEffect, useState } from "react";
import { FaPlus, FaTrashAlt, FaEdit } from "react-icons/fa";

export default function WindowTypesTab() {
  const [windowTypes, setWindowTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingType, setEditingType] = useState(null);
  const [formData, setFormData] = useState({ name: "", description: "" });

  const API_URL = "http://localhost:3000/window-types";

  // 🔹 Cargar Tipos de Ventana
  const fetchTypes = () => {
    setLoading(true);
    fetch(API_URL)
      .then((res) => res.json())
      .then((data) => setWindowTypes(data))
      .catch((err) => console.error("Error al obtener tipos de ventana:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTypes();
  }, []);

  // 🔹 Guardar (crear o editar)
  const handleSave = async (e) => {
    e.preventDefault();

    const method = editingType ? "PUT" : "POST";
    const url = editingType ? `${API_URL}/${editingType.id}` : API_URL;

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    if (res.ok) {
      fetchTypes();
      closeModal();
    }
  };

  // 🔹 Eliminar
  const handleDelete = async (id) => {
    if (!confirm("¿Seguro que deseas eliminar este tipo de ventana?")) return;
    const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
    if (res.ok) fetchTypes();
  };

  // 🔹 Abrir modal en modo editar
  const handleEdit = (type) => {
    setEditingType(type);
    setFormData({ name: type.name, description: type.description || "" });
    setShowModal(true);
  };

  // 🔹 Cerrar modal
  const closeModal = () => {
    setShowModal(false);
    setEditingType(null);
    setFormData({ name: "", description: "" });
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md transition">
      {/* 🔹 Encabezado */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-gray-800">Tipos de Ventana</h2>
          <p className="text-gray-500 text-sm">
            Administra los diferentes tipos de ventanas (corrediza, abatible, proyectable, etc.)
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-sm hover:bg-blue-700 hover:shadow-md transition-all"
        >
          <FaPlus /> Añadir Tipo
        </button>
      </div>

      {/* 🔹 Tabla */}
      {loading ? (
        <p className="text-gray-600">Cargando...</p>
      ) : windowTypes.length === 0 ? (
        <p className="text-gray-600">No hay tipos de ventana registrados.</p>
      ) : (
        <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden">
          <thead>
            <tr className="bg-gray-100 text-gray-700 text-sm uppercase">
              <th className="py-3 px-4 text-left">Nombre</th>
              <th className="py-3 px-4 text-left">Descripción</th>
              <th className="py-3 px-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {windowTypes.map((t) => (
              <tr key={t.id} className="border-t hover:bg-gray-50">
                <td className="py-2 px-4">{t.name}</td>
                <td className="py-2 px-4">{t.description || "—"}</td>
                <td className="py-2 px-4 text-right space-x-3">
                  <button
                    onClick={() => handleEdit(t)}
                    className="text-blue-600 hover:text-blue-800 transition"
                    title="Editar"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDelete(t.id)}
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

      {/* 🔹 Modal */}
{/* 🔹 Modal */}
{showModal && (
  <div className="fixed inset-0 bg-gray-300/60 backdrop-blur-sm flex justify-center items-center z-50 animate-fadeIn">
    <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-2xl border border-gray-200 animate-scaleIn relative">
      {/* Botón para cerrar */}
      <button
        onClick={closeModal}
        className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition"
      >
        ✕
      </button>

      <h3 className="text-lg font-semibold mb-4 text-gray-800">
        {editingType ? "Editar Tipo de Ventana" : "Nuevo Tipo de Ventana"}
      </h3>

      <form onSubmit={handleSave}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nombre
          </label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) =>
              setFormData({ ...formData, name: e.target.value })
            }
            className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Descripción
          </label>
          <textarea
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            rows={3}
          />
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={closeModal}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
          >
            {editingType ? "Guardar Cambios" : "Crear"}
          </button>
        </div>
      </form>
    </div>
  </div>
)}


      {/* 🔹 Animaciones Tailwind */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-fadeIn { animation: fadeIn 0.25s ease-out; }
        .animate-scaleIn { animation: scaleIn 0.25s ease-out; }
      `}</style>
    </div>
  );
}
