import { Outlet, Link, useLocation } from "react-router-dom";

export default function Layout() {
  const location = useLocation();

  // ✨ Estructura de menú mejorada para agrupar enlaces
  const menuItems = [
    { type: "link", to: "/", label: "Inicio" },
    { type: "link", to: "/orders", label: "Pedidos" },
    { type: "link", to: "/quotations", label: "Cotizaciones" },
    { type: "link", to: "/calendar", label: "🗓️ Calendario" },
    {
      type: "group",
      label: "Administración", // Título de la sección
      items: [
        { to: "/admin", label: "Panel Principal" },
      ],
    },
  ];

  return (
    <div className="flex h-screen bg-slate-100">
      {/* Sidebar */}
      <aside className="w-64 bg-indigo-700 text-white flex flex-col">
        <h1 className="text-2xl font-bold p-4 border-b border-indigo-500">
          VentPro Panel
        </h1>

        <nav className="flex-1 p-4 space-y-1">
          {/* Lógica de renderizado para el nuevo menú */}
          {menuItems.map((item, index) => {
            if (item.type === "group") {
              return (
                <div key={index} className="pt-4">
                  {/* Título de la sección */}
                  <h2 className="px-2 mb-2 text-xs font-bold text-indigo-200 uppercase tracking-wider">
                    {item.label}
                  </h2>
                  {/* Enlaces del grupo */}
                  {item.items.map((subLink) => (
                    <Link
                      key={subLink.to}
                      to={subLink.to}
                      className={`block p-2 rounded transition-colors text-sm pl-4 ${location.pathname === subLink.to
                        ? "bg-indigo-500 font-semibold"
                        : "hover:bg-indigo-600"
                        }`}
                    >
                      {subLink.label}
                    </Link>
                  ))}
                </div>
              );
            }

            // Renderiza enlaces normales
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`block p-2 rounded transition-colors font-medium ${location.pathname === item.to
                  ? "bg-indigo-500 font-semibold"
                  : "hover:bg-indigo-600"
                  }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Contenido principal */}
      <main className="flex-1 p-8 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}