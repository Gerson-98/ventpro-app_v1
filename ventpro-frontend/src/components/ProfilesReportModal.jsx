export default function ProfilesReportModal({ reportData, isLoading, onClose }) {
    return (
        // Fondo oscuro semi-transparente
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50 p-4">

            {/* Contenedor del Modal */}
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-3xl flex flex-col max-h-[90vh]">

                {/* Encabezado del Modal */}
                <div className="p-4 border-b flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-800">Reporte de Perfiles Necesarios</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-700 font-bold text-2xl"
                    >
                        &times;
                    </button>
                </div>

                {/* Cuerpo del Modal (con scroll si es necesario) */}
                <div className="p-6 overflow-y-auto">
                    {isLoading ? (
                        <p className="text-center text-gray-600">Generando reporte, por favor espera...</p>
                    ) : reportData.length === 0 ? (
                        <p className="text-center text-gray-600">No hay perfiles para calcular en este pedido. Asegúrate de que el pedido tenga ventanas agregadas.</p>
                    ) : (
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50 sticky top-0">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Color PVC</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo de Perfil</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre del Perfil</th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Barras Necesarias</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {reportData.map((item, index) => (
                                    <tr key={index} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">{item.colorPvc}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">{item.tipoPerfil}</td>
                                        <td className="px-6 py-4 whitespace-nowrap font-medium">{item.nombrePerfil}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center font-bold text-lg text-blue-600">{item.barrasNecesarias}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Pie del Modal */}
                <div className="p-4 border-t bg-gray-50 text-right">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
}