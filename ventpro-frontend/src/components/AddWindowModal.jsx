import { useState, useEffect } from "react";
import api from "@/services/api";

export default function AddWindowModal({ orderId, onClose, onSave }) {
  const [windowTypes, setWindowTypes] = useState([]);
  const [pvcColors, setPvcColors] = useState([]);
  const [glassColors, setGlassColors] = useState([]);
  const [selectedWindowType, setSelectedWindowType] = useState("");
  const [selectedPvcColor, setSelectedPvcColor] = useState("");
  const [selectedGlassColor, setSelectedGlassColor] = useState("");
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  const [loading, setLoading] = useState(false);

  // Preview de cálculos
  const [preview, setPreview] = useState(null);

  // 🔹 Cargar catálogos iniciales (solo PVC y Vidrio)
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pvc, glass] = await Promise.all([
          api.get("/pvc-colors"),
          api.get("/glass-colors"),
        ]);
        setPvcColors(Array.isArray(pvc.data) ? pvc.data : []);
        setGlassColors(Array.isArray(glass.data) ? glass.data : []);
      } catch (error) {
        console.error("❌ Error al cargar catálogos:", error);
      }
    };
    fetchData();
  }, []);

  // 🔹 Cargar tipos de ventana según color PVC
  useEffect(() => {
    setSelectedWindowType(""); // limpiar selección previa
    setWindowTypes([]); // limpiar lista actual

    if (!selectedPvcColor) return;

    api
      .get(`/window-types/by-pvc/${selectedPvcColor}`)
      .then((res) => {
        setWindowTypes(Array.isArray(res.data) ? res.data : []);
      })
      .catch((err) => {
        console.error("Error al cargar tipos:", err);
        setWindowTypes([]);
      });
  }, [selectedPvcColor]);

  useEffect(() => {
    // Si no hay datos suficientes, resetea la vista previa
    if (!selectedWindowType || !width || !height) {
      setPreview(null);
      return;
    }

    // ✨ Debounce para no llamar a la API en cada tecleo
    const handler = setTimeout(() => {
      api.post('/windows/calculate-preview', { // 👈 LLamamos a un endpoint que crearemos
        window_type_id: Number(selectedWindowType),
        width_cm: Number(width),
        height_cm: Number(height),
      })
        .then(response => {
          setPreview(response.data);
        })
        .catch(error => {
          console.error("Error al obtener la vista previa:", error);
          setPreview(null);
        });
    }, 500); // Espera 500ms después de que el usuario deja de escribir

    return () => {
      clearTimeout(handler); // Limpia el timeout si el componente se desmonta o los deps cambian
    };

  }, [selectedWindowType, width, height]);

  // 🔹 Guardar ventana
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // ✅ El payload ya no necesita calcular nada. Es más simple.
      const payload = {
        order_id: Number(orderId),
        width_cm: Number(width),
        height_cm: Number(height),
        window_type_id: Number(selectedWindowType),
        color_id: selectedPvcColor ? Number(selectedPvcColor) : null,
        glass_color_id: selectedGlassColor ? Number(selectedGlassColor) : null,
      };

      const response = await api.post("/windows", payload);

      if (typeof onSave === "function") onSave(response.data);
      onClose();
    } catch (error) {
      console.error("❌ Error al guardar ventana:", error);
      alert("Error al guardar ventana");
    } finally {
      setLoading(false);
    }
  };


  // 🔹 UI
  return (
    <div className="fixed inset-0 bg-white/30 backdrop-blur-[6px] flex justify-center items-center z-[9999] transition-all">
      <div className="bg-white/90 backdrop-blur-md border border-gray-200 p-6 rounded-xl shadow-xl w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">➕ Agregar Ventana</h2>

        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Color PVC (primero) */}
          <div>
            <label className="block font-semibold mb-1">Color PVC</label>
            <select
              value={selectedPvcColor}
              onChange={(e) => setSelectedPvcColor(e.target.value)}
              className="w-full border p-2 rounded"
              required
            >
              <option value="">Seleccione...</option>
              {pvcColors.map((color) => (
                <option key={color.id} value={color.id}>
                  {color.name}
                </option>
              ))}
            </select>
          </div>

          {/* Tipo de ventana (filtrado por color) */}
          <div>
            <label className="block font-semibold mb-1">Tipo de ventana</label>
            <select
              value={selectedWindowType}
              onChange={(e) => setSelectedWindowType(e.target.value)}
              required
              className="w-full border p-2 rounded"
              disabled={!selectedPvcColor || windowTypes.length === 0}
            >
              {!selectedPvcColor ? (
                <option value="">Seleccione color PVC primero…</option>
              ) : windowTypes.length === 0 ? (
                <option value="">Cargando tipos…</option>
              ) : (
                <>
                  <option value="">Seleccione...</option>
                  {windowTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.name}
                    </option>
                  ))}
                </>
              )}
            </select>
          </div>

          {/* Dimensiones */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold mb-1">Ancho (cm)</label>
              <input
                type="number"
                value={width}
                onChange={(e) => setWidth(e.target.value)}
                className="w-full border p-2 rounded"
                required
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Alto (cm)</label>
              <input
                type="number"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                className="w-full border p-2 rounded"
                required
              />
            </div>
          </div>

          {/* Color de vidrio */}
          <div>
            <label className="block font-semibold mb-1">Color de vidrio</label>
            <select
              value={selectedGlassColor}
              onChange={(e) => setSelectedGlassColor(e.target.value)}
              className="w-full border p-2 rounded"
            >
              <option value="">Seleccione...</option>
              {glassColors.map((color) => (
                <option key={color.id} value={color.id}>
                  {color.name}
                </option>
              ))}
            </select>
          </div>

          {/* Vista previa */}
          {preview && (
            <div className="bg-gray-50 border rounded-lg p-3 mt-2 text-sm">
              <p className="font-semibold mb-1 text-gray-700">📐 Cálculos automáticos:</p>
              <p>Hoja: {preview.hojaAncho} × {preview.hojaAlto} cm</p>
              <p>Vidrio: {preview.vidrioAncho} × {preview.vidrioAlto} cm</p>
            </div>
          )}

          {/* Botones */}
          <div className="flex justify-end gap-2 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              {loading ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
