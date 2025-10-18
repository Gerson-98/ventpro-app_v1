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

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { path: "/", element: <Home /> },
      { path: "/orders", element: <Orders /> },
      { path: "/orders/:id", element: <OrderDetail /> }, // ✅ Ruta dinámica
      { path: "/windows", element: <Windows /> },
      { path: "/clients", element: <Clients /> },
      { path: "/admin", element: <Admin /> },
      { path: "/calculationsmanager", element: <CalculationsManager /> },
      { path: "/quotations", element: <Quotations /> },
      { path: "/quotations/:id", element: <QuotationDetail /> },
      { path: "/calendar", element: <CalendarPage /> },


    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
