import { useState, useEffect } from 'react';
import api from '@/services/api';
import { FaEdit, FaSave } from 'react-icons/fa';

export default function CalculationsTab() {
    const [typesWithCalcs, setTypesWithCalcs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingRowId, setEditingRowId] = useState(null);
    const [editedValues, setEditedValues] = useState({});

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await api.get('/window-calculations');
            setTypesWithCalcs(response.data);
        } catch (error) {
            console.error("Error al cargar los datos de cálculo:", error);
        } finally {
            setLoading(false);
        }
    };

    const startEdit = (type) => {
        setEditingRowId(type.id);
        setEditedValues({
            hojaDivision: type.calculation?.hojaDivision || 'Mitad',
            hojaMargen: type.calculation?.hojaMargen || 0,
            hojaDescuento: type.calculation?.hojaDescuento || 0,
            vidrioDescuento: type.calculation?.vidrioDescuento || 0,
        });
    };

    const handleCancel = () => {
        setEditingRowId(null);
        setEditedValues({});
    };

    const handleSave = async (windowTypeId) => {
        try {
            const payload = {
                window_type_id: windowTypeId,
                hojaDivision: editedValues.hojaDivision,
                hojaMargen: Number(editedValues.hojaMargen),
                hojaDescuento: Number(editedValues.hojaDescuento),
                vidrioDescuento: Number(editedValues.vidrioDescuento),
            };
            await api.post('/window-calculations', payload);
            setEditingRowId(null);
            fetchData(); // Recargar datos para ver los cambios
        } catch (error) {
            console.error("Error al guardar los cálculos:", error);
            alert('Hubo un error al guardar.');
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setEditedValues(prev => ({ ...prev, [name]: value }));
    };

    if (loading) return <div>Cargando reglas de cálculo...</div>;

    return (
        <div className="bg-white p-6 rounded-lg shadow-md transition">
            <div className="mb-6">
                <h2 className="text-2xl font-semibold text-gray-800">Ajustes de Cálculo</h2>
                <p className="text-gray-500 text-sm">
                    Define cómo se calculan las medidas de hoja y vidrio para cada tipo de ventana.
                </p>
            </div>

            <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden">
                <thead className="bg-gray-100 text-gray-700 text-sm uppercase">
                    <tr>
                        <th className="py-3 px-4 text-left">Tipo de Ventana</th>
                        <th className="py-3 px-4 text-left">División Hoja</th>
                        <th className="py-3 px-4 text-left">Margen Ancho (cm)</th>
                        <th className="py-3 px-4 text-left">Desc. Alto Hoja (cm)</th>
                        <th className="py-3 px-4 text-left">Desc. Vidrio (cm)</th>
                        <th className="py-3 px-4 text-center">Acciones</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                    {typesWithCalcs.map((type) => (
                        <tr key={type.id} className="hover:bg-gray-50">
                            {editingRowId === type.id ? (
                                <>
                                    <td className="px-4 py-2 font-medium">{type.name}</td>
                                    <td className="px-4 py-2">
                                        <select name="hojaDivision" value={editedValues.hojaDivision} onChange={handleChange} className="w-full border p-1 rounded">
                                            <option value="Completo">Completo</option>
                                            <option value="Mitad">Mitad</option>
                                            <option value="Tercio">Tercio</option>
                                            <option value="Cuarto">Cuarto</option>
                                        </select>
                                    </td>
                                    <td className="px-4 py-2"><input type="number" step="0.1" name="hojaMargen" value={editedValues.hojaMargen} onChange={handleChange} className="w-24 border p-1 rounded" /></td>
                                    <td className="px-4 py-2"><input type="number" step="0.1" name="hojaDescuento" value={editedValues.hojaDescuento} onChange={handleChange} className="w-24 border p-1 rounded" /></td>
                                    <td className="px-4 py-2"><input type="number" step="0.1" name="vidrioDescuento" value={editedValues.vidrioDescuento} onChange={handleChange} className="w-24 border p-1 rounded" /></td>
                                    <td className="px-4 py-2 text-center">
                                        <div className="flex justify-center items-center gap-4">
                                            <button onClick={() => handleSave(type.id)} className="text-green-600 hover:text-green-800"><FaSave size={18} /></button>
                                            <button onClick={handleCancel} className="text-gray-600 hover:text-gray-800">✖</button>
                                        </div>
                                    </td>
                                </>
                            ) : (
                                <>
                                    <td className="px-4 py-2 font-medium text-gray-900">{type.name}</td>
                                    <td className="px-4 py-2">{type.calculation?.hojaDivision || 'N/A'}</td>
                                    <td className="px-4 py-2">{type.calculation?.hojaMargen ?? 'N/A'}</td>
                                    <td className="px-4 py-2">{type.calculation?.hojaDescuento ?? 'N/A'}</td>
                                    <td className="px-4 py-2">{type.calculation?.vidrioDescuento ?? 'N/A'}</td>
                                    <td className="px-4 py-2 text-center">
                                        <button onClick={() => startEdit(type)} className="text-blue-600 hover:text-blue-800"><FaEdit /></button>
                                    </td>
                                </>
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}