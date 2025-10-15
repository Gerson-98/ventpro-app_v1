import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/services/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AddClientModal from "@/components/AddClientModal";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [clients, setClients] = useState([]);
  const [showAddClient, setShowAddClient] = useState(false);
  const [formData, setFormData] = useState({
    project: "",
    clientId: "",
    total: "",
    status: "en proceso",
  });
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  // 🔹 Obtener pedidos
  const fetchOrders = async () => {
    try {
      const res = await api.get("/orders");
      const data = res.data;
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("❌ Error al obtener pedidos:", err);
      setOrders([]);
    }
  };

  // 🔹 Obtener clientes
  const fetchClients = async () => {
    try {
      const res = await api.get("/clients");
      const data = res.data;
      setClients(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("❌ Error al obtener clientes:", err);
      setClients([]);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchClients();
  }, []);

  // 🔹 Crear pedido
  const createOrder = async () => {
    try {
      await api.post("/orders", formData);
      setFormData({ project: "", clientId: "", total: "", status: "en proceso" });
      setOpen(false);
      fetchOrders();
    } catch (err) {
      console.error("❌ Error al crear pedido:", err);
      alert("No se pudo crear el pedido.");
    }
  };

  // 🔹 Eliminar pedido
  const deleteOrder = async (id) => {
    if (!confirm("¿Eliminar este pedido?")) return;
    try {
      await api.delete(`/orders/${id}`);
      fetchOrders();
    } catch (err) {
      console.error("❌ Error al eliminar pedido:", err);
    }
  };

  return (
    <div className="p-6 relative">
      {/* ENCABEZADO */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <span>📦</span> Pedidos
        </h1>

        {/* MODAL DE NUEVO PEDIDO */}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>+ Agregar Pedido</Button>
          </DialogTrigger>

          <DialogContent
            className="bg-white p-6 rounded-xl shadow-lg max-w-md"
            aria-describedby="add-order-description"
          >
            <DialogHeader>
              <DialogTitle>Nuevo Pedido</DialogTitle>
              <p
                id="add-order-description"
                className="text-sm text-gray-500 mt-1"
              >
                Llena los datos para crear un nuevo pedido.
              </p>
            </DialogHeader>

            <div className="space-y-3 mt-2">
              {/* Nombre del proyecto */}
              <div>
                <Label>Nombre del Proyecto</Label>
                <Input
                  value={formData.project}
                  onChange={(e) =>
                    setFormData({ ...formData, project: e.target.value })
                  }
                  placeholder="Ej: Proyecto Santa Rosa"
                  required
                />
              </div>

              {/* Selector de cliente */}
              <div>
                <Label>Cliente</Label>
                <div className="flex gap-2">
                  <select
                    value={formData.clientId}
                    onChange={(e) =>
                      setFormData({ ...formData, clientId: e.target.value })
                    }
                    className="flex-1 border rounded p-2"
                    required
                  >
                    <option value="">Seleccione cliente...</option>
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>

                  {/* Botón para abrir modal de cliente */}
                  <Button
                    onClick={() => setShowAddClient(true)}
                    className="bg-green-600 hover:bg-green-700"
                    type="button"
                  >
                    ➕
                  </Button>
                </div>
              </div>

              {/* Total */}
              <div>
                <Label>Total (Q)</Label>
                <Input
                  type="number"
                  value={formData.total}
                  onChange={(e) =>
                    setFormData({ ...formData, total: e.target.value })
                  }
                  placeholder="Ej: 2500"
                  required
                />
              </div>
            </div>

            <DialogFooter>
              <Button onClick={createOrder}>Guardar Pedido</Button>
            </DialogFooter>

            {/* MODAL ANIDADO DE CLIENTE */}
            <AddClientModal
              open={showAddClient}
              onClose={() => setShowAddClient(false)}
              onSave={(newClient) => {
                setClients((prev) => [...prev, newClient]);
                setFormData((prev) => ({
                  ...prev,
                  clientId: newClient.id,
                }));
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* LISTADO DE PEDIDOS */}
      {orders.length === 0 ? (
        <p className="text-gray-500">No hay pedidos registrados aún.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {orders.map((order) => (
            <Card
              key={order.id}
              className="p-4 shadow-md hover:shadow-lg transition-all"
            >
              <CardContent className="space-y-2">
                <h2 className="text-lg font-semibold">{order.project}</h2>
                <p className="text-sm text-gray-500">
                  Cliente: {order.clients?.name || "Desconocido"}
                </p>
                <p className="text-sm text-gray-500">
                  Total:{" "}
                  <span className="font-medium text-gray-800">
                    Q{order.total}
                  </span>
                </p>
                <p
                  className={`text-sm font-medium ${
                    order.status === "completado"
                      ? "text-green-600"
                      : "text-yellow-600"
                  }`}
                >
                  Estado: {order.status}
                </p>

                <div className="flex justify-between pt-2">
                  <Button
                    variant="secondary"
                    onClick={() => navigate(`/orders/${order.id}`)}
                  >
                    Ver Detalles
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => deleteOrder(order.id)}
                  >
                    Eliminar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
