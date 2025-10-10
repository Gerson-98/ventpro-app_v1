import { Outlet, Link, useLocation } from "react-router-dom";

export default function Layout() {
  const location = useLocation();

  const links = [
    { to: "/", label: "Inicio" },
    { to: "/orders", label: "Pedidos" },
    { to: "/admin", label: "Administración" }, // 👈 Nuevo botón
  ];

  return (
    <div className="flex h-screen bg-slate-100">
      {/* Sidebar */}
      <aside className="w-64 bg-indigo-700 text-white flex flex-col">
        <h1 className="text-2xl font-bold p-4 border-b border-indigo-500">
          VentPro Panel
        </h1>

        <nav className="flex-1 p-4 space-y-2">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`block p-2 rounded transition ${
                location.pathname === link.to
                  ? "bg-indigo-500 font-semibold"
                  : "hover:bg-indigo-600"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Contenido principal */}
      <main className="flex-1 p-8 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
