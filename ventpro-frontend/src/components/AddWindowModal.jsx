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
  const [preview, setPreview] = useState({
    hojaAncho: 0,
    hojaAlto: 0,
    vidrioAncho: 0,
    vidrioAlto: 0,
  });

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

  // 🔹 Cálculos automáticos
  useEffect(() => {
    if (!selectedWindowType || !width || !height) return;

    const selected = windowTypes.find(
      (t) => String(t.id) === String(selectedWindowType)
    );
    if (!selected) return;

    const { hojaAncho, hojaAlto, vidrioAncho, vidrioAlto } =
      calculateMeasurements(selected.name, Number(width), Number(height));

    setPreview({ hojaAncho, hojaAlto, vidrioAncho, vidrioAlto });
  }, [selectedWindowType, width, height, windowTypes]);

  // 🔹 Guardar ventana
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        order_id: Number(orderId),
        width_cm: Number(width),
        height_cm: Number(height),
        window_type_id: Number(selectedWindowType),
        color_id: selectedPvcColor ? Number(selectedPvcColor) : null,
        glass_color_id: selectedGlassColor ? Number(selectedGlassColor) : null,
      };

      console.log("🪟 Enviando ventana:", payload);
      const response = await api.post("/windows", payload);
      console.log("✅ Ventana creada:", response.data);

      if (typeof onSave === "function") onSave(response.data);
      onClose();
    } catch (error) {
      console.error("❌ Error al guardar ventana:", error);
      alert("Error al guardar ventana");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Cálculo de medidas
  function calculateMeasurements(windowType, width, height) {
    let hojaAncho = 0;
    let hojaAlto = 0;
    let vidrioAncho = 0;
    let vidrioAlto = 0;

    switch (windowType.toUpperCase()) {
      // ======== CORREDIZAS MARCO 45 ========
      case 'VENTANA CORREDIZA 2 HOJAS 55 CM MARCO 45 CM':
        hojaAncho = width / 2;
        hojaAlto = height - 7.2;
        vidrioAncho = hojaAncho - 8.5;
        vidrioAlto = hojaAlto - 8.5;
        break;

      case 'VENTANA CORREDIZA 3 HOJAS 55 CM MARCO 45 CM LATERALES OCULTOS':
        hojaAncho = (width + 6) / 4;
        hojaAlto = height - 7.2;
        vidrioAncho = hojaAncho - 8.5;
        vidrioAlto = hojaAlto - 8.5;
        break;

      case 'VENTANA CORREDIZA 3 HOJAS 55 CM MARCO 45 CM 3 IGUALES':
        hojaAncho = (width + 6) / 3;
        hojaAlto = height - 7.2;
        vidrioAncho = hojaAncho - 8.5;
        vidrioAlto = hojaAlto - 8.5;
        break;

      case 'VENTANA CORREDIZA 4 HOJAS 55 CM MARCO 45 CM':
        hojaAncho = (width + 6) / 4;
        hojaAlto = height - 7.2;
        vidrioAncho = hojaAncho - 8.5;
        vidrioAlto = hojaAlto - 8.5;
        break;

      // ======== PUERTAS CORREDIZAS MARCO 45 ========
      case 'PUERTA CORREDIZA 2 HOJAS 66 CM MARCO 45 CM CHAPA AMBAS HOJAS':
        hojaAncho = (width - 0.5) / 2;
        hojaAlto = height - 7.2;
        vidrioAncho = hojaAncho - 8.5;
        vidrioAlto = hojaAlto - 8.5;
        break;

      case 'PUERTA CORREDIZA 2 HOJAS 66 CM MARCO 45 CM CHAPA EN 1 HOJA':
        hojaAncho = width / 2;
        hojaAlto = height - 7.2;
        vidrioAncho = hojaAncho - 8.5;
        vidrioAlto = hojaAlto - 8.5;
        break;

      case 'PUERTA CORREDIZA 2 HOJAS 66 CM MARCO 45 CM SOLO CERROJO':
        hojaAncho = (width + 1) / 2;
        hojaAlto = height - 7.2;
        vidrioAncho = hojaAncho - 8.5;
        vidrioAlto = hojaAlto - 8.5;
        break;

      case 'PUERTA CORREDIZA 3 HOJAS 66 CM MARCO 45 CM LATERALES OCULTOS':
        hojaAncho = (width + 8) / 4;
        hojaAlto = height - 7.2;
        vidrioAncho = hojaAncho - 8.5;
        vidrioAlto = hojaAlto - 8.5;
        break;

      case 'PUERTA CORREDIZA 3 HOJAS 66 CM MARCO 45 CM 3 IGUALES':
        hojaAncho = (width + 8) / 3;
        hojaAlto = height - 7.2;
        vidrioAncho = hojaAncho - 8.5;
        vidrioAlto = hojaAlto - 8.5;
        break;

      case 'PUERTA CORREDIZA 4 HOJAS 66 CM MARCO 45 CM':
        hojaAncho = (width + 8) / 4;
        hojaAlto = height - 7.2;
        vidrioAncho = hojaAncho - 8.5;
        vidrioAlto = hojaAlto - 8.5;
        break;

      // ======== MARCO FIJO Y PUERTAS ========
      case 'MARCO FIJO':
        hojaAncho = width;
        hojaAlto = height;
        vidrioAncho = hojaAncho - 8.5;
        vidrioAlto = hojaAlto - 8.5;
        break;

      case 'PUERTA ANDINA':
        hojaAncho = width - 8.8;
        hojaAlto = height - 5.5;
        vidrioAncho = hojaAncho - 18.7;
        vidrioAlto = hojaAlto - 18.7;
        break;

      case 'PUERTA DE LUJO 1 HOJA':
        hojaAncho = width - 4.5;
        hojaAlto = height - 4;
        vidrioAncho = hojaAncho - 16.7;
        vidrioAlto = hojaAlto - 16.7;
        break;

      case 'PUERTA DE LUJO 2 HOJAS':
        hojaAncho = (width - 5) / 2;
        hojaAlto = height - 4;
        vidrioAncho = hojaAncho - 16.7;
        vidrioAlto = hojaAlto - 16.7;
        break;

      // ======== ABATIBLES Y PROYECTABLE ========
      case 'VENTANA ABATIBLE DE 1 HOJA':
        hojaAncho = width - 4.5;
        hojaAlto = height - 4.5;
        vidrioAncho = hojaAncho - 16.7;
        vidrioAlto = hojaAlto - 16.7;
        break;

      case 'VENTANA ABATIBLE DE 2 HOJAS':
        hojaAncho = (width - 5) / 2;
        hojaAlto = height - 4.5;
        vidrioAncho = hojaAncho - 16.7;
        vidrioAlto = hojaAlto - 16.7;
        break;

      case 'VENTANA PROYECTABLE':
        hojaAncho = width - 6.3;
        hojaAlto = height - 6.3;
        vidrioAncho = hojaAncho - 16.7;
        vidrioAlto = hojaAlto - 16.7;
        break;

      // ======== CORREDIZAS MARCO 5 ========
      case 'VENTANA CORREDIZA 2 HOJAS 55 CM MARCO 5 CM':
        hojaAncho = (width - 1) / 2;
        hojaAlto = height - 8.2;
        vidrioAncho = hojaAncho - 8.5;
        vidrioAlto = hojaAlto - 8.5;
        break;

      case 'VENTANA CORREDIZA 3 HOJAS 55 CM MARCO 5 CM LATERALES OCULTOS':
        hojaAncho = (width + 5) / 4;
        hojaAlto = height - 8.2;
        vidrioAncho = hojaAncho - 8.5;
        vidrioAlto = hojaAlto - 8.5;
        break;

      case 'VENTANA CORREDIZA 3 HOJAS 55 CM MARCO 5 CM 3 IGUALES':
        hojaAncho = (width + 5) / 3;
        hojaAlto = height - 8.2;
        vidrioAncho = hojaAncho - 8.5;
        vidrioAlto = hojaAlto - 8.5;
        break;

      case 'VENTANA CORREDIZA 4 HOJAS 55 CM MARCO 5 CM':
        hojaAncho = (width + 5) / 4;
        hojaAlto = height - 8.2;
        vidrioAncho = hojaAncho - 8.5;
        vidrioAlto = hojaAlto - 8.5;
        break;

      // ======== PUERTAS CORREDIZAS MARCO 5 ========
      case 'PUERTA CORREDIZA 2 HOJAS 66 CM MARCO 5 CM CHAPA AMBAS HOJAS':
        hojaAncho = (width - 1) / 2;
        hojaAlto = height - 8.2;
        vidrioAncho = hojaAncho - 10.5;
        vidrioAlto = hojaAlto - 10.5;
        break;

      case 'PUERTA CORREDIZA 2 HOJAS 66 CM MARCO 5 CM CHAPA EN 1 HOJA':
        hojaAncho = (width + 0.5) / 2;
        hojaAlto = height - 8.2;
        vidrioAncho = hojaAncho - 10.5;
        vidrioAlto = hojaAlto - 10.5;
        break;

      case 'PUERTA CORREDIZA 2 HOJAS 66 CM MARCO 5 CM SOLO CERROJO':
        hojaAncho = (width - 0.5) / 2;
        hojaAlto = height - 8.2;
        vidrioAncho = hojaAncho - 10.5;
        vidrioAlto = hojaAlto - 10.5;
        break;

      case 'PUERTA CORREDIZA 3 HOJAS 66 CM MARCO 5 CM LATERALES OCULTOS':
        hojaAncho = (width + 7) / 4;
        hojaAlto = height - 8.2;
        vidrioAncho = hojaAncho - 10.5;
        vidrioAlto = hojaAlto - 10.5;
        break;

      case 'PUERTA CORREDIZA 3 HOJAS 66 CM MARCO 5 CM 3 IGUALES':
        hojaAncho = (width + 8) / 3;
        hojaAlto = height - 8.2;
        vidrioAncho = hojaAncho - 10.5;
        vidrioAlto = hojaAlto - 10.5;
        break;

      case 'PUERTA CORREDIZA 4 HOJAS 66 CM MARCO 5 CM':
        hojaAncho = (width + 8) / 4;
        hojaAlto = height - 8.2;
        vidrioAncho = hojaAncho - 10.5;
        vidrioAlto = hojaAlto - 10.5;
        break;

      // ======== DEFAULT ========
      default:
        hojaAncho = width;
        hojaAlto = height;
        vidrioAncho = width;
        vidrioAlto = height;
    }


    return {
      hojaAncho: Number(hojaAncho.toFixed(1)),
      hojaAlto: Number(hojaAlto.toFixed(1)),
      vidrioAncho: Number(vidrioAncho.toFixed(1)),
      vidrioAlto: Number(vidrioAlto.toFixed(1)),
    };
  }

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
          {selectedWindowType && width && height && (
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
