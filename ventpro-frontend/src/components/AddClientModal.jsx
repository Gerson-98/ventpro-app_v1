import { useState } from "react"
import axios from "axios"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

export default function AddClientModal({ open, onClose, onSave }) {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
  })
  const [loading, setLoading] = useState(false)

  const API_URL = import.meta.env.VITE_API_URL

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await axios.post(`${API_URL}/clients`, form)
      onSave(res.data)
      setForm({ name: "", phone: "", email: "", address: "" })
      onClose()
    } catch (err) {
      console.error("❌ Error al guardar cliente:", err)
      alert("No se pudo guardar el cliente")
    } finally {
      setLoading(false)
    }
  }

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onClose}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay
          className="fixed inset-0 bg-white/30 backdrop-blur-[6px] transition-all z-40"
        />
        <DialogContent
          className="bg-white/90 backdrop-blur-md border border-gray-200 p-6 rounded-xl shadow-xl max-w-md z-50"
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
              <Input
                name="name"
                placeholder="Nombre completo"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label>Teléfono</Label>
              <Input
                name="phone"
                placeholder="Teléfono"
                value={form.phone}
                onChange={handleChange}
              />
            </div>
            <div>
              <Label>Correo electrónico</Label>
              <Input
                name="email"
                placeholder="Correo"
                value={form.email}
                onChange={handleChange}
              />
            </div>
            <div>
              <Label>Dirección</Label>
              <Input
                name="address"
                placeholder="Dirección"
                value={form.address}
                onChange={handleChange}
              />
            </div>

            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={onClose}
                disabled={loading}
              >
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
  )
}
