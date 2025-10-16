export default function ProfilesReportModal({ reportData, isLoading, onClose }) {
    // Extraemos ambos reportes del objeto reportData
    const profilesReport = reportData?.profilesReport || [];
    const glassReport = reportData?.glassReport || [];

    return (
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl flex flex-col max-h-[90vh]">

                {/* Encabezado */}
                <div className="p-4 border-b flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-800">Reporte de Materiales</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-700 font-bold text-2xl">&times;</button>
                </div>

                {/* Cuerpo del Modal con Scroll */}
                <div className="p-6 overflow-y-auto space-y-8">
                    {isLoading ? (
                        <p className="text-center text-gray-600">Generando reporte, por favor espera...</p>
                    ) : (
                        <>
                            {/* --- TABLA DE PERFILES --- */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-700 mb-3">Perfiles Necesarios</h3>
                                {profilesReport.length > 0 ? (
                                    <table className="min-w-full divide-y divide-gray-200 border rounded-lg">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Color PVC</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo de Perfil</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre del Perfil</th>
                                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Barras Necesarias</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {profilesReport.map((item, index) => (
                                                <tr key={`profile-${index}`} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 whitespace-nowrap">{item.colorPvc}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap">{item.tipoPerfil}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap font-medium">{item.nombrePerfil}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-center font-bold text-lg text-blue-600">{item.barrasNecesarias}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                ) : (
                                    <p className="text-gray-500">No se encontraron perfiles para este pedido.</p>
                                )}
                            </div>

                            {/* --- TABLA DE VIDRIOS --- */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-700 mb-3">Vidrios Necesarios</h3>
                                {glassReport.length > 0 ? (
                                    <table className="min-w-full divide-y divide-gray-200 border rounded-lg">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Color de Vidrio</th>
                                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Planchas Necesarias</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {glassReport.map((item, index) => (
                                                <tr key={`glass-${index}`} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 whitespace-nowrap font-medium">{item.colorVidrio}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-center font-bold text-lg text-green-600">{item.planchasNecesarias}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                ) : (
                                    <p className="text-gray-500">No se encontraron vidrios para este pedido.</p>
                                )}
                            </div>
                        </>
                    )}
                </div>

                {/* Pie del Modal con Botón de Descarga (a futuro) */}
                <div className="p-4 border-t bg-gray-50 flex justify-end items-center gap-4">
                    <button
                        disabled={true} // Deshabilitado por ahora
                        className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:bg-red-300 disabled:cursor-not-allowed"
                    >
                        Descargar PDF (Próximamente)
                    </button>
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