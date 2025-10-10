import { useState, useEffect } from "react";
import axios from "axios";

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

  // 🔹 Preview de cálculos en vivo
  const [preview, setPreview] = useState({
    hojaAncho: 0,
    hojaAlto: 0,
    vidrioAncho: 0,
    vidrioAlto: 0,
  });

  // 🔹 Cargar catálogos
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [types, pvc, glass] = await Promise.all([
          axios.get("http://localhost:3000/window-types"),
          axios.get("http://localhost:3000/pvc-colors"),
          axios.get("http://localhost:3000/glass-colors"),
        ]);
        setWindowTypes(types.data);
        setPvcColors(pvc.data);
        setGlassColors(glass.data);
      } catch (error) {
        console.error("❌ Error al cargar catálogos:", error);
      }
    };
    fetchData();
  }, []);

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
      const windowType = windowTypes.find(
        (t) => String(t.id) === String(selectedWindowType)
      );

      const payload = {
        orderId,
        width_cm: Number(width),
        height_cm: Number(height),
        windowTypeId: Number(selectedWindowType),
        windowTypeName: windowType ? windowType.name : "",
        pvcColorId: selectedPvcColor ? Number(selectedPvcColor) : null,
        glassColorId: selectedGlassColor ? Number(selectedGlassColor) : null,
      };

      console.log("🪟 Enviando ventana:", payload);
      const response = await axios.post("http://localhost:3000/windows", payload);
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

  // 🔹 Cálculo de medidas según tipo
  function calculateMeasurements(windowType, width, height) {
    let hojaAncho = 0;
    let hojaAlto = 0;
    let vidrioAncho = 0;
    let vidrioAlto = 0;

    switch (windowType.toUpperCase()) {
      case "VENTANA CORREDIZA 2 HOJAS 55 CM MARCO 45 CM":
        hojaAncho = width / 2;
        hojaAlto = height - 7.2;
        vidrioAncho = hojaAncho - 8.5;
        vidrioAlto = hojaAlto - 8.5;
        break;
      case "VENTANA CORREDIZA 3 HOJAS 55 CM MARCO 45 CM LATERALES OCULTOS":
        hojaAncho = (width + 6) / 4;
        hojaAlto = height - 7.2;
        vidrioAncho = hojaAncho - 8.5;
        vidrioAlto = hojaAlto - 8.5;
        break;
      case "VENTANA CORREDIZA 3 HOJAS 55 CM MARCO 45 CM 3 IGUALES":
        hojaAncho = (width + 6) / 3;
        hojaAlto = height - 7.2;
        vidrioAncho = hojaAncho - 8.5;
        vidrioAlto = hojaAlto - 8.5;
        break;
      case "VENTANA CORREDIZA 4 HOJAS 55 CM MARCO 45 CM":
        hojaAncho = (width + 6) / 4;
        hojaAlto = height - 7.2;
        vidrioAncho = hojaAncho - 8.5;
        vidrioAlto = hojaAlto - 8.5;
        break;
      case "MARCO FIJO":
        hojaAncho = width;
        hojaAlto = height;
        vidrioAncho = hojaAncho - 8.5;
        vidrioAlto = hojaAlto - 8.5;
        break;
      case "VENTANA PROYECTABLE":
        hojaAncho = width - 6.3;
        hojaAlto = height - 6.3;
        vidrioAncho = hojaAncho - 8.5;
        vidrioAlto = hojaAlto - 8.5;
        break;
      case "VENTANA ABATIBLE DE 1 HOJA":
        hojaAncho = width - 4.5;
        hojaAlto = height - 4.5;
        vidrioAncho = hojaAncho - 16.7;
        vidrioAlto = hojaAlto - 16.7;
        break;
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
          {/* Tipo */}
          <div>
            <label className="block font-semibold mb-1">Tipo de ventana</label>
            <select
              value={selectedWindowType}
              onChange={(e) => setSelectedWindowType(e.target.value)}
              required
              className="w-full border p-2 rounded"
            >
              <option value="">Seleccione...</option>
              {windowTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
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

          {/* Colores */}
          <div>
            <label className="block font-semibold mb-1">Color PVC</label>
            <select
              value={selectedPvcColor}
              onChange={(e) => setSelectedPvcColor(e.target.value)}
              className="w-full border p-2 rounded"
            >
              <option value="">Seleccione...</option>
              {pvcColors.map((color) => (
                <option key={color.id} value={color.id}>
                  {color.name}
                </option>
              ))}
            </select>
          </div>

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
