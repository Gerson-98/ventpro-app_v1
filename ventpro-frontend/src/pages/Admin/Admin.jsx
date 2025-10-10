import React, { useState } from "react";
import WindowTypesTab from "./Tabs/WindowTypesTab";
import PvcColorsTab from "./Tabs/PvcColorsTab";
import GlassColorsTab from "./Tabs/GlassColorsTab";
import ClientsTab from "./Tabs/ClientsTab";



export default function Admin() {
  const [activeTab, setActiveTab] = useState("windowTypes");

  return (
    <div className="p-6">
      <div className="flex items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Administración</h1>
        <p className="text-gray-500">Gestiona tus catálogos y bibliotecas</p>
      </div>

      {/* Botones de pestañas */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab("windowTypes")}
          className={`px-4 py-2 rounded-md text-sm font-medium ${
            activeTab === "windowTypes"
              ? "bg-blue-600 text-white"
              : "bg-gray-100 hover:bg-gray-200"
          }`}
        >
          Tipos de Ventana
        </button>

        <button
          onClick={() => setActiveTab("pvcColors")}
          className={`px-4 py-2 rounded-md text-sm font-medium ${
            activeTab === "pvcColors"
              ? "bg-blue-600 text-white"
              : "bg-gray-100 hover:bg-gray-200"
          }`}
        >
          Colores PVC
        </button>

        <button
          onClick={() => setActiveTab("glassColors")}
          className={`px-4 py-2 rounded-md text-sm font-medium ${
            activeTab === "glassColors"
              ? "bg-blue-600 text-white"
              : "bg-gray-100 hover:bg-gray-200"
          }`}
        >
          Tipos de Vidrio
        </button>

        <button
          onClick={() => setActiveTab("clients")}
          className={`px-4 py-2 rounded-md text-sm font-medium ${
            activeTab === "clients"
              ? "bg-blue-600 text-white"
              : "bg-gray-100 hover:bg-gray-200"
          }`}
        >
          Clientes
        </button>
      </div>

      {/* Contenido dinámico */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        {activeTab === "windowTypes" && <WindowTypesTab />}
        {activeTab === "pvcColors" && <PvcColorsTab />}
        {activeTab === "glassColors" && <GlassColorsTab />}
        {activeTab === "clients" && <ClientsTab />}
      </div>
    </div>
  );
}
