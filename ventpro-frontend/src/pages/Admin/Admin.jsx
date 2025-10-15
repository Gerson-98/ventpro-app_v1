import React, { useState } from "react";
import WindowTypesTab from "./Tabs/WindowTypesTab";
import PvcColorsTab from "./Tabs/PvcColorsTab";
import GlassColorsTab from "./Tabs/GlassColorsTab";
import ClientsTab from "./Tabs/ClientsTab";
import CalculationsTab from "./Tabs/CalculationsTab"; // ✨ 1. Importa la nueva pestaña

export default function Admin() {
  const [activeTab, setActiveTab] = useState("windowTypes");

  const tabs = [
    { id: "windowTypes", label: "Tipos de Ventana" },
    { id: "calculations", label: "Ajustes de Cálculo" }, // ✨ 2. Añade la nueva pestaña a la lista
    { id: "pvcColors", label: "Colores PVC" },
    { id: "glassColors", label: "Tipos de Vidrio" },
    { id: "clients", label: "Clientes" },
  ];

  return (
    <div className="p-6">
      <div className="flex items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Administración</h1>
        <p className="text-gray-500">Gestiona tus catálogos y bibliotecas</p>
      </div>

      {/* Botones de pestañas (ahora generados dinámicamente) */}
      <div className="flex gap-2 mb-6 border-b border-gray-200">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 -mb-px text-sm font-medium border-b-2
               ${activeTab === tab.id
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Contenido dinámico */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        {activeTab === "windowTypes" && <WindowTypesTab />}
        {activeTab === "pvcColors" && <PvcColorsTab />}
        {activeTab === "glassColors" && <GlassColorsTab />}
        {activeTab === "clients" && <ClientsTab />}
        {activeTab === "calculations" && <CalculationsTab />} {/* ✨ 3. Añade la condición para mostrarla */}
      </div>
    </div>
  );
}