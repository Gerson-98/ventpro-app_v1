import { useEffect, useState } from "react";
import { FaPlus, FaTrashAlt, FaEdit } from "react-icons/fa";
import AddClientModal from "@/components/AddClientModal";
import api from "@/services/api"; // Usaremos la instancia de api para consistencia

export default function ClientsTab() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingClient, setEditingClient] = useState(null); // Estado para guardar el cliente que se edita

  const fetchClients = async () => {
    setLoading(true);
    try {
      const response = await api.get("/clients");
      setClients(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error("❌ Error al obtener clientes:", err);
      setClients([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  // ✨ FUNCIÓN DE EDITAR CORREGIDA
  const handleEdit = (client) => {
    setEditingClient(client); // Guarda el cliente a editar
    setShowModal(true);      // Abre el modal
  };

  const handleDelete = async (id) => {
    if (!confirm("¿Seguro que deseas eliminar este cliente?")) return;
    try {
      await api.delete(`/clients/${id}`);
      fetchClients();
    } catch (err) {
      console.error("❌ Error al eliminar cliente:", err);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingClient(null); // Limpia el estado de edición al cerrar
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md transition">
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

      {loading ? (
        <p className="text-gray-600">Cargando...</p>
      ) : (
        <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden">
          {/* ... (el thead no cambia) ... */}
          <tbody>
            {clients.length === 0 ? (
              <tr><td colSpan="5" className="text-center py-4 text-gray-500">No hay clientes registrados.</td></tr>
            ) : (
              clients.map((client) => (
                <tr key={client.id} className="border-t hover:bg-gray-50">
                  <td className="py-2 px-4 font-medium">{client.name}</td>
                  <td className="py-2 px-4">{client.phone || "—"}</td>
                  <td className="py-2 px-4">{client.email || "—"}</td>
                  <td className="py-2 px-4">{client.address || "—"}</td>
                  <td className="py-2 px-4 text-right space-x-3">
                    <button onClick={() => handleEdit(client)} className="text-blue-600 hover:text-blue-800 transition" title="Editar">
                      <FaEdit />
                    </button>
                    <button onClick={() => handleDelete(client.id)} className="text-red-600 hover:text-red-800 transition" title="Eliminar">
                      <FaTrashAlt />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}

      {/* ✨ El modal ahora recibe el cliente a editar */}
      {showModal && (
        <AddClientModal
          open={showModal}
          onClose={closeModal}
          clientToEdit={editingClient} // Pasa el cliente al modal
          onSave={() => {
            fetchClients();
            closeModal();
          }}
        />
      )}
    </div>
  );
}