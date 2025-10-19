// RUTA: src/components/AdminRoute.jsx

import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AdminRoute({ children }) {
    const { user } = useAuth();

    // 1. Revisa si el rol del usuario NO es 'ADMINISTRADOR'.
    if (user?.role !== 'ADMINISTRADOR') {
        // 2. Si no es admin, lo redirige a una página segura a la que sí tenga acceso.
        // En este caso, '/orders' es una buena opción.
        return <Navigate to="/orders" replace />;
    }

    // 3. Si es admin, le permite ver la página.
    return children;
}