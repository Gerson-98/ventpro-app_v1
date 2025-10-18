<<<<<<< HEAD
// src/components/modals/AddClientModal.jsx

import { useState, useEffect } from "react";
import api from "@/services/api"; // Asegúrate de usar tu instancia de api/axios
=======
import { useState, useEffect } from "react";
import api from "@/services/api"; // Usaremos la instancia de api
>>>>>>> 2c4a8489bc09e368d9e934152f37985ca3b23446
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

<<<<<<< HEAD
  // Limpia el formulario cuando el modal se abre
  useEffect(() => {
    if (open) {
      setForm({ name: "", phone: "", email: "", address: "" });
    }
  }, [open]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  // ✨ LA CORRECCIÓN CLAVE ESTÁ AQUÍ ✨
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name) {
      alert("El nombre del cliente es obligatorio.");
      return;
    }
    setLoading(true);
    try {
      // 1. Envía la petición para crear el cliente
      const res = await api.post(`/clients`, form);

      // 2. Llama a la función onSave y le PASA los datos del cliente recién creado
      onSave(res.data);

      // 3. Cierra el modal (la función onClose se pasa desde el componente padre)
      onClose();

=======
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
>>>>>>> 2c4a8489bc09e368d9e934152f37985ca3b23446
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
<<<<<<< HEAD
        <DialogPrimitive.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
        <DialogContent
          className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-xl shadow-2xl w-full max-w-md z-50"
          aria-describedby="add-client-description"
        >
=======
        <DialogPrimitive.Overlay className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40" />
        <DialogContent className="bg-white p-6 rounded-xl shadow-xl max-w-md z-50">
>>>>>>> 2c4a8489bc09e368d9e934152f37985ca3b23446
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
<<<<<<< HEAD
              <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>
                Cancelar
              </Button>
=======
              <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>Cancelar</Button>
>>>>>>> 2c4a8489bc09e368d9e934152f37985ca3b23446
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
<<<<<<< HEAD
}
=======
}
>>>>>>> 2c4a8489bc09e368d9e934152f37985ca3b23446
