// src/pages/Quotations.jsx

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/services/api";
import { FaPlus, FaTrashAlt } from "react-icons/fa";
import AddQuotationModal from "@/components/AddQuotationModal"; // ✨ Importamos el nuevo modal

export default function Quotations() {
    const [quotations, setQuotations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false); // ✨ Estado para controlar el modal
    const navigate = useNavigate();

    const fetchQuotations = async () => {
        setLoading(true);
        try {
            const response = await api.get("/quotations");
            setQuotations(response.data);
        } catch (error) {
            console.error("❌ Error al obtener cotizaciones:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchQuotations();
    }, []);

    const formatDate = (dateString) => new Date(dateString).toLocaleDateString('es-GT', { year: 'numeric', month: 'long', day: 'numeric' });
    const handleDelete = async (e, id) => {
        e.stopPropagation(); // Evita que al hacer clic se navegue al detalle
        if (!confirm("¿Estás seguro de que deseas eliminar esta cotización?")) return;

        try {
            await api.delete(`/quotations/${id}`);
            fetchQuotations(); // Recarga la lista
        } catch (error) {
            console.error("❌ Error al eliminar la cotización:", error);
            alert("No se pudo eliminar la cotización.");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-6">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-800">Cotizaciones</h1>
                    {/* ✨ El botón ahora solo abre el modal */}
                    <button
                        onClick={() => setShowModal(true)}
                        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-sm hover:bg-blue-700 transition-all"
                    >
                        <FaPlus /> Nueva Cotización
                    </button>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    {loading ? (
                        <p className="p-6 text-gray-500">Cargando cotizaciones...</p>
                    ) : quotations.length === 0 ? (
                        <p className="p-6 text-gray-500">No hay cotizaciones creadas. ¡Crea la primera!</p>
                    ) : (
                        <table className="min-w-full text-sm">
                            <thead className="bg-gray-100 text-gray-600 uppercase">
                                <tr>
                                    <th className="py-3 px-4 text-left">Proyecto</th>
                                    <th className="py-3 px-4 text-left">Cliente</th>
                                    <th className="py-3 px-4 text-left">Fecha</th>
                                    <th className="py-3 px-4 text-center">Estado</th>
                                    <th className="py-3 px-4 text-right">Total</th>
                                    <th className="py-3 px-4 text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {quotations.map((quote) => (
                                    <tr key={quote.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => navigate(`/quotations/${quote.id}`)}>
                                        <td className="py-3 px-4 font-medium text-gray-800">{quote.project}</td>
                                        <td className="py-3 px-4 text-gray-600">{quote.client?.name || 'N/A'}</td>
                                        <td className="py-3 px-4 text-gray-600">{formatDate(quote.createdAt)}</td>
                                        <td className="py-3 px-4 text-center">

                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${quote.status === 'confirmado' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                {quote.status}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-right font-mono text-gray-800">Q {quote.total_price?.toFixed(2) || '0.00'}</td>
                                        <td className="py-3 px-4 flex justify-center items-center">
                                            <button
                                                onClick={(e) => handleDelete(e, quote.id)}
                                                className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-100"
                                                title="Eliminar Cotización"
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
            </div>

            {/* ✨ Renderizamos el modal condicionalmente */}
            {showModal && (
                <AddQuotationModal
                    open={showModal}
                    onClose={() => setShowModal(false)}
                    onSave={() => {
                        setShowModal(false); // Cierra el modal
                        fetchQuotations(); // Refresca la lista de cotizaciones
                    }}
                />
            )}
        </div>
    );
}