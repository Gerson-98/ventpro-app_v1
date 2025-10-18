// RUTA: src/pages/CalendarPage.jsx

import { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import api from '@/services/api';
import { useNavigate } from 'react-router-dom';

// Importamos los estilos de FullCalendar
const STATUS_COLORS = {
    'en proceso': '#3b82f6',         // Azul
    'en fabricacion': '#f97316',     // Naranja
    'listo para instalar': '#8b5cf6', // Morado
    'en ruta': '#06b6d4',             // Cian
    'completado': '#22c55e',          // Verde
    'default': '#6b7280',             // Gris (por si acaso)
};

export default function CalendarPage() {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchScheduledOrders = async () => {
            try {
                const response = await api.get('/orders/scheduled');

                // Transformamos los datos del backend al formato que FullCalendar entiende
                const formattedEvents = response.data.map((order) => {
                    const color = STATUS_COLORS[order.status] || STATUS_COLORS.default;

                    return {
                        id: order.id,
                        title: `${order.project}`,
                        start: order.installationStartDate,
                        end: new Date(new Date(order.installationEndDate).setDate(new Date(order.installationEndDate).getDate() + 1)),
                        backgroundColor: color,
                        borderColor: color, // Usamos el mismo color para el borde para un look más limpio
                        extendedProps: { status: order.status } // Guardamos el estado por si lo necesitamos en el futuro
                    };
                    console.log("Objeto de evento formateado:", eventObject);

                });

                setEvents(formattedEvents);
            } catch (error) {
                console.error("❌ Error al cargar los pedidos agendados:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchScheduledOrders();
    }, []);

    const handleEventClick = (clickInfo) => {
        navigate(`/orders/${clickInfo.event.id}`);
    };

    if (loading) {
        return <div className="p-8 text-center">Cargando calendario...</div>;
    }

    return (
        <div className="p-4 md:p-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Calendario de Instalaciones</h1>
            <div className="bg-white p-4 rounded-xl shadow-md border">
                <FullCalendar
                    plugins={[dayGridPlugin]}
                    initialView="dayGridMonth"
                    events={events}
                    locale="es" // Ponemos el calendario en español
                    headerToolbar={{
                        left: 'prev,next today',
                        center: 'title',
                        right: 'dayGridMonth,dayGridWeek'
                    }}
                    eventClick={handleEventClick}
                    height="auto" // El calendario se ajustará al contenido
                />
            </div>
        </div>
    );
}