import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "@/services/api";
import { Button } from "@/components/ui/button";
import { FaArrowLeft, FaCalendarAlt, FaFileAlt, FaUser } from "react-icons/fa";
import { FaChartBar, FaPlus, FaTrashAlt, FaEdit } from "react-icons/fa";
import AddWindowModal from "@/components/AddWindowModal";

export default function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingWindow, setEditingWindow] = useState(null);

  // 🔹 Obtener pedido desde API
  const fetchOrder = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/orders/${id}`);
      setOrder(res.data);
    } catch (err) {
      console.error("❌ Error al obtener pedido:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  // 🔹 Eliminar una ventana
  const handleDelete = async (winId) => {
    if (!confirm("¿Seguro que deseas eliminar esta ventana?")) return;
    try {
      await api.delete(`/windows/${winId}`);
      await fetchOrder();
    } catch (err) {
      console.error("❌ Error al eliminar ventana:", err);
      alert("Error al eliminar ventana.");
    }
  };

  // 🔹 Abrir ventana en modo edición
  const openEdit = (win) => {
    setEditingWindow(win);
    setShowModal(true);
  };

  if (loading) return <p className="p-6 text-gray-600">Cargando pedido...</p>;
  if (!order) return <p className="p-6 text-red-600">Pedido no encontrado.</p>;

  const creationDate = new Date(order.createdAt || Date.now()).toLocaleDateString("es-GT", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-6">
      {/* Encabezado */}
      <div className="max-w-6xl mx-auto mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium mb-4"
        >
          <FaArrowLeft /> Volver a Pedidos
        </button>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-blue-100 p-3 rounded-xl text-blue-600">
              <FaFileAlt size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Pedido #{order.id}
              </h1>
              <p className="text-gray-600 text-sm">{order.project}</p>
            </div>
            <div className="ml-auto">
              <span className="px-3 py-1 text-sm bg-gray-100 border rounded-full text-gray-600">
                {order.status || "Borrador"}
              </span>
            </div>
          </div>

          {/* Información general */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
              <FaUser className="text-blue-600" />
              <div>
                <p className="text-gray-500">Cliente</p>
                <p className="font-medium text-gray-800">
                  {order.clients?.name || "Desconocido"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
              <FaCalendarAlt className="text-blue-600" />
              <div>
                <p className="text-gray-500">Fecha de Creación</p>
                <p className="font-medium text-gray-800">{creationDate}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
              <FaFileAlt className="text-blue-600" />
              <div>
                <p className="text-gray-500">Ventanas</p>
                <p className="font-medium text-gray-800">
                  {order.windows?.length || 0} añadidas
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabla de Ventanas */}
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="flex justify-between items-center px-6 py-4 border-b">
          <h2 className="text-lg font-semibold text-gray-800">
            Ventanas del Pedido
          </h2>
          <div className="flex gap-2">
            <Button
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
              onClick={() => setShowModal(true)}
            >
              <FaPlus /> Añadir Ventana
            </Button>
            <Button className="flex items-center gap-2 bg-green-600 hover:bg-green-700">
              <FaChartBar /> Generar Reporte
            </Button>
          </div>
        </div>

        {/* Tabla */}
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-600 uppercase text-xs tracking-wider">
                <th className="py-3 px-4 text-left">Tipo</th>
                <th className="py-3 px-4 text-left">Marco (cm)</th>
                <th className="py-3 px-4 text-left">Hoja (cm)</th>
                <th className="py-3 px-4 text-left">Vidrio (cm)</th>
                <th className="py-3 px-4 text-left">Color PVC</th>
                <th className="py-3 px-4 text-left">Color Vidrio</th>
                <th className="py-3 px-4 text-center">Cant.</th>
                <th className="py-3 px-4 text-right">Acciones</th>
              </tr>
            </thead>

            <tbody>
              {order.windows?.length > 0 ? (
                order.windows.map((win) => (
                  <tr
                    key={win.id}
                    className="border-t hover:bg-gray-50 transition-all"
                  >
                    <td className="py-2 px-4 font-medium text-gray-700">
                      {win.window_type?.name || "Desconocido"}
                    </td>
                    <td className="py-2 px-4 text-gray-700">
                      {win.width_cm} × {win.height_cm}
                    </td>
                    <td className="py-2 px-4 text-gray-700">
                      {win.hojaAncho?.toFixed(1)} × {win.hojaAlto?.toFixed(1)}
                    </td>
                    <td className="py-2 px-4 text-gray-700">
                      {win.vidrioAncho?.toFixed(1)} × {win.vidrioAlto?.toFixed(1)}
                    </td>
                    <td className="py-2 px-4 text-gray-700">
                      {win.pvcColor?.name || "—"}
                    </td>
                    <td className="py-2 px-4 text-gray-700">
                      {win.glassColor?.name || "—"}
                    </td>
                    <td className="py-2 px-4 text-center text-gray-700">1</td>
                    <td className="py-2 px-4 text-right space-x-3">
                      <button
                        onClick={() => openEdit(win)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDelete(win.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <FaTrashAlt />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="8"
                    className="text-center py-6 text-gray-500 italic"
                  >
                    No hay ventanas registradas.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal para agregar / editar */}
      {showModal && (
        <AddWindowModal
          orderId={Number(order.id)}
          editingWindow={editingWindow}
          onClose={() => {
            setShowModal(false);
            setEditingWindow(null);
          }}
          onSave={(newWindow) => {
            // ✅ Actualiza la lista sin recargar
            setOrder((prev) => ({
              ...prev,
              windows: [...(prev.windows || []), newWindow],
            }));
          }}
        />
      )}
    </div>
  );
}
