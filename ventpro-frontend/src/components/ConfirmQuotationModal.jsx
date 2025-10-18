// RUTA: src/components/ConfirmQuotationModal.jsx

import { useState, useEffect } from "react";
import api from "@/services/api";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import "react-day-picker/dist/style.css";

export default function ConfirmQuotationModal({ open, onClose, quotationId, onConfirmSuccess }) {
    const [installationStartDate, setInstallationStartDate] = useState(null);
    const [duration, setDuration] = useState(1);
    const [installationEndDate, setInstallationEndDate] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [bookedDays, setBookedDays] = useState([]);
    const [isScheduleLoading, setIsScheduleLoading] = useState(true);

    // Carga los pedidos agendados cuando se abre el modal
    useEffect(() => {
        if (open) {
            const fetchScheduledOrders = async () => {
                setIsScheduleLoading(true);
                try {
                    const response = await api.get('/orders/scheduled');
                    setBookedDays(response.data);
                } catch (error) {
                    console.error("❌ Error al cargar el calendario:", error);
                } finally {
                    setIsScheduleLoading(false);
                }
            };
            fetchScheduledOrders();
        }
    }, [open]);

    // Calcula la fecha de fin automáticamente
    useEffect(() => {
        if (installationStartDate && duration > 0) {
            const startDate = new Date(installationStartDate);
            const endDate = new Date(startDate.getTime());
            endDate.setDate(startDate.getDate() + parseInt(duration, 10) - 1);
            setInstallationEndDate(endDate);
        } else {
            setInstallationEndDate(null);
        }
    }, [installationStartDate, duration]);

    // Limpia el estado cuando se cierra el modal
    const handleClose = () => {
        setInstallationStartDate(null);
        setDuration(1);
        setError("");
        onClose();
    };

    // Función para enviar la confirmación
    const handleSubmit = async () => {
        if (!installationStartDate || !installationEndDate) {
            setError("Debes seleccionar una fecha de inicio y una duración válida.");
            return;
        }
        setLoading(true);
        setError("");
        try {
            const payload = {
                installationStartDate: installationStartDate.toISOString(),
                installationEndDate: installationEndDate.toISOString(),
            };
            const response = await api.post(`/quotations/${quotationId}/confirm`, payload);
            onConfirmSuccess(response.data.id);
        } catch (err) {
            console.error("❌ Error al confirmar la cotización:", err);
            setError("No se pudo confirmar. Revisa la consola para más detalles.");
        } finally {
            setLoading(false);
        }
    };

    // Función para deshabilitar los días ocupados
    const isDayBooked = (day) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (day < today) return true;

        for (const order of bookedDays) {
            const start = new Date(order.installationStartDate);
            const end = new Date(order.installationEndDate);
            start.setHours(0, 0, 0, 0);
            end.setHours(0, 0, 0, 0);
            if (day >= start && day <= end) {
                return true;
            }
        }
        return false;
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="text-xl">📅 Agendar y Confirmar Cotización</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="installationStartDate" className="text-right">
                            Fecha de Inicio
                        </Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant={"outline"}
                                    className={cn("col-span-3 justify-start text-left font-normal", !installationStartDate && "text-muted-foreground")}
                                    disabled={isScheduleLoading}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {isScheduleLoading ? "Cargando..." : (installationStartDate ? format(installationStartDate, "PPP", { locale: es }) : <span>Elige una fecha</span>)}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-4">
                                <Calendar
                                    mode="single"
                                    selected={installationStartDate}
                                    onSelect={setInstallationStartDate}
                                    initialFocus
                                    locale={es}
                                    disabled={isDayBooked}
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="duration" className="text-right">Duración (días)</Label>
                        <Input id="duration" type="number" min="1" value={duration} onChange={(e) => setDuration(e.target.value)} className="col-span-3" />
                    </div>
                    {installationEndDate && (
                        <div className="text-center text-sm text-gray-600 bg-gray-100 p-2 rounded-md">
                            <p>La instalación finalizará el: <strong>{format(installationEndDate, "PPP", { locale: es })}</strong></p>
                        </div>
                    )}
                    {error && <p className="text-sm text-red-600 text-center">{error}</p>}
                </div>
                <DialogFooter>
                    <Button type="button" variant="secondary" onClick={handleClose} disabled={loading}>Cancelar</Button>
                    <Button onClick={handleSubmit} disabled={!installationStartDate || loading}>
                        {loading ? 'Confirmando...' : 'Guardar y Confirmar'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}