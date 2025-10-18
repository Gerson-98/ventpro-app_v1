// src/pages/QuotationDetail.jsx

import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '@/services/api';
import { FaFilePdf, FaCheckCircle, FaEdit } from 'react-icons/fa';
import AddQuotationModal from '@/components/AddQuotationModal';
import { generateQuotationPDF } from '@/lib/generateQuotationPDF';
import ConfirmQuotationModal from '@/components/ConfirmQuotationModal'; // ✨ 1. Importamos la función del PDF

export default function QuotationDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [quotation, setQuotation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isConfirming, setIsConfirming] = useState(false);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

    const fetchQuotation = async () => {
        setLoading(true);
        try {
            const response = await api.get(`/quotations/${id}`);
            setQuotation(response.data);
        } catch (error) {
            console.error("❌ Error al obtener la cotización:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchQuotation();
    }, [id]);

    const formatDate = (dateString) => new Date(dateString).toLocaleDateString('es-GT', { year: 'numeric', month: 'long', day: 'numeric' });
    const formatCurrency = (amount) => `Q ${Number(amount || 0).toFixed(2)}`;

    if (loading) {
        return <div className="text-center p-8">Cargando detalle de la cotización...</div>;
    }
    if (!quotation) {
        return <div className="text-center p-8 text-red-500">No se pudo encontrar la cotización.</div>;
    }



    // ✨ 2. Creamos la función que llamará al generador de PDF
    const handleGeneratePDF = () => {
        if (quotation) {
            generateQuotationPDF(quotation);
        }
    };

    return (
        <div className="max-w-5xl mx-auto">
            <Link to="/quotations" className="text-blue-600 hover:underline mb-4 inline-block">
                &larr; Volver a la lista
            </Link>

            {/* --- ENCABEZADO Y ACCIONES --- */}
            <header className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-6">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">{quotation.project}</h1>
                        <p className="text-gray-500">Cliente: {quotation.client?.name || "N/A"}</p>
                        <p className="text-sm text-gray-400">Creada el: {formatDate(quotation.createdAt)}</p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setIsEditModalOpen(true)}
                            className="flex items-center gap-2 bg-gray-200 text-gray-700 px-3 py-2 rounded-lg text-sm hover:bg-gray-300">
                            <FaEdit /> Editar
                        </button>
                        {/* ✨ 3. Conectamos el onClick al botón del PDF */}
                        <button
                            onClick={handleGeneratePDF}
                            className="flex items-center gap-2 bg-red-500 text-white px-3 py-2 rounded-lg text-sm hover:bg-red-600">
                            <FaFilePdf /> PDF
                        </button>
                        <button
                            onClick={() => setIsConfirmModalOpen(true)}
                            disabled={quotation.status === 'confirmado'}
                            className="flex items-center gap-2 bg-green-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                            <FaCheckCircle />
                            {quotation.status === 'confirmado' ? 'Confirmado' : 'Confirmar'}
                        </button>
                    </div>
                </div>
                <div className="mt-4 border-t pt-4 flex justify-between items-center">
                    <div className="text-sm text-gray-500">
                        <span className="font-semibold">Precio por m²:</span> {formatCurrency(quotation.price_per_m2)}
                    </div>
                    <div className="text-right">
                        <span className="text-sm text-gray-500">Total de la Cotización</span>
                        <p className="text-2xl font-bold text-gray-800">{formatCurrency(quotation.total_price)}</p>
                    </div>
                </div>
            </header>

            {/* --- TABLA DE VENTANAS --- */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <h2 className="p-4 text-lg font-semibold border-b">Detalle de Ventanas</h2>
                <table className="min-w-full text-sm">
                    <thead className="bg-gray-50 text-gray-500">
                        <tr>
                            <th className="py-2 px-4 text-left">Tipo de Ventana</th>
                            <th className="py-2 px-4 text-left">Dimensiones (m)</th>
                            <th className="py-2 px-4 text-left">Color PVC</th>
                            <th className="py-2 px-4 text-left">Color Vidrio</th>
                            <th className="py-2 px-4 text-right">Precio</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {quotation.quotation_windows && quotation.quotation_windows.map((win) => (
                            <tr key={win.id}>
                                <td className="py-3 px-4 font-medium">{win.window_type.name}</td>
                                <td className="py-3 px-4">{(win.width_cm / 100).toFixed(2)}m x {(win.height_cm / 100).toFixed(2)}m</td>
                                <td className="py-3 px-4">{win.pvcColor.name}</td>
                                <td className="py-3 px-4">{win.glassColor.name}</td>
                                <td className="py-3 px-4 text-right font-mono">{formatCurrency(win.price)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* --- MODAL DE EDICIÓN --- */}
            {isEditModalOpen && (
                <AddQuotationModal
                    open={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                    quotationToEdit={quotation}
                    onSave={() => {
                        setIsEditModalOpen(false);
                        fetchQuotation();
                    }}
                />
            )}
            {isConfirmModalOpen && (
                <ConfirmQuotationModal
                    open={isConfirmModalOpen}
                    onClose={() => setIsConfirmModalOpen(false)}
                    quotationId={quotation.id}
                    onConfirmSuccess={(newOrderId) => {
                        // Cuando la confirmación es exitosa, el modal nos da el ID del nuevo pedido
                        // y nosotros nos encargamos de redirigir al usuario.
                        navigate(`/orders/${newOrderId}`);
                    }}
                />
            )}
        </div>
    );
}