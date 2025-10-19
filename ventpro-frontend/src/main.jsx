// RUTA: src/main.jsx

import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Layout from "./components/layout/Layout";
import Home from "./pages/Home";
import Orders from "./pages/Orders";
import Windows from "./pages/Windows";
import "./index.css";
import OrderDetail from "./pages/OrderDetail";
import Clients from "./pages/Clients";
import Admin from "./pages/Admin/Admin";
import CalculationsManager from './pages/CalculationsManager';
import Quotations from './pages/Quotations';
import QuotationDetail from './pages/QuotationDetail';
import CalendarPage from './pages/CalendarPage';
import LoginPage from './pages/LoginPage';
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext"; // ✨ 1. Importa el proveedor de autenticación
import AdminRoute from "./components/AdminRoute";

const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),

    children: [
      // ✨ 2. Envuelve el elemento de Home con el AdminRoute
      {
        path: "/",
        element: (
          <AdminRoute>
            <Home />
          </AdminRoute>
        )
      },
      { path: "/orders", element: <Orders /> },
      { path: "/orders/:id", element: <OrderDetail /> },
      { path: "/windows", element: <Windows /> },
      { path: "/clients", element: <Clients /> },
      {
        path: "/admin",
        element: (
          <AdminRoute>
            <Admin />
          </AdminRoute>
        )
      },
      { path: "/calculationsmanager", element: <CalculationsManager /> },
      { path: "/quotations", element: <Quotations /> },
      { path: "/quotations/:id", element: <QuotationDetail /> },
      { path: "/calendar", element: <CalendarPage /> },


    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {/* ✨ 2. Envuelve toda la aplicación con el AuthProvider */}
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </React.StrictMode>
);