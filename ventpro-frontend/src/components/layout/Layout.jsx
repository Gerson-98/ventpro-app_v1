import { Outlet, Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function Layout() {
  const location = useLocation();
  const { user, logout } = useAuth();

  // ✨ Estructura de menú mejorada para agrupar enlaces
  const menuItems = [
    // Visible solo para Administrador
    { type: "link", to: "/", label: "Inicio", roles: ['ADMINISTRADOR'] },

    // Visible para todos los roles
    { type: "link", to: "/orders", label: "Pedidos" },
    { type: "link", to: "/quotations", label: "Cotizaciones" },
    { type: "link", to: "/calendar", label: "🗓️ Calendario" },

    // Visible solo para Vendedor
    { type: "link", to: "/clients", label: "Clientes", roles: ['VENDEDOR'] },

    // Visible solo para Administrador
    {
      type: "group",
      label: "Administración",
      roles: ['ADMINISTRADOR'],
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
          {/* ✨ 2. Modifica el renderizado para filtrar por rol */}
          {menuItems.map((item, index) => {
            // Si el item tiene roles definidos y el rol del usuario no está incluido, no lo renderices.
            if (item.roles && !item.roles.includes(user?.role)) {
              return null;
            }

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
                      className={`block p-2 rounded transition-colors text-base pl-4 ${location.pathname === subLink.to
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
        <div className="p-4 mt-auto border-t border-indigo-500">
          {user && ( // Nos aseguramos de que el usuario exista antes de mostrar su nombre
            <div className="text-sm">
              <p className="font-semibold">{user.name}</p>
              <p className="text-xs text-indigo-200">{user.role}</p>
            </div>
          )}
          <button
            onClick={logout} // Llama a la función de logout del contexto
            className="w-full mt-4 p-2 text-sm font-semibold text-white bg-indigo-500 hover:bg-red-500 rounded transition-colors"
          >
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Contenido principal */}
      <main className="flex-1 p-8 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}