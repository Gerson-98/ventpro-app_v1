import { useEffect, useState } from "react";
import { FaPlus, FaTrashAlt, FaEdit } from "react-icons/fa";

export default function GlassColorsTab() {
  const [colors, setColors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingColor, setEditingColor] = useState(null);
  const [formData, setFormData] = useState({ name: "", description: "" });

  const API_URL = "http://localhost:3000/glass-colors";

  // 🔹 Obtener lista de colores de vidrio
  const fetchColors = () => {
    setLoading(true);
    fetch(API_URL)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setColors(data);
        } else {
          console.warn("⚠️ La API de colores de vidrio no devolvió un arreglo:", data);
          setColors([]);
        }
      })
      .catch((err) => {
        console.error("❌ Error al obtener colores de vidrio:", err);
        setColors([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchColors();
  }, []);

  // 🔹 Guardar (crear o editar)
  const handleSave = async (e) => {
    e.preventDefault();
    const method = editingColor ? "PATCH" : "POST";
    const url = editingColor ? `${API_URL}/${editingColor.id}` : API_URL;

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error(`Error ${res.status}`);
      closeModal();
      fetchColors(); // ✅ Actualiza la lista
    } catch (err) {
      console.error("❌ Error guardando color de vidrio:", err);
    }
  };

  // 🔹 Eliminar color
  const handleDelete = async (id) => {
    if (!confirm("¿Seguro que deseas eliminar este color de vidrio?")) return;
    try {
      const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
      if (res.ok) fetchColors();
    } catch (err) {
      console.error("❌ Error eliminando color:", err);
    }
  };

  // 🔹 Editar color
  const handleEdit = (color) => {
    setEditingColor(color);
    setFormData({ name: color.name, description: color.description || "" });
    setShowModal(true);
  };

  // 🔹 Cerrar modal
  const closeModal = () => {
    setShowModal(false);
    setEditingColor(null);
    setFormData({ name: "", description: "" });
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md transition">
      {/* 🔹 Encabezado */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-gray-800">Colores de Vidrio</h2>
          <p className="text-gray-500 text-sm">
            Administra los colores de vidrio disponibles para los proyectos.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg shadow-sm hover:bg-green-700 hover:shadow-md transition-all"
        >
          <FaPlus /> Añadir Color
        </button>
      </div>

      {/* 🔹 Tabla */}
      {loading ? (
        <p className="text-gray-600">Cargando...</p>
      ) : colors.length === 0 ? (
        <p className="text-gray-600">No hay colores de vidrio registrados.</p>
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
            {colors.map((color) => (
              <tr key={color.id} className="border-t hover:bg-gray-50">
                <td className="py-2 px-4">{color.name}</td>
                <td className="py-2 px-4">{color.description || "—"}</td>
                <td className="py-2 px-4 text-right space-x-3">
                  <button
                    onClick={() => handleEdit(color)}
                    className="text-blue-600 hover:text-blue-800 transition"
                    title="Editar"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDelete(color.id)}
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
      {showModal && (
        <div className="fixed inset-0 bg-gray-200/40 backdrop-blur-sm flex justify-center items-center z-50 animate-fadeIn">
          <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-2xl border border-gray-200 animate-scaleIn relative">
            {/* Botón para cerrar */}
            <button
              onClick={closeModal}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition"
            >
              ✕
            </button>

            <h3 className="text-lg font-semibold mb-4 text-gray-800">
              {editingColor ? "Editar Color de Vidrio" : "Nuevo Color de Vidrio"}
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
                  className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-green-500 focus:outline-none"
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
                  className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-green-500 focus:outline-none"
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
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
                >
                  {editingColor ? "Guardar Cambios" : "Crear"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 🔹 Animaciones */}
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
