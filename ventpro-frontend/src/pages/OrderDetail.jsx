import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "@/services/api";
import { Button } from "@/components/ui/button";
import { FaArrowLeft, FaFileAlt, FaChartBar, FaPlus, FaTrashAlt, FaEdit, FaClone, FaSave, FaMagic, FaCalendarAlt } from "react-icons/fa";
import AddWindowModal from "@/components/AddWindowModal";
import ProfilesReportModal from "@/components/ProfilesReportModal";
import CutOptimizationModal from "@/components/CutOptimizationModal";
import RescheduleOrderModal from "@/components/RescheduleOrderModal";

const ORDER_STATUSES = [
  { value: 'en proceso', label: 'En Proceso' },
  { value: 'en fabricacion', label: 'En Fabricación' },
  { value: 'listo para instalar', label: 'Listo para Instalar' },
  { value: 'en ruta', label: 'En Ruta' },
  { value: 'completado', label: 'Completado' },
];

const STATUS_STYLES = {
  'en proceso': 'bg-blue-100 text-blue-800 border-blue-300',
  'en fabricacion': 'bg-orange-100 text-orange-800 border-orange-300',
  'listo para instalar': 'bg-purple-100 text-purple-800 border-purple-300',
  'en ruta': 'bg-cyan-100 text-cyan-800 border-cyan-300',
  'completado': 'bg-green-100 text-green-800 border-green-300',
  'default': 'bg-gray-100 text-gray-800 border-gray-300',
};

export default function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRow, setEditingRow] = useState(null);
  const [editedValues, setEditedValues] = useState({});
  const [savingRow, setSavingRow] = useState(false);

  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Estados para el reporte de resumen
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportData, setReportData] = useState({});
  const [isReportLoading, setIsReportLoading] = useState(false);

  // Estados para el modal de optimización
  const [showOptimizationModal, setShowOptimizationModal] = useState(false);
  const [optimizationData, setOptimizationData] = useState({});
  const [isOptimizationLoading, setIsOptimizationLoading] = useState(false);

  const [showRescheduleModal, setShowRescheduleModal] = useState(false);

  // Estados para los catálogos de edición
  const [windowTypes, setWindowTypes] = useState([]);
  const [pvcColors, setPvcColors] = useState([]);
  const [glassColors, setGlassColors] = useState([]);

  // Cargar catálogos
  useEffect(() => {
    const fetchCatalogs = async () => {
      try {
        const [types, pvc, glass] = await Promise.all([
          api.get("/window-types"),
          api.get("/pvc-colors"),
          api.get("/glass-colors"),
        ]);
        setWindowTypes(types.data);
        setPvcColors(pvc.data);
        setGlassColors(glass.data);
      } catch (err) {
        console.error("❌ Error cargando catálogos:", err);
      }
    };
    fetchCatalogs();
  }, []);

  // Obtener pedido
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

  const formatCurrency = (amount) => `Q ${Number(amount || 0).toFixed(2)}`;

  const formatInstallationDate = (start, end) => {
    if (!start || !end) return "No agendado";
    const startDate = new Date(start);
    const endDate = new Date(end);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };

    const formattedStart = startDate.toLocaleDateString('es-GT', options);
    const formattedEnd = endDate.toLocaleDateString('es-GT', options);

    if (formattedStart === formattedEnd) {
      return formattedStart;
    }
    return `${formattedStart} - ${formattedEnd}`;
  };

  const handleGenerateReport = async () => {
    setIsReportLoading(true);
    setShowReportModal(true);
    try {
      const response = await api.get(`/reports/order/${id}/profiles`);
      setReportData(response.data);
    } catch (error) {
      console.error("Error al generar el reporte:", error);
      alert("No se pudo generar el reporte. Inténtalo de nuevo.");
      setShowReportModal(false);
    } finally {
      setIsReportLoading(false);
    }
  };

  const handleOptimizeCuts = async () => {
    setIsOptimizationLoading(true);
    setShowOptimizationModal(true);
    try {
      const response = await api.get(`/reports/order/${id}/optimize-cuts`);
      setOptimizationData(response.data);
    } catch (error) {
      console.error("Error al optimizar los cortes:", error);
      alert("No se pudo generar el plan de corte. Inténtalo de nuevo.");
      setShowOptimizationModal(false);
    } finally {
      setIsOptimizationLoading(false);
    }
  };

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

  const handleDuplicate = async (winId) => {
    try {
      const res = await api.post(`/windows/${winId}/duplicate`);
      // En lugar de actualizar localmente, volvemos a cargar todo para asegurar consistencia
      await fetchOrder();
    } catch (err) {
      console.error("❌ Error al duplicar ventana:", err);
      alert("No se pudo duplicar la ventana.");
    }
  };

  const startEdit = (win) => {
    setEditingRow(win.id);
    setEditedValues({
      width_cm: win.width_cm,
      height_cm: win.height_cm,
      window_type_id: win.window_type?.id || "",
      color_id: win.pvcColor?.id || "",
      glass_color_id: win.glassColor?.id || "",
    });
  };

  const saveChanges = async (winId) => {
    try {
      setSavingRow(true);
      const payload = {
        width_cm: parseFloat(editedValues.width_cm),
        height_cm: parseFloat(editedValues.height_cm),
        window_type_id: editedValues.window_type_id ? Number(editedValues.window_type_id) : null,
        color_id: editedValues.color_id ? Number(editedValues.color_id) : null,
        glass_color_id: editedValues.glass_color_id ? Number(editedValues.glass_color_id) : null,
      };
      await api.put(`/windows/${winId}`, payload);
      await fetchOrder();
      setEditingRow(null);
      setEditedValues({});
    } catch (err) {
      console.error("❌ Error al guardar cambios:", err);
      alert("No se pudieron guardar los cambios.");
    } finally {
      setSavingRow(false);
    }
  };

  // ✨ 3. Nueva función para manejar el cambio de estado
  const handleStatusChange = async (e) => {
    const newStatus = e.target.value;
    setIsUpdatingStatus(true);
    try {
      await api.patch(`/orders/${id}/status`, { status: newStatus });
      // Actualiza el estado localmente para una respuesta visual inmediata
      setOrder(prevOrder => ({ ...prevOrder, status: newStatus }));
    } catch (error) {
      console.error("❌ Error al actualizar el estado:", error);
      alert("No se pudo actualizar el estado.");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  if (loading) return <p className="p-6 text-gray-600">Cargando pedido...</p>;
  if (!order) return <p className="p-6 text-red-600">Pedido no encontrado.</p>;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-6">
      <div className="max-w-6xl mx-auto mb-6">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium mb-4">
          <FaArrowLeft /> Volver a Pedidos
        </button>

        {/* ✨ REEMPLAZA TODO EL <div className="bg-white..."> DEL ENCABEZADO CON ESTA NUEVA ESTRUCTURA ✨ */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-start">
            {/* Columna Izquierda: Información Principal */}
            <div className="flex items-center gap-4">
              <div className="bg-blue-100 p-3 rounded-xl text-blue-600">
                <FaFileAlt size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">{order.project}</h1>
                <p className="text-gray-600">Cliente: {order.clients?.name || "N/A"}</p>
                <p className="text-lg font-semibold text-blue-700 mt-1">{formatCurrency(order.total)}</p>
              </div>
            </div>

            <div className="flex flex-col items-end gap-3">
              {/* ✨ 2. Aplica las clases de estilo dinámicas al select */}
              <select
                value={order.status || ''}
                onChange={handleStatusChange}
                disabled={isUpdatingStatus}
                className={`px-3 py-1 text-sm border rounded-full font-medium appearance-none disabled:opacity-50 transition-colors
                  ${STATUS_STYLES[order.status] || STATUS_STYLES.default}
                `}
              >
                {ORDER_STATUSES.map(statusOption => (
                  <option key={statusOption.value} value={statusOption.value}>
                    {statusOption.label}
                  </option>
                ))}
              </select>

              {order.installationStartDate ? (
                <>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <FaCalendarAlt />
                    <span>{formatInstallationDate(order.installationStartDate, order.installationEndDate)}</span>
                  </div>
                  <Button variant="outline" size="sm" className="flex items-center gap-2" onClick={() => setShowRescheduleModal(true)}>
                    <FaCalendarAlt /> Reprogramar
                  </Button>
                </>
              ) : (
                <p className="text-sm text-gray-400">Sin fecha de instalación</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* TABLA */}
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="flex justify-between items-center px-6 py-4 border-b">
          <h2 className="text-lg font-semibold text-gray-800">Ventanas del Pedido</h2>
          <div className="flex gap-2">
            <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700" onClick={() => setShowModal(true)}>
              <FaPlus /> Añadir Ventana
            </Button>
            <Button className="flex items-center gap-2 bg-green-600 hover:bg-green-700" onClick={handleGenerateReport}>
              <FaChartBar /> Generar Reporte
            </Button>
            <Button className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700" onClick={handleOptimizeCuts}>
              <FaMagic /> Optimizar Cortes
            </Button>
          </div>
        </div>

        {showModal && (
          <AddWindowModal
            orderId={Number(order.id)}
            onClose={() => setShowModal(false)}
            onSave={async () => {
              setShowModal(false);
              await fetchOrder();
            }}
          />
        )}

        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse text-sm text-gray-800">
            <thead className="bg-gray-100 text-gray-700">
              <tr className="h-12">
                <th className="text-left px-3 py-2 w-[280px]">TIPO</th>
                <th className="text-center px-3 py-2">MARCO (CM)</th>
                <th className="text-center px-3 py-2">HOJA (CM)</th>
                <th className="text-center px-3 py-2">VIDRIO (CM)</th>
                <th className="text-center px-3 py-2">COLOR PVC</th>
                <th className="text-center px-3 py-2">COLOR VIDRIO</th>
                <th className="text-center px-3 py-2">CANT.</th>
                <th className="text-center px-3 py-2 w-[120px]">ACCIONES</th>
              </tr>
            </thead>

            {/* ✨ AQUÍ ESTÁ LA PARTE RESTAURADA QUE DIBUJA LAS FILAS ✨ */}
            <tbody>
              {(order.windows || []).map((window) => (
                <tr key={window.id} className="h-14 border-b hover:bg-gray-50 transition-all align-middle">
                  {editingRow === window.id ? (
                    <>
                      {/* MODO EDICIÓN */}
                      <td className="px-3 py-2 max-w-[280px] truncate whitespace-nowrap" title="Tipo de ventana">
                        <select
                          className="w-full border rounded px-2 py-1"
                          value={editedValues.window_type_id ?? ""}
                          onChange={(e) => setEditedValues((v) => ({ ...v, window_type_id: e.target.value ? Number(e.target.value) : "" }))}
                        >
                          <option value="">— Selecciona —</option>
                          {windowTypes.map((t) => (<option key={t.id} value={t.id}>{t.name}</option>))}
                        </select>
                      </td>
                      <td className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          <input type="number" className="w-20 border rounded px-2 text-center" value={editedValues.width_cm ?? ""} onChange={(e) => setEditedValues((v) => ({ ...v, width_cm: e.target.value }))} />
                          <span>×</span>
                          <input type="number" className="w-20 border rounded px-2 text-center" value={editedValues.height_cm ?? ""} onChange={(e) => setEditedValues((v) => ({ ...v, height_cm: e.target.value }))} />
                        </div>
                      </td>
                      <td className="text-center">—</td>
                      <td className="text-center">—</td>
                      <td className="text-center">
                        <select
                          className="border rounded px-2 py-1"
                          value={editedValues.color_id ?? ""}
                          onChange={(e) => setEditedValues((v) => ({ ...v, color_id: e.target.value ? Number(e.target.value) : "" }))}
                        >
                          <option value="">—</option>
                          {pvcColors.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
                        </select>
                      </td>
                      <td className="text-center">
                        <select
                          className="border rounded px-2 py-1"
                          value={editedValues.glass_color_id ?? ""}
                          onChange={(e) => setEditedValues((v) => ({ ...v, glass_color_id: e.target.value ? Number(e.target.value) : "" }))}
                        >
                          <option value="">—</option>
                          {glassColors.map((g) => (<option key={g.id} value={g.id}>{g.name}</option>))}
                        </select>
                      </td>
                      <td className="text-center">{window.quantity || 1}</td>
                      <td className="text-center w-[120px]">
                        <div className="flex justify-center items-center gap-3 text-lg">
                          <button onClick={() => saveChanges(window.id)} disabled={savingRow} className="text-green-600 hover:text-green-800 disabled:opacity-60" title="Guardar cambios"><FaSave /></button>
                          <button onClick={() => { setEditingRow(null); setEditedValues({}); }} className="text-gray-600 hover:text-gray-800" title="Cancelar">✖</button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      {/* VISTA NORMAL */}
                      <td className="px-3 py-2 max-w-[280px] truncate whitespace-nowrap" title={window.window_type?.name || "Sin tipo"}>
                        {window.window_type?.name || "Desconocido"}
                      </td>
                      <td className="text-center">{window.width_cm} × {window.height_cm}</td>
                      <td className="text-center">{window.hojaAncho?.toFixed(1)} × {window.hojaAlto?.toFixed(1)}</td>
                      <td className="text-center">{window.vidrioAncho?.toFixed(1)} × {window.vidrioAlto?.toFixed(1)}</td>
                      <td className="text-center">{window.pvcColor?.name || "—"}</td>
                      <td className="text-center">{window.glassColor?.name || "—"}</td>
                      <td className="text-center">{window.quantity || 1}</td>
                      <td className="text-center w-[120px]">
                        <div className="flex justify-center items-center gap-3 text-lg">
                          <button onClick={() => startEdit(window)} className="text-blue-600 hover:text-blue-800" title="Editar ventana"><FaEdit /></button>
                          <button onClick={() => handleDelete(window.id)} className="text-red-600 hover:text-red-800" title="Eliminar ventana"><FaTrashAlt /></button>
                          <button onClick={() => handleDuplicate(window.id)} className="text-gray-600 hover:text-gray-800" title="Duplicar ventana"><FaClone /></button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODALES */}
      {showReportModal && (
        <ProfilesReportModal
          isLoading={isReportLoading}
          reportData={reportData}
          onClose={() => setShowReportModal(false)}
        />
      )}
      {showOptimizationModal && (
        <CutOptimizationModal
          isLoading={isOptimizationLoading}
          optimizationData={optimizationData}
          onClose={() => setShowOptimizationModal(false)}
        />
      )}
      {showRescheduleModal && (
        <RescheduleOrderModal
          open={showRescheduleModal}
          onClose={() => setShowRescheduleModal(false)}
          order={order}
          onRescheduleSuccess={() => {
            setShowRescheduleModal(false); // Cierra el modal
            fetchOrder(); // Vuelve a cargar los datos del pedido para mostrar la nueva fecha
          }}
        />
      )}
    </div>
  );
}

