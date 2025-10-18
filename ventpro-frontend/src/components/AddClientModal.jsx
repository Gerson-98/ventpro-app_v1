// src/components/modals/AddClientModal.jsx

import { useState, useEffect } from "react";
import api from "@/services/api";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export default function AddClientModal({ open, onClose, onSave, clientToEdit }) {
  // 1. ESTADOS (en el nivel superior)
  const [form, setForm] = useState({ name: "", phone: "", email: "", address: "" });
  const [loading, setLoading] = useState(false);

  // 2. EFECTOS (en el nivel superior)
  // Este efecto llena el formulario si estamos editando, o lo limpia si estamos creando.
  useEffect(() => {
    if (clientToEdit && open) {
      setForm({
        name: clientToEdit.name || "",
        phone: clientToEdit.phone || "",
        email: clientToEdit.email || "",
        address: clientToEdit.address || "",
      });
    } else if (open) {
      // Si el modal se abre para crear uno nuevo, nos aseguramos que el form esté vacío.
      setForm({ name: "", phone: "", email: "", address: "" });
    }
  }, [clientToEdit, open]); // Se activa cuando el modal se abre o el cliente a editar cambia.

  // 3. MANEJADORES DE EVENTOS (en el nivel superior)
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name) {
      alert("El nombre del cliente es obligatorio.");
      return;
    }
    setLoading(true);

    const isEditing = !!clientToEdit;
    const url = isEditing ? `/clients/${clientToEdit.id}` : "/clients";
    const method = isEditing ? 'patch' : 'post';

    // ✅ Bloque try...catch...finally corregido y completo
    try {
      const res = await api[method](url, form);
      onSave(res.data); // Pasamos los datos actualizados/creados al padre
    } catch (err) {
      console.error("❌ Error al guardar cliente:", err);
      alert("No se pudo guardar el cliente. Revisa la consola para más detalles.");
    } finally {
      setLoading(false);
    }
  };

  // 4. RENDERIZADO DEL JSX (al final)
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onClose}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
        <DialogContent
          className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-xl shadow-2xl w-full max-w-md z-50"
          aria-describedby="add-client-description"
        >
          <DialogHeader>
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
              <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Guardando..." : (clientToEdit ? 'Guardar Cambios' : 'Crear Cliente')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}