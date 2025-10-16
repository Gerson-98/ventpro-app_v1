import { useState, useEffect } from "react";
import api from "@/services/api"; // Usaremos la instancia de api
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

// ✨ El modal ahora acepta una nueva prop: clientToEdit
export default function AddClientModal({ open, onClose, onSave, clientToEdit }) {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
  });
  const [loading, setLoading] = useState(false);

  // ✨ Este efecto se ejecuta si pasamos un cliente para editar
  useEffect(() => {
    if (clientToEdit) {
      setForm({
        name: clientToEdit.name || "",
        phone: clientToEdit.phone || "",
        email: clientToEdit.email || "",
        address: clientToEdit.address || "",
      });
    } else {
      // Si no hay cliente a editar, nos aseguramos que el form esté vacío
      setForm({ name: "", phone: "", email: "", address: "" });
    }
  }, [clientToEdit, open]); // Se activa cuando el modal se abre o el cliente cambia

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  // ✨ El handleSubmit ahora sabe si debe crear (POST) o actualizar (PATCH)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const isEditing = !!clientToEdit;
    const url = isEditing ? `/clients/${clientToEdit.id}` : "/clients";
    const method = isEditing ? 'patch' : 'post';

    try {
      await api[method](url, form);
      onSave(); // Llama a la función onSave sin argumentos
    } catch (err) {
      console.error("❌ Error al guardar cliente:", err);
      alert("No se pudo guardar el cliente");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onClose}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40" />
        <DialogContent className="bg-white p-6 rounded-xl shadow-xl max-w-md z-50">
          <DialogHeader>
            {/* ✨ El título cambia dinámicamente */}
            <DialogTitle>{clientToEdit ? '✏️ Editar Cliente' : '➕ Nuevo Cliente'}</DialogTitle>
            <DialogPrimitive.Description className="text-sm text-gray-500">
              {clientToEdit ? 'Modifica la información del cliente.' : 'Agrega la información básica del cliente.'}
            </DialogPrimitive.Description>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-3 mt-2">
            <div>
              <Label>Nombre</Label>
              <Input name="name" placeholder="Nombre completo" value={form.name} onChange={handleChange} required />
            </div>
            <div>
              <Label>Teléfono</Label>
              <Input name="phone" placeholder="Teléfono" value={form.phone} onChange={handleChange} />
            </div>
            <div>
              <Label>Correo electrónico</Label>
              <Input name="email" type="email" placeholder="Correo" value={form.email} onChange={handleChange} />
            </div>
            <div>
              <Label>Dirección</Label>
              <Input name="address" placeholder="Dirección" value={form.address} onChange={handleChange} />
            </div>

            <DialogFooter className="pt-4">
              <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>Cancelar</Button>
              <Button type="submit" disabled={loading}>
                {/* ✨ El texto del botón cambia dinámicamente */}
                {loading ? "Guardando..." : (clientToEdit ? 'Guardar Cambios' : 'Crear Cliente')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
