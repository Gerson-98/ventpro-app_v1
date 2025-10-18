// src/components/modals/AddClientModal.jsx

import { useState, useEffect } from "react";
import api from "@/services/api"; // Asegúrate de usar tu instancia de api/axios
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export default function AddClientModal({ open, onClose, onSave }) {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
  });
  const [loading, setLoading] = useState(false);

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
        <DialogPrimitive.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
        <DialogContent
          className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-xl shadow-2xl w-full max-w-md z-50"
          aria-describedby="add-client-description"
        >
          <DialogHeader>
            <DialogTitle>➕ Nuevo Cliente</DialogTitle>
            <p id="add-client-description" className="text-sm text-gray-500">
              Agrega la información básica del cliente.
            </p>
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
                {loading ? "Guardando..." : "Guardar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}