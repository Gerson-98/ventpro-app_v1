import { useEffect, useState } from "react";
import { FaPlus, FaTrashAlt, FaEdit } from "react-icons/fa";

export default function WindowTypesTab() {
  const API_URL = import.meta.env.VITE_API_URL;
  const [windowTypes, setWindowTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingType, setEditingType] = useState(null);
  const [formData, setFormData] = useState({ name: "", description: "" });

  const fetchTypes = () => {
    setLoading(true);
    fetch(`${API_URL}/window-types`)
      .then((res) => res.json())
      .then((data) => setWindowTypes(Array.isArray(data) ? data : []))
      .catch((err) => console.error("Error al obtener tipos de ventana:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTypes();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    const method = editingType ? "PATCH" : "POST";
    const url = editingType
      ? `${API_URL}/window-types/${editingType.id}`
      : `${API_URL}/window-types`;

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

  const handleDelete = async (id) => {
    if (!confirm("¿Seguro que deseas eliminar este tipo de ventana?")) return;
    const res = await fetch(`${API_URL}/window-types/${id}`, { method: "DELETE" });
    if (res.ok) fetchTypes();
  };

  const handleEdit = (type) => {
    setEditingType(type);
    setFormData({ name: type.name, description: type.description || "" });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingType(null);
    setFormData({ name: "", description: "" });
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md transition">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-gray-800">Tipos de Ventana</h2>
          <p className="text-gray-500 text-sm">
            Administra los diferentes tipos de ventanas (corrediza, abatible, proyectable, etc.)
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <FaPlus /> Añadir Tipo
        </button>
      </div>

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
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDelete(t.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <FaTrashAlt />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {showModal && (
        <div className="fixed inset-0 bg-gray-300/60 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-2xl border relative">
            <button
              onClick={closeModal}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
            <h3 className="text-lg font-semibold mb-4 text-gray-800">
              {editingType ? "Editar Tipo" : "Nuevo Tipo"}
            </h3>
            <form onSubmit={handleSave}>
              <div className="mb-4">
                <label className="block text-sm font-medium">Nombre</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full border rounded-md p-2"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium">Descripción</label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full border rounded-md p-2"
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 bg-gray-200 rounded-md"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  {editingType ? "Guardar Cambios" : "Crear"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
