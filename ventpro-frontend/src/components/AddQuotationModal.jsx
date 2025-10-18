// src/components/modals/AddQuotationModal.jsx

import { useState, useEffect } from 'react';
import api from '@/services/api';
import { FaPlus, FaTrashAlt, FaClone } from 'react-icons/fa';
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import AddClientModal from './AddClientModal';

export default function AddQuotationModal({ open, onClose, onSave, quotationToEdit }) {
    const [clients, setClients] = useState([]);
    const [windowTypes, setWindowTypes] = useState([]);
    const [pvcColors, setPvcColors] = useState([]);
    const [glassColors, setGlassColors] = useState([]);
    const [showAddClientModal, setShowAddClientModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);

    const [quotation, setQuotation] = useState({
        project: '', clientId: '', price_per_m2: '', windows: [],
    });

    // ✨ Lógica movida al useEffect correcto
    useEffect(() => {
        // 1. Cargar catálogos solo cuando el modal se abre
        if (open) {
            const fetchCatalogs = async () => {
                try {
                    const [clientsRes, typesRes, pvcRes, glassRes] = await Promise.all([
                        api.get('/clients'), api.get('/window-types'), api.get('/pvc-colors'), api.get('/glass-colors'),
                    ]);
                    setClients(clientsRes.data);
                    setWindowTypes(typesRes.data);
                    setPvcColors(pvcRes.data);
                    setGlassColors(glassRes.data);
                } catch (error) { console.error("❌ Error cargando catálogos:", error); }
            };
            fetchCatalogs();
        }

        // 2. Llenar el formulario si estamos en modo edición
        if (quotationToEdit) {
            setIsEditing(true);
            setQuotation({
                project: quotationToEdit.project,
                clientId: quotationToEdit.clientId || '',
                price_per_m2: quotationToEdit.price_per_m2,
                windows: quotationToEdit.quotation_windows.map(win => ({
                    width_m: win.width_cm / 100, // Convertimos de cm a m
                    height_m: win.height_cm / 100,
                    window_type_id: win.window_type_id,
                    color_id: win.color_id,
                    glass_color_id: win.glass_color_id,
                })),
            });
        } else {
            // Limpiar formulario si estamos en modo creación
            setIsEditing(false);
            setQuotation({ project: '', clientId: '', price_per_m2: '', windows: [] });
        }
    }, [open, quotationToEdit]);

    // --- Manejadores de estado (ahora en el lugar correcto) ---
    const handleQuotationChange = (e) => setQuotation(prev => ({ ...prev, [e.target.name]: e.target.value }));
    const handleWindowChange = (index, e) => {
        const updatedWindows = [...quotation.windows];
        updatedWindows[index][e.target.name] = e.target.value;
        setQuotation(prev => ({ ...prev, windows: updatedWindows }));
    };
    const addWindow = () => setQuotation(prev => ({ ...prev, windows: [...prev.windows, { width_m: '', height_m: '', window_type_id: '', color_id: '', glass_color_id: '' }] }));
    const removeWindow = (index) => setQuotation(prev => ({ ...prev, windows: prev.windows.filter((_, i) => i !== index) }));
    const duplicateWindow = (index) => {
        const windowToDuplicate = { ...quotation.windows[index] };
        const updatedWindows = [...quotation.windows];
        updatedWindows.splice(index + 1, 0, windowToDuplicate);
        setQuotation(prev => ({ ...prev, windows: updatedWindows }));
    };

    // ✨ handleSubmit ahora es "inteligente"
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const payload = {
            ...quotation,
            clientId: Number(quotation.clientId) || null,
            price_per_m2: Number(quotation.price_per_m2),
            windows: quotation.windows.map(win => ({
                width_m: Number(win.width_m), height_m: Number(win.height_m),
                window_type_id: Number(win.window_type_id), color_id: Number(win.color_id), glass_color_id: Number(win.glass_color_id),
            })),
        };
        try {
            if (isEditing) {
                await api.patch(`/quotations/${quotationToEdit.id}`, payload);
            } else {
                await api.post('/quotations', payload);
            }
            onSave();
        } catch (error) {
            console.error("❌ Error al guardar la cotización:", error);
            alert('Hubo un error al guardar la cotización.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <DialogPrimitive.Root open={open} onOpenChange={onClose}>
                <DialogPrimitive.Portal>
                    <DialogPrimitive.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" />
                    <DialogContent className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto z-50">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-bold text-gray-800">
                                {isEditing ? 'Editar Cotización' : 'Crear Nueva Cotización'}
                            </DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="mt-4 space-y-6">
                            {/* --- DATOS GENERALES --- */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700">Nombre del Proyecto</label>
                                    <input type="text" name="project" value={quotation.project} onChange={handleQuotationChange} className="mt-1 w-full border-gray-300 rounded-md shadow-sm" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Cliente</label>
                                    <div className="flex items-center gap-2">
                                        <select name="clientId" value={quotation.clientId} onChange={handleQuotationChange} className="mt-1 w-full border-gray-300 rounded-md shadow-sm">
                                            <option value="">-- Seleccionar --</option>
                                            {clients.map(client => <option key={client.id} value={client.id}>{client.name}</option>)}
                                        </select>
                                        <Button type="button" size="icon" onClick={() => setShowAddClientModal(true)} className="mt-1">
                                            <FaPlus />
                                        </Button>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Precio por m² (Q)</label>
                                    <input type="number" step="0.01" name="price_per_m2" value={quotation.price_per_m2} onChange={handleQuotationChange} className="mt-1 w-full border-gray-300 rounded-md shadow-sm" required />
                                </div>
                            </div>
                            <hr />
                            {/* --- LISTA DE VENTANAS --- */}
                            <div>
                                <h2 className="text-xl font-semibold text-gray-800 mb-4">Ventanas</h2>
                                <div className="space-y-4">
                                    {quotation.windows.map((win, index) => (
                                        <div key={index} className="bg-gray-50 p-4 rounded-lg border grid grid-cols-12 gap-3 items-end">
                                            <div className="col-span-2"><label className="text-xs">Ancho (m)</label><input type="number" step="0.01" name="width_m" value={win.width_m} onChange={(e) => handleWindowChange(index, e)} className="w-full text-sm p-2 border-gray-300 rounded-md" required /></div>
                                            <div className="col-span-2"><label className="text-xs">Alto (m)</label><input type="number" step="0.01" name="height_m" value={win.height_m} onChange={(e) => handleWindowChange(index, e)} className="w-full text-sm p-2 border-gray-300 rounded-md" required /></div>
                                            <div className="col-span-3"><label className="text-xs">Tipo Ventana</label><select name="window_type_id" value={win.window_type_id} onChange={(e) => handleWindowChange(index, e)} className="w-full text-sm p-2 border-gray-300 rounded-md" required><option value="">--</option>{windowTypes.map(wt => <option key={wt.id} value={wt.id}>{wt.name}</option>)}</select></div>
                                            <div className="col-span-2"><label className="text-xs">Color PVC</label><select name="color_id" value={win.color_id} onChange={(e) => handleWindowChange(index, e)} className="w-full text-sm p-2 border-gray-300 rounded-md" required><option value="">--</option>{pvcColors.map(pc => <option key={pc.id} value={pc.id}>{pc.name}</option>)}</select></div>
                                            <div className="col-span-2"><label className="text-xs">Color Vidrio</label><select name="glass_color_id" value={win.glass_color_id} onChange={(e) => handleWindowChange(index, e)} className="w-full text-sm p-2 border-gray-300 rounded-md" required><option value="">--</option>{glassColors.map(gc => <option key={gc.id} value={gc.id}>{gc.name}</option>)}</select></div>
                                            <div className="col-span-1 flex items-center justify-center gap-4">
                                                <button type="button" onClick={() => duplicateWindow(index)} className="text-blue-500 hover:text-blue-700" title="Duplicar Fila"><FaClone /></button>
                                                <button type="button" onClick={() => removeWindow(index)} className="text-red-500 hover:text-red-700" title="Eliminar Fila"><FaTrashAlt /></button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <button type="button" onClick={addWindow} className="mt-4 flex items-center gap-2 text-blue-600 font-medium text-sm"><FaPlus /> Añadir Ventana</button>
                            </div>
                            <DialogFooter className="pt-4">
                                <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>Cancelar</Button>
                                <Button type="submit" disabled={loading}>
                                    {loading ? 'Guardando...' : (isEditing ? 'Guardar Cambios' : 'Guardar Cotización')}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </DialogPrimitive.Portal>
            </DialogPrimitive.Root>

            {/* El modal de AddClientModal se queda igual */}
            <AddClientModal
                open={showAddClientModal}
                onClose={() => setShowAddClientModal(false)}
                onSave={(newClient) => {
                    setShowAddClientModal(false);
                    setClients((prev) => [...prev, newClient]);
                    setQuotation((prev) => ({ ...prev, clientId: newClient.id }));
                }}
            />
        </>
    );
}